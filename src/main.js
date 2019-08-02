import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/axios'
import './plugins/bootstrap-vue'
import App from './App.vue'

Vue.config.productionTip = false

Vue.component('detail-display', {
	props: ['task',],
	template: `<ul>
          <li>Description: {{ task.description }}</li>
        </ul>`,
})

new Vue({
  render: h => h(App),
}).$mount('#app')
