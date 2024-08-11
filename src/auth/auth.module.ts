import { UsersService } from '@/users/users.service'
import { CloudinaryModule } from '@app/cloudinary'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PasswordModule } from './password/password.module'
import { LocalStrategy } from './strategy'
import { GoogleStrategy } from './strategy/google.strategy'
import { SessionSerializer } from './utils/session.serializer'

@Module({
	imports: [
		PassportModule.register({ session: true }),
		PasswordModule,
		CloudinaryModule
	],
	providers: [
		AuthService,
		SessionSerializer,
		LocalStrategy,
		GoogleStrategy,
		UsersService
	],
	controllers: [AuthController]
})
export class AuthModule {}
