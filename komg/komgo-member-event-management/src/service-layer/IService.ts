export default interface IService {
  start()
  stop()
}

export const sleep = miliseconds => new Promise(resolve => setTimeout(resolve, miliseconds))
