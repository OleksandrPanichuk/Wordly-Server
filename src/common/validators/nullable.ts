import { ValidateIf } from 'class-validator'

export const Nullable = () => ValidateIf((obj) => obj.sample_result !== null)
