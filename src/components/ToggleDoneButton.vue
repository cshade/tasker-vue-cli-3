<template>
		<button
			v-on:click="$emit('custom')">
			<slot></slot>
		</button>
</template>

<script>
export default {
	name: 'ToggleDoneButton'
}
</script>

<style>
</style>