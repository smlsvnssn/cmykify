<script>
	export let settings;

	$: mixin = `@mixin cmykify($c: 20, $m: 40, $y: 100, $k: 10, $raster: 3, $saturation: 1) {
	$base: "https://cmykify.vercel.app";
	background-image: url(#{$base}/cmyk/c#{$c}.png), url(#{$base}/cmyk/m#{$m}.png), url(#{$base}/cmyk/y#{$y}.png), url(#{$base}/cmyk/k#{$k}.png),
		url(#{$base}/cmyk/grain.png);
	background-size: #{$raster * 45}px, #{$raster * 45}px, #{$raster * 45}px, #{$raster * 45}px, 512px;
	filter: saturate($saturation);
}

.cmykified { @include cmykify(${settings.c}, ${settings.m} ,${settings.y}, ${settings.k}, ${settings.raster}, ${settings.saturation}) }`;
</script>

<pre>{mixin}</pre>

<style lang="scss">
	pre {
		tab-size: 4;
		font-size: 0.6rem;
		font-family: 'JetBrains Mono', monospace;
	}
</style>
