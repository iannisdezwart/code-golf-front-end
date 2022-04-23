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
let file: string

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

const showLeaderboard = async (i: number) =>
{
	const challenge = challenges[i]
	const response = await fetch(`${ API_URL }/leaderboard?challenge=${ challenge.challenge }`)
	const leaderboard = await response.json() as PublicLeaderboard

	const leaderboardEntries = Object.entries(leaderboard)
		.map(([ lang, entries ]) => ({ lang, entry: entries[0] }))

	challengesContainer.classList.add('hidden')
	challengeInfoContainer.classList.add('hidden')
	leaderboardContainer.classList.remove('hidden')
	submitContainer.classList.add('hidden')

	leaderboardBox.innerHTML = /* html */ `
	<h2>${ challenge.challenge } leaderboard</h2>

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
				<td>${ lang }</td>
				<td>${ entry?.name ?? '-' }</td>
				<td>${ entry?.codeSize ?? '-' }</td>
			</tr>
			`).join('') }
		</tbody>
	</table>

	<div class="bottom-buttons">
		<button onclick="showChallenge(${ i })">Go back</button>
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
	<input type="text" placeholder="language" id="lang-input">

	<div class="bottom-buttons">
		<button onclick="selectFile()">Select file</button>
		<button onclick="submitCode(${ i })">Submit</button>
		<button onclick="showChallenge(${ i })">Go back</button>
	</div>
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
	console.log(body)

	if (body.state == 'pass')
	{
		console.log('pass')
	}
	else
	{
		console.log('fail')
	}
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
}

getChallenges()