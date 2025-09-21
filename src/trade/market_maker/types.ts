// 单个深度级别 [价格, 数量]
export type DepthLevel = [string, string];

// 深度更新事件的类型定义
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