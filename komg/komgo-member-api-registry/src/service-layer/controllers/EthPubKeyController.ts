import { getLogger } from '@komgo/logging'
import { Route, Post, Body, Controller, Security } from 'tsoa'

import { IEthPubKeyUseCase } from '../../business-layer/ethpubkey/IEthPubKeyUseCase'
import { NewEthPubKey } from '../../data-layer/models/NewEthPubKey'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { Metric, EthPubKeyControllerEndpoints } from '../../utils/Metrics'
import { generateHttpException } from '../ErrorHandling'
import { AddEthPubKeyRequest } from '../requests/AddEthPubKeyRequest'
import { RevokeEthPubKeyRequest } from '../requests/RevokeEthPubKeyRequest'
import { IEthPubKeyTransactionResponse } from '../responses/IEthPubKeyTransactionResponse'

/**
 * EthPubKeyController
 * @export
 * @class EthPubKeyController
 * @extends {Controller}
 */
@Route('registry/ethpubkeys')
@provideSingleton(EthPubKeyController)
export class EthPubKeyController extends Controller {
  private readonly logger = getLogger('EthPubKeyController')

  constructor(@inject(TYPES.EthPubKeyUseCase) private ethPubKeyUseCase: IEthPubKeyUseCase | any) {
    super()
  }

  /**
   * Add a new Ethereum public Key to the specific company ENS registration
   * @param ethPubKeyRequest request which includes the company ENS domain and the ethereum public key information
   */
  @Security('internal')
  @Post()
  public async addEthPubKey(
    @Body() ethPubKeyRequest: AddEthPubKeyRequest | any
  ): Promise<IEthPubKeyTransactionResponse> {
    this.logger.metric({
      [Metric.APICallReceived]: EthPubKeyControllerEndpoints.AddEthPubKey
    })
    const ethPubKey = new NewEthPubKey(
      ethPubKeyRequest.lowPublicKey,
      ethPubKeyRequest.highPublicKey,
      ethPubKeyRequest.termDate
    )
    this.logger.metric({
      [Metric.APICallFinished]: EthPubKeyControllerEndpoints.AddEthPubKey
    })
    try {
      const txHash = await this.ethPubKeyUseCase.addEthPubKey(ethPubKeyRequest.companyEnsDomain, ethPubKey)
      return { txHash }
    } catch (e) {
      throw generateHttpException(e)
    }
  }

  /**
   * Revoke an Ethereum public key from the company ENS registration
   * @param revokeKeyRequest request which includes the company ENS domain and the index of the key in the array of keys at the ENS Resolver
   */
  @Security('internal')
  @Post('{keyIndex}/revoke')
  public async revokeEthPubKey(
    keyIndex: number,
    @Body() revokeKeyRequest: RevokeEthPubKeyRequest | any
  ): Promise<IEthPubKeyTransactionResponse> {
    try {
      this.logger.metric({
        [Metric.APICallReceived]: EthPubKeyControllerEndpoints.RevokeEthPubKey
      })
      const txHash = await this.ethPubKeyUseCase.revokeEthPubKey(revokeKeyRequest.companyEnsDomain, keyIndex)
      this.logger.metric({
        [Metric.APICallFinished]: EthPubKeyControllerEndpoints.RevokeEthPubKey
      })
      return { txHash }
    } catch (e) {
      throw generateHttpException(e)
    }
  }
}
