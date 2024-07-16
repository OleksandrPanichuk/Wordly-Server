import { Prisma } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class Transcription implements Prisma.TranscriptionCreateInput {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	readonly en?: string

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	readonly us?: string
}
