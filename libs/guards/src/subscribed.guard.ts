import { PrismaService } from '@app/prisma'
import { CanActivate, ExecutionContext } from '@nestjs/common'
import { User } from '@prisma/client'
import { Request } from 'express'

export class SubscribedGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>()
		const authenticated = req.isAuthenticated()

		if (!authenticated) return false

		const user = req.user as User

		const subscription = await this.prisma.subscriptions.findUnique({
			where: {
				userId: user.id
			}
		})

		return !!subscription.lsSubscriptionId
	}
}
