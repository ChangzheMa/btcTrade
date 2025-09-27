import { SYMBOL } from './config.js';

// 最小价差
export const PRICE_GAP_LOWER_LIMIT: {[k: string]: number} = {
    [SYMBOL]: 5
}

// 未完成订单等待多久后抛弃
export const UN_FILL_ORDER_WAIT_SECOND: {[k: string]: number} = {
    [SYMBOL]: 10
}

// 单次下单数量
export const ORDER_VOLUME_MAP: {[k: string]: number} = {
    [SYMBOL]: 10
}