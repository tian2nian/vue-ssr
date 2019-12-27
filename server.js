//nodeJs 服务器
const fs = require('fs');
const path = require('path');
const express = require('express');
//创建 express实例
const server = express();
//导入渲染器插件
const { createBundleRenderer } = require('vue-server-renderer');
const resolve = file => path.resolve(__dirname, file);
const templatePath = resolve('./src/index.template.html');
//获取 npm run 后面的命令
const isProd = process.env.NODE_ENV === 'production';
/**
 * 创建Renderer
 */
function createRenderer(bundle, options) {
    return createBundleRenderer(
        bundle,
        Object.assign(options, {
            runInNewContext: false
        })
    );
}
let renderer;
//生产环境
if (isProd) {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const serverBundle = require('./dist/vue-ssr-server-bundle.json');
    const clientManifest = require('./dist/vue-ssr-client-manifest.json');
    renderer = createRenderer(serverBundle, {
        template,
        clientManifest
    });
} else {
    readyPromise = require('./build/setup-dev-server.js')(
        server,
        templatePath,
        (bundle, options) => {
            renderer = createRenderer(bundle, options);
        }
    );
}
//当浏览器请求 *（任意接口）时
server.get('*', async (req, res) => {
    try {
        const context = {
            url: req.url
        };
        //将vm实例渲染为HTML
        const html = await renderer.renderToString(context);
        //将HTML返回给浏览器
        res.send(html);
    } catch (e) {
        console.log(e);
        res.status(500).send('服务器内部错误');
    }
});
//监听浏览器8080端口
server.listen(8080, () => {
    console.log('监听8000，服务器启动成功')
});
