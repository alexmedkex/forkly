import { injectable } from 'inversify'
import { ICompanyCoverageDataAgent } from './ICompanyCoverageDataAgent'
import { CompanyCoverage } from '../models/CompanyCoverage'
import { ICompanyCoverageDocument } from '../models/ICompanyCoverageDocument'
import { STATUSES } from '../constants/Status'
import { ErrorUtils } from '@komgo/microservice-config'
import { ErrorCode } from '@komgo/error-utilities'
import { DataAccessException, DATA_ACCESS_ERROR } from '../exceptions/DataAccessException'

@injectable()
export class CompanyCoverageDataAgent implements ICompanyCoverageDataAgent {
  async create(companyCoverage: ICompanyCoverageDocument): Promise<ICompanyCoverageDocument> {
    if (
      await CompanyCoverage.findOne({ companyId: companyCoverage.companyId, covered: true, status: STATUSES.COMPLETED })
    ) {
      throw new DataAccessException(
        DATA_ACCESS_ERROR.DUPLICATE_KEY,
        `Company coverage with company ID "${companyCoverage.companyId}" already exists.`,
        null
      )
    }

    if (
      companyCoverage.status !== STATUSES.PENDING &&
      // Allow auto added coverages.
      !(companyCoverage.status === STATUSES.COMPLETED && companyCoverage.coverageAutoAddedOn) &&
      !companyCoverage.coverageRequestId
    ) {
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, `Request id is mandatory.`, null)
    }

    let entity
    try {
      entity = await CompanyCoverage.create(companyCoverage)
      if (!companyCoverage.coverageRequestId) {
        entity.coverageRequestId = entity._id.toString()
        await CompanyCoverage.updateOne({ _id: entity._id }, { coverageRequestId: entity._id.toString() })
      }
    } catch (e) {
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, e.message, null)
    }
    return entity
  }
  async update(coverageRequestId: string, data: ICompanyCoverageDocument): Promise<void> {
    const result = await CompanyCoverage.findOne({ coverageRequestId })
    if (!result) {
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'Company coverage not found')
    }
    if (data.companyId !== result.companyId) {
      throw new DataAccessException(DATA_ACCESS_ERROR.INVALID_DATA, 'Company ID cannot be changed.')
    }
    result.set(data)
    return result.save()
  }
  async delete(coverageRequestId: string): Promise<void> {
    // MAYBE SOFT DELETE
    const result = await CompanyCoverage.findOne({ coverageRequestId })
    if (!result) {
      throw new DataAccessException(DATA_ACCESS_ERROR.NOT_FOUND, 'Company coverage not found')
    }
    await result.remove()
  }
  async get(companyId: string): Promise<ICompanyCoverageDocument> {
    return CompanyCoverage.findOne({ companyId })
  }

  async findByCompanyIds(companyIds: string[], filter?: any): Promise<ICompanyCoverageDocument[]> {
    let query = { companyId: { $in: companyIds } }
    if (filter) {
      query = {
        ...query,
        ...filter
      }
    }
    return CompanyCoverage.find(query)
  }

  async find(query: any): Promise<ICompanyCoverageDocument[]> {
    return CompanyCoverage.find(query)
  }

  async findOne(query: any): Promise<ICompanyCoverageDocument> {
    return CompanyCoverage.findOne(query)
  }
}
