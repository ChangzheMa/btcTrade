import { Console } from 'console'
import { SYMBOL } from './config.js';
import { WebsocketStream } from '@binance/connector'

const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: data => logger.info(data)
}

const websocketStreamClient = new WebsocketStream({ logger, callbacks })
websocketStreamClient.kline(SYMBOL, '1s')
