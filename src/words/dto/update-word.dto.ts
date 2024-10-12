import { Transcription } from "@/common"
import { Transform } from "class-transformer"
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"

export class UpdateWordInput {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => value.toLowerCase())
	readonly name?: string

	@IsOptional()
	@ValidateNested()
	readonly transcription?: Transcription
}
