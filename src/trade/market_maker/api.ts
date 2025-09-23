import { Spot, SPOT_REST_API_PROD_URL, SPOT_WS_API_PROD_URL, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';
import { SYMBOL } from './config.js'
import { localCache } from './cache.js';
import { BookDepthData, DepthUpdateEvent } from './types.js';

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

export const listenBookDepth = async () => {
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
            // printDepth()
        });
    } catch (error) {
        console.error(error);
    }
}

export const listenAccount = async () => {
    let connection;
    try {
        connection = await client.websocketAPI.connect();
        const res = await connection.userDataStreamSubscribeSignature();
        const stream = res.stream;
        stream.on('message', (data) => {
            console.log('userDataStreamSubscribeSignature() stream data:', data);
        });
    } catch (error) {
        console.error('userDataStreamSubscribe() error:', error);
    }
}
