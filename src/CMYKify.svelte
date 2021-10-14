<script>
	import { clickOutside } from './actions';
	let visible = true;
</script>

<div class="cmykify" class:visible use:clickOutside={() => (visible = false)}>
	<h1><span class="c">C</span><span class="m">M</span><span class="y">Y</span><span class="k">K</span>ify®</h1>
	<p>CMYK for the modern web. Finally!</p>
	<p>
		Simply use the provided <span class="c">C</span><span class="m">M</span><span class="y">Y</span><span class="k">K</span>ificators® to adjust
		the colour to your specific needs, and copy/paste the resulting mixin into your scss. It's that easy!
	</p>
</div>

<style lang="scss">
	@import './mixins.scss';

	.cmykify {
		background: #fffe;
		padding: 1rem 2rem;
		@include center();
		max-width: 30rem;
		transition: opacity 2s;
		opacity: 0;
		&.visible {
			opacity: 1;
		}
		.c {
			color: #00aeef;
		}
		.m {
			color: #ec008c;
		}
		.y {
			color: #fff200;
		}
		.k {
			color: #231f20;
		}
	}
</style>
