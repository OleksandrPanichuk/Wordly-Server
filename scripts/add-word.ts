import { PrismaClient } from '@prisma/client'

async function addWord() {
	try {
		const prisma = new PrismaClient()
		await prisma.word.create({
			data: {
				name: 'word',
				transcription: {
					en: '/wˈɜːd/',
					us: '/ˈwɝd/'
				},
				partsOfSpeech: ['NOUN', 'VERB']
			}
		})
		console.log('CREATED')
	} catch (err) {
		console.log('ERROR', err)
	}
}

addWord().catch(console.dir)
