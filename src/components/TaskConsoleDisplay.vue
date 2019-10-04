<template>
  <div class="task-list">
    <h2 id="heading-top">Tasks</h2>

    <ul>
      <li v-show="getTasksForDisplay.length == 0">
        There are no tasks to display.
      </li>

      <li v-for="task in getTasksForDisplay" :key="task._id">
        <toggle-done-button
          v-show="!task.done"
          v-on:custom="toggleDone(task._id)"
          class="btn btn-dark btn-sm"
          >done
        </toggle-done-button>

        <strong>{{ task.name }}</strong
        >,
        <span
          v-bind:class="{
            'due-today': getDueToday(task._id),
            overdue: getOverdue(task._id)
          }"
          >Due {{ displayDate(task._id) }}</span
        >

        <toggle-show-detail-button
          v-on:custom="toggleShowDetail(task._id)"
          class="btn btn-light btn-sm"
          >more info
        </toggle-show-detail-button>

        <!-- START LABELS -->

        <span v-show="labels">
          <span v-show="task.labels.length > 0">
            <span v-for="label in task.labels" v-bind:key="label">
              <b-button
                pill
                size="sm"
                variant="info"
                v-on:click="updateLabel(task._id, label)"
              >
                {{ label }} <strong>x</strong>
              </b-button>
            </span>
          </span>

          <b-button
            pill
            size="sm"
            variant="info"
            v-on:click="toggleEditLabels(task._id)"
          >
            <span v-show="showLabels != task._id"><strong>+</strong></span>
            <span v-show="showLabels == task._id"><strong>–</strong></span>
          </b-button>

          <span v-show="showLabels == task._id">
            <span v-for="labelOption in getAllLabels" v-bind:key="labelOption">
              <span v-show="task.labels.includes(labelOption)">
                <b-button
                  pill
                  size="sm"
                  variant="secondary"
                  v-on:click="updateLabel(task._id, labelOption)"
                >
                  {{ labelOption }} <strong>x</strong>
                </b-button>
              </span>
              <span v-show="!task.labels.includes(labelOption)">
                <b-button
                  pill
                  size="sm"
                  variant="outline-secondary"
                  v-on:click="updateLabel(task._id, labelOption)"
                >
                  {{ labelOption }} <strong>+</strong>
                </b-button>
              </span>
            </span>
          </span>

          <div v-show="showLabels == task._id">
            <div class="container">
              <div class="row justify-content-start align-items-center">
                <div class="col-sm-auto">
                  <input
                    id="new-label"
                    type="text"
                    class="form-control"
                    v-model.trim="newLabelText"
                  />
                </div>
                <div class="col-sm-auto">
                  <create-task-button
                    v-on:custom="createLabel(task._id)"
                    class="btn btn-outline-secondary"
                    >Create Label
                  </create-task-button>
                </div>
              </div>
            </div>
          </div>
        </span>
        <!-- END LABELS -->

        <task-details-display
          v-show="showDetail == task._id"
          v-bind:task="task"
          v-bind:key="task._id"
        >
        </task-details-display>
      </li>

      <li>
        <sort-list-button
          v-show="getTasksForDisplay.length > 0"
          v-on:custom="toggleSort"
          class="btn btn-primary btn-sm"
          >toggle sort
        </sort-list-button>
        <sort-list-button
          v-on:custom="toggleLabels"
          class="btn btn-primary btn-sm"
        >
          <span v-show="labels">hide</span>
          <span v-show="!labels">show</span>
          labels
        </sort-list-button>
      </li>
    </ul>

    <span class="filter-label">Filter:</span>

    <filter-list-button
      v-on:custom="filterKey = 'all'"
      v-bind:class="{
        'btn btn-outline-primary col-sm-2': filterKey == 'all',
        'btn btn-primary col-sm-2': filterKey != 'all'
      }"
      >All
    </filter-list-button>

    <filter-list-button
      v-on:custom="filterKey = 'overdue'"
      v-bind:class="{
        'btn btn-outline-danger col-sm-2': filterKey == 'overdue',
        'btn btn-danger col-sm-2': filterKey != 'overdue'
      }"
      >Overdue
    </filter-list-button>

    <filter-list-button
      v-on:custom="filterKey = 'today'"
      v-bind:class="{
        'btn btn-outline-warning col-sm-2': filterKey == 'today',
        'btn btn-warning col-sm-2': filterKey != 'today'
      }"
      >Today
    </filter-list-button>

    <filter-list-button
      v-on:custom="filterKey = 'tomorrow'"
      v-bind:class="{
        'btn btn-outline-secondary col-sm-2': filterKey == 'tomorrow',
        'btn btn-secondary col-sm-2': filterKey != 'tomorrow'
      }"
      >Tomorrow
    </filter-list-button>

    <div v-show="labels">
      <span v-for="labelFilter in getAllLabels" v-bind:key="labelFilter">
        <b-button
          v-show="filterKey != labelFilter"
          pill
          size="sm"
          variant="info"
          v-on:click="filterKey = labelFilter"
        >
          {{ labelFilter }}
        </b-button>
        <b-button
          v-show="filterKey == labelFilter"
          pill
          size="sm"
          variant="outline-info"
          v-on:click="filterKey = labelFilter"
        >
          {{ labelFilter }}
        </b-button>
      </span>
    </div>

    <hr />

    <h2>Done Tasks</h2>
    <ul>
      <li v-show="getDoneTasksForDisplay.length == 0">
        There are no tasks marked as done.
      </li>
      <li v-for="task in getDoneTasksForDisplay" v-bind:key="task._id">
        <b-button variant="dark" size="sm" v-on:click="deleteTask(task._id)">
          delete
        </b-button>

        <toggle-done-button
          v-show="task.done"
          v-on:custom="toggleDone(task._id)"
          class="btn btn-light btn-sm"
          >not done
        </toggle-done-button>

        {{ task.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import ToggleDoneButton from "./ToggleDoneButton";
import ToggleShowDetailButton from "./ToggleShowDetailButton";
import TaskDetailsDisplay from "./TaskDetailsDisplay";
import FilterListButton from "./FilterListButton";
import SortListButton from "./SortListButton";
import CreateTaskButton from "./CreateTaskButton"; // for now, no reason not to re-use this

export default {
  name: "TaskList",
  props: {},
  data() {
    return {
      // an array of all tasks
      myTasks: [],

      // a task id, for display of its detail
      showDetail: "0",

      // for the filter button action, triggers a filtered display
      filterKey: "all",

      // asc is default here
      sortDirection: true,

      labels: false,
      // to edit labels
      showLabels: false,
      newLabelText: ""
    };
  },
  components: {
    "toggle-done-button": ToggleDoneButton,
    "toggle-show-detail-button": ToggleShowDetailButton,
    "task-details-display": TaskDetailsDisplay,
    "filter-list-button": FilterListButton,
    "sort-list-button": SortListButton,
    "create-task-button": CreateTaskButton
  },
  methods: {
    toggleSort() {
      this.sortDirection = !this.sortDirection;
      this.sortTasks();
    },

    sortTasks() {
      if (this.myTasks) {
        this.myTasks.sort((a, b) => {
          if (moment(a.due).isBefore(moment(b.due)))
            return this.sortDirection ? -1 : 1;
          if (moment(a.due).isAfter(moment(b.due)))
            return this.sortDirection ? 1 : -1;
          return 0;
        });
      }
    },

    // sets the showDetail variable to a given task's id
    toggleShowDetail(taskId = 0) {
      this.showDetail == taskId
        ? (this.showDetail = 0)
        : (this.showDetail = taskId);
    },

    // sets the showDetail variable to a given task's id
    toggleLabels() {
      this.labels = !this.labels;
    },
    toggleEditLabels(taskId) {
      this.showLabels == taskId
        ? (this.showLabels = "")
        : (this.showLabels = taskId);
    },

    // return overdue state of a given task
    getOverdue(taskId = 0) {
      if (taskId != 0) {
        // find this task in the array
        let taskToEvaluate = this.myTasks.filter(tempTask => {
          return tempTask._id == taskId;
        })[0];

        return moment(taskToEvaluate.due, "YYYY-MM-DD").isBefore(
          moment(),
          "day"
        );
      }
      return false;
    },
    // return due today state of a given task
    getDueToday(taskId = 0) {
      if (taskId != 0) {
        // find this task in the array
        let taskToEvaluate = this.myTasks.filter(tempTask => {
          return tempTask._id == taskId;
        })[0];

        return moment(taskToEvaluate.due, "YYYY-MM-DD").isSame(moment(), "day");
      }
      return false;
    },
    // return due tomorrow state of a given task
    getDueTomorrow(taskId = 0) {
      if (taskId != 0) {
        // find this task in the array
        let taskToEvaluate = this.myTasks.filter(tempTask => {
          return tempTask._id == taskId;
        })[0];
        // a tomorrow moment object for comparison
        let tempMoment = moment().add(1, "days");
        return moment(taskToEvaluate.due, "YYYY-MM-DD").isSame(
          tempMoment,
          "day"
        );
      }
      return false;
    },
    // friendly format for display of this task's date
    displayDate(taskId = 0) {
      if (taskId != 0) {
        // find this task in the array
        let taskToEvaluate = this.myTasks.filter(tempTask => {
          return tempTask._id == taskId;
        })[0];
        return moment(taskToEvaluate.due, "YYYY-MM-DD").isSame(moment(), "day")
          ? "Today"
          : moment(taskToEvaluate.due, "YYYY-MM-DD").format("dddd MMMM DD");
      }
      console.log("displayDate() error: invalid task id");
      return "Date format error";
    },

    // newLabelText is cleared downstream in finally block
    createLabel(taskId) {
      return this.updateLabel(taskId, this.newLabelText);
    },

    updateLabel(taskId, label) {
      if (taskId != 0) {
        // find this task in the array
        let taskToUpdate = this.myTasks.filter(tempTask => {
          return tempTask._id == taskId;
        })[0];
        let index = taskToUpdate.labels.findIndex(
          tmpLabel => tmpLabel === label
        );

        if (taskToUpdate.labels.includes(label)) {
          taskToUpdate.labels.splice(index, 1);
        } else {
          taskToUpdate.labels.push(label);
        }

        const config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        };
        axios
          .post("/task/update/" + taskId, taskToUpdate, config)
          .then(response => (this.myTasks = response.data))
          .catch(error => {
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
              console.log("Error", error.message);
            }
            console.log(error.config);
          })
          .finally(() => {
            // in the case of create action
            this.newLabelText = "";
          });
      } else {
        console.log("toggleDone() error: invalid task id");
      }
    },

    // toggles the "done" state of a given task, via the server
    toggleDone(taskId = 0) {
      if (taskId != 0) {
        // find the task in the array
        let taskToUpdate = this.myTasks.filter(taskToUpdate => {
          return taskToUpdate._id == taskId;
        })[0];
        taskToUpdate.done = !taskToUpdate.done;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        };
        axios
          .post("/task/update/" + taskId, taskToUpdate, config)
          .then(response => (this.myTasks = response.data))
          .catch(error => {
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
              console.log("Error", error.message);
            }
            console.log(error.config);
          });
      } else {
        console.log("toggleDone() error: invalid task id");
      }
    },
    deleteTask(taskId) {
      if (taskId != 0) {
        axios
          .delete("/delete/" + taskId)
          .then(response => (this.myTasks = response.data))
          .catch(error => {
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
              console.log("Error", error.message);
            }
            console.log(error.config);
          });
      } else {
        console.log("deleteTask() error: invalid task id");
      }
    }
  },
  computed: {
    // get the set of tasks appropriate to display
    getTasksForDisplay() {
      if (this.myTasks) {
        if (this.filterKey == "overdue") {
          return this.myTasks
            .filter(task =>
              moment(task.due, "YYYY-MM-DD").isBefore(moment(), "day")
            )
            .filter(task => !task.done)
            .sort((a, b) => {
              if (moment(a.due).isBefore(moment(b.due)))
                return this.sortDirection ? -1 : 1;
              if (moment(a.due).isAfter(moment(b.due)))
                return this.sortDirection ? 1 : -1;
              return 0;
            });
        } else if (this.filterKey == "today") {
          return this.myTasks
            .filter(task =>
              moment(task.due, "YYYY-MM-DD").isSame(moment(), "day")
            )
            .filter(task => !task.done)
            .sort((a, b) => {
              if (moment(a.due).isBefore(moment(b.due)))
                return this.sortDirection ? -1 : 1;
              if (moment(a.due).isAfter(moment(b.due)))
                return this.sortDirection ? 1 : -1;
              return 0;
            });
        } else if (this.filterKey == "tomorrow") {
          let tempMoment = moment().add(1, "days");
          return this.myTasks
            .filter(task =>
              moment(task.due, "YYYY-MM-DD").isSame(tempMoment, "day")
            )
            .filter(task => !task.done)
            .sort((a, b) => {
              if (moment(a.due).isBefore(moment(b.due)))
                return this.sortDirection ? -1 : 1;
              if (moment(a.due).isAfter(moment(b.due)))
                return this.sortDirection ? 1 : -1;
              return 0;
            });
        } else if (this.getAllLabels.includes(this.filterKey)) {
          return this.myTasks
            .filter(task => task.labels.includes(this.filterKey))
            .filter(task => !task.done)
            .sort((a, b) => {
              if (moment(a.due).isBefore(moment(b.due)))
                return this.sortDirection ? -1 : 1;
              if (moment(a.due).isAfter(moment(b.due)))
                return this.sortDirection ? 1 : -1;
              return 0;
            });
        }
        return this.myTasks
          .filter(task => !task.done)
          .sort((a, b) => {
            if (moment(a.due).isBefore(moment(b.due)))
              return this.sortDirection ? -1 : 1;
            if (moment(a.due).isAfter(moment(b.due)))
              return this.sortDirection ? 1 : -1;
            return 0;
          });
      }
      return this.myTasks;
    },
    getDoneTasksForDisplay() {
      return this.myTasks.filter(task => task.done);
    },
    getAllLabels() {
      let allLabels = new Array();
      this.myTasks.forEach(task => {
        task.labels.forEach(label => {
          if (!allLabels.includes(label)) {
            allLabels.push(label);
          }
        });
      });
      allLabels.sort();
      return allLabels;
    }
  },
  // retrieve all the existing tasks from the server
  mounted: function() {
    axios
      .get("/task/all")
      .then(response => {
        console.log(
          "TaskConsoleDisplay.vue mounted with tasks: " +
            JSON.stringify(response.data, null, 4)
        );
        this.myTasks = response.data;
      })
      .catch(error => {
        console.log("TaskConsoleDisplay.vue: error communicating with server");
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
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
  }
};
</script>

<style lang="scss">
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
  color: var(--danger);
  font-weight: 700;
}

.due-today {
  color: var(--warning);
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
