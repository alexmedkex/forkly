import { getLogger } from '@komgo/logging'
import { Controller, Route, Tags, Post, Body, Path, Get, Query } from 'tsoa'

import { provideSingleton } from '../../inversify/ioc'
import { IHarborProject, IAddProjectMemberRequest } from '../interfaces'

@Tags('Projects')
@Route('projects')
@provideSingleton(ProjectsController)
export class ProjectsController extends Controller {
  private readonly logger = getLogger('ProjectsController')

  /**
   * @summary get project by ID
   */
  @Get('{id}')
  public getProject(@Path() id: string): IHarborProject {
    this.logger.info(`Get Project. id=${id}`)
    return {
      name: 'project-name'
    }
  }

  /**
   * @summary assign member to a project
   */
  @Post('{id}/members')
  public addMember(@Body() data: IAddProjectMemberRequest): void {
    this.logger.info('Add project member', data)
  }
}
