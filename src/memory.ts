import _ from 'lodash'

import * as me from './mock/exchange.js';
import { mockExClearOrder, mockExSendOrder } from './mock/exchange.js';
import { ma3_ma7_and_delay1, ma3_ma7_and_delay1_always_hold, ma5_ma10_ma20_choice } from './strategy.js';

let closeList: number[] = []  //每秒
let bestAsk: string
let bestBid: string
let sign: number

const calAndExecute = () => {
    sign = ma5_ma10_ma20_choice(closeList)
    // sign = ma3_ma7_and_delay1(closeList)
    // sign = ma3_ma7_and_delay1_always_hold(closeList, sign)
}

// 这个方法的作用是把仓位调到 sign 所代表的目标
const executeSign = () => {
    const account = me.mockExGetAccount()

    const middleAskBid = (parseFloat(bestAsk) + parseFloat(bestBid)) / 2
    const totalValue = account.accountMoney + account.accountVolume * middleAskBid
    const targetMoney = sign === 1 ? 0 : (sign === -1 ? totalValue * 2 : totalValue)
    const targetMount = totalValue - targetMoney
    const mountChange = targetMount - account.accountVolume * middleAskBid

    if (Math.abs(mountChange) > 1) {
        const op = mountChange > 0 ? 'buy' : 'sell'
        // const price = middleAskBid
        const price = op === 'buy' ? parseFloat(bestBid) + 0.1 : parseFloat(bestAsk) - 0.1

        setTimeout(() => {
            mockExClearOrder()
            mockExSendOrder(op, price, Math.abs(mountChange))
            executeSign()
        }, _.random(200, 1000, false))
    } else {
        setTimeout(() => {
            mockExClearOrder()
            executeSign()
        }, _.random(200, 1000, false))
    }
}

export const updateClose = (closePrice: number) => {
    closeList.push(closePrice)
    closeList = closeList.slice(-900)
    calAndExecute()
}

/**
 * ask > bid
 */
export const updateBestAskBid = (ask: string, bid: string) => {
    bestAsk = ask
    bestBid = bid
}

setTimeout(executeSign, 3000)
