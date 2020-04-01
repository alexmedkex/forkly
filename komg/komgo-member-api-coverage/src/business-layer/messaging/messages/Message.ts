export default abstract class Message {
  version: number
  messageType: string
  abstract context: object
  abstract data: object
}
