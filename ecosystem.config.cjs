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
            name: 'MMTrade',
            script: './dist/trade/market_maker/index.js',     // pm2 启动的入口文件
            watch: false,                  // 是否监控文件变动重启，可根据需求开启
            instances: 1,                  // 启动的实例数量
            exec_mode: 'fork',             // fork 模式
            env: {
                NODE_ENV: 'production',       // 设置环境变量为生产环境
                API_KEY: '5vrSGNpTJAJkNYyDHTlb7uLXdMXCJRoNATRdyxJwhLe0Xn9G89n0m0aw6GL7nroa',
                API_SECRET: 'uP6guqd7U8m5e5BdJte64xM86c4xru8EL56yTU0NnTqT3PoVbw18h4HFdRj7acji',
            }
        }
    ]
};