export interface IReadyStatus {
  isReady: boolean
  details: {}
}

export default interface IIsReadyChecker {
  isReady(): Promise<boolean>
  status(): Promise<IReadyStatus>
}
