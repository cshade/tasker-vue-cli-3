<template>
  <div id="app">
    <router-link to="/">
      <img id="logo" alt="Tasker logo" src="./assets/logo.png" />
    </router-link>

    <div id="nav">
      <b-navbar type="light" variant="light">
        <b-navbar-nav class="ml-auto">
          <!-- Bootstrap Vue's b-nav-item in place of router-link -->
          <b-nav-item to="/tasks">Tasks</b-nav-item>
          <b-nav-item to="/reminders">Reminders</b-nav-item>
          <b-nav-item-dropdown
            id="create-dropdown"
            text="Create"
            toggle-class="nav-link-custom"
            right
          >
            <b-dropdown-item to="/create/task">Task</b-dropdown-item>
            <b-dropdown-item to="/create/reminder">Reminder</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-navbar>
    </div>

    <router-view />
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#logo {
  float: left;
  margin: 0px 50px 0px 30px;
}

h1,
h2 {
  font-weight: normal;
  margin: 40px 0px 10px 0px !important;
}

h1 {
  text-align: center;
}

#heading-top {
  margin-top: 135px !important;
}

ul {
  list-style-type: none;
  padding: 0;
  text-align: left;
  padding-left: 20px;
}

li {
  margin: 5px 10px;
}

a {
  color: #42b983;
}
</style>
