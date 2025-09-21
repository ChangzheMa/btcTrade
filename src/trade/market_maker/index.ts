import { Spot, SPOT_REST_API_PROD_URL, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';
import { SYMBOL } from './config.js'
import { LocalCache } from './cache.js';
import { BookDepthData, DepthUpdateEvent } from './types.js';

const localCache = new LocalCache()

const configurationRestAPI = {
    apiKey: process.env.API_KEY ?? '',
    apiSecret: process.env.API_SECRET ?? '',
    basePath: process.env.BASE_PATH ?? SPOT_REST_API_PROD_URL,
};
const configurationWebsocketStreams = {
    wsURL: process.env.WS_STREAMS_URL ?? SPOT_WS_STREAMS_PROD_URL,
};

const client = new Spot({ configurationRestAPI, configurationWebsocketStreams });

function printDepth() {
    const depth = localCache.getBookDepthCurrent()
    if (depth) {
        console.log(`最优价格: bid: ${depth.bids[0]}, ask: ${depth.asks[0]}`)
    }
}

const diffBookDepth = async () => {
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
            printDepth()
        });
    } catch (error) {
        console.error(error);
    }
}

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

diffBookDepth().then();
