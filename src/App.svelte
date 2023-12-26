<script>
	import CMYKify from './CMYKify.svelte'
	import CMYKificator from './CMYKificator.svelte'
	import Info from './parts/Info.svelte'
	import { isSmallScreen } from './stores'
	import { log, times } from 'ouml'

	//localStorage.clear();
	let settingsA = { c: 20, m: 40, y: 100, k: 10, raster: 3, saturation: 1 },
		settingsB = { c: 100, m: 20, y: 20, k: 10, raster: 3, saturation: 1 },
		innerWidth

	if (localStorage.getItem('CMYKprops'))
		[settingsA, settingsB] = JSON.parse(localStorage.getItem('CMYKprops'))

	const preloadImages = (a = []) => {
		;['c', 'm', 'y', 'k'].forEach(channel => {
			a.push(
				times(11, value => {
					const i = new Image()
					i.src = `/cmyk/${channel}${value * 10}.png`
					return i
				}),
			)
		})
		return a
	}

	const preloaded = preloadImages()

	$: $isSmallScreen = innerWidth < 600

	$: localStorage.setItem('CMYKprops', JSON.stringify([settingsA, settingsB]))
</script>

<svelte:window bind:innerWidth />

<CMYKificator bind:settings={settingsA} />
{#if !$isSmallScreen}
	<CMYKificator bind:settings={settingsB} />
{/if}

<CMYKify />

<Info />

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=JetBrains+Mono:wght@300&family=DM+Serif+Display&family=DM+Serif+Text&display=swap"
		type="text/css"
		rel="stylesheet"
	/>
</svelte:head>

<style lang="scss" global>
	//&family=Calistoga&family=Modak
	@use './style.scss';
</style>
