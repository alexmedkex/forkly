import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { ISessionRequest, ISessionVerifyRequest } from '@komgo/types'
import axios from 'axios'
import { Controller, Route, Tags, Post, Body, Patch, Security, Path, Get, Put } from 'tsoa'

import { ISessionDataAgent } from '../../data-layer/data-agent/SessionDataAgent'
import { IJWSAgent, IDecodedJWS } from '../../data-layer/utils/JWSAgent'
import sleep from '../../data-layer/utils/sleep'
import { ICompanyRegistryService } from '../../infrastructure/api-registry/CompanyRegistryService'
import { DocumentRegistryV1 } from '../../infrastructure/blockchain/DocumentRegistryV1'
import { provideSingleton, inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { Metric } from '../../utils/Metric'
import { IPutSessionRequest } from '../requests/session/IPutSessionRequest'
import { ISessionResponse } from '../responses/session'

const { conflictException, unprocessableEntityException, notFoundException } = ErrorUtils

/**
 * Session Class
 * @export
 * @class SessionController
 * @extends {Controller}
 */
@Tags('Session')
@Route('session')
@provideSingleton(SessionController)
export class SessionController extends Controller {
  private readonly logger = getLogger('SessionController')

  constructor(
    @inject(TYPES.ApiRegistryUrl) private readonly registryBaseUrl: string,
    @inject(TYPES.CompanyRegistryService) private readonly companyRegistry: ICompanyRegistryService,
    @inject(TYPES.SessionDataAgent) private readonly sessionDataAgent: ISessionDataAgent,
    @inject(TYPES.DocumentRegistryV1) private readonly docRegistry: DocumentRegistryV1,
    @inject(TYPES.JWTAgent) private readonly jwtAgent: IJWSAgent
  ) {
    super()
  }

  /**
   * @summary create session
   */
  @Security('public')
  @Post()
  public async createSession(@Body() data: ISessionRequest): Promise<ISessionResponse> {
    const jws: IDecodedJWS = await this.jwtAgent.decodeAndVerify(data.jws)
    return this.sessionDataAgent.createSession(jws.staticId)
  }

  /**
   * @summary activate session
   */
  @Security('public')
  @Patch('{sessionId}/activate')
  public async activateSession(@Path() sessionId: string, @Body() data: ISessionRequest): Promise<any> {
    const jws: IDecodedJWS = await this.jwtAgent.decodeAndVerify(data.jws)
    const existedSession: ISessionResponse = await this.sessionDataAgent.getSession(sessionId)

    if (this.isSessionConfiguredOrActivated(existedSession)) {
      throw conflictException(ErrorCode.ValidationHttpContent, 'Session is configured or activated already')
    }

    if (jws.staticId !== existedSession.staticId) {
      throw unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'You have no permission to activate this session'
      )
    }

    const reverseNode = await this.docRegistry.getCompanyId(jws.docId)

    const response = await axios.get(
      `${this.registryBaseUrl}/v0/registry/cache?companyData=${encodeURIComponent(`{"node" : "${reverseNode}" }`)}`
    )

    const companyId = response.data[0] ? response.data[0].staticId : null

    if (!reverseNode || !companyId) {
      throw unprocessableEntityException(ErrorCode.ValidationHttpContent, 'Document is not registered in blockchain')
    }

    if (jws.staticId !== companyId) {
      throw unprocessableEntityException(ErrorCode.ValidationHttpContent, 'You are not the owner of this document')
    }

    const [docHash, docTimestamp] = await this.docRegistry.getHashAndTimestamp(jws.docId)

    if (jws.merkle !== docHash) {
      throw unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'Document hash is not registered in blockchain'
      )
    }
    this.logger.metric({ [Metric.SessionActivated]: true })

    return this.sessionDataAgent.updateSession(sessionId, {
      merkle: jws.merkle,
      metadataHash: jws.metadataHash,
      timestamp: docTimestamp,
      activated: true
    })
  }

  /**
   * @summary deactivate session
   */
  @Security('public')
  @Patch('{sessionId}/deactivate')
  public async deactivateSession(@Path() sessionId: string, @Body() data: ISessionRequest): Promise<ISessionResponse> {
    const jws: IDecodedJWS = await this.jwtAgent.decodeAndVerify(data.jws)
    const existedSession: ISessionResponse = await this.sessionDataAgent.getSession(sessionId)

    this.verifyConfigurationAndActivation(existedSession)

    if (jws.staticId !== existedSession.staticId) {
      throw unprocessableEntityException(
        ErrorCode.ValidationHttpContent,
        'You have no permission to deactivate this session'
      )
    }
    this.logger.metric({ [Metric.SessionDeactivated]: true })

    return this.sessionDataAgent.updateSession(sessionId, { activated: false })
  }

  /**
   * @summary get session
   */
  @Security('public')
  @Get('{sessionId}')
  public async getSession(@Path() sessionId: string): Promise<any> {
    const session: ISessionResponse = await this.sessionDataAgent.getSession(sessionId)

    this.verifyConfigurationAndActivation(session, 'The link in this document has been deactivated')

    return { metadataHash: session.metadataHash }
  }

  /**
   * @summary verify document
   */
  @Security('public')
  @Post('{sessionId}/verify')
  public async verifyDocument(@Path() sessionId: string, @Body() data: ISessionVerifyRequest): Promise<any> {
    await sleep(Math.ceil(Math.random() * 3) * 1000)
    const session: ISessionResponse = await this.sessionDataAgent.getSession(sessionId)

    this.verifyConfigurationAndActivation(session)

    if (data.merkleHash !== session.merkle) {
      throw conflictException(
        ErrorCode.ValidationHttpContent,
        'The document is not registered on komgo network. Upload the document which contains the link you used to access this page'
      )
    }

    const companyName = await this.companyRegistry.getCompanyName(session.staticId)

    this.logger.metric({ [Metric.DocumentVerified]: true })

    return { registeredAt: session.timestamp, companyName }
  }

  /**
   * This endpoint is only used from E2E tests to verify that ML documents registered
   * with Document Registry v1 still work correctly
   */
  @Security('internal')
  @Put('{sessionId}/')
  public async putSession(@Path() sessionId: string, @Body() data: IPutSessionRequest): Promise<ISessionResponse> {
    const { staticId } = data
    const sessionData = {
      merkle: data.merkle,
      metadataHash: data.metadataHash,
      timestamp: data.timestamp,
      activated: data.activated
    }
    return this.sessionDataAgent.putSession(staticId, sessionId, sessionData)
  }

  private verifyConfigurationAndActivation(
    session: ISessionResponse,
    notActiveError: string = 'Session is not active',
    notConfError: string = 'Session is not configured'
  ): void {
    if (!this.isSessionConfigured(session)) {
      throw conflictException(ErrorCode.ValidationHttpContent, notConfError)
    }

    if (!session.activated) {
      throw conflictException(ErrorCode.ValidationHttpContent, notActiveError)
    }
  }

  private isSessionConfigured(session: ISessionResponse): boolean {
    return !!session.merkle && !!session.metadataHash && !!session.timestamp
  }

  private isSessionConfiguredOrActivated(session: ISessionResponse): boolean {
    return session.activated || this.isSessionConfigured(session)
  }
}
