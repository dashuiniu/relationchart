import Vue from 'vue'
import Router from 'vue-router'
import RelationMain from '@/components/RelationMain'
// import Form from '@/components/Form'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'RelationMain',
            component: RelationMain
        },
    ]
})
