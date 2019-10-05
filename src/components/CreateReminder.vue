<template>
	<div class="create-reminder">
		<h2 id="heading-top">Create a Reminder</h2>
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
import CreateTaskButton from "./CreateTaskButton"; // for now, no reason not to re-use this

export default {
	name: "CreateReminder",
	props: {},
	data() {
		return {
			newRemind: "",
			newRemindwhen: "",
			createFormErrorMsg: "", // form error msg
			createFormError: false // simple error msg display flag
		};
	},
	components: {
		"create-task-button": CreateTaskButton
	},

	methods: {
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
						remindwhen: this.newRemindwhen,
						labels: ["new"]
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
		}
	}
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
