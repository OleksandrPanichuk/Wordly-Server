import { AuthService } from '@/auth/auth.service'
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { User } from '@prisma/client'
import { Strategy } from 'passport-local'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'email'
		})
	}

	public async validate(email: string, password: string): Promise<User> {
		return await this.authService.signIn({ email, password })
	}
}
