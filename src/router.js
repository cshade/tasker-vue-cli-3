import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home.vue";
// import TaskConsoleDisplay from "./components/TaskConsoleDisplay";
// import ReminderConsoleDisplay from "./components/ReminderConsoleDisplay";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/reminders",
      name: "reminders",
      component: () => import("./components/ReminderConsoleDisplay")
    },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("./components/TaskConsoleDisplay")
    },
    {
      path: "/create/task",
      name: "create-task",
      component: () => import("./components/CreateTask")
    },
    {
      path: "/create/reminder",
      name: "create-reminder",
      component: () => import("./components/CreateReminder")
    }
  ]
});
