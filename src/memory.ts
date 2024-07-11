let closeList: number[] = []  //每秒
let bestAsk: string
let bestBid: string

export const updateClose = (closePrice: number) => {
    closeList.push(closePrice)
    closeList = closeList.slice(-900)
    console.log("closePrice: ", closePrice)
}

/**
 * ask > bid
 */
export const updateBestAskBid = (ask: string, bid: string) => {
    bestAsk = ask
    bestBid = bid
    console.log("askAndBid: ", ask, bid)
}