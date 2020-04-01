export class EntityNotFoundError extends Error {
  constructor(m?: string) {
    super(m)

    Object.setPrototypeOf(this, EntityNotFoundError.prototype)
  }
}
