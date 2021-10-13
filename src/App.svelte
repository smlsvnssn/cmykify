<script>
	import 'style.scss';
	import CMYKificator from './CMYKificator.svelte';

	//localStorage.clear();
	let settingsA = { c: 20, m: 40, y: 100, k: 10, raster: 3, saturation: 1 },
		settingsB = { c: 20, m: 40, y: 100, k: 10, raster: 3, saturation: 1 };

	if (localStorage.getItem('CMYKprops')) [settingsA, settingsB] = JSON.parse(localStorage.getItem('CMYKprops'));

	$: localStorage.setItem('CMYKprops', JSON.stringify([settingsA, settingsB]));
</script>

<CMYKificator bind:settings={settingsA} />
<CMYKificator bind:settings={settingsB} />

<style lang="scss" global>
	@import './style.scss';
</style>
