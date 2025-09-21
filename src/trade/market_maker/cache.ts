import { BookDepthData, DepthLevel, DepthUpdateEvent } from './types.js';
import _ from 'lodash';

export class LocalCache {
    depthUpdateEventList: DepthUpdateEvent[];
    bookDepthCurrent: any;

    constructor() {
        this.depthUpdateEventList = []
        this.bookDepthCurrent = null
    }

    getBookDepthCurrent = () => {
        return this.bookDepthCurrent
    }

    updateBookDepth = () => {
        if (this.depthUpdateEventList.length == 0 || this.bookDepthCurrent == null) {
            return
        }
        for (const event of this.depthUpdateEventList) {
            if (event.u < this.bookDepthCurrent.lastUpdateId) {
                // nothing
            } else if (event.U > this.bookDepthCurrent.lastUpdateId) {
                this.bookDepthCurrent = null
                console.log("数据异常，重建订单簿")
            } else {
                this.bookDepthCurrent.bids = this._updateDepthLevel(this.bookDepthCurrent.bids, event.b, false)
                this.bookDepthCurrent.asks = this._updateDepthLevel(this.bookDepthCurrent.asks, event.a, true)
                this.bookDepthCurrent.lastUpdateId = event.u
            }
        }
        this.depthUpdateEventList = []
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

    private _updateDepthLevel(base: DepthLevel[], patch: DepthLevel[], sortAsc: boolean) {
        base = base.slice(0, 100)
        for (const i of _.range(0, patch.length)) {
            let found = false
            for (const j of _.range(0, base.length)) {
                if (base[j][0] == patch[i][0]) {
                    base[j][1] = patch[i][1]
                    found = true
                    break
                }
            }
            if (!found) {
                base.push(patch[i])
            }
        }
        // @ts-ignore
        return base.filter(value => value[1] > 0).sort((a,b) => sortAsc ? a[0]-b[0] : b[0]-a[0])
    }
}
