import { listenAccount, listenBookDepth, sendLimitMakerOrder } from './api.js';
import { localCache } from './cache.js';

const printDepth = () => {
    const depth = localCache.getBookDepthCurrent()
    if (depth) {
        console.log(`best orderBook: bid: ${depth.bids[0]}, ask: ${depth.asks[0]}`)
    }
}

const printOrders = () => {
    const orders = localCache.getOpenOrders()
    if (orders && orders.length > 0) {
        console.log('orders: ' + (orders.map(o => `${o.i}: ${(o.S + '  ').slice(0,4)} ${o.p} ${o.q}`).join('\n      ')))
    }
}

const strategyTrade = () => {
    const orders = localCache.getOpenOrders()
    if (!!orders && orders.length > 0) {
        // console.log(`order exists, return`)
        return
    }
    const depth = localCache.getBookDepthCurrent()
    if (!depth) {
        // console.log(`order book is null, return`)
        return
    }
    const bestBid = parseFloat(depth.bids[0][0])
    const bestAsk = parseFloat(depth.asks[0][0])
    if (!bestBid || !bestAsk) {
        // console.log(`missing best price, return`)
        return
    }
    sendLimitMakerOrder(bestBid, 20, 'BUY').then()
    sendLimitMakerOrder(bestAsk, 20, 'SELL').then()
}

listenBookDepth(strategyTrade).then();
listenAccount().then();

// setInterval(() => {
//     console.log('account position: ', localCache.getAccountPosition())
//     printDepth()
//     printOrders()
// }, 1000)