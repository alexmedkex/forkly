import { IHistory } from '@komgo/types'

import { datePlusHours } from '../test-utils'

import { createHistory } from './createHistory'

describe('createHistory', () => {
  const STATIC_ID = 'staticId'
  const STATIC_ID_0 = 'staticId0'
  const STATIC_ID_1 = 'staticId1'
  const STATIC_ID_2 = 'staticId2'

  const initialObject = {
    staticId: STATIC_ID,
    field: 'field-initial',
    fieldDate: new Date().toISOString(),
    fieldArray: ['fieldArray-0', 'fieldArray-1'],
    fieldIgnore: 'fieldIgnore',
    updatedAt: new Date().toISOString(),
    nestedObject: {
      nestedField1: 'nestedField1-initial',
      nestedField2: 'nestedField2-initial'
    },
    nestedArray: [
      {
        staticId: STATIC_ID_0,
        nestedArrayField1: 'nestedArrayField1-initial-0',
        nestedArrayField2: 'nestedArrayField2-initial-0'
      },
      {
        staticId: STATIC_ID_1,
        nestedArrayField1: 'nestedArrayField1-initial-1',
        nestedArrayField2: 'nestedArrayField2-initial-1'
      },
      {
        staticId: STATIC_ID_2,
        nestedArrayField1: 'nestedArrayField1-initial-2',
        nestedArrayField2: 'nestedArrayField2-initial-2'
      }
    ]
  }

  describe('flat objects', () => {
    it('should return empty history if no change', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2)
      }

      const history = createHistory([initialObject, updatedObject])
      expect(history).toEqual(undefined)
    })

    it('should return successfully if more than one update', () => {
      const updatedObject0 = {
        ...initialObject,
        field: 'field-updated0',
        updatedAt: datePlusHours(initialObject.updatedAt, 2)
      }

      const updatedObject1 = {
        ...updatedObject0,
        field: 'field-updated1',
        updatedAt: datePlusHours(initialObject.updatedAt, 2)
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          field: [
            { updatedAt: updatedObject1.updatedAt, value: updatedObject1.field },
            { updatedAt: updatedObject0.updatedAt, value: updatedObject0.field },
            { updatedAt: initialObject.updatedAt, value: initialObject.field }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject0, updatedObject1])
      expect(history).toEqual(expectedHistory)
    })

    it('should return the history of each updated field: standard values', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        field: 'field-updated'
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          field: [
            { updatedAt: updatedObject.updatedAt, value: updatedObject.field },
            { updatedAt: initialObject.updatedAt, value: initialObject.field }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject])
      expect(history).toEqual(expectedHistory)
    })

    it('should return the history of each updated field: dates', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        fieldDate: datePlusHours(initialObject.fieldDate, 10)
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          fieldDate: [
            { updatedAt: updatedObject.updatedAt, value: updatedObject.fieldDate },
            { updatedAt: initialObject.updatedAt, value: initialObject.fieldDate }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject])
      expect(history).toEqual(expectedHistory)
    })

    it('should return the history of each updated field: flat arrays', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        fieldArray: ['fieldArray-0', 'fieldArray-1', 'fieldArray-2']
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          fieldArray: [
            { updatedAt: updatedObject.updatedAt, value: updatedObject.fieldArray },
            { updatedAt: initialObject.updatedAt, value: initialObject.fieldArray }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject])
      expect(history).toEqual(expectedHistory)
    })

    it('should return the history of each updated field and ignore listed fields', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        field: 'field-updated',
        fieldIgnore: 'fieldIgnoredChanged'
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          field: [
            { updatedAt: updatedObject.updatedAt, value: updatedObject.field },
            { updatedAt: initialObject.updatedAt, value: initialObject.field }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject], ['fieldIgnore'])
      expect(history).toEqual(expectedHistory)
    })

    it('should add all fields to history even if non-present in some entities of the list', () => {
      const updatedObject0 = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        newField: 'newField-0'
      }
      const updatedObject1 = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 3)
      }
      const updatedObject2 = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 4),
        newField: 'newField-2'
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          newField: [
            { updatedAt: updatedObject2.updatedAt, value: updatedObject2.newField },
            { updatedAt: updatedObject0.updatedAt, value: updatedObject0.newField }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject0, updatedObject1, updatedObject2])
      expect(history).toEqual(expectedHistory)
    })
  })

  describe('nested objects', () => {
    it('should return the history of each updated field in a nested object', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        nestedObject: {
          nestedField1: 'nestedField1-updated',
          nestedField2: 'nestedField2-initial'
        }
      }

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          nestedObject: {
            historyEntry: {
              nestedField1: [
                { updatedAt: updatedObject.updatedAt, value: updatedObject.nestedObject.nestedField1 },
                { updatedAt: initialObject.updatedAt, value: initialObject.nestedObject.nestedField1 }
              ]
            }
          }
        }
      }

      const history = createHistory([initialObject, updatedObject])
      expect(history).toEqual(expectedHistory)
    })
  })

  describe('nested array of objects', () => {
    it('should return the history of each updated field and nested array containing objects grouped by staticId', () => {
      const updatedObject = {
        ...initialObject,
        updatedAt: datePlusHours(initialObject.updatedAt, 2),
        nestedArray: [
          {
            staticId: STATIC_ID_0,
            nestedArrayField1: 'nestedArrayField1-updated-0',
            nestedArrayField2: 'nestedArrayField2-initial-0'
          },
          {
            staticId: STATIC_ID_1,
            nestedArrayField1: 'nestedArrayField1-updated-1',
            nestedArrayField2: 'nestedArrayField2-initial-1'
          },
          {
            staticId: STATIC_ID_2,
            nestedArrayField1: 'nestedArrayField1-initial-2',
            nestedArrayField2: 'nestedArrayField2-initial-2'
          }
        ]
      } // Object at index 0 and 1 are updated but not object at index 2

      const expectedHistory: IHistory<any> = {
        id: STATIC_ID,
        historyEntry: {
          nestedArray: [
            {
              id: STATIC_ID_0,
              historyEntry: {
                nestedArrayField1: [
                  { updatedAt: updatedObject.updatedAt, value: updatedObject.nestedArray[0].nestedArrayField1 },
                  { updatedAt: initialObject.updatedAt, value: initialObject.nestedArray[0].nestedArrayField1 }
                ]
              }
            },
            {
              id: STATIC_ID_1,
              historyEntry: {
                nestedArrayField1: [
                  { updatedAt: updatedObject.updatedAt, value: updatedObject.nestedArray[1].nestedArrayField1 },
                  { updatedAt: initialObject.updatedAt, value: initialObject.nestedArray[1].nestedArrayField1 }
                ]
              }
            }
          ]
        }
      }

      const history = createHistory([initialObject, updatedObject])
      expect(history).toEqual(expectedHistory)
    })
  })

  describe('combination', () => {
    const mockTradeSnapshot = {
      sourceId: 'tradeSnapshotSourceId',
      movements: [
        {
          _id: 'movement0',
          version: 2,
          grade: 'grade',
          parcels: [
            {
              _id: 'parcel0',
              parcelField: 'parcelField',
              createdAt: '2019-07-12T10:08:23.131Z',
              updatedAt: '2019-07-12T10:08:23.131Z'
            }
          ],
          createdAt: '2019-07-12T10:08:23.131Z',
          updatedAt: '2019-07-12T10:08:23.131Z'
        },
        {
          _id: 'movement1',
          version: 2,
          parcels: [],
          createdAt: '2019-07-12T10:08:23.131Z',
          updatedAt: '2019-07-12T10:08:23.131Z'
        }
      ],
      trade: {
        _id: 'tradeId',
        requiredDocuments: [],
        version: 2,
        source: 'KOMGO',
        sourceId: 'tradeSourceId',
        paymentTerms: {
          eventBase: 'BL',
          when: 'AFTER',
          time: 2
        },
        createdAt: '2019-07-12T10:08:23.131Z',
        updatedAt: '2019-07-12T10:08:23.131Z'
      },
      createdAt: '2019-07-12T10:09:23.131Z',
      updatedAt: '2019-07-12T10:09:23.131Z'
    }

    it('should return the history of each updated field', () => {
      const mockTradeSnapshotUpdated = {
        ...mockTradeSnapshot,
        updatedAt: datePlusHours(mockTradeSnapshot.updatedAt, 2)
      }
      mockTradeSnapshotUpdated.trade = {
        _id: 'tradeId',
        requiredDocuments: ['documentId'], // document added that creates an array
        version: 2,
        source: 'KOMGO',
        sourceId: 'tradeSourceId',
        paymentTerms: { eventBase: 'BL', when: 'AFTER', time: 5 }, // has changed
        createdAt: '2019-07-12T10:08:23.131Z',
        updatedAt: '2019-08-12T10:08:23.131Z'
      }
      mockTradeSnapshotUpdated.movements = [
        {
          _id: 'movement0',
          version: 2,
          grade: 'gradeChanged', // has changed
          parcels: [
            {
              _id: 'parcel0',
              parcelField: 'parcelFieldChanged', // has changed
              createdAt: '2019-07-12T10:08:23.131Z',
              updatedAt: '2019-08-12T10:08:23.131Z'
            }
          ],
          createdAt: '2019-07-12T10:08:23.131Z',
          updatedAt: '2019-08-12T10:08:23.131Z'
        }
        // movement1 was removed
      ]

      const expectedHistory: IHistory<any> = {
        historyEntry: {
          trade: {
            id: mockTradeSnapshot.trade._id,
            historyEntry: {
              paymentTerms: {
                historyEntry: {
                  time: [
                    {
                      updatedAt: mockTradeSnapshotUpdated.trade.updatedAt,
                      value: mockTradeSnapshotUpdated.trade.paymentTerms.time
                    },
                    { updatedAt: mockTradeSnapshot.trade.updatedAt, value: mockTradeSnapshot.trade.paymentTerms.time }
                  ]
                }
              },
              requiredDocuments: [
                {
                  updatedAt: mockTradeSnapshotUpdated.trade.updatedAt,
                  value: mockTradeSnapshotUpdated.trade.requiredDocuments
                },
                { updatedAt: mockTradeSnapshot.trade.updatedAt, value: mockTradeSnapshot.trade.requiredDocuments }
              ]
            }
          },
          movements: [
            {
              id: mockTradeSnapshotUpdated.movements[0]._id,
              historyEntry: {
                grade: [
                  {
                    updatedAt: mockTradeSnapshotUpdated.movements[0].updatedAt,
                    value: mockTradeSnapshotUpdated.movements[0].grade
                  },
                  { updatedAt: mockTradeSnapshot.movements[0].updatedAt, value: mockTradeSnapshot.movements[0].grade }
                ],
                parcels: [
                  {
                    id: mockTradeSnapshotUpdated.movements[0].parcels[0]._id,
                    historyEntry: {
                      parcelField: [
                        {
                          updatedAt: mockTradeSnapshotUpdated.movements[0].parcels[0].updatedAt,
                          value: mockTradeSnapshotUpdated.movements[0].parcels[0].parcelField
                        },
                        {
                          updatedAt: mockTradeSnapshot.movements[0].parcels[0].updatedAt,
                          value: mockTradeSnapshot.movements[0].parcels[0].parcelField
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }

      const history = createHistory([mockTradeSnapshot, mockTradeSnapshotUpdated])
      expect(history).toEqual(expectedHistory)
    })

    it('should return the history of each updated, even if field comes `undefined`', () => {
      const mockTradeSnapshotUpdated = {
        ...mockTradeSnapshot,
        updatedAt: datePlusHours(mockTradeSnapshot.updatedAt, 2)
      }
      mockTradeSnapshotUpdated.trade = {
        _id: 'tradeId',
        requiredDocuments: ['documentId'], // document added that creates an array
        version: 2,
        source: 'KOMGO',
        sourceId: 'tradeSourceId',
        paymentTerms: undefined, // has changed to undefined
        createdAt: '2019-07-12T10:08:23.131Z',
        updatedAt: '2019-08-12T10:08:23.131Z'
      }
      const mockTradeSnapshotUpdated2 = {
        ...mockTradeSnapshot,
        updatedAt: datePlusHours(mockTradeSnapshotUpdated.updatedAt, 2)
      }
      mockTradeSnapshotUpdated2.trade = {
        _id: 'tradeId',
        requiredDocuments: ['documentId'], // document added that creates an array
        version: 2,
        source: 'KOMGO',
        sourceId: 'tradeSourceId',
        paymentTerms: { eventBase: 'BL', when: 'AFTER', time: 8 }, // has changed
        createdAt: '2019-07-12T10:08:23.131Z',
        updatedAt: '2019-08-12T10:08:23.131Z'
      }
      const mockTradeSnapshotUpdated3 = {
        ...mockTradeSnapshot,
        updatedAt: datePlusHours(mockTradeSnapshotUpdated2.updatedAt, 2)
      }
      mockTradeSnapshotUpdated3.trade = {
        _id: 'tradeId',
        requiredDocuments: ['documentId'], // document added that creates an array
        version: 2,
        source: 'KOMGO',
        sourceId: 'tradeSourceId',
        paymentTerms: { eventBase: 'BL', when: 'AFTER', time: 10 }, // has changed
        createdAt: '2019-07-12T10:08:23.131Z',
        updatedAt: '2019-08-12T10:08:23.131Z'
      }

      const expectedHistory: IHistory<any> = {
        historyEntry: {
          trade: {
            id: mockTradeSnapshot.trade._id,
            historyEntry: {
              requiredDocuments: [
                {
                  updatedAt: mockTradeSnapshotUpdated.trade.updatedAt,
                  value: mockTradeSnapshotUpdated.trade.requiredDocuments
                },
                { updatedAt: mockTradeSnapshot.trade.updatedAt, value: mockTradeSnapshot.trade.requiredDocuments }
              ]
            }
          }
        }
      }

      const history = createHistory([mockTradeSnapshot, mockTradeSnapshotUpdated, mockTradeSnapshotUpdated2])
      expect(history).toEqual(expectedHistory)
    })

    it('adding object to array of objects in real example', () => {
      const rd0 = {
        supportingInstruments: ['BILL_OF_EXCHANGE'],
        tradeReference: {
          sourceId: 'a837c9d9-40fb-464d-8c38-ea65ca6cc9b4',
          sellerEtrmId: 'E5190706',
          source: 'KOMGO'
        },
        invoiceAmount: 200,
        invoiceType: 'INDICATIVE',
        discountingDate: '2019-09-03T00:00:00Z',
        dateOfPerformance: '2019-09-03T00:00:00Z',
        numberOfDaysDiscounting: 15,
        advancedRate: 90,
        currency: 'USD',
        discountingType: 'WITHOUT_RECOURSE',
        requestType: 'DISCOUNT',
        staticId: '88660238-0c0b-49b4-92fb-2e2c95245f67',
        createdAt: '2019-08-29T12:13:52.591Z',
        updatedAt: '2019-08-29T12:13:52.591Z',
        __v: 0
      }
      const rd1 = {
        ...rd0,
        financialInstrumentInfo: {
          financialInstrument: 'OTHER',
          financialInstrumentIssuerName: 'name',
          financialInstrumentIfOther: 'test'
        },
        createdAt: datePlusHours(rd0.updatedAt, 2),
        updatedAt: datePlusHours(rd0.updatedAt, 2)
      }

      createHistory([rd0, rd1])
      // If it doesn't throw, consider test as passing
    })
  })
})
