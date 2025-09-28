// 最小价差
export const PRICE_GAP_LOWER_LIMIT: {[k: string]: number} = {
    'BTCFDUSD': 1,
    'BNBFDUSD': 0.05
}

// 未完成订单等待多久后抛弃
export const UN_FILL_ORDER_WAIT_SECOND: {[k: string]: number} = {
    'BTCFDUSD': 2.5,
    'BNBFDUSD': 10
}

// 单次下单数量
export const ORDER_VOLUME_MAP: {[k: string]: number} = {
    'BTCFDUSD': 7,
    'BNBFDUSD': 7
}

// 定义“过期”订单的绝对价差阈值
export const STALE_ORDER_PRICE_GAP = {
    'BTCFDUSD': 100, // 如果订单价格与中间价的差距超过 500 FDUSD，则视为过期
    'BNBFDUSD': 1
}

// 定义合并订单的分组大小
export const MERGE_GROUP_SIZE = 10;

// 定义价格精度（小数点位数），用于 VWAP 计算结果的取整
export const PRICE_PRECISION = {
    'BTCFDUSD': 2,
    'BNBFDUSD': 2
}