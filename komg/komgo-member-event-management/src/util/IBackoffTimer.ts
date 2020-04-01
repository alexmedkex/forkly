export default interface IBackoffTimer {
  /**
   * Sleep for a determined time based on the backoff logic, which exponentially increases before is reset, until a max value
   */
  sleep()

  /**
   * Reset the backoff time
   */
  reset()
}
