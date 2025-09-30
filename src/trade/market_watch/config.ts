/**
 * 需要通过 WebSocket 实时监控成交信息的交易对列表
 */
export const SYMBOLS_TO_WATCH: string[] = [
    'BTCFDUSD',
    'BNBFDUSD',
    'ETHFDUSD'
];

/**
 * 定义每个交易对近期成交数据的最大保留时长 (毫秒)
 * 例如, 3_600_000 表示只保留最近 1 小时的数据
 */
export const TRADE_DATA_RETENTION_MS: number = 3_600_000; // 1 hour
