import { Body, Controller, Get, Post, Path, Request, Route, Security, Tags, Response, Header, Patch } from 'tsoa'
import { inject, provide } from '../../inversify/ioc'
import logger, { getLogger } from '@komgo/logging'
import { ICounterpartyProfileResponse } from '../responses/counterparty-profile/ICounterpartyProfileResponse'
import { TYPES } from '../../inversify/types'
import CounterpartyProfileDataAgent from '../../data-layer/data-agents/CounterpartyProfileDataAgent'
import { validateRequest, ErrorUtils, HttpException } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { CreateCounterpartyProfileRequest } from '../request/counterparty-profile/CreateCounterpartyProfileRequest'
import { UpdateCounterpartyProfileRequest } from '../request/counterparty-profile/UpdateCounterpartyProfileRequest'
import {
  convertCreateReqToCounterpartyProfile,
  convertUpdateReqToCounterpartyProfile,
  convertToCounterpartyProfileResponse
} from '../utils/converters'

@Tags('counterparty profiles')
@Route('counterparty-profile')
@provide(CounterpartyProfileController)
export class CounterpartyProfileController extends Controller {
  private readonly logger = getLogger('CounterpartyProfileController')

  constructor(
    @inject(TYPES.CounterpartyProfileDataAgent) private readonly profileDataAgent: CounterpartyProfileDataAgent
  ) {
    super()
  }

  /**
   * @param counterpartyId Identifier of the counterparty we want to retrieve its risk profile from
   */
  @Response<HttpException>('404', 'Counterparty profile does not exist')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Get('{counterpartyId}')
  public async getCounterpartyProfile(
    @Path('counterpartyId') counterpartyId: string
  ): Promise<ICounterpartyProfileResponse> {
    this.logger.info(`Loading risk profile for counterparty: ${counterpartyId}`)
    const profile = await this.profileDataAgent.getByCounterpartyId(counterpartyId)
    if (profile) {
      return convertToCounterpartyProfileResponse(profile)
    } else {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, 'Counterparty not found')
    }
  }

  /**
   * @param newProfile Object with all the fields of the new risk profile, including ID of the counterparty
   */
  @Response<HttpException>('409', 'Counterparty profile already exists')
  @Response<HttpException>('500', 'Internal Server Error')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Post()
  public async postCounterpartyProfile(
    @Body() newProfile: CreateCounterpartyProfileRequest
  ): Promise<ICounterpartyProfileResponse> {
    // Validation
    await validateRequest(CreateCounterpartyProfileRequest, newProfile)
    // Storage
    const profile = await this.profileDataAgent.getByCounterpartyId(newProfile.counterpartyId)
    if (profile) {
      throw ErrorUtils.conflictException(
        ErrorCode.UnexpectedError,
        `A risk profile for counterparty ${newProfile.counterpartyId} already exists`
      )
    }
    try {
      this.logger.info(`Storing risk profile for counterparty: ${newProfile.counterpartyId}`)
      const profileCreated = await this.profileDataAgent.create(convertCreateReqToCounterpartyProfile(newProfile))
      return convertToCounterpartyProfileResponse(profileCreated)
    } catch (error) {
      throw ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
    }
  }

  /**
   * @param counterpartyId ID of the counterparty which risk profile we are modifying
   * @param updateProfile risk profile fields we are going to overwrite
   */
  @Response<HttpException>('404', 'Counterparty profile not found')
  @Response<HttpException>('500', 'Internal Server Error')
  @Security('withPermission', ['kyc', 'manageDoc', 'crudAndShare'])
  @Security('withPermission', ['kyc', 'reviewDoc'])
  @Patch('{counterpartyId}')
  public async patchCounterpartyProfile(
    @Path('counterpartyId') counterpartyId: string,
    @Body() updateProfile: UpdateCounterpartyProfileRequest
  ): Promise<ICounterpartyProfileResponse> {
    await validateRequest(UpdateCounterpartyProfileRequest, updateProfile)
    const profile = await this.profileDataAgent.getByCounterpartyId(counterpartyId)
    if (!profile) {
      throw ErrorUtils.notFoundException(ErrorCode.DatabaseMissingData, 'Counterparty not found')
    }
    try {
      this.logger.info(`Updating risk profile for counterparty: ${counterpartyId}`)
      const profileUpdated = await this.profileDataAgent.update(
        convertUpdateReqToCounterpartyProfile(updateProfile, counterpartyId, profile.id)
      )
      return convertToCounterpartyProfileResponse(profileUpdated)
    } catch (error) {
      throw ErrorUtils.internalServerException(ErrorCode.UnexpectedError)
    }
  }
}
