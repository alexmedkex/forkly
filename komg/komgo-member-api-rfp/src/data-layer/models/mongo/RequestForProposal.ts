import DataAccess from '@komgo/data-access'
import mongoose from 'mongoose'

import IRequestForProposalDocument from './IRequestForProposalDocument'
import { logIndexCreation } from './models-utils'
import RequestForProposalSchema from './RequestForProposalSchema'

export type RequestForProposalModel = mongoose.Model<IRequestForProposalDocument>

export const RequestForProposal: RequestForProposalModel = DataAccess.connection.model<IRequestForProposalDocument>(
  'rfps',
  RequestForProposalSchema
)

logIndexCreation(RequestForProposal)
