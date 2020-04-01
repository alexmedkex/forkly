import { injectable, unmanaged } from 'inversify'
import * as mongoose from 'mongoose'

import ItemNotFound from './exceptions/ItemNotFound'
import { IFullHasProduct } from './interfaces/IFullHasProduct'
import { IHasProduct } from './interfaces/IHasProduct'
import { handleRecordUpsert } from './utils'

/**
 * Implements base methods for all data agents that are part of a product.
 */
@injectable()
export abstract class BaseDataAgent<BareModel extends IHasProduct, FullModel extends IFullHasProduct> {
  /**
   * Create BaseDataAgent
   * @param model Mongoose model that should be used to perform Mongo operations
   * @param populateWith an array of fields that should be populated. An individual
   * element can be a name of a field of an object to configure nested mapping
   */
  constructor(
    // Here is why the mongoose.Model has this complicated generic type. Since we are optionally populating (joining) records
    // from one collection with records in other collections Model#find() and Model#findOne() methods can return
    // either an object with string ids or an object with joined objects. Since Mongoose is a JavaScript library it
    // is not restricted by type definitions so we need to specify that depending on how we call it it can return
    // one model or another. This is the <BareModel | FullModel> part. This puts the burden on us to specify what
    // type will be returned by a particular method call on a mongoose.Model instance.
    // The definition is more complicated because mongoose.Model<T> class requires T to extend mongoose.Document. However
    // we do not want to do this since this makes creating instances of these models more complicated. To resolve this
    // we have two interfaces: we use one throughout most of the code base (e.g. "ICategory") and another one that specifically
    // that extends our model interface and mongoose.Document interface (e.g. "ICategoryModel"). To make definition
    // of child DataAgent classes simpler and avoid passing lots of similar interfaces we specify an interface
    // like BareModel & mongoose.Document.
    @unmanaged()
    protected readonly model: mongoose.Model<BareModel & mongoose.Document | FullModel & mongoose.Document>,
    @unmanaged() private readonly populateWith: any[]
  ) {}

  async create(productId: string, record: BareModel): Promise<BareModel> {
    this.validateNewRecord(record)

    return handleRecordUpsert(this.model.create({
      ...(record as object),
      productId
    }) as Promise<BareModel>)
  }

  async getAllByProduct(productId: string): Promise<FullModel[]> {
    return this.populateMany(this.model.find({ productId }))
  }

  /**
   * Get a record by id. Joins it with records from other collections according
   * to the "populateWith" configuration.
   *
   * @param id id of a record to find
   * @returns populated record if a record with the specified id exists, null otherwise
   */
  async getById(productId: string, id: string): Promise<FullModel> {
    return this.populateOne(this.model.findOne({ _id: id, productId }))
  }

  /**
   * Get a record by id. Does not join it with other records
   *
   * @param id id of a record to find
   * @returns bare record if a record with the specified id exists, null otherwise
   */
  async getBareById(productId: string, id: string): Promise<BareModel> {
    const record = this.model.findOne({ _id: id, productId })
    return (record as unknown) as BareModel
  }

  /**
   * Check if a record with the specified id exists for the specified product
   * @param productId id of a product
   * @param id id of a record
   * @returns true if a record with the specified id exits, false otherwise
   */
  async exists(productId: string, id: string): Promise<boolean> {
    const record = await this.getBareById(productId, id)
    return record != null
  }

  async update(productId: string, newRecord: BareModel): Promise<BareModel> {
    const oldRecord = (await this.model.findOne({
      _id: newRecord.id,
      productId
    })) as BareModel & mongoose.Document
    this.validateUpdate(oldRecord, newRecord)

    oldRecord.set(newRecord)
    return handleRecordUpsert(oldRecord.save() as Promise<BareModel>)
  }

  /**
   * Find and update a record in MongoDB collection atomically without fetching a record.
   * Allows to avoid check-then-act race condition errors.
   *
   * This method can update a subset of fields using the provided update operations. List
   * of supported operations can be found in MongoDB documentation:
   * https://docs.mongodb.com/manual/reference/operator/update
   *
   * @param productId id of a product for which to find and update a record
   * @param id if of a record to update
   * @param update a set of update operations
   *
   * @returns updated record
   */
  async findAndUpdate(productId: string, id: string, update: object): Promise<BareModel> {
    const result = this.model.findOneAndUpdate(
      {
        productId,
        _id: id
      },
      {
        ...update,
        $inc: { __v: 1 } // Increment Mongoose version field
      },
      {
        new: true // Return updated version of the record
      }
    )

    return (result as unknown) as BareModel
  }

  async delete(productId: string, id: string): Promise<void> {
    const removedRecord = await this.model.findOneAndRemove({
      _id: id,
      productId
    })
    if (removedRecord == null) {
      throw new ItemNotFound(`Record ${id} from product ${productId} not found`)
    }
  }

  protected populateMany(
    findResult: mongoose.DocumentQuery<
      Array<FullModel & mongoose.Document | BareModel & mongoose.Document>,
      FullModel & mongoose.Document | BareModel & mongoose.Document
    >
  ): Promise<FullModel[]> {
    for (const populateCollection of this.populateWith) {
      findResult = findResult.populate(populateCollection)
    }

    return findResult.exec() as Promise<FullModel[]>
  }

  protected populateOne(
    findResult: mongoose.DocumentQuery<
      FullModel | BareModel,
      FullModel & mongoose.Document | BareModel & mongoose.Document
    >
  ): Promise<FullModel> {
    for (const populateCollection of this.populateWith) {
      findResult = findResult.populate(populateCollection)
    }

    return findResult.exec() as Promise<FullModel>
  }

  protected validateNewRecord(newRecord: BareModel): void {
    // Default implementation is empty
  }

  protected validateUpdatedRecord(oldRecord: BareModel, newRecord: BareModel): void {
    // Default implementation is empty
  }

  protected validateUpdate(oldRecord: BareModel, newRecord: BareModel) {
    if (!oldRecord) {
      throw new ItemNotFound('Record not found')
    }

    this.validateUpdatedRecord(oldRecord, newRecord)
  }
}
