/*
import {
    MarginTrading,
    MARGIN_TRADING_REST_API_PROD_URL,
    MARGIN_TRADING_WS_STREAMS_PROD_URL,
    SpotWebsocketAPI
} from '@binance/margin-trading';
import { PRICE_PRECISION_MAP, QUANTITY_PRECISION_MAP, SYMBOL } from '../config.js'
import { localCache } from '../cache.js';
import {
    Balance,
    ExecutionReportEvent,
    OutboundAccountPositionEvent, SimpleSpotOrder
} from '../types.js';
import _ from 'lodash';

const configurationRestAPI = {
    apiKey: process.env.API_KEY ?? '',
    apiSecret: process.env.API_SECRET ?? '',
    basePath: process.env.BASE_PATH ?? MARGIN_TRADING_REST_API_PROD_URL,
};
const configurationWebsocketStreams = {
    wsURL: process.env.WS_STREAMS_URL ?? MARGIN_TRADING_WS_STREAMS_PROD_URL,
};

const client = new MarginTrading({ configurationRestAPI, configurationWebsocketStreams });

const initAccount = async () => {
    try {
        console.log("正在初始化账户信息...");
        const response = await client.restAPI.getAccount();
        const accountData = await response.data();

        if (!accountData.balances) {
            return false;
        }

        const initialBalances: Balance[] = accountData.balances!.map(b => ({
            a: b.asset!,
            f: b.free!,
            l: b.locked!,
        }));
        localCache.onAccountPositionInit(initialBalances);
        console.log("账户信息初始化成功。");
        return true;

    } catch (error) {
        console.error('account() error:', error);
        return false;
    }
}

const initOpenOrders = async () => {
    try {
        console.log("正在初始化当前挂单列表...");
        const response = await client.restAPI.getOpenOrders();
        const openOrdersData = await response.data();

        // **重要**: 将 API 返回的结构直接映射到 SimpleSpotOrder 结构
        const initialOrders: SimpleSpotOrder[] = openOrdersData.map(o => ({
            i: o.orderId!,
            s: o.symbol!,
            c: o.clientOrderId!,
            S: o.side! as 'BUY' | 'SELL',
            p: o.price!,
            q: o.origQty!,
            X: o.status!,
            x: o.status!, // 使用当前 status 作为初始执行类型
            z: o.executedQty!,
            Z: o.cummulativeQuoteQty!,
            w: o.isWorking!,
            O: o.time!,
            T: o.updateTime!,   // 使用订单时间作为初始成交时间
        }));

        localCache.onOrdersInit(initialOrders);
        return true;

    } catch (error) {
        console.error('openOrders() error:', error);
        return false;
    }
}

export const listenAccount = async (callback: Function = (data: ExecutionReportEvent) => {}) => {
    const accountInitSuccess = await initAccount();
    const orderInitSuccess = await initOpenOrders();
    if (!accountInitSuccess || !orderInitSuccess) {
        return
    }

    let connection;
    try {
        connection = await client.websocketAPI.connect();
        const res = await connection.userDataStreamSubscribeSignature();
        const stream = res.stream;
        stream.on('message', async (data) => {
            console.log(`listenAccount on message: ${data}`)
            switch (data.e) {
                case 'outboundAccountPosition':
                    localCache.onAccountPositionUpdate(data as OutboundAccountPositionEvent);
                    break;
                case 'executionReport':
                    localCache.onOrderUpdate(data as ExecutionReportEvent);
                    callback(data as ExecutionReportEvent)
                    break;
            }
        });
    } catch (error) {
        console.error('userDataStreamSubscribe() error:', error);
    }
}

let orderConnection: any;

export const sendLimitMakerOrder = async (price: number, volume: number, buyOrSell: 'BUY' | 'SELL') => {
    if (!orderConnection) {
        orderConnection = await client.websocketAPI.connect();
    }
    const quantity = _.round(volume / price, QUANTITY_PRECISION_MAP[SYMBOL])
    orderConnection.orderPlace({
        symbol: SYMBOL,
        side: buyOrSell,
        type: SpotWebsocketAPI.OrderPlaceTypeEnum.LIMIT_MAKER,
        price: _.round(price, PRICE_PRECISION_MAP[SYMBOL]),
        quantity: quantity
    });
    console.log(`sendLimitMakerOrder: ${(buyOrSell + ' ').slice(0, 4)}, p ${price}, v ${volume} (q ${quantity})`)
}

export const cancelOrdersByIds = async (symbol: string, orderIdsToCancel: number[]) => {
    if (!orderIdsToCancel || orderIdsToCancel.length === 0) {
        return;
    }

    if (!orderConnection) {
        orderConnection = await client.websocketAPI.connect();
    }

    await Promise.allSettled(orderIdsToCancel.map(orderId => {
        return orderConnection.orderCancel({symbol, orderId})
    }))
}

export const cancelAllOrders = async (symbol: string) => {
    if (!orderConnection) {
        orderConnection = await client.websocketAPI.connect();
    }
    await orderConnection.openOrdersCancelAll({symbol})
}

*/
