// 单个深度级别 [价格, 数量]
export type DepthLevel = [string, string];

// 深度更新事件的类型定义
export interface DepthUpdateEvent {
    E: number;      // 事件时间
    s: string;      // 交易对
    U: number;      // 首个更新ID
    u: number;      // 最后更新ID
    a: DepthLevel[];  // 卖单更新
    b: DepthLevel[];  // 买单更新
}