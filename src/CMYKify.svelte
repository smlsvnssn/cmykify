<script>
	import { clickOutside } from './actions';
	import { onMount } from 'svelte';
	import { nextFrame } from 'ouml';
	import { introVisible } from './stores';
	import { fly } from 'svelte/transition';
	import { backOut, backIn } from 'svelte/easing';

	onMount(async () => {
		await nextFrame();
		$introVisible = true;
	});
</script>

{#if $introVisible}
	<div
		class="cmykify"
		in:fly={{ delay: 10, duration: 1000, y: -500, opacity: 0, easing: backOut }}
		out:fly={{ duration: 300, y: 300, opacity: 0, easing: backIn }}
		use:clickOutside={() => ($introVisible = false)}
	>
		<h1>
			<span class="c">C</span><span class="m">M</span><span class="y">Y</span><span class="k">K</span>ify®
		</h1>
		<p>CMYK for the modern web. Finally!</p>
		<p>
			Simply use the provided <span class="cmykificator"
				><span class="c">C</span><span class="m">M</span><span class="y">Y</span><span class="k">K</span>ificator®</span
			> to adjust the colour to your specific needs, and copy/paste the resulting mixin into your scss. It's that easy!
		</p>
		<small>
			If you prefer to host the files yourself, download
			<a href="./cmyk.zip">this .zip</a> and change <code>$base</code> accordingly.<br />
			Brought to you by <a href="https://lhli.net">LHLI Corporation™®© Limited</a>. No rights reserved.
		</small>
	</div>
{/if}

<style lang="scss">
	@import './mixins';

	.cmykify {
		background: #ffffffef;
		padding: 1rem 2rem 1.5rem;
		@include center();
		@include cmyko();
		max-width: 25rem;
		box-shadow: 0 5px 30px #231f2033;
		z-index: 100;
		h1 {
			font-size: 3rem;
			line-height: 3rem;
			letter-spacing: -0.04em;
			margin: 1rem 0 0;
			font-weight: normal;
			font-family: 'DM Serif Display';
			color: #231f20;
		}
		small {
			font-size: 0.5rem;
			line-height: 1em;
			a {
				color: #231f20;
			}
		}
		.cmykificator {
			font-family: 'DM Serif Text';
		}
		.c {
			color: #00aeef;
		}
		.m {
			color: #ec008c;
		}
		.y {
			color: rgb(235, 223, 0);
		}
		.k {
			color: #231f20;
		}
	}
</style>
