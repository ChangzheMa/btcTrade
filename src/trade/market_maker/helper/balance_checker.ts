import { localCache } from '../cache.js';
import { parseSymbol } from '../../../common/utils.js';
import { Balance } from '../types.js';

class BalanceChecker {
    /**
     * 对于一个交易对，检查账户中两种资产的余额和可用余额。
     * 分别返回两种资产余额/可用余额占总资产的比例。
     * (总资产 = 两种资产的总额之和)
     * @param symbol 交易对，例如 'BTCFDUSD'
     * @returns 返回一个对象，包含基础资产和计价资产的余额比例和可用余额比例
     */
    public checkBalanceRatio(symbol: string) {
        const { base: baseAsset, quote: quoteAsset } = parseSymbol(symbol);

        const baseAssetBalance = localCache.getAssetBalance(baseAsset);
        const quoteAssetBalance = localCache.getAssetBalance(quoteAsset);

        // 为了进行同单位的比较和加总，我们需要将基础资产（如BTC）也换算成计价资产（如FDUSD）的价值
        // 这里需要一个市价来做换算，我们可以使用当前订单簿的中间价
        const depth = localCache.getBookDepthCurrent();
        if (!depth || depth.bids.length === 0 || depth.asks.length === 0) {
            console.warn("无法获取市场价格，暂时无法计算资产比例。");
            return null;
        }
        const midPrice = (parseFloat(depth.bids[0][0]) + parseFloat(depth.asks[0][0])) / 2;

        const baseValueInQuote = this.getTotalBalanceValue(baseAssetBalance, midPrice);
        const quoteValueInQuote = this.getTotalBalanceValue(quoteAssetBalance, 1); // 计价资产本身的价格是1

        const totalAssetsValue = baseValueInQuote + quoteValueInQuote;

        if (totalAssetsValue === 0) {
            return {
                [baseAsset]: {
                    balanceRatio: 0,
                    availableRatio: 0,
                },
                [quoteAsset]: {
                    balanceRatio: 0,
                    availableRatio: 0,
                }
            };
        }

        const baseAvailableValue = this.getAvailableBalanceValue(baseAssetBalance, midPrice);
        const quoteAvailableValue = this.getAvailableBalanceValue(quoteAssetBalance, 1);

        return {
            [baseAsset]: {
                balanceRatio: baseValueInQuote / totalAssetsValue,
                availableRatio: baseAvailableValue / totalAssetsValue,
            },
            [quoteAsset]: {
                balanceRatio: quoteValueInQuote / totalAssetsValue,
                availableRatio: quoteAvailableValue / totalAssetsValue,
            }
        };
    }

    private getTotalBalanceValue(balance: Balance | undefined, price: number): number {
        if (!balance) {
            return 0;
        }
        const totalAmount = parseFloat(balance.f) + parseFloat(balance.l);
        return totalAmount * price;
    }

    private getAvailableBalanceValue(balance: Balance | undefined, price: number): number {
        if (!balance) {
            return 0;
        }
        const availableAmount = parseFloat(balance.f);
        return availableAmount * price;
    }
}

export const balanceChecker = new BalanceChecker();
