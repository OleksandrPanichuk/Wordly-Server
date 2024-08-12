import {
	CanActivate,
	ExecutionContext,
	Injectable,
	mixin
} from '@nestjs/common'
import { User } from '@prisma/client'
import { Request } from 'express'

export const UserGuard = (paramKey = 'userId') => {
	@Injectable()
	class UserGuardMixin implements CanActivate {
		async canActivate(context: ExecutionContext) {
			const request = context.switchToHttp().getRequest<Request>()
			const user = request.user as User

			if (!user) {
				return false
			}

			const userIdFromParams = request.params[paramKey]

			if (!userIdFromParams) {
				throw new Error('userId is required or invalid param key')
			}

			if (user.id === userIdFromParams) {
				return true
			}

			return false
		}
	}
	const guard = mixin(UserGuardMixin)
	return guard
}
