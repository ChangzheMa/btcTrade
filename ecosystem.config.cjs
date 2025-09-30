module.exports = {
    apps: [
        // {
        //     name: 'BinanceApp',
        //     script: './dist/index.js',     // pm2 启动的入口文件
        //     watch: false,                  // 是否监控文件变动重启，可根据需求开启
        //     instances: 1,                  // 启动的实例数量
        //     exec_mode: 'fork',             // fork 模式
        //     env: {
        //         NODE_ENV: 'production'       // 设置环境变量为生产环境
        //     }
        // },
        // {
        //     name: 'BinanceWatch',
        //     script: './dist/watch.js',     // pm2 启动的入口文件
        //     watch: false,                  // 是否监控文件变动重启，可根据需求开启
        //     instances: 1,                  // 启动的实例数量
        //     exec_mode: 'fork',             // fork 模式
        //     env: {
        //         NODE_ENV: 'production'       // 设置环境变量为生产环境
        //     }
        // },
        {
            name: 'MMTradeBTC',
            script: './dist/trade/market_maker/index.js',     // pm2 启动的入口文件
            watch: false,                  // 是否监控文件变动重启，可根据需求开启
            instances: 1,                  // 启动的实例数量
            exec_mode: 'fork',             // fork 模式
            env: {
                NODE_ENV: 'production',       // 设置环境变量为生产环境
                SYMBOL: 'BTCFDUSD',
                BASE_COIN: 'FDUSD',
                API_KEY: '5vrSGNpTJAJkNYyDHTlb7uLXdMXCJRoNATRdyxJwhLe0Xn9G89n0m0aw6GL7nroa',
                API_SECRET: 'uP6guqd7U8m5e5BdJte64xM86c4xru8EL56yTU0NnTqT3PoVbw18h4HFdRj7acji',
            }
        },
        {
            name: 'MMTradeBNB',
            script: './dist/trade/market_maker/index.js',     // pm2 启动的入口文件
            watch: false,                  // 是否监控文件变动重启，可根据需求开启
            instances: 1,                  // 启动的实例数量
            exec_mode: 'fork',             // fork 模式
            env: {
                NODE_ENV: 'production',       // 设置环境变量为生产环境
                SYMBOL: 'BNBFDUSD',
                BASE_COIN: 'FDUSD',
                API_KEY: '6bjT1F3gtnKI5gc7nqLzLK2i3O6sa1sDhDeN5tmler95z6gCcsvvTow1Wa4cxtDH',
                API_SECRET: 'aamMkjGbmtTqqV1uXbJKmmEIQpIGyjMasQzkbskoeSKKsPJMTPWqbv5gWjligVM5',
            }
        }
    ]
};
