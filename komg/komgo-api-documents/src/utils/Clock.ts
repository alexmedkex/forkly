import { injectable } from 'inversify'

@injectable()
export default class Clock {
  currentTime(): Date {
    return new Date()
  }
}
