<script>
	import 'style.scss';
	import CMYKificator from './CMYKificator.svelte';
	import { times } from 'ouml';

	//localStorage.clear();
	let settingsA = { c: 20, m: 40, y: 100, k: 10, raster: 3, saturation: 1 },
		settingsB = { c: 20, m: 40, y: 100, k: 10, raster: 3, saturation: 1 };

	if (localStorage.getItem('CMYKprops')) [settingsA, settingsB] = JSON.parse(localStorage.getItem('CMYKprops'));

	const preloadImages = (a = []) => {
		['c', 'm', 'y', 'k'].forEach((channel) => {
			times(11, (value) => {
				const i = new Image();
				i.src = `/cmyk/${channel}${value * 10}.png`;
				a.push(i);
			});
		});
		return a;
	};

	const preloaded = preloadImages();

	$: localStorage.setItem('CMYKprops', JSON.stringify([settingsA, settingsB]));
</script>

<CMYKificator bind:settings={settingsA} />
<CMYKificator bind:settings={settingsB} />

<style lang="scss" global>
	@import './style.scss';
</style>
