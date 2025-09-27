import { listenAccount, listenBookDepth, sendLimitMakerOrder } from './api.js';
import { localCache } from './cache.js';
import { ORDER_VOLUME_MAP, PRICE_GAP_LOWER_LIMIT, UN_FILL_ORDER_WAIT_SECOND } from './params.js';
import { SYMBOL } from './config.js';
import _ from 'lodash';
import { parseSymbol } from '../../common/utils.js';

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

// setInterval(() => {
//     console.log('account position: ', localCache.getAccountPosition())
//     printDepth()
//     printOrders()
// }, 1000)

/**
 * 检查账户余额是否足够同时下买单和卖单
 * @param symbol 交易对, e.g., 'BTCFDUSD'
 * @param buyPrice 下买单的价格
 * @param sellPrice 下卖单的价格
 * @param volumeInQuoteAsset 以计价资产为单位的交易量 (e.g., FDUSD 的数量)
 * @returns {boolean} 如果余额充足则返回 true, 否则返回 false
 */
const hasSufficientBalance = (symbol: string, buyPrice: number, sellPrice: number, volumeInQuoteAsset: number): boolean => {
    // 1. 解析交易对
    const { base: baseAsset, quote: quoteAsset } = parseSymbol(symbol); // base: 'BTC', quote: 'FDUSD'

    // 2. 获取余额
    const baseAssetBalance = localCache.getAssetBalance(baseAsset);
    const quoteAssetBalance = localCache.getAssetBalance(quoteAsset);

    // 3. 检查买单余额 (花费 volumeInQuoteAsset 的计价资产)
    // 需要的计价资产(FDUSD)数量 = volumeInQuoteAsset
    if (!quoteAssetBalance || parseFloat(quoteAssetBalance.f) < volumeInQuoteAsset) {
        // console.log(`余额不足 [买单]: 需要 ${volumeInQuoteAsset.toFixed(2)} ${quoteAsset}, 可用: ${quoteAssetBalance?.f ?? 0}`);
        return false;
    }

    // 4. 检查卖单余额 (卖出基础资产以获得 volumeInQuoteAsset 的计价资产)
    // 需要的基础资产(BTC)数量 = FDUSD 数量 / 卖出价
    const requiredBaseAmount = volumeInQuoteAsset / sellPrice;
    if (!baseAssetBalance || parseFloat(baseAssetBalance.f) < requiredBaseAmount + 1e-5) {
        // console.log(`余额不足 [卖单]: 需要 ${requiredBaseAmount.toFixed(8)} ${baseAsset}, 可用: ${baseAssetBalance?.f ?? 0}`);
        return false;
    }

    // 5. 如果所有检查都通过
    return true;
}

const strategyTrade = () => {
    const orders = localCache.getOpenOrders()
    const activeOrders = orders.filter(o => o.O > new Date().valueOf() - UN_FILL_ORDER_WAIT_SECOND[SYMBOL] * 1000)
    if (activeOrders.length > 0) {
        // console.log(`order exists, return`)
        return
    }
    const depth = localCache.getBookDepthCurrent()
    if (!depth) {
        // console.log(`order book is null, return`)
        return
    }
    let bestBid = parseFloat(depth.bids[0][0])
    let bestAsk = parseFloat(depth.asks[0][0])
    if (!bestBid || !bestAsk) {
        // console.log(`missing best price, return`)
        return
    }

    // 限制一下最小价差
    const priceGapLowerLimit = PRICE_GAP_LOWER_LIMIT[SYMBOL]
    if (bestAsk - bestBid < priceGapLowerLimit) {
        const mid = (bestAsk + bestBid) / 2
        bestAsk = _.round(mid + priceGapLowerLimit / 2, 2)
        bestBid = _.round(mid - priceGapLowerLimit / 2, 2)
    }

    const volume = ORDER_VOLUME_MAP[SYMBOL]
    if (!hasSufficientBalance(SYMBOL, bestBid, bestAsk, volume)) {
        // 如果余额不足，函数会打印原因并返回 false，我们在这里直接退出
        return;
    }
    sendLimitMakerOrder(bestBid, volume, 'BUY').then()
    sendLimitMakerOrder(bestAsk, volume, 'SELL').then()
}

listenBookDepth(strategyTrade).then();
listenAccount().then();
