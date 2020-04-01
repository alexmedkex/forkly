'use strict'

const TYPES_COLLECTION = 'types'

const newTypes = [
    {
        _id: 'copy-vat-certificate',
        productId: 'kyc',
        categoryId: 'company-details',
        name: 'Copy of your VAT certificate',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'factual-control',
        productId: 'kyc',
        categoryId: 'regulation-and-compliance',
        name: 'Factual control',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'extract-public-registry',
        productId: 'kyc',
        categoryId: 'company-details',
        name: 'Extract of public registry',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'utility-bill',
        productId: 'kyc',
        categoryId: 'shareholders',
        name: 'Utility bill',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'share-register',
        productId: 'kyc',
        categoryId: 'company-details',
        name: 'Share register',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'w8ben-e',
        productId: 'kyc',
        categoryId: 'regulation-and-compliance',
        name: 'W8ben-E',
        fields: null,
        __v: 0,
        predefined: true
    }
]



module.exports = {
    async up(db) {        
        for(const type of newTypes) {
            await db.collection(TYPES_COLLECTION).insert(type)
        }
    },

    async down(db) {
        for(const type of newTypes) {
            await db.collection(TYPES_COLLECTION).remove({ _id: type._id })
        }
    }
}
