<script>
	import löremIpsum from 'loerem';
	import { hsla } from '../ö';
</script>

<div class="box">
	<h4>
		{@html löremIpsum({
			numberOfParagraphs: 1,
			sentencesPerParagraph: 1,
			maxSentenceLength: 4,
			useLörem: false,
			isHeadline: true,
		})}
	</h4>
	<div class="caption" style="color:{hsla(Math.random() * 360, 100, 40)}">
		{@html löremIpsum({
			numberOfParagraphs: 1,
			sentencesPerParagraph: 1,
			maxSentenceLength: 4,
			useLörem: false,
			isHeadline: false,
		})}
	</div>
	{@html löremIpsum({
		numberOfParagraphs: 2,
		sentencesPerParagraph: 3,
		maxSentenceLength: 4,
		useLörem: false,
		isHeadline: false,
	})}
</div>
