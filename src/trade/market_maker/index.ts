import { Spot, SPOT_REST_API_PROD_URL, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';
import { SYMBOL } from './config.js'
import { LocalCache } from './cache.js';
import { DepthUpdateEvent } from './types.js';

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

const diffBookDepth = async () => {
    let connection;
    try {
        connection = await client.websocketStreams.connect();
        const stream = connection.diffBookDepth({
            symbol: SYMBOL, updateSpeed: '100ms'
        });
        stream.on('message', (data) => {
            if (!!data.E && !!data.s && !!data.U && !!data.u && !!data.a && !!data.b) {
                localCache.onUpdateEvent(data as DepthUpdateEvent)
            }
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
        const rateLimits = response.rateLimits!;
        console.log('depth() rate limits:', rateLimits);
        const data = await response.data();
        console.log('depth() response:', data);
    } catch (error) {
        console.error('depth() error:', error);
    }
}

diffBookDepth().then(() => {
    setTimeout(initBookDepth, 1000)
});
