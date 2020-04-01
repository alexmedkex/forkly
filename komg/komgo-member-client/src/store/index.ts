import initialiseStore from './initialiseStore'
import { history } from './history'

export { history }

export const store = initialiseStore(history)
