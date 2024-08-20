import { CanActivate, ExecutionContext } from '@nestjs/common'
import { PrismaClient, User, UserRole } from '@prisma/client'
import { Request } from 'express'

export class SubscribedGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const prisma = new PrismaClient()

		const req = context.switchToHttp().getRequest<Request>()
		const authenticated = req.isAuthenticated()

		if (!authenticated) {
			return false
		}

		const user = req.user as User

		if (user.role === UserRole.ADMIN) {
			return true
		}

		const subscription = await prisma.subscription.findUnique({
			where: {
				userId: user.id
			}
		})

		if (!subscription) {
			return false
		}

		if (Date.now() > subscription.endsAt.getTime()) {
			await prisma.subscription.delete({
				where: {
					id: subscription.id
				}
			})
			return false
		}

		return true
	}
}
