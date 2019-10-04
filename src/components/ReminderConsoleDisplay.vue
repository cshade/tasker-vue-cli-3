<template>
  <div class="reminder-console">
    <h2 id="heading-top">Reminders</h2>
    <ul>
      <li v-show="getRemindersForDisplay.length == 0">
        There are no reminders to display.
      </li>

      <div v-for="reminder in getRemindersForDisplay" :key="reminder._id">
        <li>
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

          <!-- START LABELS -->

          <span v-show="labels">
            <span v-show="reminder.labels.length > 0">
              <span v-for="label in reminder.labels" v-bind:key="label">
                <b-button
                  pill
                  size="sm"
                  variant="info"
                  v-on:click="updateLabel(reminder._id, label)"
                >
                  {{ label }} <strong>x</strong>
                </b-button>
              </span>
            </span>

            <b-button
              pill
              size="sm"
              variant="info"
              v-on:click="toggleEditLabels(reminder._id)"
            >
              <span v-show="showLabels != reminder._id"
                ><strong>+</strong></span
              >
              <span v-show="showLabels == reminder._id"
                ><strong>–</strong></span
              >
            </b-button>

            <span v-show="showLabels == reminder._id">
              <span
                v-for="labelOption in getAllLabels"
                v-bind:key="labelOption"
              >
                <span v-show="reminder.labels.includes(labelOption)">
                  <b-button
                    pill
                    size="sm"
                    variant="secondary"
                    v-on:click="updateLabel(reminder._id, labelOption)"
                  >
                    {{ labelOption }} <strong>x</strong>
                  </b-button>
                </span>
                <span v-show="!reminder.labels.includes(labelOption)">
                  <b-button
                    pill
                    size="sm"
                    variant="outline-secondary"
                    v-on:click="updateLabel(reminder._id, labelOption)"
                  >
                    {{ labelOption }} <strong>+</strong>
                  </b-button>
                </span>
              </span>
            </span>
          </span>

          <div v-show="showLabels == reminder._id">
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
                    v-on:custom="createLabel(reminder._id)"
                    class="btn btn-outline-secondary"
                    >Create Label
                  </create-task-button>
                </div>
              </div>
            </div>
          </div>

          <!-- END LABELS -->
        </li>
      </div>

      <li>
        <sort-list-button
          v-show="getRemindersForDisplay.length > 0"
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
              'btn btn-outline-warning': filterKey == 'soon',
              'btn btn-warning': filterKey != 'soon'
            }"
            >This Week
          </filter-list-button>
        </div>

        <div class="col-sm-auto">
          <filter-list-button
            v-on:custom="filterKey = 'past'"
            v-bind:class="{
              'btn btn-outline-secondary': filterKey == 'past',
              'btn btn-secondary': filterKey != 'past'
            }"
            >Past
          </filter-list-button>
        </div>
      </div>
      <div class="row justify-content-center align-items-center">
        <div class="col-sm-auto">
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
import CreateTaskButton from "./CreateTaskButton"; // for now, no reason not to re-use this

export default {
  name: "ReminderList",
  props: {},
  data() {
    return {
      // an array of all reminders
      myReminders: [],

      // for the filter button action, triggers a filtered display
      filterKey: "all",

      labels: false,

      // selectedLabel: "",

      showLabels: "",
      newLabelText: ""
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
        // find this reminder in the array
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
      this.sortReminders();
    },

    sortReminders() {
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

    toggleLabels() {
      this.labels = !this.labels;
    },
    toggleEditLabels(reminderId) {
      this.showLabels == reminderId
        ? (this.showLabels = "")
        : (this.showLabels = reminderId);
    },

    // newLabelText is cleared downstream in finally block
    createLabel(reminderId) {
      return this.updateLabel(reminderId, this.newLabelText);
    },

    updateLabel(reminderId, label) {
      if (reminderId != 0) {
        // find this reminder in the array
        let reminderToUpdate = this.myReminders.filter(tempReminder => {
          return tempReminder._id == reminderId;
        })[0];
        let index = reminderToUpdate.labels.findIndex(
          tmpLabel => tmpLabel === label
        );

        if (reminderToUpdate.labels.includes(label)) {
          reminderToUpdate.labels.splice(index, 1);
        } else {
          reminderToUpdate.labels.push(label);
        }

        const config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        };
        axios
          .post("/reminder/update/" + reminderId, reminderToUpdate, config)
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
          })
          .finally(() => {
            // in the case of create action
            this.newLabelText = "";
          });
      } else {
        console.log("toggleDone() error: invalid reminder id");
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
        } else if (this.getAllLabels.includes(this.filterKey)) {
          return this.myReminders
            .filter(reminder => reminder.labels.includes(this.filterKey))
            .sort((a, b) => {
              if (moment(a.due).isBefore(moment(b.due)))
                return this.sortDirection ? -1 : 1;
              if (moment(a.due).isAfter(moment(b.due)))
                return this.sortDirection ? 1 : -1;
              return 0;
            });
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
    },

    getAllLabels() {
      let allLabels = new Array();
      this.myReminders.forEach(reminder => {
        reminder.labels.forEach(label => {
          if (!allLabels.includes(label)) {
            allLabels.push(label);
          }
        });
      });
      allLabels.sort();
      return allLabels;
    }
  },
  // retrieve all the existing reminders from the server
  mounted: function() {
    axios
      .get("/reminder/all")
      .then(response => {
        console.log(
          "ReminderConsoleDisplay.vue mounted with reminders: " +
            JSON.stringify(response.data, null, 4)
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

.label {
  color: var(--primary);
}
</style>
