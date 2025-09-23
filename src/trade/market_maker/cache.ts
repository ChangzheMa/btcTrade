import {
    AccountCache,
    Balance,
    BookDepthData,
    DepthLevel,
    DepthUpdateEvent,
    OutboundAccountPositionEvent
} from './types.js';
import _ from 'lodash';

class LocalCache {
    // --- 订单簿属性 ---
    depthUpdateEventList: DepthUpdateEvent[];
    bookDepthCurrent: BookDepthData | null;

    // --- 账户仓位属性 ---
    accountPositionEventList: OutboundAccountPositionEvent[];
    accountPositionCurrent: AccountCache | null;

    constructor() {
        this.depthUpdateEventList = []
        this.bookDepthCurrent = null

        this.accountPositionEventList = []
        this.accountPositionCurrent = null
    }

    // ==================================================
    // 订单簿方法
    // ==================================================
    getBookDepthCurrent = () => {
        return this.bookDepthCurrent
    }

    onUpdateEvent = (updateEvent: DepthUpdateEvent) => {
        this.depthUpdateEventList.push(updateEvent)
        if (this.bookDepthCurrent != null) {
            this.updateBookDepth()
        }
    }

    onBookDepthInit = (data: BookDepthData): boolean => {
        if (this.depthUpdateEventList.length > 0 && data.lastUpdateId > this.depthUpdateEventList[0].U) {
            this.bookDepthCurrent = data
            this.updateBookDepth()
            return true
        }
        return false
    }

    private updateBookDepth = () => {
        if (!this.bookDepthCurrent) return;

        for (const event of this.depthUpdateEventList) {
            if (event.u <= this.bookDepthCurrent!.lastUpdateId) {
                // 过期数据，跳过，检查下一条
                continue
            } else if (event.U > this.bookDepthCurrent!.lastUpdateId + 1) {
                console.log(`数据异常，重建订单簿: event: ${JSON.stringify(event)}, lastUpdateId: ${this.bookDepthCurrent!.lastUpdateId}`)
                this.bookDepthCurrent = null
                this.depthUpdateEventList = []
                return
            } else {
                this.bookDepthCurrent!.bids = this._updateDepthLevel(this.bookDepthCurrent!.bids, event.b, false)
                this.bookDepthCurrent!.asks = this._updateDepthLevel(this.bookDepthCurrent!.asks, event.a, true)
                this.bookDepthCurrent!.lastUpdateId = event.u
            }
        }
        this.depthUpdateEventList = []
    }

    private _updateDepthLevel = (base: DepthLevel[], patch: DepthLevel[], sortAsc: boolean) => {
        const baseMap = new Map<string, string>(base);
        for (const [price, quantity] of patch) {
            if (parseFloat(quantity) === 0) {
                baseMap.delete(price);
            } else {
                baseMap.set(price, quantity);
            }
        }
        const sorted = Array.from(baseMap.entries());
        sorted.sort((a, b) => {
            const priceA = parseFloat(a[0]);
            const priceB = parseFloat(b[0]);
            return sortAsc ? priceA - priceB : priceB - priceA;
        });
        return sorted.slice(0, 100);
    }


    // ==================================================
    // 账户仓位方法
    // ==================================================

    /**
     * 获取完整的账户仓位缓存
     */
    public getAccountPosition = (): AccountCache | null => {
        return this.accountPositionCurrent;
    }

    /**
     * 获取指定资产的余额信息
     * @param asset 资产名称 (例如 'BTC')
     */
    public getAssetBalance = (asset: string): Balance | undefined => {
        return this.accountPositionCurrent?.get(asset);
    }

    /**
     * 处理来自 WebSocket 的账户更新事件
     * @param updateEvent 账户仓位更新事件
     */
    public onAccountPositionUpdate = (updateEvent: OutboundAccountPositionEvent) => {
        // 如果缓存已初始化，直接应用更新
        if (this.accountPositionCurrent) {
            this._applyAccountPositionUpdate(updateEvent);
        } else {
            // 如果缓存未初始化，先将事件存入队列
            this.accountPositionEventList.push(updateEvent);
        }
    }

    /**
     * 使用完整的快照数据初始化账户仓位缓存
     * @param initialBalances 从 REST API 获取的完整余额列表
     */
    public onAccountPositionInit = (initialBalances: Balance[]) => {
        // 使用 Map 结构初始化缓存，便于快速查找
        this.accountPositionCurrent = new Map<string, Balance>();
        for (const balance of initialBalances) {
            this.accountPositionCurrent.set(balance.a, balance);
        }

        // 应用在初始化之前收到的所有排队事件
        for (const event of this.accountPositionEventList) {
            this._applyAccountPositionUpdate(event);
        }

        // 清空已处理的事件队列
        this.accountPositionEventList = [];
        console.log("账户仓位缓存初始化并更新完成");
    }

    /**
     * 将单个账户更新事件应用到缓存中
     */
    private _applyAccountPositionUpdate = (event: OutboundAccountPositionEvent) => {
        if (!this.accountPositionCurrent) return;

        for (const updatedBalance of event.B) {
            // 如果资产余额都为0，可以从缓存中移除
            if (parseFloat(updatedBalance.f) === 0 && parseFloat(updatedBalance.l) === 0) {
                this.accountPositionCurrent.delete(updatedBalance.a);
            } else {
                // 更新或添加资产到缓存
                this.accountPositionCurrent.set(updatedBalance.a, updatedBalance);
            }
        }
    }
}

export const localCache = new LocalCache()
