const basePaths = {
  notification: `http://api-notif:8080/v0`
}

export const apiroutes = {
  notification: {
    create: new RegExp(`${basePaths.notification}/notifications.*`),
    task: new RegExp(`${basePaths.notification}/tasks.*`)
  }
}
