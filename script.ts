// import { MongoClient } from 'mongodb'

import { PrismaClient } from '@prisma/client'

// const uri =
// 	'mongodb+srv://sashapanichuk:wD2XZVDaa9YrwlBz@cluster0.z1v0ctz.mongodb.net/dev?retryWrites=true&w=majority&appName=Cluster0'

// const client = new MongoClient(uri)

// async function run() {
// 	try {
// 		await client.connect()
// 		const database = client.db()
// 		const collection = database.collection('PasswordResetLink') // Replace with your collection name

// 		const indexOptions = {
// 			expireAfterSeconds: 600 // Documents expire after 1 hour (3600 seconds)
// 		}

// 		await collection.createIndex('createdAt', indexOptions) // Replace "yourDateField" with your actual date field

// 		console.log('TTL index created successfully!')
// 	} finally {
// 		await client.close()
// 	}
// }

// run().catch(console.dir)

const prisma = new PrismaClient()

async function addWord() {
	try {
		await prisma.word.create({
			data: {
				name: 'word',
				transcription: {
					en: '/wˈɜːd/',
					us: '/ˈwɝd/'
				},
				meanings: {
					createMany: {
						data: [
							{
								definition: 'the sacred writings of the Christian religions',
								partOfSpeech: 'NOUN',
								examples: ['Word is a basic form in every language'],
								creatorId: '6696ce3d8b0596f11af041af',
								type: 'VOCABULARY'
							},
							{
								definition: 'put into words or an expression',
								partOfSpeech: 'VERB',
								examples: [
									'Word is a basic form in every language',
									'Word is a basic form in every language',
									'Word is a basic form in every language',
									'Word is a basic form in every language',
									'Word is a basic form in every language'
								],
								creatorId: '6696ce3d8b0596f11af041af',
								type: 'VOCABULARY'
							}
						]
					}
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
