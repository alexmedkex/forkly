export default interface IIsReadyChecker {
  isReady(): Promise<boolean>
  status(): Promise<{ isReady: boolean; details: {} }>
}
