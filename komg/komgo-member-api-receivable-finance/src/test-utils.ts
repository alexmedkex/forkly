export function datePlusHours(date: string, hours: number) {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() + hours)
  return newDate.toJSON()
}
