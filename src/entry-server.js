/** entry-server.js服务端入口。
 * 仅运行于服务器。
 * 核心作用是：拿到App实例生成HTML返回给浏览器渲染首屏
 */
//导入App生成器
import {createApp} from "./app";
/*
context:“服务器”调用上下文。如：访问的url，根据url决定将来createApp里路由的具体操作
 */
export default context => {
    return new Promise((resolve, reject) => {
        //创建App实例,router实例
        const {app, router, store} = createApp();
        //进入首屏：约定node服务器会将浏览器请求的url放进上下文context中，使用router.push()将当前访问的url对应的vue组件路由到App实例当前页
        router.push(context.url);
        //路由准备就绪后
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents();
            // 匹配不到的路由，执行 reject 函数，并返回 404
            if (!matchedComponents.length) {
                return reject({code: 404})
            }
            // 对所有匹配的路由组件调用 `asyncData()`
            Promise.all(matchedComponents.map(Component => {
                if (Component.asyncData) {
                    return Component.asyncData({
                        store,
                        route: router.currentRoute
                    })
                }
            })).then(() => {
                // 在所有预取钩子(preFetch hook) resolve 后，
                // 我们的 store 现在已经填充入渲染应用程序所需的状态。
                // 当我们将状态附加到上下文，
                // 并且 `template` 选项用于 renderer 时，
                // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
                context.state = store.state;
                context.title = router.currentRoute.name;
                //将渲染出来的App返回
                resolve(app);
            }, reject)
        });
    });
}
