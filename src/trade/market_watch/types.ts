/**
 * 从 WebSocket 接收的实时成交事件的原始结构
 */
export interface TradeEvent {
    e: string;      // 事件类型, e.g., "trade"
    E: number;      // 事件时间 (Event time)
    s: string;      // 交易对 (Symbol)
    t: number;      // 成交ID (Trade ID)
    p: string;      // 成交价格 (Price)
    q: string;      // 成交数量 (Quantity)
    b: number;      // 买方订单ID (Buyer order ID)
    a: number;      // 卖方订单ID (Seller order ID)
    T: number;      // 成交时间 (Trade time)
    m: boolean;     // 买方是否是做市方 (Is the buyer the market maker?)
    M: boolean;     // 忽略 (Ignore)
}

/**
 * 用于查询近期成交数据的选项
 */
export interface GetTradesOptions {
    /**
     * Unix 时间戳 (毫秒), 只返回此时间之后的数据
     */
    since?: number;
    /**
     * 最小成交量 (以计价货币为单位, e.g., FDUSD), 只返回大于等于此成交量的数据
     * 成交量 = 价格 * 数量
     */
    minQuoteVolume?: number;
}
