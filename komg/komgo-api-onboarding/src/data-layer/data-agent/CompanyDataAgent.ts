import { ErrorCode } from '@komgo/error-utilities'
import { ErrorUtils } from '@komgo/microservice-config'
import { Status, ICompanyRequest } from '@komgo/types'
import { injectable } from 'inversify'
import { v4 as uuid4 } from 'uuid'

import { ICompanyModel } from '../../interfaces'
import { Company } from '../models/Company'
import ICompanyDocument from '../models/ICompanyDocument'

const { notFoundException } = ErrorUtils

const companyNotFoundMessage = 'Company not found'

export type ICompanyProperties = { [key in keyof ICompanyModel]?: any }

export interface ICompanyDataAgent {
  getCompanies(filter?: ICompanyProperties): Promise<ICompanyDocument[]>
  getCompany(staticId: string): Promise<ICompanyDocument>
  deleteCompany(staticId: string): Promise<void>
  getMemberByKeycloakUserId(keycloakUserId: string): Promise<ICompanyDocument>
  createCompany(data: ICompanyRequest): Promise<ICompanyDocument>
  update(staticId: string, data: ICompanyProperties): Promise<ICompanyDocument>
}

@injectable()
export default class CompanyDataAgent implements ICompanyDataAgent {
  getCompanies(filter: ICompanyProperties = {}): Promise<ICompanyDocument[]> {
    return Company.find(filter).exec()
  }

  async getCompany(staticId: string): Promise<ICompanyDocument> {
    const company = await Company.findOne({ staticId }).exec()
    if (!company) {
      throw notFoundException(ErrorCode.ValidationHttpContent, companyNotFoundMessage)
    }
    return company
  }

  async getMemberByKeycloakUserId(keycloakUserId: string): Promise<ICompanyDocument> {
    const company = await Company.findOne({ keycloakUserId, isMember: true }).exec()
    if (!company) {
      throw notFoundException(ErrorCode.ValidationHttpContent, companyNotFoundMessage)
    }
    return company
  }

  async createCompany(data: ICompanyRequest): Promise<ICompanyDocument> {
    const komgoMnid = uuid4()
    return Company.create({
      ...data,
      status: Status.Draft,
      staticId: uuid4(),
      komgoMnid
    })
  }

  async update(staticId: string, data: ICompanyProperties): Promise<ICompanyDocument> {
    const company = await Company.findOne({ staticId }).exec()
    if (!company) {
      throw notFoundException(ErrorCode.ValidationHttpContent, companyNotFoundMessage)
    }
    return Company.findOneAndUpdate({ staticId }, { $set: data }, { new: true }).exec()
  }

  async deleteCompany(staticId: string): Promise<void> {
    await Company.deleteOne({ staticId }).exec()
  }
}
