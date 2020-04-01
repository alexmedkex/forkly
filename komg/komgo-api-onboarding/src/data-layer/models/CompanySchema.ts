import { Status } from '@komgo/types'
import * as EmailValidator from 'email-validator'
import { Schema } from 'mongoose'

import isSMS from '../../utils/isSMS'

import EthereumPublicKey from './EthereumPublicKey'
import MessagingPublicKey from './MessagingPublicKey'
import VaktInfoSchema from './VaktInfoSchema'
import X500NameSchema from './X500NameSchema'

export const CompanySchema: Schema = new Schema({
  staticId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  komgoMnid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  memberType: {
    type: String
  },
  companyAdminEmail: {
    type: String,
    validate: {
      validator: function validateEmail(value) {
        return isEmailRequired.apply(this) ? EmailValidator.validate(value) : true
      },
      message: props => `${props.value} is not a valid email`
    },
    required: [isEmailRequired, 'Email is required for SMS members']
  },
  keycloakUserId: {
    type: String,
    index: true
  },
  isFinancialInstitution: {
    type: Boolean,
    required: true
  },
  isMember: {
    type: Boolean,
    required: true
  },
  x500Name: {
    type: X500NameSchema,
    required: true
  },
  hasSWIFTKey: {
    type: Boolean,
    required: true
  },
  harborUser: {
    type: String
  },
  harborEmail: {
    type: String
  },
  harborPassword: {
    type: String
  },
  rabbitMQCommonUser: {
    type: String
  },
  rabbitMQCommonPassword: {
    type: String
  },
  addedToENS: {
    type: Boolean,
    default: false
  },
  addedToMQ: {
    type: Boolean,
    default: false
  },
  messagingPublicKey: {
    type: MessagingPublicKey
  },
  ethereumPublicKey: {
    type: EthereumPublicKey
  },
  nodeKeys: {
    type: String
  },
  vakt: {
    type: VaktInfoSchema
  },
  isDeactivated: {
    type: Boolean,
    default: false
  }
})

const isStatusReady = (isMember: boolean, isMemberSMS: boolean, hasMessagingPublicKey: boolean) =>
  !isMember || !isMemberSMS || (isMemberSMS && hasMessagingPublicKey)

export const virtualStatus = function() {
  switch (true) {
    case this.addedToENS && !this.isMember:
      return Status.Registered
    case this.addedToENS && this.addedToMQ:
      return Status.Onboarded
    case isStatusReady(this.isMember, isSMS(this.memberType), !!this.messagingPublicKey):
      return Status.Ready
    case isSMS(this.memberType) && !!this.harborUser:
      return Status.Pending
    default:
      return Status.Draft
  }
}

CompanySchema.virtual('status').get(virtualStatus)

CompanySchema.virtual('x500Name.CN').get(function() {
  return this.x500Name.O
})

CompanySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id
    delete ret.id
  }
})

function isEmailRequired() {
  return this.isMember && isSMS(this.memberType)
}
