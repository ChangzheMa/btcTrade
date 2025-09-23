import { listenAccount, listenBookDepth } from './api.js';
import { localCache } from './cache.js';

listenBookDepth().then();
listenAccount().then();

const printDepth = () => {
    const depth = localCache.getBookDepthCurrent()
    if (depth) {
        console.log(`最优价格: bid: ${depth.bids[0]}, ask: ${depth.asks[0]}`)
    }
}

setInterval(() => {
    printDepth()
    console.log('account position: ', localCache.getAccountPosition())
}, 1000)