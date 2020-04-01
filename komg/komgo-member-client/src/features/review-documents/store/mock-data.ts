import { IFullReceivedDocumentsResponse, FieldType, IFullDocumentReviewResponse, ReviewStatus } from './types'

const recentRandomDate = (minutesAgo: number): Date => {
  const now = new Date().getTime()
  return new Date(now - minutesAgo)
}

export const mockReceivedDocuments: IFullReceivedDocumentsResponse = {
  id: 'string',
  product: {
    id: 'string',
    name: 'string'
  },
  companyId: 'string',
  request: {
    id: 'string',
    product: {
      id: 'string',
      name: 'string'
    },
    companyId: 'string',
    types: [
      {
        id: 'string',
        product: {
          id: 'string',
          name: 'string'
        },
        category: {
          id: 'string',
          product: {
            id: 'string',
            name: 'string'
          },
          name: 'string'
        },
        name: 'string',
        fields: [
          {
            id: 'string',
            name: 'string',
            type: FieldType.STRING,
            isArray: true
          }
        ],
        predefined: true
      }
    ]
  },
  documents: [
    {
      document: {
        id: 'string',
        name: 'string',
        product: {
          id: 'string',
          name: 'string'
        },
        category: {
          id: 'string',
          product: {
            id: 'string',
            name: 'string'
          },
          name: 'string'
        },
        type: {
          id: 'string',
          product: {
            id: 'string',
            name: 'string'
          },
          category: {
            id: 'string',
            product: {
              id: 'string',
              name: 'string'
            },
            name: 'string'
          },
          name: 'string',
          fields: [
            {
              id: 'string',
              name: 'string',
              type: FieldType.STRING,
              isArray: true
            }
          ],
          predefined: true
        },
        owner: {
          firstName: 'string',
          lastName: 'string',
          companyId: 'string'
        },
        hash: 'string',
        sharedWith: [{ counterpartyId: 'string', sharedDates: [new Date()] }],
        receivedDate: recentRandomDate(Math.random() * 1000 * 3600),
        registrationDate: recentRandomDate(Math.random() * 1000 * 3600),
        metadata: [
          {
            name: 'string',
            value: 'string'
          }
        ],
        sharedBy: 'string'
      },
      status: 'string',
      note: 'string'
    }
  ],
  feedbackSent: true
}

export const mockDocumentReviewResponse: IFullDocumentReviewResponse = {
  document: {
    id: 'idDoc1',
    name: 'nameDoc1',
    product: {
      id: 'idProd1',
      name: 'name'
    },
    category: {
      id: 'cat1',
      product: {
        id: 'id',
        name: 'name'
      },
      name: 'name'
    },
    type: {
      id: 'string',
      product: {
        id: 'string',
        name: 'string'
      },
      category: {
        id: 'string',
        product: {
          id: 'string',
          name: 'string'
        },
        name: 'string'
      },
      name: 'string',
      fields: [],
      predefined: true
    },
    owner: {
      firstName: 'string',
      lastName: 'string',
      companyId: 'string'
    },
    hash: '123456789',
    sharedWith: [],
    receivedDate: recentRandomDate(Math.random() * 1000 * 3600),
    registrationDate: recentRandomDate(Math.random() * 1000 * 3600),
    metadata: [],
    sharedBy: ''
  },
  status: ReviewStatus.PENDING,
  note: ''
}
