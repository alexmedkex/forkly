'use strict'

const TYPES_COLLECTION = 'types'
const CATEGORY_COLLECTION = 'categories'

const fundraisingCategory = {
    _id: 'fundraising',
    productId: 'kyc',
    name: 'Fundraising',
    _v: 0
}

const fundraisingTypes = [
    {
        _id: 'administrative-documents',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Administrative documents',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'taxes',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Taxes',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'financials',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Financials',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'legal-insurance-intellectual-property',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Legal, insurance & intellectual property',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'contracts',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Contracts',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'human-resources-social',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Human resources & social',
        fields: null,
        __v: 0,
        predefined: true
    },
    {
        _id: 'company-presentation-elements',
        productId: 'kyc',
        categoryId: 'fundraising',
        name: 'Company presentation elements',
        fields: null,
        __v: 0,
        predefined: true
    }
]



module.exports = {
    async up(db) {
        await db.collection(CATEGORY_COLLECTION).insert(fundraisingCategory)
        
        for(const type of fundraisingTypes) {
            await db.collection(TYPES_COLLECTION).insert(type)
        }
    },

    async down(db) {
        await db.collection(CATEGORY_COLLECTION).remove({ _id: fundraisingCategory._id })

        for(const type of fundraisingTypes) {
            await db.collection(TYPES_COLLECTION).remove({ _id: type._id })
        }
    }
}
