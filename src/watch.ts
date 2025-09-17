import { Console } from 'console'
import { Interval, WebsocketStream } from '@binance/connector-typescript'

import { SYMBOL, SYMBOL_BASE } from './config.js'
import pkg from 'lodash'
const { mean } = pkg

const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

const priceCache: {[k: string]: { close: number, timestamp: number}} = {}
let priceDiffCache: number[] = []

const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: (data: string) => {
        const obj = JSON.parse(data);
        if (obj['e'] === 'kline') {
            // console.log(`[${new Date().toLocaleString()}]【K线 ${(obj['s'] + '  ').slice(0,8)} 】  O ${obj['k']['o']}  C ${obj['k']['c']}     H ${obj['k']['h']}  L ${obj['k']['l']}`)
            updateCache(obj['s'], obj['k']['c'])
            printPriceDiffByCache()
        } else if (obj['e'] === 'aggTrade') {
            console.log(`[${new Date().toLocaleString()}]【成交】  ${obj['m'] ? '<<' : '  '} ${obj['p']} ${obj['m'] ? '  ' : '>>'}`)
        }
    }
}

const updateCache = (symble: string, close: number) => {
    priceCache[symble] = {
        close,
        timestamp: new Date().valueOf()
    }
}

const printPriceDiffByCache = () => {
    if (!!priceCache[SYMBOL] && !!priceCache[SYMBOL_BASE] && Math.abs(priceCache[SYMBOL]['timestamp'] - priceCache[SYMBOL_BASE]['timestamp']) < 200) {
        priceDiffCache.push(priceCache[SYMBOL]['close'] - priceCache[SYMBOL_BASE]['close'])
        priceDiffCache = priceDiffCache.slice(-1000)
        const lastDiff = priceDiffCache[priceDiffCache.length - 1]
        console.log(
            `价格差: ${lastDiff.toFixed(4)} , ` +
            `偏离均值: ${('     ' + (lastDiff - mean(priceDiffCache.slice(-20))).toFixed(4)).slice(-10)} (20)  ` +
            `${('     ' + (lastDiff - mean(priceDiffCache.slice(-50))).toFixed(4)).slice(-10)} (50)  ` +
            `${('     ' + (lastDiff - mean(priceDiffCache.slice(-300))).toFixed(4)).slice(-10)} (300)`
        )
    }
}

const websocketStreamClient = new WebsocketStream({ callbacks })
websocketStreamClient.kline(SYMBOL, Interval['1s'])
websocketStreamClient.kline(SYMBOL_BASE, Interval['1s'])
// websocketStreamClient.bookTicker(SYMBOL)
// websocketStreamClient.aggTrade(SYMBOL)
