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