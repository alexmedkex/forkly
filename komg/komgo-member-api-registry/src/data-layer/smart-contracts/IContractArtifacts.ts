export interface IContractArtifacts {
  ensRegistry(): Promise<any>
  komgoRegistrar(): Promise<any>
  komgoResolver(): Promise<any>
  komgoMetaResolver(): Promise<any>
  resolverForNode(node: string): Promise<any>
}
