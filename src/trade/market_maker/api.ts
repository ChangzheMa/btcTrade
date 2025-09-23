import { Spot, SPOT_REST_API_PROD_URL, SPOT_WS_API_PROD_URL, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';
import { SYMBOL } from './config.js'
import { localCache } from './cache.js';
import { Balance, BookDepthData, DepthUpdateEvent, OutboundAccountPositionEvent } from './types.js';

const configurationRestAPI = {
    apiKey: process.env.API_KEY ?? '',
    apiSecret: process.env.API_SECRET ?? '',
    basePath: process.env.BASE_PATH ?? SPOT_REST_API_PROD_URL,
};
const configurationWebsocketAPI = {
    apiKey: process.env.API_KEY ?? '',
    apiSecret: process.env.API_SECRET ?? '',
    wsURL: process.env.WS_API_URL ?? SPOT_WS_API_PROD_URL,
};
const configurationWebsocketStreams = {
    wsURL: process.env.WS_STREAMS_URL ?? SPOT_WS_STREAMS_PROD_URL,
};

const client = new Spot({ configurationRestAPI, configurationWebsocketAPI, configurationWebsocketStreams });

const initBookDepth = async () => {
    try {
        const response = await client.restAPI.depth({
            symbol: SYMBOL,
        });
        const data: BookDepthData = await response.data() as BookDepthData;
        const initSuccess = localCache.onBookDepthInit(data)
        if (!initSuccess) {
            setTimeout(initBookDepth, 1000)
        }
    } catch (error) {
        console.error('depth() error:', error);
    }
}

export const listenBookDepth = async (callback: Function = () => {}) => {
    let connection;
    try {
        connection = await client.websocketStreams.connect();
        const stream = connection.diffBookDepth({
            symbol: SYMBOL, updateSpeed: '100ms'
        });
        stream.on('message', (data) => {
            if (localCache.getBookDepthCurrent() == null) {
                initBookDepth()
            }
            if (!!data.E && !!data.s && !!data.U && !!data.u && !!data.a && !!data.b) {
                localCache.onUpdateEvent(data as DepthUpdateEvent)
            }
            callback()
        });
    } catch (error) {
        console.error(error);
    }
}

const initAccount = async () => {
    try {
        console.log("正在初始化账户信息...");
        const response = await client.restAPI.getAccount();
        const accountData = await response.data();

        if (!accountData.balances) {
            return false;
        }

        const initialBalances: Balance[] = accountData.balances!.map(b => ({
            a: b.asset!,
            f: b.free!,
            l: b.locked!,
        }));
        localCache.onAccountPositionInit(initialBalances);
        console.log("账户信息初始化成功。");
        return true;

    } catch (error) {
        console.error('account() error:', error);
        return false;
    }
}

export const listenAccount = async () => {
    const initSuccess = await initAccount();
    if (!initSuccess) {
        return
    }

    let connection;
    try {
        connection = await client.websocketAPI.connect();
        const res = await connection.userDataStreamSubscribeSignature();
        const stream = res.stream;
        stream.on('message', async (data) => {
            switch (data.e) {
                case 'outboundAccountPosition':
                    localCache.onAccountPositionUpdate(data as OutboundAccountPositionEvent);
                    break;
                case 'executionReport':
                    console.log('收到订单更新:', data.s, data.S, data.o, '状态:', data.X);
                    break;
            }
        });
    } catch (error) {
        console.error('userDataStreamSubscribe() error:', error);
    }
}
