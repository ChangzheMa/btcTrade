import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { Console } from 'console'
import { Interval, WebsocketStream } from '@binance/connector-typescript'

import { SYMBOL, SYMBOL_BASE } from './config.js'
import _ from 'lodash'
import * as fs from 'fs'
import * as path from 'path'

const logger = new Console({ stdout: process.stdout, stderr: process.stderr })

const DIFF_RANGE_LIST = [20, 50, 300, 1800, 10800, 36000, 86400]
const LOG_FILE_NAME = `price_diff_log_${DIFF_RANGE_LIST.join('_')}.csv`
const LOG_DIRECTORY = path.join(__dirname, '..', 'data')
const LOG_FILE_PATH = path.join(LOG_DIRECTORY, LOG_FILE_NAME)

const priceCache: {[k: string]: { close: number, timestamp: number}} = {}
let priceDiffCache: number[] = []

const initializeLogFile = () => {
    try {
        fs.mkdirSync(LOG_DIRECTORY, { recursive: true })
        if (!fs.existsSync(LOG_FILE_PATH)) {
            const header = `timestamp,${DIFF_RANGE_LIST.join(',')}\n`
            fs.writeFileSync(LOG_FILE_PATH, header, { encoding: 'utf-8' })
            console.log(`日志文件已创建: ${LOG_FILE_NAME}`)
        } else {
            console.log(`日志文件已存在: ${LOG_FILE_NAME}`)
        }
    } catch (error) {
        console.error('初始化日志文件时出错:', error)
    }
}

const callbacks = {
    open: () => logger.debug('Connected with Websocket server'),
    close: () => logger.debug('Disconnected with Websocket server'),
    message: (data: string) => {
        const obj = JSON.parse(data)
        if (obj['e'] === 'kline') {
            updateCache(obj['s'], obj['k']['c'])
            checkPriceDiffByCache()
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

function savePriceDiff(meanDiffObj: { [p: string]: number }) {
    try {
        const timestamp = new Date().valueOf()
        const row = `${timestamp},${DIFF_RANGE_LIST.map(range => meanDiffObj[range]).join(',')}\n`
        fs.appendFileSync(LOG_FILE_PATH, row, { encoding: 'utf-8' })
    } catch (error) {
        console.error('写入日志文件时出错:', error)
    }
}

const checkPriceDiffByCache = () => {
    if (!!priceCache[SYMBOL] && !!priceCache[SYMBOL_BASE] && Math.abs(priceCache[SYMBOL]['timestamp'] - priceCache[SYMBOL_BASE]['timestamp']) < 200) {
        priceDiffCache.push(priceCache[SYMBOL]['close'] - priceCache[SYMBOL_BASE]['close'])
        priceDiffCache = priceDiffCache.slice(-100000)
        const lastDiff = priceDiffCache[priceDiffCache.length - 1]
        const meanDiffObj: {[k: string]: number} = {}

        for (const range of DIFF_RANGE_LIST) {
            meanDiffObj[range] = _.round(lastDiff - _.mean(priceDiffCache.slice(-range)), 6)
        }
        console.log(`价格差: ${lastDiff.toFixed(4)} , 偏离均值: ` +
            DIFF_RANGE_LIST.map(range => `${('     ' + (meanDiffObj[range]).toFixed(4)).slice(-10)} (${range})`).join('    '))

        savePriceDiff(meanDiffObj)
    }
}

initializeLogFile()

const websocketStreamClient = new WebsocketStream({ callbacks })
websocketStreamClient.kline(SYMBOL, Interval['1s'])
websocketStreamClient.kline(SYMBOL_BASE, Interval['1s'])
// websocketStreamClient.bookTicker(SYMBOL)
// websocketStreamClient.aggTrade(SYMBOL)
