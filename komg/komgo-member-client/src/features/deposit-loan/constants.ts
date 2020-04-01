import { ISharedDepositLoanForm } from './store/types'

export const defaultShared: ISharedDepositLoanForm = {
  sharedWithStaticId: '',
  appetite: {
    shared: false
  },
  pricing: {
    shared: false,
    pricing: null
  }
}
