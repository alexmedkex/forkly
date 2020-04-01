import { Grade } from '@komgo/types'
import { sentenceCase } from '../../../utils/casings'

export const gradeIsAllowedValue = (grade?: string) => !!Grade[(grade ? sentenceCase(grade) : '') as Grade]
