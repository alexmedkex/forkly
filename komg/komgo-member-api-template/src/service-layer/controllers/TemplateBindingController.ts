import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ITemplateBinding, ILetterOfCreditBase, ILetterOfCredit, ITemplateBindingBase } from '@komgo/types'
import { decompressFromBase64 } from 'lz-string'
import { parse } from 'qs'
import { Controller, Route, Tags, Get, Path, Security, Query, Post, Body } from 'tsoa'

import { ContentNotFoundException } from '../../exceptions'
import { ErrorNames } from '../../exceptions/ErrorNames'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { IPaginate } from '../responses/IPaginate'
import { TemplateBindingService } from '../services/TemplateBindingService'
import { generateHttpException } from '../utils/ErrorHandling'

import { queryParser } from './queryParser'

@Tags('Template-binding')
@Route('templatebindings')
@provideSingleton(TemplateBindingController)
export class TemplateBindingController extends Controller {
  private readonly logger = getLogger('TemplateBindingController')

  constructor(@inject(TYPES.TemplateBindingService) private templateBindingService: TemplateBindingService) {
    super()
  }

  @Post()
  async create(@Body() baseTemplateBinding: ITemplateBindingBase): Promise<ITemplateBinding> {
    try {
      const templateBinding = await this.templateBindingService.create(baseTemplateBinding)
      return templateBinding
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['template', 'manageTemplates', 'read'])
  @Get(`{staticId}`)
  async get(@Path() staticId: string): Promise<ITemplateBinding> {
    try {
      const templateBinding: ITemplateBinding = await this.templateBindingService.get(staticId)
      if (!templateBinding) {
        const message = `TemplateBinding ${staticId} does not exist`
        this.logger.warn(ErrorCode.DatabaseMissingData, ErrorNames.TemplateBindingControllerTemplateNotFound, message)
        throw generateHttpException(new ContentNotFoundException(`TemplateBinding not found`))
      }
      return templateBinding
    } catch (error) {
      throw generateHttpException(error)
    }
  }

  @Security('withPermission', ['template', 'manageTemplates', 'read'])
  @Get()
  public async getAll(@Query('filter') filter = {}): Promise<IPaginate<ITemplateBinding[]>> {
    let items: ITemplateBinding[]
    const decompressed = Object.keys(filter).length === 0 ? filter : decompressFromBase64(filter)
    const { projection, options } = queryParser(parse(decompressed, { arrayLimit: 1000 }))
    const { limit, skip } = options
    this.logger.info('TemplateBindingController find:', { projection, options })
    try {
      items = await this.templateBindingService.getAll(projection, options)
      const total = await this.templateBindingService.count()
      return {
        limit,
        skip,
        items,
        total
      }
    } catch (e) {
      throw generateHttpException(e)
    }
  }
}
