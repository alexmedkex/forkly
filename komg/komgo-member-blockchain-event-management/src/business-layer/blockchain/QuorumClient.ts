import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import Axios, { AxiosInstance, AxiosResponse } from 'axios'
import http from 'http'
import httpProxyAgent from 'http-proxy-agent'
import https from 'https'
import httpsProxyAgent from 'https-proxy-agent'
import { injectable, inject } from 'inversify'

import { randInt } from '../../inversify/utils'
import { VALUES } from '../../inversify/values'
import { ErrorName } from '../../util/ErrorName'
import RateLimiter from '../../util/RateLimiter'
import { RequestIdHandler } from '../../util/RequestIdHandler'
import { BlockchainConnectionError, QuorumRequestError } from '../errors'

const JSON_MIME_TYPE = 'application/json;charset=utf-8'
export const JSON_RPC_VERSION = '2.0'

// if multiple, move to enum in constants.ts
export const ETH_GET_QUORUM_PAYLOAD = 'eth_getQuorumPayload'

@injectable()
export class QuorumClient {
  readonly axios: AxiosInstance
  private readonly logger = getLogger('QuorumClient')
  private readonly rateLimitedPost: (url: string, query: any) => Promise<AxiosResponse>

  constructor(
    @inject(VALUES.BlockchainURL) blockchainURL: string,
    @inject(VALUES.MaxRequestPerSecond) maxRequestsPerSecond: number,
    @inject(VALUES.RequestIdHandler) requestIdHandler: RequestIdHandler,
    @inject(VALUES.HTTPProxy) httpProxy: string,
    @inject(VALUES.HTTPSProxy) httpsProxy: string,
    @inject(VALUES.QuorumHTTPTimeout) timeout: number,
    rateLimiter: RateLimiter = new RateLimiter(maxRequestsPerSecond)
  ) {
    const httpAgent = httpProxy ? new httpProxyAgent(httpProxy) : new http.Agent({ keepAlive: true })
    const httpsAgent = httpsProxy ? new httpsProxyAgent(httpsProxy) : new https.Agent({ keepAlive: true })
    this.logger.info('Using proxy', { httpProxy, httpsProxy, blockchainURL })

    this.axios = Axios.create({
      baseURL: blockchainURL,
      headers: { 'Content-Type': JSON_MIME_TYPE },
      httpAgent,
      httpsAgent,
      proxy: false, // disable proxy autoconfiguration
      timeout // prevent any hanging
    })
    requestIdHandler.addToAxios(this.axios)

    this.rateLimitedPost = rateLimiter.wrap(this.axios.post)
  }

  /**
   * Gets transaction data from transaction hash
   * https://github.com/jpmorganchase/quorum/blob/master/docs/api.md#example-3
   *
   * @param reference (tx.input) -> A sha512 hash of the transaction data.
   * This can be retrieved as Transaction.input from a private transaction which
   * creates a contract
   *
   * @returns string -> transaction data
   */
  public async getTransactionData(reference: string): Promise<string> {
    const query = {
      jsonrpc: JSON_RPC_VERSION,
      method: ETH_GET_QUORUM_PAYLOAD,
      params: [reference],
      id: randInt(100) // random ID number required
    }

    let response: AxiosResponse
    try {
      this.logger.info('Sending post request to quorum node', {
        jsonrpc: query.jsonrpc,
        method: query.method,
        id: query.id,
        reference
      })
      response = await this.rateLimitedPost('', query)
    } catch (error) {
      this.logger.error(ErrorCode.BlockchainConnection, ErrorName.QuorumGetTransactionDataFailed, {
        errorMessage: error.message,
        reference
      })
      throw new BlockchainConnectionError(error.message)
    }

    if (!response.data || !response.data.result) {
      this.logger.crit(ErrorCode.BlockchainEventValidation, ErrorName.QuorumGetTransactionInvalidResponse, {
        reference,
        query
      })
      throw new QuorumRequestError('Invalid response format from Quorum API: ', response.data)
    }

    this.logger.info('Successfully fetched transaction data for reference: %s', reference)
    return response.data.result
  }
}
