import { User } from "@prisma/client"

export type UserWithoutHash = Omit<User, 'hash'>