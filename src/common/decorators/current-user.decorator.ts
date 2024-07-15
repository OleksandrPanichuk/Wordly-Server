import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { User as TypeUser } from "@prisma/client"
import { Request } from "express"

export const CurrentUser = createParamDecorator(
	async (data: keyof TypeUser, ctx:  ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>()
		const user = req.user as TypeUser
		return data ? user?.[data] : user
	}
)


