import { inlineSASS, PageShell, inlineJS } from 'page-compiler'

export const homePageCompiler = async (pageShell: PageShell) => ({
	html: pageShell.render('⛳️ Code Golf 🧑‍💻', /* html */ `
	${ await inlineSASS('./src/sass/index.sass') }

	<main>
		<h1>⛳️ Code Golf 🧑‍💻</h1>

		<div id="challenges-container">
			<h2>Challenges</h2>
			<div id="challenges" class="box-container"></div>
		</div>

		<div id="challenge-info-container" class="hidden">
			<div id="challenge-info"></div>
		</div>

		<div id="leaderboard-container" class="hidden">
			<div id="leaderboard"></div>
		</div>

		<div id="submit-container" class="hidden">
			<div id="submit"></div>
		</div>
	</main>

	${ await inlineJS('./src/js/index.js') }
	`, {
		author: 'Iannis de Zwart',
		description: 'Code Golf',
		keywords: [ 'code golf', 'competitive programming' ]
	}),
	path: '/index.html'
})