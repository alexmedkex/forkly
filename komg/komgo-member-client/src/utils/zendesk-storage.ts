import { stringOrNull } from './types'
import { ErrorReportRequest, ErrorReportError } from '../features/error-report/store/types'
import { LocalStorageItem } from './storage-item'

export class ZendeskStorageClass {
  pRequests: LocalStorageItem
  pError: LocalStorageItem
  pUser: LocalStorageItem
  pCurrentUrl: LocalStorageItem

  constructor() {
    this.pRequests = new LocalStorageItem('Zendesk_requests')
    this.pError = new LocalStorageItem('Zendesk_error')
    this.pUser = new LocalStorageItem('Zendesk_user')
    this.pCurrentUrl = new LocalStorageItem('Zendesk_current_url')
  }

  get requests(): ErrorReportRequest[] {
    const requests: stringOrNull = this.pRequests.get()
    return requests ? JSON.parse(requests) : []
  }

  set requests(requests: ErrorReportRequest[]) {
    this.pRequests.add(JSON.stringify(requests))
  }

  get user() {
    const userData = this.pUser.get()
    return userData ? JSON.parse(userData) : {}
  }

  set user(userData) {
    this.pUser.add(JSON.stringify(userData))
  }

  get currentUrl(): string {
    const currentUrl = this.pCurrentUrl.get()
    return currentUrl ? JSON.parse(currentUrl) : ''
  }

  set currentUrl(currentUrl: string) {
    this.pCurrentUrl.add(JSON.stringify(currentUrl))
  }

  get error(): ErrorReportError | {} {
    const err = this.pError.get()
    return err ? JSON.parse(err) : {}
  }

  set error(err: ErrorReportError | {}) {
    this.pError.add(JSON.stringify(err))
  }

  clearAll(): void {
    this.pError.remove()
    this.pRequests.remove()
    this.pCurrentUrl.remove()
    this.pUser.remove()
  }
}

export const ZendeskStorage = new ZendeskStorageClass()
