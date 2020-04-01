export function getBooleanFromEnvVariable(envVariableValue: string, defaultValue: boolean = false) {
  switch (envVariableValue) {
    case 'true':
      return true
    case 'false':
      return false
    default:
      return defaultValue
  }
}

export function getArrayFromEnvVariable(envVariableValue: string, defaultValue: string[]): string[] {
  if (envVariableValue) {
    return envVariableValue.split(',').map(value => value.trim())
  }

  return defaultValue
}

export function randInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max))
}
