import { Console } from 'console'
import { Interval, WebsocketStream } from '@binance/connector-typescript'

import { SYMBOL } from './config.js'
import { updateClose, updateBestAskBid } from './memory.js';

const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: (data: string) => {
        const obj = JSON.parse(data);
        if (obj['e'] === 'kline') {
            console.log("closePrice: ", obj['k']['c'], "klines delay: ", (new Date().valueOf() - obj['k']['T']))
            updateClose(parseFloat(obj['k']['c']))
        } else if (obj['a'] && obj['b']) {
            updateBestAskBid(obj['a'], obj['b'])
        }
    }
}

const websocketStreamClient = new WebsocketStream({ callbacks })
websocketStreamClient.kline(SYMBOL, Interval['1s'])
websocketStreamClient.bookTicker(SYMBOL)
