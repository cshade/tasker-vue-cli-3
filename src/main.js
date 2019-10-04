import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import App from "./App.vue";

import "./scss/tasker.scss";
import BootstrapVue from "bootstrap-vue";
// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap-vue/dist/bootstrap-vue.css";
Vue.use(BootstrapVue);

import VueRouter from "vue-router";
Vue.use(VueRouter);
import router from "./router";

import axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, axios);

// URI of the Tasker API
axios.defaults.baseURL = "http://localhost:8082/api/";

Vue.config.productionTip = false;

new Vue({
	router,
	render: h => h(App)
}).$mount("#app");
