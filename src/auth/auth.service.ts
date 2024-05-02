import { generateErrorResponse } from '@app/helpers'
import { PrismaService } from '@app/prisma'
import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { compare } from 'bcrypt'
import { SignInInput, SignUpInput } from './dto'

@Injectable()
export class AuthService {
	constructor(private readonly prisma: PrismaService) {}

	public async signUp(dto: SignUpInput) {
		try {
			const existingUser = await this.prisma.user.findUnique({
				where: {
					email: dto.email
				}
			})
			if (existingUser?.id) throw new ConflictException('Email already in use')

			const salt = await bcrypt.genSalt(10)
			const hash = await bcrypt.hash(dto.password, salt)

			return await this.prisma.user.create({
				data: {
					email: dto.email,
					hash,
					username: dto.username,
					...(dto.avatarUrl && {
						avatar: {
							url: dto.avatarUrl
						}
					})
				}
			})
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async signIn(dto: SignInInput): Promise<User> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					email: dto.email
				}
			})

			if (!user) throw new NotFoundException('User not found')

			const isPasswordMatchHash = await compare(dto.password, user.hash)

			if (!isPasswordMatchHash)
				throw new ForbiddenException('Invalid email or password')

			return user
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}

	public async authorizeWithGoogle(
		input: User
	): Promise<{ status: 'signed-in' | 'no-user'; user: User }> {
		try {
			if (!input)
				throw new UnauthorizedException('Unauthenticated', {
					description: 'auth/unauthenticated'
				})

			const user = await this.prisma.user.findFirst({
				where: {
					email: input.email,
					username: input.username
				}
			})

			if (!user) {
				return { status: 'no-user', user: input }
			}

			return { status: 'signed-in', user }
		} catch (err) {
			throw generateErrorResponse(err)
		}
	}
}
