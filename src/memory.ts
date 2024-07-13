import _ from 'lodash'

import * as me from './mock/exchange.js';
import { mockExClearOrder, mockExSendOrder } from './mock/exchange.js';

let closeList: number[] = []  //每秒
let bestAsk: string
let bestBid: string
let sign: -1|0|1

const calSign = (close: number) => {
    const ma5 = _.mean(closeList.slice(-5))
    const ma10 = _.mean(closeList.slice(-10))
    const ma20 = _.mean(closeList.slice(-20))
    const ma300 = _.mean(closeList.slice(-300))
    const ma600 = _.mean(closeList.slice(-600))

    const cond_down = close < ma5 && ma5 < ma10 && ma10 < ma20
    const cond_down_reverse = close < ma300 && ma300 < ma600
    const cond_up = close > ma5 && ma5 > ma10 && ma10 > ma20
    const cond_up_reverse = close > ma300 && ma300 > ma600

    const newSign = cond_down && !cond_down_reverse ? -1 : (cond_up && !cond_up_reverse ? 1 : 0)
    if (newSign !== sign) {
        executeSign()
        sign = newSign
    }
}

// 这个方法的作用是把仓位调到 sign 所代表的目标
const executeSign = () => {
    const account = me.mockExGetAccount()

    const orderPrice = (parseFloat(bestAsk) + parseFloat(bestBid)) / 2
    const totalValue = account.accountMoney + account.accountVolume * orderPrice
    const targetMoney = sign === 1 ? 0 : (sign === -1 ? totalValue * 2 : totalValue)
    const targetMount = totalValue - targetMoney
    const mountChange = targetMount - account.accountVolume * orderPrice
    const op = mountChange > 0 ? 'buy' : 'sell'
    let price: number = orderPrice
    if (op === 'buy') {
        price = parseFloat(bestBid) + 0.1
    } else {
        price = parseFloat(bestAsk) - 0.1
    }

    setTimeout(() => {
        mockExClearOrder()
        const success = mockExSendOrder(op, price, Math.abs(mountChange))
        if (!success) {
            executeSign()
        }
    }, _.random(200, 1000, false))
}

export const updateClose = (closePrice: number) => {
    closeList.push(closePrice)
    closeList = closeList.slice(-900)
    calSign(closePrice)
}

/**
 * ask > bid
 */
export const updateBestAskBid = (ask: string, bid: string) => {
    bestAsk = ask
    bestBid = bid
}