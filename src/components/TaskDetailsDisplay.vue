<template>
		<ul>
          <li>{{ task.description }}</li>
        </ul>
</template>

<script>
export default {
	name: 'TaskDetailsDisplay',
	props: {
		task: Object,
		
		// pass the whole task object instead of 
		// individual props to make it easier later
		// to display other props of this task.
		// description: String,
	},
}
</script>

<style>
</style>