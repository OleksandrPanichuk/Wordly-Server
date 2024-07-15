export type TypeUploadedFile = {
	key: string
	url: string
}

export type TypeFile = {
	fieldname: string
	originalname: string
	encoding: string
	mimetype: string
	buffer: Buffer
	size: number
}


export enum PrismaClientErrorCodes {
	NOT_FOUND = 'P2001',
	TIMED_OUT = 'P1008',
	OUT_OF_RANGE = 'P2020',
	VALIDATION_ERROR = 'P2007'
}
