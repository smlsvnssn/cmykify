<script>
	export let title = 'Title';
	export let value = 0;
	export let min = 0;
	export let max = 1;
	export let step = 1;

	// sanitize
	$: value = Math.max(min, Math.min(value, max)) /*- (value % step)*/;
</script>

<div>
	<legend>{title}</legend>
	<input type="range" class="slider" bind:value {min} {max} {step} />
	<input type="number" class="slider" bind:value {min} {max} {step} />
</div>

<style lang="scss">
	div {
		margin-bottom: 0.5rem;
	}
</style>
