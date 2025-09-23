import { listenAccount, listenBookDepth } from './api.js';
import { localCache } from './cache.js';

const printDepth = () => {
    const depth = localCache.getBookDepthCurrent()
    if (depth) {
        console.log(`最优价格: bid: ${depth.bids[0]}, ask: ${depth.asks[0]}`)
    }
}

listenBookDepth().then();
listenAccount().then();

setInterval(() => {
    console.log('account position: ', localCache.getAccountPosition())
    printDepth()
}, 1000)