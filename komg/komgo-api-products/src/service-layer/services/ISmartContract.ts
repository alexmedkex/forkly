export default interface ISmartContract {
  ensRegistry(): Promise<any>
  komgoResolver(address: string): Promise<any>
  komgoMetaResolver(): Promise<any>
  komgoOnboarder(): Promise<any>
}
