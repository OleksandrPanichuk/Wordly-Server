import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@prisma/client'
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(private readonly config: ConfigService) {
		super({
			clientID: config.get<string>('GOOGLE_CLIENT_ID'),
			clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
			scope: ['email', 'profile'],
			callbackURL: `${config.get<string>('URL')}/api/auth/callback/google`
		})
	}

	async validate(
		at: string,
		rt: string,
		profile: Profile,
		done: VerifyCallback
	) {
		const { displayName, emails, photos } = profile

		const user: Partial<User> = {
			username: displayName,
			email: emails[0].value,
			avatar: {
				url: photos[0].value,
				key: undefined
			}
		}
		done(null, user)
	}
}
