import { getLogger } from '@komgo/logging'
import { Route, Post, Body, Controller, Security } from 'tsoa'

import IAttributeUseCase from '../../business-layer/attribute/IAttributeUseCase'
import Attribute from '../../data-layer/models/Attribute'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { Metric, AttributeControllerEndpoints } from '../../utils/Metrics'
import { generateHttpException } from '../ErrorHandling'
import AttributeRequest from '../requests/AttributeRequest'
import IAddAttributeResponse from '../responses/IAddAttributeResponse'

/**
 * AttributeController
 * @export
 * @class AttributeController
 * @extends {Controller}
 */
@Route('registry/attribute')
@provideSingleton(AttributeController)
export class AttributeController extends Controller {
  private readonly logger = getLogger('AttributeController')

  constructor(@inject(TYPES.AttributeUseCase) private attributeUseCase: IAttributeUseCase) {
    super()
  }

  @Security('internal')
  @Post()
  public async addAttribute(@Body() attributeRequest: AttributeRequest): Promise<IAddAttributeResponse> {
    this.logger.metric({
      [Metric.APICallReceived]: AttributeControllerEndpoints.AddAttribute
    })
    const attribute = new Attribute(attributeRequest.key, attributeRequest.value)
    try {
      const txHash = await this.attributeUseCase.addAttribute(attributeRequest.companyEnsDomain, attribute)
      this.logger.metric({
        [Metric.APICallFinished]: AttributeControllerEndpoints.AddAttribute
      })
      return { txHash }
    } catch (error) {
      throw generateHttpException(error)
    }
  }
}
