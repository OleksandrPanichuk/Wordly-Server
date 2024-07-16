import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { User, UserRole } from '@prisma/client'
import { Request } from 'express'
import { Observable } from 'rxjs'

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest<Request>()
		if (!req.isAuthenticated()) return false
		const user = req.user as User
		return user.role === UserRole.ADMIN
	}
}
