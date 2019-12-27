const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
//用于使用service workers缓存您的外部项目依赖项。它将使用sw-precache生成一个服务工作者文件，并将其添加到您的构建目录中。
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const config = merge(base, {
    entry: {
        app: './src/entry-client.js'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'vendor',
                    minChunks: 1
                }
            }
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.VUE_ENV': '"client"'
        }),
        // 此插件在输出目录中
        // 生成 `vue-ssr-client-manifest.json`。
        new VueSSRClientPlugin()
    ]
})

module.exports = config
