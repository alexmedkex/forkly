export class TradingRoleError extends Error {
  constructor(m: string) {
    super(m)

    Object.setPrototypeOf(this, TradingRoleError.prototype)
  }
}
