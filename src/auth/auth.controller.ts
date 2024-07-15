import { AuthenticatedGuard } from '@/common'
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	Session,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { SignInInput, SignUpInput } from './dto'
import { GoogleOAuthGuard } from './guard'

@Controller('auth')
export class AuthController {
	private CLIENT_URL: string

	constructor(
		private readonly config: ConfigService,
		private readonly authService: AuthService
	) {
		this.CLIENT_URL = config.get<string>('CLIENT_URL')
	}

	@Post('sign-in')
	@HttpCode(HttpStatus.OK)
	async signIn(@Session() session, @Body() body: SignInInput) {
		const user = await this.authService.signIn(body)
		session.passport = { user: user.id }
		return user
	}

	@Post('sign-up')
	@HttpCode(HttpStatus.CREATED)
	async signUp(@Body() dto: SignUpInput, @Session() session) {
		const user = await this.authService.signUp(dto)
		session.passport = { user: user.id }
		return user
	}

	@Post('sign-out')
	@UseGuards(AuthenticatedGuard)
	@HttpCode(HttpStatus.OK)
	async logOut(@Req() req: Request) {
		req.session.destroy((err) => console.log(err))
		return { message: 'Successfully logged out' }
	}

	@Get('sign-in/google')
	@UseGuards(GoogleOAuthGuard)
	signInWithGoogle() {}

	@Get('callback/google')
	@UseGuards(GoogleOAuthGuard)
	async googleCallback(
		@Req() req: Request,
		@Session() session,
		@Res() res: Response
	) {
		try {
			const data = await this.authService.authorizeWithGoogle(req?.user as User)
			if (data.status === 'signed-in') {
				session.passport = { user: data.user.id }
				return res.redirect(this.CLIENT_URL)
			} else {
				return res.redirect(
					`${this.CLIENT_URL}/create-password?email=${data.user.email}&username=${data.user.username}&avatarUrl=${data.user.avatar.url}`
				)
			}
		} catch (err) {
			return res.redirect(`${this.CLIENT_URL}/auth?error=google`)
		}
	}
}
