import DataAccess from '@komgo/data-access'
import { getLogger } from '@komgo/logging'
import mongoose from 'mongoose'

import { Model } from '../constants'
import { logIndexCreation } from '../utils/logIndexCreation'

import { ContractAddressSchema } from './ContractAddressSchema'
import { IContractAddressDocument } from './IContractAddressDocument'

export type ContractAddressModel = mongoose.Model<IContractAddressDocument>

export const ContractAddress: ContractAddressModel = DataAccess.connection.model<IContractAddressDocument>(
  Model.ContractAddress,
  ContractAddressSchema
)

logIndexCreation(getLogger('ContractAddressModel'), ContractAddress)
