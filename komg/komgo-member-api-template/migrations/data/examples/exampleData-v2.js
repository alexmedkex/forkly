module.exports = {
    trade: {
        "buyer": "node.123",
        "buyerEtrmId": "buyerEtrmId",
        "commodity": "Crude oil",
        "creditRequirement": "Standby letter of credit",
        "currency": "Eur",
        "dealDate": "2017-12-31",
        "deliveryLocation": "Weymouth",
        "deliveryPeriod": { "endDate": "2019-04-10", "startDate": "2019-04-03" },
        "deliveryTerms": "Fob",
        "invoiceQuantity": "Load",
        "maxTolerance": 1.25,
        "minTolerance": 1.50,
        "generalTermsAndConditions": 'SUKO90',
        "paymentTerms": {
            "dayType": "Calendar",
            "eventBase": "Bl",
            "time": 30,
            "timeUnit": "Days",
            "when": "After"
        },
        "laytime": '',
        "demurrageTerms": '',
        "law": "New York law",
        "paymentTermsOption": "Deferred",
        "contractReference": "ref-123",
        "contractDate": "2019-12-31",
        "price": 70.02,
        "priceUnit": "BBL",
        "priceOption": "Fix",
        "priceFormula": "price formula",
        "quantity": 600000,
        "seller": "node.321",
        "sellerEtrmId": "sellerEtrmId",
        "source": "komgo",
        "sourceId": "E2389423",
        "status": "To be financed",
        "version": 2
    },

    cargo: {
        "cargoId": "F0401",
        "grade": "Brent",
        "originOfGoods": "China",
        "parcels": [
            {
                "deemedBLDate": '2018-10-04',
                "destinationPlace": "Weymouth",
                "id": "parcelId1",
                "laycanPeriod": {
                    "endDate": "2017-12-31",
                    "startDate": "2017-12-31"
                },
                "loadingPlace": "Porto",
                "modeOfTransport": "Vessel",
                "quantity": 600000,
                "version": 2
            }
        ],
        "quality": "Oil Product",
        "source": "komgo",
        "sourceId": "E2389423",
        "status": "To be financed",
        "version": 2
    },

    amount: 1000000,
    currency: "USD",
    expiryDate: "2019-10-11",
    issuingBankReference: "REF-ISSUING-00",

    issuingBank: {
        "isFinancialInstitution": true,
        "isMember": true,
        "x500Name": {
            "C": "Issuing Bank country",
            "CN": "Issuing Bank",
            "L": "Issuing Bank city",
            "O": "Issuing Bank ltd",
            "PC": "Issuing Bank postal code",
            "STREET": "Issuing Bank street"
        }
    },

    beneficiaryBank: {
        "isFinancialInstitution": true,
        "isMember": true,
        "x500Name": {
            "C": "Beneficiary Bank country",
            "CN": "Beneficiary Bank",
            "L": "Beneficiary Bank city",
            "O": "Beneficiary Bank ltd",
            "PC": "Beneficiary Bank postal code",
            "STREET": "Beneficiary Bank street"
        }
    },

    applicant: {
        "isFinancialInstitution": false,
        "isMember": true,
        "x500Name": {
            "C": "Applicant country",
            "CN": "Applicant",
            "L": "Applicant city",
            "O": "Applicant ltd",
            "PC": "Applicant postal code",
            "STREET": "Applicant street"
        }
    },

    beneficiary: {
        "isFinancialInstitution": false,
        "isMember": true,
        "x500Name": {
            "C": "Beneficiary country",
            "CN": "Beneficiary",
            "L": "Beneficiary city",
            "O": "Beneficiary ltd",
            "PC": "Beneficiary postal code",
            "STREET": "Beneficiary street"
        }
    }
}
