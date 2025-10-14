export const SYMBOL = process.env.SYMBOL || ''
export const BASE_COIN = process.env.BASE_COIN || ''

export const QUANTITY_PRECISION_MAP: {[k: string]: number}  = {
    'BTCFDUSD': 5,
    'BNBFDUSD': 3
}

export const PRICE_PRECISION_MAP: {[k: string]: number}  = {
    'BTCFDUSD': 2,
    'BNBFDUSD': 1
}

