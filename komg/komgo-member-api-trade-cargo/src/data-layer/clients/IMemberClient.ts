export interface IMemberClient {
  find(query: object): Promise<any[]>
}
