export interface IDocumentReceived {
  typeName: string
  context: {
    subProductId: string
    rdId?: string
    vaktId?: string
  }
}
