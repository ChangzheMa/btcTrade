import { TradeEvent, GetTradesOptions } from './types.js';
import { TRADE_DATA_RETENTION_MS } from './config.js';

class MarketWatchCache {
    /**
     * 使用 Map 存储每个交易对的成交列表。
     * Key: 交易对字符串 (e.g., 'BTCFDUSD')
     * Value: 该交易对的成交事件数组 (TradeEvent[])
     */
    private tradeCache: Map<string, TradeEvent[]>;

    constructor() {
        this.tradeCache = new Map<string, TradeEvent[]>();
    }

    /**
     * 添加一笔新的成交记录到缓存中，并清理过期数据。
     * @param trade - 从 WebSocket 收到的成交事件
     */
    public addTrade(trade: TradeEvent): void {
        console.log(`addTrade: ${JSON.stringify(trade)}`)

        const symbol = trade.s;
        if (!this.tradeCache.has(symbol)) {
            this.tradeCache.set(symbol, []);
        }

        const trades = this.tradeCache.get(symbol)!;
        trades.push(trade);

        // 清理旧数据，防止内存无限增长
        this.cleanupExpiredTrades(symbol);
    }

    /**
     * 根据交易对和筛选条件获取成交数据。
     * @param symbol - 要查询的交易对
     * @param options - 过滤选项，包括时长和最小成交量
     * @returns 符合条件的成交事件数组
     */
    public getTrades(symbol: string, options: GetTradesOptions = {}): TradeEvent[] {
        const trades = this.tradeCache.get(symbol);
        if (!trades) {
            return [];
        }

        let filteredTrades = trades;

        // 1. 按时间筛选 (since)
        if (options.since) {
            filteredTrades = filteredTrades.filter(t => t.T >= options.since!);
        }

        // 2. 按最小成交量筛选 (minQuoteVolume)
        if (options.minQuoteVolume) {
            filteredTrades = filteredTrades.filter(t => {
                const price = parseFloat(t.p);
                const quantity = parseFloat(t.q);
                return price * quantity >= options.minQuoteVolume!;
            });
        }

        return filteredTrades;
    }

    /**
     * 清理指定交易对的过期成交数据。
     * @param symbol - 交易对
     */
    private cleanupExpiredTrades(symbol: string): void {
        const trades = this.tradeCache.get(symbol);
        if (!trades || trades.length === 0) {
            return;
        }

        const cutoffTime = Date.now() - TRADE_DATA_RETENTION_MS;

        // 寻找第一个未过期的交易的索引
        // 由于数据是按时间顺序添加的，我们可以高效地找到分割点
        const firstValidIndex = trades.findIndex(t => t.T >= cutoffTime);

        if (firstValidIndex > 0) {
            // 如果找到了过期的交易 (即 firstValidIndex > 0)，则移除它们
            const updatedTrades = trades.slice(firstValidIndex);
            this.tradeCache.set(symbol, updatedTrades);
        }
    }
}

export const marketWatchCache = new MarketWatchCache();
