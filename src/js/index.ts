const API_URL = 'https://code-golf.iannis.io'

interface Challenge
{
	challenge: string
	description: string
}

interface PublicLeaderboard
{
	[lang: string]: PublicLeaderboardEntry[]
}

interface PublicLeaderboardEntry
{
	name: string
	codeSize: number
}

interface TestCaseResult
{
	name: string
	state: 'pass' | 'fail' | 'err'
	err?: string
	input: string
	output: string
	expectedOutput?: string
}

interface SubmitResult
{
	state: 'pass' | 'fail'
	results: TestCaseResult[]
}

const challengesContainer = document.querySelector<HTMLDivElement>('#challenges-container')
const challengesBox = document.querySelector<HTMLDivElement>('#challenges')
const challengeInfoContainer = document.querySelector<HTMLDivElement>('#challenge-info-container')
const challengeInfoBox = document.querySelector<HTMLDivElement>('#challenge-info')
const leaderboardContainer = document.querySelector<HTMLDivElement>('#leaderboard-container')
const leaderboardBox = document.querySelector<HTMLDivElement>('#leaderboard')
const submitContainer = document.querySelector<HTMLDivElement>('#submit-container')
const submitBox = document.querySelector<HTMLDivElement>('#submit')

let challenges: Challenge[]
let langs: string[]
let file: string

const escapeHtml = (text: string) => {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

const showChallenge = (i: number) =>
{
	const challenge = challenges[i]

	challengesContainer.classList.add('hidden')
	challengeInfoContainer.classList.remove('hidden')
	leaderboardContainer.classList.add('hidden')
	submitContainer.classList.add('hidden')

	challengeInfoBox.innerHTML = /* html */ `
	<h2>${ challenge.challenge }</h2>

	${ challenge.description }

	<div class="bottom-buttons">
		<button onclick="showHomeScreen()">Go back</button>
		<button onclick="showSubmit(${ i })">Submit code</button>
		<button onclick="showLeaderboard(${ i })">Show leaderboard</button>
	</div>
	`
}

const leaderboardData = new Map<string, PublicLeaderboard>()

const fetchLeaderboard = async (challenge: string) => {
	if (leaderboardData.has(challenge))
	{
		return leaderboardData.get(challenge)
	}

	const response = await fetch(`${ API_URL }/leaderboard?challenge=${ challenge }`)
	const leaderboard = await response.json() as PublicLeaderboard
	leaderboardData.set(challenge, leaderboard)

	return leaderboard
}

const showLeaderboard = async (i: number) =>
{
	const challenge = challenges[i]
	const leaderboard = await fetchLeaderboard(challenge.challenge)

	const leaderboardEntries = Object.entries(leaderboard)
		.map(([ lang, entries ]) => ({ lang, entry: entries[0] }))

	challengesContainer.classList.add('hidden')
	challengeInfoContainer.classList.add('hidden')
	leaderboardContainer.classList.remove('hidden')
	submitContainer.classList.add('hidden')

	leaderboardBox.innerHTML = /* html */ `
	<h2>${ challenge.challenge } leaderboard</h2>

	<div id="leaderboard-table-container">
		<table>
			<thead>
				<tr>
					<th>Language</th>
					<th>Record holder</th>
					<th>Code size</th>
				</tr>
			</thead>
			<tbody>
				${ leaderboardEntries.map(({ lang, entry }) => /* html */ `
				<tr>
					<td><a onclick="showLangLeaderboard(${ i }, '${ lang }')">
						${ lang }</a></td>
					<td>${ entry?.name ?? '-' }</td>
					<td>${ entry?.codeSize ?? '-' }</td>
				</tr>
				`).join('') }
			</tbody>
		</table>
	</div>

	<div class="bottom-buttons">
		<button onclick="showChallenge(${ i })">Go back</button>
	</div>
	`
}
const showLangLeaderboard = async (i: number, language: string) =>
{
	const challenge = challenges[i]
	const leaderboard = await fetchLeaderboard(challenge.challenge)

	const leaderboardEntries = Object.entries(leaderboard)
		.filter(([ lang ]) => lang == language)[0][1]

	challengesContainer.classList.add('hidden')
	challengeInfoContainer.classList.add('hidden')
	leaderboardContainer.classList.remove('hidden')
	submitContainer.classList.add('hidden')

	leaderboardBox.innerHTML = /* html */ `
	<h2>${ challenge.challenge } leaderboard > ${ language }</h2>

	<div id="leaderboard-table-container">
		<table>
			<thead>
				<tr>
					<th>Submitter</th>
					<th>Code size</th>
				</tr>
			</thead>
			<tbody>
				${ leaderboardEntries.map(entry => /* html */ `
				<tr>
					<td>${ entry.name }</td>
					<td>${ entry.codeSize }</td>
				</tr>
				`).join('') }
			</tbody>
		</table>
	</div>

	<div class="bottom-buttons">
		<button onclick="showLeaderboard(${ i })">Go back</button>
	</div>
	`
}

const showSubmit = async (i: number) =>
{
	const challenge = challenges[i]

	challengesContainer.classList.add('hidden')
	challengeInfoContainer.classList.add('hidden')
	leaderboardContainer.classList.add('hidden')
	submitContainer.classList.remove('hidden')

	submitBox.innerHTML = /* html */ `
	<h2>Submit ${ challenge.challenge }</h2>

	<input type="text" placeholder="name" id="name-input">
	<br>
	<select id="lang-input">
		${ langs.map(lang => /* html */ `
		<option value="${ lang }">${ lang }</option>
		`) }
	</select>

	<div class="bottom-buttons">
		<button onclick="showChallenge(${ i })">Go back</button>
		<button onclick="selectFile()">Select file</button>
		<button onclick="submitCode(${ i })">Submit</button>
	</div>

	<div class="spinner-container hidden">
		<label>Running</label>
		<div class="spinner">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</div>

	<div id="result-container"></div>
	`
}

const selectFile = async () =>
{
	file = await new Promise<string>((resolve, reject) =>
	{
		const input = document.createElement('input')
		input.type = 'file'

		document.body.appendChild(input)

		input.onchange = () =>
		{
			if (input.files?.length)
			{
				const fileReader = new FileReader()

				fileReader.onload = () =>
				{
					resolve(fileReader.result as string)
				}

				fileReader.readAsText(input.files[0])
			}
			else
			{
				reject()
			}
		}

		input.click()
		input.remove()
	})
}

const submitCode = async () =>
{
	const name = submitBox.querySelector<HTMLInputElement>('#name-input').value
	const lang = submitBox.querySelector<HTMLInputElement>('#lang-input').value

	if (name == '')
	{
		alert('Please enter your name')
		return
	}

	if (file == null)
	{
		alert('No file selected')
		return
	}

	const spinnerContainer = submitBox.querySelector<HTMLDivElement>('.spinner-container')
	spinnerContainer.classList.remove('hidden')

	const response = await fetch(`${ API_URL }/submit`, {
		method: 'POST',
		body: JSON.stringify({
			name,
			code: file,
			challenge: challenges[0].challenge,
			lang
		}),
	})

	const body = await response.json() as SubmitResult
	spinnerContainer.classList.add('hidden')

	const resultContainer = submitBox.querySelector<HTMLDivElement>('#result-container')

	if (body.state == 'pass')
	{
		resultContainer.innerHTML = /* html */ `
		<p class="green">Your code passed all test cases!</p>
		<p>
			Your submission of ${ file.length } bytes was added to
			the leaderboard.
		</p>
		`
	}
	else
	{
		resultContainer.innerHTML = /* html */ `
		<p class="red">Your code failed one or more test cases!</p>
		${ body.results.map(result => /* html */ `
		<h3>${ result.name }</h3>
		<p>State: ${ result.state }</p>
		<br><br>
		<h4>Input</h4>
		<code>${ escapeHtml(result.input) }</code>
		<br><br>
		<h4>Expected output</h4>
		<code>${ escapeHtml(result.expectedOutput) }</code>
		<br><br>
		<h4>Actual output</h4>
		<code>${ escapeHtml(result.output) }</code>
		<br><br>
		${ result.err ? /* html */ `
		<h4>Error</h4>
		<code>${ escapeHtml(JSON.stringify(result.err)) }</code>
		` : '' }
		`) }
		`
	}

	file = null
}

const showHomeScreen = () =>
{
	challengesContainer.classList.remove('hidden')
	challengeInfoContainer.classList.add('hidden')
	leaderboardContainer.classList.add('hidden')
	submitContainer.classList.add('hidden')
}

const getChallenges = async () =>
{
	const response = await fetch(`${ API_URL }/challenges`)
	challenges = await response.json() as Challenge[]

	challengesBox.innerHTML = challenges.map((challenge, i) => /* html */ `
	<div class="box">
		<div class="title">${ challenge.challenge }</div>
		<button onclick="showChallenge(${ i })">Check out</button>
	</div>
	`).join('')

	langs = await (await fetch(`${ API_URL }/languages`)).json()
}

getChallenges()