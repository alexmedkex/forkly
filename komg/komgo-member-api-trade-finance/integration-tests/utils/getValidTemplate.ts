export function getValidTemplate() {
  return {
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [
        {
          object: 'block',
          type: 'paragraph',
          data: {},
          nodes: [
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'beneficiary.x500Name.CN',
                title: 'Beneficiary name'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Beneficiary name',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'applicant.x500Name.CN',
                title: 'Applicant name'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Applicant name',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'issuingBank.x500Name.CN',
                title: 'Issuing bank name'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Issuing bank name',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'beneficiaryBank.x500Name.CN',
                title: 'Beneficiary bank name'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Beneficiary bank name',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'amount',
                title: 'Opening amount'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Opening amount',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'currency',
                title: 'Currency'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Currency',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'expiryDate',
                title: 'Expiry date'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Expiry date',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            },
            {
              object: 'inline',
              type: 'variable',
              data: {
                path: 'issuingBankReference',
                title: 'Issuing bank reference'
              },
              nodes: [
                {
                  object: 'text',
                  text: 'Issuing bank reference',
                  marks: []
                }
              ]
            },
            {
              object: 'text',
              text: '',
              marks: []
            }
          ]
        }
      ]
    }
  }
}
