<template>
    <section>
        这里是：views/Home.vue
        状态管理数据{{fooCount}}
        <hello-world></hello-world>
    </section>
</template>

<script>
    import HelloWorld from '../components/HelloWorld.vue'
    // 在这里导入模块，而不是在 `store/index.js` 中
    import fooStoreModule from '../store/modules/test'

    export default {
        asyncData ({ store }) {
            store.registerModule('foo', fooStoreModule);
            return store.dispatch('foo/inc')
        },

        // 重要信息：当多次访问路由时，
        // 避免在客户端重复注册模块。
        destroyed () {
            this.$store.unregisterModule('foo')
        },

        computed: {
            fooCount () {
                return this.$store.state.foo.count
            }
        },
        components: {
            HelloWorld
        }
    }
</script>
