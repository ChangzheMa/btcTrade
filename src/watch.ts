import { Console } from 'console'
import { Interval, WebsocketStream } from '@binance/connector-typescript'

import { SYMBOL } from './config.js'

const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: (data: string) => {
        const obj = JSON.parse(data);
        if (obj['e'] === 'kline') {
            console.log(`[${new Date().toLocaleString()}]【K线】  O ${obj['k']['o']}  C ${obj['k']['c']}     H ${obj['k']['h']}  L ${obj['k']['l']}`)
        } else if (obj['e'] === 'aggTrade') {
            console.log(`[${new Date().toLocaleString()}]【成交】  P ${obj['p']}`)
        }
    }
}

const websocketStreamClient = new WebsocketStream({ callbacks })
websocketStreamClient.kline(SYMBOL, Interval['1s'])
websocketStreamClient.bookTicker(SYMBOL)
websocketStreamClient.aggTrade(SYMBOL)
