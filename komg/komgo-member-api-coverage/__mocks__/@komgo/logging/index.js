const logger = {
    info: jest.fn(msg => {}),
    warn: jest.fn(msg => {}),
    error: jest.fn(msg => {}),
    addLoggingToAxios: jest.fn(msg => {}),
  }
module.exports = {
  default: logger,
  getLogger: jest.fn(msg => (logger))
}
