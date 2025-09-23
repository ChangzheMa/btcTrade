import { listenAccount, listenBookDepth } from './api.js';
import { localCache } from './cache.js';

const printDepth = () => {
    const depth = localCache.getBookDepthCurrent()
    if (depth) {
        console.log(`最优价格: bid: ${depth.bids[0]}, ask: ${depth.asks[0]}`)
    }
}

const printOrders = () => {
    const orders = localCache.getOpenOrders()
    if (orders && orders.length > 0) {
        console.log('订单: ' + (orders.map(o => `${o.i}: ${(o.S + '  ').slice(0,4)} ${o.p} ${o.q}`).join('\n      ')))
    }
}

listenBookDepth().then();
listenAccount().then();

setInterval(() => {
    console.log('account position: ', localCache.getAccountPosition())
    printDepth()
    printOrders()
}, 1000)