import { Spot, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';
import { marketWatchCache } from './cache.js';
import { TradeEvent } from './types.js';

const configurationWebsocketStreams = {
    wsURL: process.env.WS_STREAMS_URL ?? SPOT_WS_STREAMS_PROD_URL,
};
const client = new Spot({ configurationWebsocketStreams });

/**
 * 监听指定交易对列表的实时成交流。
 * @param symbols - 需要监听的交易对数组, e.g., ['BTCFDUSD', 'BNBFDUSD']
 */
export const listenTrades = async (symbols: string[]) => {
    if (!symbols || symbols.length === 0) {
        console.warn("没有提供需要监控的交易对。");
        return;
    }

    // 将交易对数组转换为 WebSocket API 需要的 stream 名称数组
    // e.g., 'BTCFDUSD' -> 'btcfdusd@trade'
    const streams = symbols.map(s => `${s.toLowerCase()}@trade`);

    console.log(`正在连接并订阅以下成交信息流: ${streams.join(', ')}`);

    try {
        const connection = await client.websocketStreams.connect({ stream: streams });

        connection.on('message', (data) => {
            const message = JSON.parse(data.toString()).data;

            // 检查是否是有效的成交事件
            if (message.e === 'trade' && message.s) {
                marketWatchCache.addTrade(message as TradeEvent);
            }
        });

        console.log("成功订阅所有成交信息流。");

    } catch (error) {
        console.error('订阅成交信息流时出错:', error);
    }
};
