import { Nullable, SortOrder } from '@/common'
import { Word } from '@prisma/client'
import { Transform } from 'class-transformer'
import {
	IsEnum,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString
} from 'class-validator'

export enum SortBy {
	NAME = 'name',
	CREATED_AT = 'createdAt',
	MEANINGS_COUNT = 'meanings-count'
}

export class FindManyWordsInput {
	@Transform(({value}) => value && parseInt(value))
	@IsOptional()
	@IsNumber()
	@IsPositive()
	readonly take?: number

	@IsOptional()
	@Nullable()
	@IsMongoId()
	readonly cursor?: string | null

	@IsOptional()
	@IsString()
	readonly searchValue?: string

	@IsOptional()
	@IsEnum(SortBy)
	readonly sortBy?: SortBy

	@IsOptional()
	@IsEnum(SortOrder)
	readonly sortOrder?: SortOrder

	@IsOptional()
	@IsMongoId()
	readonly creatorId?: string
}

export class FindManyWordsResponse {
	count: number
	nextCursor?: string
	words: (Word & {
		_count: {
			meanings: number
		}
	})[]
}
