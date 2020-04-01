export class CargoArgumentError extends Error {
  thrown: boolean
  status: number
  constructor(message: string, status: number = 422) {
    super(message)
    this.name = 'CargoArgumentError'
    this.thrown = true
    this.status = status
  }
}
