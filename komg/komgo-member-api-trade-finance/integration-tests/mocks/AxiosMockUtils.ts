import MockAdapter from 'axios-mock-adapter/types'
import { apiroutes } from '../utils/apiroutes'

export class AxiosMockUtils {
  constructor(private readonly axiosMock: MockAdapter) {}

  public reset() {
    this.axiosMock.reset()
  }

  public mockSuccessCompanyRegistryGetMember(returnCompany: any) {
    this.axiosMock.onGet(apiroutes.registry.getMembers).reply(200, returnCompany)
  }

  public mockSuccessCompanyRegistryGetSpecificMembers(companyData: string, returnCompany: any) {
    this.axiosMock.onGet(`${apiroutes.registry.getMembersNoWildcard}${companyData}`).reply(200, returnCompany)
  }

  public mockErrorCompanyRegistryGetMember() {
    this.axiosMock.onGet(apiroutes.registry.getMembers).reply(500)
  }

  public mockSuccessGetSpecificTrade(tradeFilter: string, response: any) {
    this.axiosMock.onGet(`${apiroutes.tradeCargo.getTradeNoWildCard}${tradeFilter}`).reply(200, response)
  }

  public mockErrorGetSpecificTrade(tradeFilter: string) {
    this.axiosMock.onGet(`${apiroutes.tradeCargo.getTradeNoWildCard}${tradeFilter}`).reply(500)
  }
}
