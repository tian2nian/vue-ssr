/*app.js通用入口。
 *核心作用是创建Vue实例。类似SPA的main.js。
*/
import Vue from 'vue'
//导入跟页面
import App from './App.vue'
// 导入路由生成器
import {createRouter} from "./router";
// 导入状态管理生成器
import {createStore} from "./store";
import {sync} from 'vuex-router-sync'

//创建并导出 vue实例生成器
export function createApp() {
    // 生成路由器
    let router = createRouter();
    // 生成状态管理器
    let store = createStore();
    // 同步路由状态(route state)到 store
    sync(store, router);
    let app = new Vue({
        //将路由器挂载到vue实例
        router,
        //将状态管理器挂载到vue实例
        store,
        // 生成App渲染
        render: h => h(App)
    });
    //返回生成的实例们
    return {app, router, store}
}
