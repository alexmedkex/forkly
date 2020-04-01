import { IRequestForProposal } from '@komgo/types'
import Mongoose from 'mongoose'

export default interface IRequestForProposalDocument extends Mongoose.Document, IRequestForProposal {}
