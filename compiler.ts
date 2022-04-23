import { compilePages, importGoogleFont, inlineSASS, PageShell } from 'page-compiler'
import { homePageCompiler } from './pages/home-page'

const main = async () =>
{
	const pageShell = new PageShell({
		head: /* html */ `
		${ await importGoogleFont('Work Sans', [
			{ weight: 400, italic: false },
			{ weight: 700, italic: false }
		]) }
		${ await importGoogleFont('Anonymous Pro', [
			{ weight: 400, italic: false }
		]) }
		`
	})

	compilePages([
		await homePageCompiler(pageShell)
	])
}

main()