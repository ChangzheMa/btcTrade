import { Spot, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';
import { SYMBOL } from './config.js'

const configurationWebsocketStreams = {
    wsURL: process.env.WS_STREAMS_URL ?? SPOT_WS_STREAMS_PROD_URL,
};
const client = new Spot({ configurationWebsocketStreams });

const diffBookDepth = async () => {
    let connection;

    try {
        connection = await client.websocketStreams.connect();

        const stream = connection.diffBookDepth({
            symbol: SYMBOL,
            updateSpeed: '100ms'
        });

        stream.on('message', (data) => {
            console.info(data);
        });
    } catch (error) {
        console.error(error);
    }
}

diffBookDepth().then();
