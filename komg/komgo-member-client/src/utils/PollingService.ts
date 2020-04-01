export class PollingService {
  interval: number
  actions: any[]
  private refreshAnimationFrameRequestId: number = 0
  private timeout: any
  constructor(interval = 3000, actions: Array<() => any> = []) {
    this.interval = interval
    this.actions = actions
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.tick = this.tick.bind(this)
  }

  public start() {
    this.refreshAnimationFrameRequestId = window.requestAnimationFrame(this.tick)
  }

  public stop() {
    clearTimeout(this.timeout)
    window.cancelAnimationFrame(this.refreshAnimationFrameRequestId)
  }

  private tick() {
    this.timeout = setTimeout(async () => {
      // Wait for async actions before running this.tick again
      // by spec definition Promise.resolve will always return the same object if it's a promise
      const promises = this.actions.map(action => Promise.resolve(action()))
      await Promise.all(promises)
      this.refreshAnimationFrameRequestId = requestAnimationFrame(this.tick)
    }, this.interval)
  }
}
