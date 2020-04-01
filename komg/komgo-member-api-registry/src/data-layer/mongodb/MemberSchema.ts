import { Schema } from 'mongoose'

const X500NameSchema: Schema = new Schema(
  {
    CN: {
      type: String
    },
    O: {
      type: String
    },
    C: {
      type: String
    },
    L: {
      type: String
    },
    STREET: {
      type: String
    },
    PC: {
      type: String
    }
  },
  { _id: false }
)

const EthPubKeyKeySchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true
    },
    effDate: {
      type: Number
    },
    termDate: {
      type: Number
    },
    address: {
      type: String
    },
    current: {
      type: Boolean
    },
    revoked: {
      type: Boolean
    }
  },
  { _id: false }
)

const MessagingPubKeySchema: Schema = new Schema(
  {
    key: {
      type: String
    },
    effDate: {
      type: Number
    },
    termDate: {
      type: Number
    },
    current: {
      type: Boolean
    },
    revoked: {
      type: Boolean
    }
  },
  { _id: false }
)

const MemberSchema: Schema = new Schema({
  node: {
    type: String,
    required: true,
    indexed: true
  },
  parentNode: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  resolver: {
    type: String
  },
  address: {
    type: String
  },
  abi: {
    type: String
  },
  nodeKeys: {
    type: String
  },
  staticId: {
    type: String
  },
  isFinancialInstitution: {
    type: Boolean
  },
  isMember: {
    type: Boolean
  },
  memberType: {
    type: String
  },
  vaktStaticId: {
    type: String
  },
  komgoMnid: {
    type: String
  },
  vaktMnid: {
    type: String
  },
  x500Name: {
    type: X500NameSchema
  },
  text: {
    type: Object
  },
  ethPubKeys: {
    type: [EthPubKeyKeySchema]
  },
  komgoMessagingPubKeys: {
    type: [MessagingPubKeySchema]
  },
  vaktMessagingPubKeys: {
    type: [MessagingPubKeySchema]
  },
  hasSWIFTKey: {
    type: Boolean
  },
  reverseNode: {
    type: String
  },
  isDeactivated: {
    type: Boolean
  },
  komgoProducts: {
    type: Object
  }
})

export { MemberSchema }
