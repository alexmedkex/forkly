import { v4 as uuid4 } from 'uuid'

/**
 * Generate RequestId in the format of <ms time>.<random string> to match api-gateway
 */
export function generateRequestId() {
  const milliseconds = new Date().getTime()
  return `${milliseconds}.${uuid4()}`
}
