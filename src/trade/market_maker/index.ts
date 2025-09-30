import { cancelOrdersByIds, listenAccount, listenBookDepth, sendLimitMakerOrder } from './api.js';
import { localCache } from './cache.js';
import {
    ORDER_VOLUME_MAP,
    PRICE_GAP_LOWER_LIMIT,
    PRICE_PRECISION,
    STALE_ORDER_PRICE_GAP,
    UN_FILL_ORDER_WAIT_SECOND
} from './params.js';
import { BASE_COIN, SYMBOL } from './config.js';
import _ from 'lodash';
import { parseSymbol } from '../../common/utils.js';
import { SimpleSpotOrder } from './types.js';
import { balanceChecker } from './helper/balance_checker.js';

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

const printBalanceRatios = () => {
    const ratios = balanceChecker.checkBalanceRatio(SYMBOL);
    if (ratios) {
        console.log('Balance Ratios:', JSON.stringify(ratios, null, 2));
    }
}

// setInterval(() => {
//     console.log('account position: ', localCache.getAccountPosition())
//     printDepth()
//     printOrders()
//     printBalanceRatios()
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

/**
 * 合并离当前市场价过远的过期订单
 * - 按绝对价差判断
 * - 动态成组，确保合并后的订单总额在基础量的 10~30 倍之间
 * - 新价格为组内的加权平均价 (VWAP)，新数量为组内数量之和
 * @param orders 当前所有挂单
 * @param midPrice 当前的市场中间价
 */
const mergeExpiredOrders = async (orders: SimpleSpotOrder[], midPrice: number) => {
    console.log(`当前挂单数量过多 (${orders.length})，开始按新逻辑合并过期订单...`);
    const priceGapThreshold = STALE_ORDER_PRICE_GAP[SYMBOL];
    const precision = PRICE_PRECISION[SYMBOL];
    const baseVolume = ORDER_VOLUME_MAP[SYMBOL];
    const minMergeVolume = 10 * baseVolume;
    const maxMergeVolume = 30 * baseVolume;

    // 1. 筛选出所有价格差距过大的订单
    const staleBuyOrders = orders.filter(o => o.S === 'BUY' && parseFloat(o.p) < midPrice - priceGapThreshold);
    const staleSellOrders = orders.filter(o => o.S === 'SELL' && parseFloat(o.p) > midPrice + priceGapThreshold);

    // --- 内部函数：处理一个订单分组的撤单和下单逻辑 ---
    const processChunk = async (chunk: SimpleSpotOrder[], side: 'BUY' | 'SELL') => {
        if (chunk.length === 0) return;

        // 计算加权平均价 (VWAP) 和总计价数量
        let totalRemainingBaseQty = 0;
        let vwapNumerator = 0; // 该值即为合并后订单的总计价金额

        for (const order of chunk) {
            const price = parseFloat(order.p);
            const remainingQty = parseFloat(order.q) - parseFloat(order.z);
            if (remainingQty <= 0) continue;

            totalRemainingBaseQty += remainingQty;
            vwapNumerator += price * remainingQty;
        }

        if (totalRemainingBaseQty <= 0) return;

        const vwap = vwapNumerator / totalRemainingBaseQty;
        const mergedPrice = _.round(vwap, precision);
        const mergedQuoteQty = vwapNumerator;

        // 执行操作：批量撤单 + 新挂单
        try {
            const orderIdsToCancel = chunk.map(o => o.i);
            const sideText = side === 'BUY' ? '买' : '卖';
            console.log(`准备合并 ${chunk.length} 笔${sideText}单, 新价格(VWAP): ${mergedPrice.toFixed(precision)}, 新计价数量: ${mergedQuoteQty.toFixed(precision)}`);
            await cancelOrdersByIds(SYMBOL, orderIdsToCancel);
            console.log(`成功撤销 ${orderIdsToCancel.length} 笔旧${sideText}单。`);
            await sendLimitMakerOrder(mergedPrice, mergedQuoteQty, side);
            console.log(`已挂出新的合并${sideText}单 @ ${mergedPrice.toFixed(precision)}`);

        } catch (error) {
            console.error(`合并${side === 'BUY' ? '买' : '卖'}单时出错:`, error);
        }
    };

    // --- 处理过期的买单 ---
    if (staleBuyOrders.length > 0) {
        // 按价格从高到低排序 (优先合并价格更优的)
        staleBuyOrders.sort((a, b) => parseFloat(b.p) - parseFloat(a.p));

        let currentChunk: SimpleSpotOrder[] = [];
        let currentChunkVolume = 0;

        for (const order of staleBuyOrders) {
            const price = parseFloat(order.p);
            const remainingBaseQty = parseFloat(order.q) - parseFloat(order.z);
            if (remainingBaseQty <= 0) continue;

            const orderQuoteVolume = remainingBaseQty * price;

            // 如果加入此订单将超出最大值
            if (currentChunkVolume + orderQuoteVolume > maxMergeVolume) {
                // 如果当前组已满足最小合并额，则先处理当前组
                if (currentChunkVolume >= minMergeVolume) {
                    await processChunk(currentChunk, 'BUY');
                    // 用当前订单开启一个新组
                    currentChunk = [order];
                    currentChunkVolume = orderQuoteVolume;
                } else {
                    // 否则（当前组太小，此订单又太大），则跳过此订单，继续为当前组寻找更合适的订单
                    continue;
                }
            } else {
                // 如果未超出最大值，则将订单加入当前组
                currentChunk.push(order);
                currentChunkVolume += orderQuoteVolume;
            }
        }

        // 处理循环结束后剩余的最后一个 chunk
        if (currentChunk.length > 0 && currentChunkVolume >= minMergeVolume) {
            await processChunk(currentChunk, 'BUY');
        }
    }

    // --- 处理过期的卖单 (逻辑与买单完全相同) ---
    if (staleSellOrders.length > 0) {
        // 按价格从低到高排序 (优先合并价格更优的)
        staleSellOrders.sort((a, b) => parseFloat(a.p) - parseFloat(b.p));

        let currentChunk: SimpleSpotOrder[] = [];
        let currentChunkVolume = 0;

        for (const order of staleSellOrders) {
            const price = parseFloat(order.p);
            const remainingBaseQty = parseFloat(order.q) - parseFloat(order.z);
            if (remainingBaseQty <= 0) continue;

            const orderQuoteVolume = remainingBaseQty * price;

            // 如果加入此订单将超出最大值
            if (currentChunkVolume + orderQuoteVolume > maxMergeVolume) {
                // 如果当前组已满足最小合并额，则先处理当前组
                if (currentChunkVolume >= minMergeVolume) {
                    await processChunk(currentChunk, 'SELL');
                    // 用当前订单开启一个新组
                    currentChunk = [order];
                    currentChunkVolume = orderQuoteVolume;
                } else {
                    // 否则（当前组太小，此订单又太大），则跳过此订单，继续为当前组寻找更合适的订单
                    continue;
                }
            } else {
                // 如果未超出最大值，则将订单加入当前组
                currentChunk.push(order);
                currentChunkVolume += orderQuoteVolume;
            }
        }

        // 处理循环结束后剩余的最后一个 chunk
        if (currentChunk.length > 0 && currentChunkVolume >= minMergeVolume) {
            await processChunk(currentChunk, 'SELL');
        }
    }
};

const strategyTrade = async () => {
    const start = new Date();
    const depth = localCache.getBookDepthCurrent();
    if (!depth) return;

    const bestBid = parseFloat(depth.bids[0][0]);
    const bestAsk = parseFloat(depth.asks[0][0]);
    if (!bestBid || !bestAsk) return;

    const mid = (bestAsk + bestBid) / 2

    const orders = localCache.getOpenOrders()
    if (orders && orders.length > 150) {
        await mergeExpiredOrders(orders, mid);
        return; // 合并后直接返回，等待下一轮
    }

    const activeOrders = orders.filter(o => o.O > new Date().valueOf() - UN_FILL_ORDER_WAIT_SECOND[SYMBOL] * 1000)
    if (activeOrders.length > 0) {
        // console.log(`order exists, return`)
        return
    }

    let askPrice;
    let bidPrice;
    // 限制一下最小价差
    const priceGapLowerLimit = PRICE_GAP_LOWER_LIMIT[SYMBOL]
    if (bestAsk - bestBid < priceGapLowerLimit) {
        askPrice = _.round(mid + priceGapLowerLimit / 2, 2)
        bidPrice = _.round(mid - priceGapLowerLimit / 2, 2)
    } else {
        askPrice = bestAsk;
        bidPrice = bestBid;
    }

    const volume = ORDER_VOLUME_MAP[SYMBOL]
    if (!hasSufficientBalance(SYMBOL, bidPrice, askPrice, volume)) {
        // 如果余额不足，函数会打印原因并返回 false，我们在这里直接退出
        return;
    }

    const ratios = balanceChecker.checkBalanceRatio(SYMBOL);
    console.log(`time used: ${new Date().valueOf() - start.valueOf()}`)
    if (ratios && ratios[BASE_COIN].balanceRatio > 0.5) {
        sendLimitMakerOrder(bidPrice, volume, 'BUY').then()
        sendLimitMakerOrder(askPrice, volume, 'SELL').then()
    } else {
        sendLimitMakerOrder(askPrice, volume, 'SELL').then()
        sendLimitMakerOrder(bidPrice, volume, 'BUY').then()
    }
}

listenBookDepth(strategyTrade).then();
listenAccount().then();
