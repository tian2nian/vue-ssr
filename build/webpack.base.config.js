//webpack-dev-server插件：自动编译代码 （1）会启动一个实时打包的http服务器，监听代码变化，然后完成编译功能（2）它打包生成的输出文件默认放在项目根目录中，并且该文件是虚拟的、看不见的
const path = require('path');
const webpack = require('webpack');
//合并配置
const merge = require('webpack-merge');
//它会将所有 required 的 *.css 模块抽取到分离的 CSS 文件。 所以你的样式将不会内联到 JS bundle，而是在一个单独的 CSS 文件。如果你的样式文件很大，这样会提速，因为 CSS bundle 和 JS bundle 是平行加载的 从webpack v4开始，该插件不应该用于css由“mini-css-extract-plugin”代替
const ExtractTextPlugin = require("extract-text-webpack-plugin");
// script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题； 自动创建html入口文件
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 用terser-webpack-plugin替换掉uglifyjs-webpack-plugin解决uglifyjs不支持es6语法问题
const TerserJSPlugin = require('terser-webpack-plugin');
// 此模块至少需要Node v6.9.0和webpack v4.0.0  混淆代码
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// 这个插件将CSS提取到单独的文件中 支持按需加载CSS和SourceMaps 建立在webpack v4上
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 用于优化、压缩CSS资源
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// 打包时将之前打包的目录里的文件先清除干净，再生成新的
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
//mock数据
const apiMocker = require('mocker-api');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
//获取 npm run 后面的命令
const lifecycle = process.env.npm_lifecycle_event;
//npm run 的文件名
const project = lifecycle.split('-')[0];
//npm run 的环境名
const proMode = lifecycle.split('-')[1] === 'te';
const envMode = lifecycle.split('-')[1];
const webpackConfig = {
    mode: proMode ? 'production' : 'development',
    output: {
        //打包后的文件目录为dist
        path: path.resolve(__dirname, '../dist'),
        //打包后源代码映射
        // devtool: proMode ?'cheap-module-eval-source-map':'hidden-source-map',
        // devtool: "inline-source-map",
        //打包后的出口js目录
        filename: 'js/[name].[hash].js',
        //分块打包的js目录
        // chunkFilename: proMode ? 'js/[name].[contenthash].bundle.js' : 'js/[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                use: {
                    loader: 'vue-loader'
                }
            },
            {
                test: /\.(le|c)ss$/i,
                use: [
                    proMode ? MiniCssExtractPlugin.loader :
                        'vue-style-loader',
                    'css-loader',
                    'postcss-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.html$/i,
                use: [
                    'html-withimg-loader'//处理.html文件中的图片
                ]
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',//将文件转换为base64URI,url-loader的工作方式与file-loader类似，但如果文件小于字节限制，则可以返回DataURL。file-loader将文件上的import/request()解析为url，并将文件发送到输出目录中。
                        options: {
                            limit: 4096,
                            name: 'img/[name].[contenthash].[ext]'
                        },
                    },
                ],
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    //webpack-dev-server 配置npm run 时启动本地服务
    devServer: {
        contentBase: `./dist`,
        inline: true //实时刷新
    },
    //优化
    optimization: {
        // 分块
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                },
            }
        }
    },
    plugins: [
        // new CleanWebpackPlugin(),
        //定义插件—— 在项目中可以读取到
        new webpack.DefinePlugin({
            'baseUrl':proMode ? 'https:www.baidu.com':JSON.stringify('localhost'),
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new HtmlWebpackPlugin({
            title:'练习',
            filename: './src/index.template.html',
            template: `./src/index.template.html`,
            // 对 html 文件进行压缩
            minify: {
                //是否对大小写敏感，默认false
                caseSensitive: false,

                //是否简写boolean格式的属性如：disabled="disabled" 简写为disabled  默认false
                collapseBooleanAttributes: true,
                //是否去除空格，默认false
                collapseWhitespace: true,

                //是否压缩html里的css（使用clean-css进行的压缩） 默认值false；
                minifyCSS: true,

                //是否压缩html里的js（使用uglify-js进行的压缩）
                minifyJS: true,
                //是否移除注释 默认false
                removeComments: true,
                //Prevents the escaping of the values of attributes
                preventAttributesEscaping: true,

                //是否移除属性的引号 默认false
                removeAttributeQuotes: true,

                //从脚本和样式删除的注释 默认false
                removeCommentsFromCDATA: true,

                //是否删除空属性，默认false
                removeEmptyAttributes: false,

                //  若开启此项，生成的html中没有 body 和 head，html也未闭合
                removeOptionalTags: false,

                //删除多余的属性
                removeRedundantAttributes: true,

                //删除script的类型属性，在h5下面script的type默认值：text/javascript 默认值false
                removeScriptTypeAttributes: true,

                //删除style的类型属性， type="text/css" 同上
                removeStyleLinkTypeAttributes: true,

                //使用短的文档类型，默认false
                useShortDoctype: false,
            }
        }),
        new VueLoaderPlugin()
    ],
    //目录映射
    resolve: {
        alias: {
            '@assets': path.resolve(__dirname, `../assets`),
            '@mixins': path.resolve(__dirname, `..//mixins`),
            '@tools': path.resolve(__dirname, `../tools`),
            '@components': path.resolve(__dirname, `../components`),
        }
    }
};
if (proMode) {
    webpackConfig.optimization.minimizer = [
        //混淆语法
        new UglifyJsPlugin({
            chunkFilter: (chunk) => {
                if (chunk.name === 'vendor') {
                    return false;
                }
                return true;
            },
            //去掉控制台日志
            uglifyOptions: {
                compress: {
                    drop_console: true
                }
            }
        }),
        new OptimizeCssAssetsPlugin({})
    ];
    // webpackConfig.optimization.minimizer = [new TerserJSPlugin({}),
    //     new OptimizeCssAssetsPlugin({}),];
    webpackConfig.plugins.push(
        new MiniCssExtractPlugin({
            filename: proMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: proMode ? '[id].css' : '[id].[hash].css',
        })
    )
} else {
    // 热更新模块
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.devtool = 'inline-source-map';
    if (envMode == 'mock') {
        //mock环境，启用mock代理服务
        webpackConfig.devServer.before = (app) => {
            apiMocker(app, path.resolve(`mock/api.js`));
        };
        //非mock匹配项走测试环境
        webpackConfig.devServer.proxy = process.baseUrl;
    }
}
module.exports = webpackConfig;
