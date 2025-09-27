/**
 * 解析交易对，返回基础资产和计价资产
 * @param symbol 例如 'BTCUSDT'
 * @returns { base: 'BTC', quote: 'USDT' }
 */
export const parseSymbol = (symbol: string): { base: string, quote: string } => {
    // 常见的计价资产列表
    const quoteAssets = ['USDT', 'FDUSD', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];

    for (const quote of quoteAssets) {
        if (symbol.endsWith(quote)) {
            const base = symbol.substring(0, symbol.length - quote.length);
            return { base, quote };
        }
    }

    // 如果没有匹配到，可以根据一个默认规则（比如后3位是计价资产）
    // 但上面的列表更健壮
    const base = symbol.slice(0, -3);
    const quote = symbol.slice(-3);
    return { base, quote };
}