// --- 订单簿相关类型 ---
// 单个订单簿深度级别 [价格, 数量]
export type DepthLevel = [string, string];

// 深度订单簿更新事件的类型定义
export interface DepthUpdateEvent {
    E: number;      // 事件时间
    s: string;      // 交易对
    U: number;      // 首个更新ID
    u: number;      // 最后更新ID
    b: DepthLevel[];  // 买单更新
    a: DepthLevel[];  // 卖单更新
}

// 深度订单簿类型定义
export interface BookDepthData {
    lastUpdateId: number;      // 更新ID
    bids: DepthLevel[];  // 买单更新
    asks: DepthLevel[];  // 卖单更新
}

// --- 账户仓位相关类型 ---
export interface Balance {
    a: string; // 资产名称
    f: string; // 可用余额
    l: string; // 冻结余额
}

export interface OutboundAccountPositionEvent {
    e: string; // 事件类型
    E: number; // 事件时间
    u: number; // 账户末次更新时间戳
    B: Balance[]; // 余额
}

// 账户仓位缓存的数据结构
export type AccountCache = Map<string, Balance>;

/**
 * 收到 WebSocket 推送的完整订单更新事件结构
 */
export interface ExecutionReportEvent {
    e: "executionReport";
    E: number;
    s: string;
    c: string;
    S: "BUY" | "SELL";
    o: string;
    f: string;
    q: string;
    p: string;
    P: string;
    F: string;
    g: number;
    C: string | null;
    x: string;
    X: string;
    r: string;
    i: number;
    l: string;
    z: string;
    L: string;
    n: string;
    N: string | null;
    T: number;
    I: number;
    w: boolean;
    m: boolean;
    M: boolean;
    O: number;
    Z: string;
    Y: string;
    Q: string;
}

/**
 * 用于本地缓存的现货订单结构
 */
export interface SimpleSpotOrder {
    // 核心标识
    i: number;      // Order ID
    s: string;      // 交易对
    c: string;      // clientOrderId
    // 订单基本信息
    S: "BUY" | "SELL";
    p: string;      // 价格
    q: string;      // 数量
    // 状态与成交信息
    X: string;      // 当前状态 (NEW, PARTIALLY_FILLED, etc.)
    x: string;      // 本次执行类型 (NEW, TRADE, etc.)
    z: string;      // 累计已成交数量
    Z: string;      // 累计已成交金额
    w: boolean;     // 是否在订单簿上
    // 时间
    O: number;      // 创建时间
    T: number;      // 成交时间
}

/**
 * 订单缓存的数据结构
 */
export type OrderCache = Map<number, SimpleSpotOrder>;