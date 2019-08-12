<template>
<div class="task-list">
    <h2>Due Tasks</h2>

  <ul>
    <li v-show="getTasksForDisplay.length == 0">There are no tasks to display.</li>

    <li v-for="task in getTasksForDisplay" :key="task._id">

      <toggle-done-button 
        v-show="!task.done"
        v-on:custom="toggleDone(task._id)"
        class="btn btn-dark btn-sm"
      >done
      </toggle-done-button>

      <strong>{{ task.name }}</strong>, <span v-bind:class="{ 'due-today': getDueToday(task._id), 'overdue': getOverdue(task._id) }">Due {{ displayDate(task._id) }}</span>

      <toggle-show-detail-button
        v-on:custom="toggleShowDetail(task._id)"
        class="btn btn-light btn-sm"
      >more info

      </toggle-show-detail-button>

      <task-details-display
        v-show="showDetail == task._id"
        v-bind:task="task"
        v-bind:key="task._id">
      </task-details-display>

    </li>

    <li><sort-tasks-button
      v-show="getTasksForDisplay.length > 0"
      v-on:custom="toggleSort"
      class="btn btn-primary btn-sm"
      >toggle sort
      </sort-tasks-button>
    </li>

</ul>
  
  <span class="filter-label">Filter:</span>

  <filter-tasks-button
    v-on:custom="filterKey = 'all'"
    v-bind:class="{ 'btn btn-outline-primary col-sm-2': (filterKey == 'all'), 'btn btn-primary col-sm-2': (filterKey != 'all') }"
  >All Due
  </filter-tasks-button>

  <filter-tasks-button
    v-on:custom="filterKey = 'overdue'"
    v-bind:class="{ 'btn btn-outline-danger col-sm-2': (filterKey == 'overdue'), 'btn btn-danger col-sm-2': (filterKey != 'overdue') }"
  >Overdue
  </filter-tasks-button>

  <filter-tasks-button
    v-on:custom="filterKey = 'today'"
    v-bind:class="{ 'btn btn-outline-warning col-sm-2': (filterKey == 'today'), 'btn btn-warning col-sm-2': (filterKey != 'today') }"
  >Due Today
  </filter-tasks-button>

  <filter-tasks-button
    v-on:custom="filterKey = 'tomorrow'"
    v-bind:class="{ 'btn btn-outline-secondary col-sm-2': (filterKey == 'tomorrow'), 'btn btn-secondary col-sm-2': (filterKey != 'tomorrow') }"
  >Due Tomorrow
  </filter-tasks-button>

<hr>

  <h2>All Done</h2>
    <ul>
      <li v-show="getDoneTasksForDisplay.length == 0">There are no tasks marked as done.</li>
      <li v-for="task in getDoneTasksForDisplay" v-bind:key="task._id">

        <button class="btn btn-dark btn-sm" v-on:click="deleteTask(task._id)">delete</button>

        <toggle-done-button 
          v-show="task.done"
          v-on:custom="toggleDone(task._id)"
          class="btn btn-light btn-sm"
        >not done
        </toggle-done-button>

        {{ task.name }}
      </li>
    </ul>

<hr>
  <h2>Create a New Task</h2>
  <div class="container">

    <div class="row">
      <div class="col">
        <div class="error" v-show="createFormError">
          {{ createFormErrorMsg }}
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-6">
          Task: <input id="new-task-name" type="text" class="form-control" v-model.trim="newTaskName">
      </div>

      <div class="col-sm-auto">
          Due: <input id="new-task-due" class="form-control" type=date v-model.trim="newTaskDue">
      </div>
    </div>

    <div class="row">
      <div class="col-12">
          More info: <input id="new-task-descr" class="form-control" type="text" v-model.trim="newTaskDescr">
      </div>
    </div>
      
    <div class="row">
      <div class="col">
        <create-task-button
          v-on:custom="createTask"
          class="btn btn-primary col-sm-3"
        >Create
        </create-task-button>
      </div>
    </div>

  </div>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import axios from 'axios'
import ToggleDoneButton from './ToggleDoneButton'
import ToggleShowDetailButton from './ToggleShowDetailButton'
import TaskDetailsDisplay from './TaskDetailsDisplay'
import FilterTasksButton from './FilterTasksButton'
import CreateTaskButton from './CreateTaskButton'
import SortTasksButton from './SortTasksButton'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// URI of the Task API
axios.defaults.baseURL = 'http://localhost:8082/api/task';

export default {
  name: 'TaskList',
  props: {
  },
  data () {
    return {
      // an array of all tasks
      myTasks: [],

      // a task id, for display of its detail
      showDetail: '0',

      // for the filter button action, triggers a filtered display
      filterKey: 'all',

      sortDirection: true, // asc is default here

      // these are for Create Task action
      newTaskName: '',
      newTaskDescr: '',
      newTaskDue: '',
      createFormErrorMsg: '', // form error msg
      createFormError: false, // simple error msg display flag
    }
  },
  components: {
    'toggle-done-button': ToggleDoneButton,
    'toggle-show-detail-button': ToggleShowDetailButton,
    'task-details-display': TaskDetailsDisplay,
    'filter-tasks-button': FilterTasksButton,
    'create-task-button': CreateTaskButton,
    'sort-tasks-button': SortTasksButton,
  },
  methods: {
      toggleSort() {
        this.sortDirection = !this.sortDirection;
        if (this.myTasks) {
          this.myTasks.sort((a,b) => {
            if (moment(a.due).isBefore(moment(b.due))) return this.sortDirection?-1:1; 
            if (moment(a.due).isAfter(moment(b.due))) return this.sortDirection?1:-1;
            return 0;
          })
        }
      },

      // sets the showDetail variable to a given task's id
      toggleShowDetail(taskId = 0) {
          (this.showDetail == taskId) ? this.showDetail = 0 : this.showDetail = taskId;
      },

      // return overdue state of a given task
      getOverdue(taskId = 0) {
        if (taskId != 0) {
          // find this task in the array
          let taskToEvaluate = this.myTasks.filter( taskToEvaluate => {
            return taskToEvaluate._id == taskId; })[0];

          return moment(taskToEvaluate.due, "YYYY-MM-DD").isBefore(moment(), 'day')
        } else {
          return false;
        }
      },
      // return due today state of a given task
      getDueToday(taskId = 0) {
        if (taskId != 0) {
          // find this task in the array
          let taskToEvaluate = this.myTasks.filter( taskToEvaluate => {
            return taskToEvaluate._id == taskId; })[0];
          
          return moment(taskToEvaluate.due, "YYYY-MM-DD").isSame(moment(), 'day')
        } else {
          return false;
        }
      },
      // return due tomorrow state of a given task
      getDueTomorrow(taskId = 0) {
        if (taskId != 0) {
          // find this task in the array
          let taskToEvaluate = this.myTasks.filter( taskToEvaluate => {
            return taskToEvaluate._id == taskId; })[0];
          // create a tomorrow moment object for comparison
          let tempMoment = moment().add(1, 'days');
          return moment(taskToEvaluate.due, "YYYY-MM-DD").isSame(tempMoment, 'day')
        } else {
          return false;
        }
      },
      // friendly format for display of this task's date
      displayDate(taskId = 0) {
        if (taskId != 0) {
          // find this task in the array
          let taskToEvaluate = this.myTasks.filter( taskToEvaluate => {
            return taskToEvaluate._id == taskId; })[0];
          return (moment(taskToEvaluate.due, "YYYY-MM-DD").isSame(moment(), 'day')) ? 
            "Today" : moment(taskToEvaluate.due, "YYYY-MM-DD").format("dddd MMMM DD");
        } else {
          console.log("displayDate() error: invalid task id");
          return "Date format error";
        }
      },

      // toggles the "done" state of a given task, via the Task API
      toggleDone(taskId = 0) {
        if (taskId != 0) {
          // find the task in the array
          let taskToUpdate = this.myTasks.filter( taskToUpdate => {
            return taskToUpdate._id == taskId; })[0];
          taskToUpdate.done = !taskToUpdate.done;

          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          };
          axios.post( 
              '/update/' + taskId, 
              taskToUpdate,
              config)
            .then( response => this.myTasks = response.data )
            .catch(function (error) {
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
              console.log(error.config);
            });
        } else {
          console.log("toggleDone() error: invalid task id");
        }
      },
      deleteTask(taskId) {
        if (taskId != 0) {
          axios.delete('/delete/' + taskId)
              .then( response => this.myTasks = response.data )
            .catch(function (error) {
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
              console.log(error.config);
            });
        } else {
          console.log("deleteTask() error: invalid task id");
        }
      },        
      // create a new task in the system, via the Task API
      createTask() {
        // clear any pre-existing error condition
        this.createFormError = false; 
        this.createFormErrorMsg = '';

        // confirm that we have data for a new task
        if (!this.newTaskName ||
            !this.newTaskDescr ||
            !this.newTaskDue) {
              this.createFormError = true;
              this.createFormErrorMsg = 'To create a task, please complete the form.';

        // validate date
        } else if (moment(this.newTaskDue).isBefore(moment(), 'day')) {          
            this.createFormError = true;
            this.createFormErrorMsg = 'To create this task, please choose either today or a future date.';

        } else if (!this.createFormError) { // just in case
            // clean date format
            this.newTaskDue = moment(this.newTaskDue).format('YYYY-MM-DD');

            axios.post('/add' , {
                  name: this.newTaskName,
                  description: this.newTaskDescr,
                  due: this.newTaskDue
                  })
              .then( response =>  this.myTasks = response.data )
              .catch(function (error) {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                console.log(error.config);
              });

            // clear form fields
            this.newTaskName = '';
            this.newTaskDescr = '';
            this.newTaskDue = '';
            this.createFormError = false; // clear any error message
          }
      },
  },
  computed: {
      // get the set of tasks appropriate to display
      getTasksForDisplay() {
        if (this.myTasks) {
          if (this.filterKey == 'overdue') {
              return this.myTasks.filter(task => moment(task.due, "YYYY-MM-DD").isBefore(moment(), 'day')).filter(task => !task.done)
          } else if (this.filterKey == 'today') {
              return this.myTasks.filter(task => moment(task.due, "YYYY-MM-DD").isSame(moment(), 'day')).filter(task => !task.done)
          } else if (this.filterKey == 'tomorrow') {
              let tempMoment = moment().add(1, 'days');
              return this.myTasks.filter(task => moment(task.due, "YYYY-MM-DD").isSame(tempMoment, 'day')).filter(task => !task.done)
          }
          return this.myTasks.filter(task => !task.done).sort((a,b) => {
            if (moment(a.due).isBefore(moment(b.due))) return this.sortDirection?-1:1; 
            if (moment(a.due).isAfter(moment(b.due))) return this.sortDirection?1:-1;
            return 0;
          })
        }
        return this.myTasks;
      },
      getDoneTasksForDisplay() {
        return this.myTasks.filter(task => task.done)
      },
  },
  // retrieve all the existing tasks via the Task API
  mounted: function () {
    axios.get('/all')
      .then(response => {
        console.log("TaskConsoleDisplay.vue mounted with tasks: " + JSON.stringify(response.data))
        this.myTasks = response.data
      })
      .catch(function (error) {
        console.log("TaskConsoleDisplay.vue: error communicating with Task API");
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
    })    
  },
}
</script>

<style>
.container {
  text-align: left;
}

button {
  margin: 5px 5px;
}

input {
  margin: 5px 0px;
}

.overdue {
  color: #dc3545;
  font-weight: 700;
}

.error {
  color: #dc3545;
  font-weight: 700;  
  margin: 5px 0px;
}

.due-today {
  color: #ffc107;
  font-weight: 700;
}

.filter-label {
  margin: 5px 5px;
  font-weight: 700;  
}

.filter-button {
  width: 15%;
}
</style>