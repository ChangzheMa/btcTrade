import { DepthUpdateEvent } from './types.js';

export class LocalCache {
    depthUpdateEventList: DepthUpdateEvent[];
    bookDepthCurrent: any;

    constructor() {
        this.depthUpdateEventList = []
        this.bookDepthCurrent = null
    }

    updateBookDepth = () => {
        this.depthUpdateEventList = this.depthUpdateEventList.slice(-1000)
    }

    onUpdateEvent = (updateEvent: DepthUpdateEvent) => {
        this.depthUpdateEventList.push(updateEvent)
        if (this.bookDepthCurrent != null) {
            this.updateBookDepth()
        }
    }

    onBookDepthInit = () => {

    }
}
