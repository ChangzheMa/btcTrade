import _ from 'lodash';

export const ma5_ma10_ma20_choice = (closeList: number[]): number => {
    const close = closeList[closeList.length-1]
    const ma5 = _.mean(closeList.slice(-5))
    const ma10 = _.mean(closeList.slice(-10))
    const ma20 = _.mean(closeList.slice(-20))
    const ma300 = _.mean(closeList.slice(-300))
    const ma600 = _.mean(closeList.slice(-600))

    const cond_down = close < ma5 && ma5 < ma10 && ma10 < ma20
    const cond_down_reverse = close < ma300 && ma300 < ma600
    const cond_up = close > ma5 && ma5 > ma10 && ma10 > ma20
    const cond_up_reverse = close > ma300 && ma300 > ma600

    return cond_down && !cond_down_reverse ? -1 : (cond_up && !cond_up_reverse ? 1 : 0)
    // return cond_down ? -1 : (cond_up ? 1 : 0)
}

export const ma3_ma7_and_delay1 = (closeList: number[]): number => {
    const ma3 = _.mean(closeList.slice(-3))
    const ma7 = _.mean(closeList.slice(-7))

    const ma3_d1 = _.mean(closeList.slice(-4, -1))
    const ma7_d1 = _.mean(closeList.slice(-8, -1))

    return ma3 < ma7 && ma3_d1 < ma7_d1 ? -1 : (ma3 > ma7 && ma3_d1 > ma7_d1 ? 1 : 0)
}

export const ma3_ma7_and_delay1_always_hold = (closeList: number[], preSign: number): number => {
    const ma3 = _.mean(closeList.slice(-3))
    const ma7 = _.mean(closeList.slice(-7))

    const ma3_d1 = _.mean(closeList.slice(-4, -1))
    const ma7_d1 = _.mean(closeList.slice(-8, -1))

    return ma3 < ma7 && ma3_d1 < ma7_d1 ? -1 : (ma3 > ma7 && ma3_d1 > ma7_d1 ? 1 : preSign)
}