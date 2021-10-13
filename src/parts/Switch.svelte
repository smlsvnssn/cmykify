<script>
	export let title = 'Title';
	export let id = 'id';
	export let value = 0;
</script>

<div>
	<input type="checkbox" class="switch" {id} bind:checked={value}>
	<label for={id}>{title}</label>
</div>