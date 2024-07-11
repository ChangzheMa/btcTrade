let closeList: number[] = []  //每秒
let bestAsk: string
let bestBid: string

export const updateClose = (closePrice: number) => {
    closeList.push(closePrice)
    closeList = closeList.slice(-900)
}

/**
 * ask > bid
 */
export const updateBestAskBid = (ask: string, bid: string) => {
    bestAsk = ask
    bestBid = bid
}