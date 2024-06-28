import { getSessionConfig } from '@/config'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as CookieParser from 'cookie-parser'

import * as session from 'express-session'
import helmet from 'helmet'
import * as passport from 'passport'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)

	const PORT = config.get<number>('PORT')

	app.use(helmet())

	app.enableCors({
		credentials: true,
		origin: [config.get<string>('CLIENT_URL')],
		allowedHeaders: ['X-Xsrf-Token']
	})

	app.setGlobalPrefix('api')

	app.use(CookieParser())
	app.useGlobalPipes(new ValidationPipe())

	app.use(session(getSessionConfig(config)))

	app.use(passport.initialize())
	app.use(passport.session())

	await app.listen(PORT, () => console.log('Server started on port:', PORT))
}
bootstrap()
