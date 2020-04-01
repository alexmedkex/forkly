import mockingoose from 'mockingoose'
import { MongoError } from 'mongodb'

import { MONGODB_DUPLICATE_ERROR } from '../consts'

import { BaseDataAgent } from './BaseDataAgent'
import InvalidItem from './exceptions/InvalidItem'
import ItemNotFound from './exceptions/ItemNotFound'
import { IFullHasProduct } from './interfaces/IFullHasProduct'
import { IHasProduct } from './interfaces/IHasProduct'

declare const beforeEach: any
declare const expect: any
declare const it: any

const PRODUCT_ID = 'product-id'
const MONGO_DB_ERROR = 'Test MongoDB error'

export function createCommonTests<BareModel extends IHasProduct, FullModel extends IFullHasProduct>(
  modelMock: any,
  dataAgent: BaseDataAgent<BareModel, FullModel>,
  bareModel: BareModel
) {
  beforeEach(() => {
    mockingoose.resetAll()
  })

  it('if a new product record is valid, DataAgent#create should succeed', async () => {
    const newRecord = removeId(bareModel)

    modelMock.toReturn(newRecord, 'save')

    const result: BareModel = await dataAgent.create(PRODUCT_ID, newRecord)
    expect(toObject(result)).toMatchObject(newRecord)
  })

  it('if a new record conflicts with other records, DataAgent#create should fail', async () => {
    modelMock.toReturn(createMongoError(), 'save')

    const result = dataAgent.create(PRODUCT_ID, removeId(bareModel))
    await expect(result).rejects.toThrow(new InvalidItem(MONGO_DB_ERROR))
  })

  it('if a product id and record id are valid, DataAgent#getById should return the matching record', async () => {
    modelMock.toReturn(bareModel, 'findOne')

    const result = await dataAgent.getById(PRODUCT_ID, bareModel.id)
    expect(toObject(result)).toMatchObject(removeId(bareModel))
  })

  it('if a product id is valid but record id is invalid, DataAgent#getById should return null', async () => {
    modelMock.toReturn(null, 'findOne')

    const result: FullModel = await dataAgent.getById(PRODUCT_ID, 'non-existing-id')
    expect(result).toBeNull()
  })

  it('if a product contains one record, DataAgent#getAllByProduct should return a list with that record', async () => {
    modelMock.toReturn([bareModel], 'find')

    const result = await dataAgent.getAllByProduct(PRODUCT_ID)
    expect(toObjects(result)).toMatchObject([removeId(bareModel)])
  })

  it('if a product record exists, DataAgent#exists should return true', async () => {
    modelMock.toReturn(bareModel, 'findOne')

    const result: boolean = await dataAgent.exists(PRODUCT_ID, bareModel.id)
    expect(result).toEqual(true)
  })

  it('if a product record does not exist, DataAgent#exists should return false', async () => {
    modelMock.toReturn(null, 'findOne')

    const result: boolean = await dataAgent.exists(PRODUCT_ID, 'non-existing-record')
    expect(result).toEqual(false)
  })

  it('if a product record is updated with a valid one, DataAgent#update should return updated record', async () => {
    modelMock.toReturn(bareModel, 'findOne')

    const result = await dataAgent.update(PRODUCT_ID, bareModel)
    expect(toObject(result)).toMatchObject(removeId(bareModel))
  })

  it('if a product record does not exists, DataAgent#update should fail', async () => {
    modelMock.toReturn(null, 'findOne')

    const result = dataAgent.update(PRODUCT_ID, bareModel)
    expect(result).rejects.toThrow(new ItemNotFound('Record not found'))
  })

  it('if an updated record conflicts with other records, DataAgent#update should fail', async () => {
    modelMock.toReturn(bareModel, 'findOne').toReturn(createMongoError(), 'save')

    const result = dataAgent.update(PRODUCT_ID, bareModel)
    await expect(result).rejects.toThrow(new InvalidItem(MONGO_DB_ERROR))
  })

  it('if a product record exists, DataAgent#delete should succeed', async () => {
    modelMock.toReturn(bareModel, 'findOneAndRemove')

    const result = await dataAgent.delete(PRODUCT_ID, bareModel.id)
    expect(result).toBeUndefined()
  })

  it('if a product record does not exist, DataAgent#delete should fail', async () => {
    modelMock.toReturn(null, 'findOneAndRemove')

    const result = dataAgent.delete(PRODUCT_ID, 'non-existing')
    await expect(result).rejects.toThrow(new ItemNotFound(`Record non-existing from product ${PRODUCT_ID} not found`))
  })
}

export function removeId<T extends IHasProduct>(record: T): T {
  const recordCopy = {
    id: record.id,
    ...(record as object)
  }
  delete recordCopy.id

  return recordCopy as T
}

function createMongoError(message: string = MONGO_DB_ERROR, code: number = MONGODB_DUPLICATE_ERROR): MongoError {
  const error = MongoError.create(message)
  error.code = code
  return error
}

// Helper methods to convert Mockingoose results into regular objects
function toObject(record: any): any {
  return record.toObject()
}

export function toObjects(records: any[]): object[] {
  return records.map(r => toObject(r))
}
