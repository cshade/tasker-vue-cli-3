import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap-vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import VueRouter from "vue-router";
Vue.use(VueRouter);
import router from "./router";

import BootstrapVue from "bootstrap-vue";
Vue.use(BootstrapVue);

import axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, axios);

Vue.config.productionTip = false;

new Vue({
	router,
	render: h => h(App)
}).$mount("#app");
