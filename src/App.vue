<template>
  <div id="app">
    <img alt="Tasker logo" src="./assets/logo.png">

    <task-console-display/>

  </div>
</template>

<script>
import TaskConsoleDisplay from './components/TaskConsoleDisplay.vue'

export default {
  name: 'app',
  components: { 
      'task-console-display': TaskConsoleDisplay
  },
}

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

h1, h2 {
  font-weight: normal;
  margin: 5px 20px;
}

h1 {
  text-align: center;
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

button {
  margin: 5px 5px;
}
</style>

