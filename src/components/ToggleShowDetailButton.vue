<template>
		<button
			v-on:click="$emit('custom')">
			<slot></slot>
		</button>
</template>

<script>
export default {
	name: 'ToggleShowDetailButton'
}
</script>

<style>
</style>