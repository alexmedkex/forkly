export default class Attribute {
  private key: string
  private value: string

  constructor(key: string, value: string) {
    this.key = key
    this.value = value
  }

  get getKey(): string {
    return this.key
  }

  get getValue(): string {
    return this.value
  }
}
