let currentOrderOp: 'sell' | 'buy' | null = null
let currentOrderPrice: number | null
let currentOrderMount: number | null

let accountMoney: number = 100
let accountVolume: number = 0

let bestAsk: string
let bestBid: string
let lastPrice: number

// 更新当前最优报价（最优报价用于判定下单是否成功）
export const mockExUpdateAskBid = (ask: string, bid: string) => {
    bestAsk = ask
    bestBid = bid
}

// 更新最新成交价，用于判定虚拟订单是否成交
export const mockExActionTrade = (price: number) => {
    lastPrice = price
    if (!!currentOrderPrice && !!currentOrderMount) {
        let filled = false;
        if (currentOrderOp === 'buy' && price < currentOrderPrice) {
            accountMoney -= currentOrderMount
            accountVolume += currentOrderMount / currentOrderPrice
            filled = true
        } else if (currentOrderOp === 'sell' && price > currentOrderPrice) {
            accountMoney += currentOrderMount
            accountVolume -= currentOrderMount / currentOrderPrice
            filled = true
        }
        if (filled) {
            console.log(`【成交了！】                            ${currentOrderOp} , ${currentOrderPrice} , ${currentOrderMount} , 账户价值: ${accountMoney + accountVolume * lastPrice}, 持仓: ${accountVolume * lastPrice}`)
            clearCurrentOrder()
        }
    }

}

// 下单（mount以元为单位）
export const mockExSendOrder = (op: 'sell' | 'buy' | null, price: number, mount: number): boolean => {

    const ask = parseFloat(bestAsk)
    const bid = parseFloat(bestBid)
    if ((op === 'sell' && price < bid) || (op === 'buy' && price > ask)) {
        return false
    } else {
        currentOrderOp = op
        currentOrderPrice = price
        currentOrderMount = mount
        // console.log(`【创建订单】 ${op} , ${price} , ${mount}`)
        return true
    }
}

export const mockExClearOrder = () => {
    currentOrderOp = null
    currentOrderPrice = null
    currentOrderMount = null
}

export const mockExGetAccount = () => {
    return {
        accountMoney,
        accountVolume,
        lastPrice,
    }
}

export const mockExGetCurrentOrder = () => {
    return {
        currentOrderOp,
        currentOrderPrice,
        currentOrderMount,
    }
}

const clearCurrentOrder = () => {
    currentOrderOp = null
    currentOrderPrice = null
    currentOrderMount = null
}