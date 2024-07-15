import { Redis, SESSION_NAME } from '@/common'
import { ConfigService } from '@nestjs/config'
import RedisStore from 'connect-redis'
import { SessionOptions } from 'express-session'

export function getSessionConfig(config: ConfigService): SessionOptions {
	const redis = Redis.getInstance(config)
	return {
		secret: config.get<string>('SESSION_SECRET'),
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7
		},
		name: SESSION_NAME,
		store: new RedisStore({
			client: redis,
			ttl: 60 * 60 * 24 * 7
		})
	}
}
