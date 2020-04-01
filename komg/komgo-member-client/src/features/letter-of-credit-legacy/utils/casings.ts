import { sentenceCase } from '../../../utils/casings'

export const sentenceCaseWithLC = (str: string = '') => {
  return sentenceCase(str)
    .split(' ')
    .map(word => (word === 'lc' ? 'LC' : word))
    .join(' ')
}
