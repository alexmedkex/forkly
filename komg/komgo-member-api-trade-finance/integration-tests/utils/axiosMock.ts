import MockAdapter from 'axios-mock-adapter'

export default class AxiosMock {
  constructor(private readonly axiosMock: MockAdapter) {}

  public reset() {
    this.axiosMock.reset()
  }

  public mockApiCall(shouldSucceed: boolean, route: RegExp, returnValue: any = [{}], httpReply: number = 200) {
    const onGet = this.axiosMock.onGet(route)
    if (shouldSucceed) {
      onGet.reply(httpReply, returnValue)
    } else {
      onGet.networkErrorOnce(500)
    }
  }
}
