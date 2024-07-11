import _ from 'lodash'

let closeList: number[] = []  //每秒
let bestAsk: string
let bestBid: string

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

    const sign = cond_down && !cond_down_reverse ? -1 : (cond_up && !cond_up_reverse ? 1 : 0)
    switch (sign) {
        case -1:
            console.log("Sell: ", (parseFloat(bestAsk) + parseFloat(bestBid)) / 2)
            break;
        case 1:
            console.log("Buy : ", (parseFloat(bestAsk) + parseFloat(bestBid)) / 2)
            break;
        case 0:
            console.log("Mid : ", (parseFloat(bestAsk) + parseFloat(bestBid)) / 2)
            break;
    }
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