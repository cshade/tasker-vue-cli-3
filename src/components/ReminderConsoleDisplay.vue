<template>
  <div class="reminder-console">
    <h2 id="reminders-heading">Reminders</h2>
    <ul>
      <li v-show="getRemindersForDisplay.length == 0">
        There are no reminders to display.
      </li>

      <li v-for="reminder in getRemindersForDisplay" :key="reminder._id">
        <button
          class="btn btn-dark btn-sm"
          v-on:click="deleteReminder(reminder._id)"
        >
          delete
        </button>
        <span class="reminder">{{ reminder.remind }}</span
        >,
        <span
          v-bind:class="{
            soon: isSoon(reminder._id),
            past: isPast(reminder._id)
          }"
          >{{ displayDate(reminder._id) }}</span
        >
      </li>

      <li>
        <sort-list-button
          v-show="getRemindersForDisplay.length > 0"
          v-on:custom="toggleSort"
          class="btn btn-primary btn-sm"
          >toggle sort
        </sort-list-button>
      </li>

      <li>
        <button
          v-show="getRemindersForDisplay.length > 0 && filterKey != 'soon'"
          class="btn btn-danger btn-sm"
          v-on:click="deletePastReminders()"
        >
          delete all past reminders
        </button>
      </li>
    </ul>

    <div class="container">
      <div class="row justify-content-center align-items-center">
        <div class="col-sm-auto">
          <span class="filter-label">Filter:</span>
        </div>

        <div class="col-sm-auto">
          <filter-list-button
            v-on:custom="filterKey = 'all'"
            v-bind:class="{
              'btn btn-outline-primary': filterKey == 'all',
              'btn btn-primary': filterKey != 'all'
            }"
            >All
          </filter-list-button>
        </div>

        <div class="col-sm-auto">
          <filter-list-button
            v-on:custom="filterKey = 'soon'"
            v-bind:class="{
              'btn btn-outline-success': filterKey == 'soon',
              'btn btn-success': filterKey != 'soon'
            }"
            >This Week
          </filter-list-button>
        </div>

        <div class="col-sm-auto">
          <filter-list-button
            v-on:custom="filterKey = 'past'"
            v-bind:class="{
              'btn btn-outline-dark': filterKey == 'past',
              'btn btn-dark': filterKey != 'past'
            }"
            >Past
          </filter-list-button>
        </div>
      </div>
    </div>

    <hr />
    <h2>Create a Reminder</h2>
    <div class="container">
      <div class="row justify-content-start align-items-center">
        <div class="col-sm-auto">
          <div class="error" v-show="createFormError">
            {{ createFormErrorMsg }}
          </div>
        </div>
      </div>

      <div class="row justify-content-start align-items-center">
        <div class="col-6 align-self-start">
          Reminder:
          <input
            id="remind"
            type="text"
            class="form-control"
            v-model.trim="newRemind"
          />
        </div>

        <div class="col-sm-auto">
          Remind When:
          <input
            id="remind-when"
            class="form-control"
            type="date"
            v-model.trim="newRemindwhen"
          />
        </div>
      </div>

      <div class="row justify-content-start align-items-center">
        <div class="col-sm-auto align-self-start">
          <create-task-button
            v-on:custom="createReminder"
            class="btn btn-primary"
            >Create
          </create-task-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";
import SortListButton from "./SortListButton";
import FilterListButton from "./FilterListButton";
import CreateTaskButton from "./CreateTaskButton";

export default {
  name: "ReminderList",
  props: {},
  data() {
    return {
      // an array of all reminders
      myReminders: [],

      // for the filter button action, triggers a filtered display
      filterKey: "all",

      // these are for Create Reminder action
      newRemind: "",
      newRemindwhen: "",
      createFormErrorMsg: "", // form error msg
      createFormError: false // simple error msg display flag
    };
  },
  components: {
    "sort-list-button": SortListButton,
    "filter-list-button": FilterListButton,
    "create-task-button": CreateTaskButton
  },
  methods: {
    isSoon(reminderId = 0) {
      if (reminderId != 0) {
        // find this one in the array
        let reminderToEvaluate = this.myReminders.filter(tempReminder => {
          return tempReminder._id == reminderId;
        })[0];
        return moment(reminderToEvaluate.remindwhen, "YYYY-MM-DD").isSame(
          moment(),
          "week"
        );
      }
      return false;
    },
    isPast(reminderId = 0) {
      if (reminderId != 0) {
        // find this one in the array
        let reminderToEvaluate = this.myReminders.filter(tempReminder => {
          return tempReminder._id == reminderId;
        })[0];
        return moment(reminderToEvaluate.remindwhen, "YYYY-MM-DD").isBefore(
          moment(),
          "day"
        );
      }
      return false;
    },
    // friendly format for display of date
    displayDate(reminderId = 0) {
      if (reminderId != 0) {
        // find this task in the array
        let reminderToEvaluate = this.myReminders.filter(tempReminder => {
          return tempReminder._id == reminderId;
        })[0];
        return moment(reminderToEvaluate.remindwhen, "YYYY-MM-DD").isSame(
          moment(),
          "day"
        )
          ? "Today"
          : moment(reminderToEvaluate.remindwhen, "YYYY-MM-DD").format(
              "dddd MMMM DD"
            );
      }
      console.log("displayDate() error: invalid task id");
      return "Date format error";
    },

    toggleSort() {
      this.sortDirection = !this.sortDirection;
      if (this.myReminders) {
        this.myReminders.sort((a, b) => {
          if (moment(a.remindwhen).isBefore(moment(b.remindwhen)))
            return this.sortDirection ? -1 : 1;
          if (moment(a.remindwhen).isAfter(moment(b.remindwhen)))
            return this.sortDirection ? 1 : -1;
          return 0;
        });
      }
    },
    // create a reminder in the system, via the server
    createReminder() {
      // clear any pre-existing error condition
      this.createFormError = false;
      this.createFormErrorMsg = "";

      // confirm that we have data for a new task
      if (!this.newRemind || !this.newRemindwhen) {
        this.createFormError = true;
        this.createFormErrorMsg =
          "To create a reminder, please complete the form.";

        // validate date
      } else if (moment(this.newRemindwhen).isBefore(moment(), "day")) {
        this.createFormError = true;
        this.createFormErrorMsg =
          "To create this reminder, please choose either today or a future date.";
      } else if (!this.createFormError) {
        // just in case
        // clean date format
        this.newTaskDue = moment(this.newTaskDue).format("YYYY-MM-DD");

        axios
          .post("/reminder/add", {
            remind: this.newRemind,
            remindwhen: this.newRemindwhen
          })
          .then(response => (this.myReminders = response.data))
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

        // clear form fields
        this.newRemind = "";
        this.newRemindwhen = "";
        this.createFormError = false; // clear any error message
      }
    },
    deleteReminder(reminderId) {
      if (reminderId != 0) {
        axios
          .delete("/reminder/delete/" + reminderId)
          .then(response => (this.myReminders = response.data))
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
        console.log("deleteReminder() error: invalid reminder id");
      }
    },
    deletePastReminders() {
      if (this.myReminders) {
        let pastReminders = this.myReminders.filter(tempReminder =>
          moment(tempReminder.remindwhen, "YYYY-MM-DD").isBefore(
            moment(),
            "day"
          )
        );
        for (var i = 0; i < pastReminders.length; i++) {
          this.deleteReminder(pastReminders[i]._id);
        }
      } else {
        console.log("deletePastReminders() error: invalid reminders array");
      }
    }
  },
  computed: {
    // get the set of reminders appropriate to display
    getRemindersForDisplay() {
      if (this.myReminders) {
        if (this.filterKey == "past") {
          return this.myReminders.filter(reminder =>
            moment(reminder.remindwhen, "YYYY-MM-DD").isBefore(moment(), "day")
          );
        } else if (this.filterKey == "soon") {
          return this.myReminders.filter(reminder =>
            moment(reminder.remindwhen, "YYYY-MM-DD").isSame(moment(), "day")
          );
        }
        return this.myReminders.slice().sort((a, b) => {
          if (moment(a.remindwhen).isBefore(moment(b.remindwhen)))
            return this.sortDirection ? -1 : 1;
          if (moment(a.remindwhen).isAfter(moment(b.remindwhen)))
            return this.sortDirection ? 1 : -1;
          return 0;
        });
      }
      return this.myReminders;
    }
  },
  // retrieve all the existing reminders from the server
  mounted: function() {
    axios
      .get("/reminder/all")
      .then(response => {
        console.log(
          "ReminderConsoleDisplay.vue mounted with reminders: " +
            JSON.stringify(response.data)
        );
        this.myReminders = response.data;
      })
      .catch(error => {
        console.log(
          "ReminderConsoleDisplay.vue: error communicating with server"
        );
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
#reminders-heading {
  margin-top: 135px !important;
}

button {
  margin: 5px 5px;
}

.soon {
  color: var(--success);
  font-weight: 700;
}

.past {
  text-decoration: line-through;
}

.reminder {
  font-weight: 700;
}

.filter-button {
  width: 15%;
}

.error {
  color: var(--danger);
  font-weight: 700;
  margin: 5px 0px;
}
</style>
