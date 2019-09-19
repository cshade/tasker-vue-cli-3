<template>
	<b-button variant="primary" v-on:click="$emit('custom')">
		<slot></slot>
	</b-button>
</template>

<script>
export default {
	name: "CreateTaskButton"
};
</script>

<style></style>
