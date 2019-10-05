<template>
      <div class="create-task">
            <h2 id="heading-top">Create a Task</h2>
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
                              Task:
                              <input
                                    id="new-task-name"
                                    type="text"
                                    class="form-control"
                                    v-model.trim="newTaskName"
                              />
                        </div>

                        <div class="col-sm-auto">
                              Due:
                              <input
                                    id="new-task-due"
                                    class="form-control"
                                    type="date"
                                    v-model.trim="newTaskDue"
                              />
                        </div>
                  </div>

                  <div class="row">
                        <div class="col-12">
                              More info:
                              <input
                                    id="new-task-descr"
                                    class="form-control"
                                    type="text"
                                    v-model.trim="newTaskDescr"
                              />
                        </div>
                  </div>

                  <div class="row">
                        <div class="col-sm-3">
                              <create-task-button
                                    v-on:custom="createTask"
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
import CreateTaskButton from "./CreateTaskButton";

export default {
      name: "CreateTask",
      props: {},
      data() {
            return {
                  newTaskName: "",
                  newTaskDescr: "",
                  newTaskDue: "",
                  createFormErrorMsg: "", // form error msg
                  createFormError: false // simple error msg display flag
            };
      },
      components: {
            "create-task-button": CreateTaskButton
      },
      methods: {
            // create a task in the system, via the server
            createTask() {
                  // clear any pre-existing error condition
                  this.createFormError = false;
                  this.createFormErrorMsg = "";

                  // confirm that we have data for a new task
                  if (
                        !this.newTaskName ||
                        !this.newTaskDescr ||
                        !this.newTaskDue
                  ) {
                        this.createFormError = true;
                        this.createFormErrorMsg =
                              "To create a task, please complete the form.";
                  } else if (
                        moment(this.newTaskDue).isBefore(moment(), "day")
                  ) {
                        this.createFormError = true;
                        this.createFormErrorMsg =
                              "To create this task, please choose either today or a future date.";
                  } else if (!this.createFormError) {
                        // just in case
                        // clean date format
                        this.newTaskDue = moment(this.newTaskDue).format(
                              "YYYY-MM-DD"
                        );

                        axios.post("/task/add", {
                              name: this.newTaskName,
                              description: this.newTaskDescr,
                              due: this.newTaskDue,
                              labels: ["new"]
                        })
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

                        // clear form fields
                        this.newTaskName = "";
                        this.newTaskDescr = "";
                        this.newTaskDue = "";
                        this.createFormError = false; // clear any error message
                  }
            }
      },
      computed: {}
};
</script>

<style lang="scss">
button {
      margin: 5px 5px;
}

input {
      margin: 5px 0px;
}

.error {
      color: var(--danger);
      font-weight: 700;
      margin: 5px 0px;
}
</style>
