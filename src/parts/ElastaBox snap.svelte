<script>
	import 'snapsvg';
	import { onMount } from 'svelte';

	export let active = false;
	let svgElement, s, path;

	const paths = {
		start: 'M260,500H0c0,0,0-120,0-250C0,110,0,0,0,0h260c0,0,0,110,0,250C260,380,260,500,260,500z',
		mid: 'M260,500H0c0,0,8-120,8-250C8,110,0,0,0,0h260c0,0-8,110-8,250C252,380,260,500,260,500z',
	};

	onMount(() => {
		s = Snap(svgElement);
		path = s.select('path');
	});

	$: {
		active = active;
		if (path) {
			path.stop().animate({ path: paths.mid }, 320, mina.easeinout, () => {
				path.stop().animate({ path: paths.start }, 1000, mina.elastic);
			});
		}
	}
</script>

<div class="container" class:active on:click on:blur on:mouseenter on:mouseleave>
	<div class="content">
		<slot />
	</div>
	<svg bind:this={svgElement} viewBox="0 0 260 500" preserveAspectRatio="none">
		<path fill="none" d={paths.start} />
	</svg>
</div>

<style>
	.container {
		width: 300px;
		height: 100px;
		position: relative;
		transition: height 0.5s cubic-bezier(0.7, 0, 0.3, 1);
	}

	.content {
		position: relative;
		z-index: 1;
	}

	svg {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		bottom: 0;
		transition: height 0.5s cubic-bezier(0.7, 0, 0.3, 1);
		z-index: 0;
	}

	.active {
		height: 400px;
	}

	svg path {
		fill: #c6cfcf;
	}
</style>
