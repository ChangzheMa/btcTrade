import { listenTrades } from './api.js';
import { marketWatchCache } from './cache.js';
import { SYMBOLS_TO_WATCH } from './config.js';
import _ from 'lodash';

// --- 分析与展示函数 ---

/**
 * 打印指定交易对在最近一段时间内的大额成交统计信息。
 * @param symbol - 交易对
 * @param minutes - 时间范围（分钟）
 * @param minVolume - 定义为“大单”的最小成交额
 */
const printLargeTradesSummary = (symbol: string, minutes: number, minVolume: number) => {
    const since = Date.now() - minutes * 60 * 1000;

    const largeTrades = marketWatchCache.getTrades(symbol, {
        since: since,
        minQuoteVolume: minVolume,
    });

    if (largeTrades.length > 0) {
        const totalVolume = _.sumBy(largeTrades, t => parseFloat(t.p) * parseFloat(t.q));
        const buyTrades = largeTrades.filter(t => t.m === false); // is maker = false -> Taker is buyer
        const sellTrades = largeTrades.filter(t => t.m === true); // is maker = true -> Taker is seller

        const buyVolume = _.sumBy(buyTrades, t => parseFloat(t.p) * parseFloat(t.q));
        const sellVolume = _.sumBy(sellTrades, t => parseFloat(t.p) * parseFloat(t.q));

        console.log(`\n--- ${symbol} 最近 ${minutes} 分钟大单 (>= ${minVolume} U) 统计 ---`);
        console.log(`总笔数: ${largeTrades.length} (买: ${buyTrades.length}, 卖: ${sellTrades.length})`);
        console.log(`总成交额: ${totalVolume.toFixed(2)} U`);
        console.log(`  - 主动买入额: ${buyVolume.toFixed(2)} U`);
        console.log(`  - 主动卖出额: ${sellVolume.toFixed(2)} U`);
        console.log('--------------------------------------------------');
    }
};

// --- 主逻辑 ---

function main() {
    console.log("启动市场成交监控服务...");

    // 1. 启动 WebSocket 监听
    listenTrades(SYMBOLS_TO_WATCH).then(() => {
        console.log("WebSocket 监听器已启动。");
    });

    // 2. 每 30 秒打印一次统计数据作为演示
    setInterval(() => {
        console.log(`\n\n======== [${new Date().toLocaleString()}] 市场动态报告 ========`);
        for (const symbol of SYMBOLS_TO_WATCH) {
            // 示例: 统计 BTCFDUSD 最近5分钟，成交额大于 20,000 FDUSD 的大单
            if (symbol === 'BTCFDUSD') {
                printLargeTradesSummary(symbol, 5, 20000);
            }
            // 示例: 统计 BNBFDUSD 最近10分钟，成交额大于 5,000 FDUSD 的大单
            if (symbol === 'BNBFDUSD') {
                printLargeTradesSummary(symbol, 10, 5000);
            }
        }
    }, 3000);
}

// 运行主函数
main();
