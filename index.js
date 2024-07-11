const { Console } = require('console')
const { WebsocketStream } = require('@binance/connector')
const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: data => logger.info(data)
}

const websocketStreamClient = new WebsocketStream({ logger, callbacks })
websocketStreamClient.ticker('btcfdusd')
setTimeout(() => websocketStreamClient.disconnect(), 6000)
