export const EMPTY_TEMPLATE = {
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
            text: 'Empty Template',
            marks: [{ object: 'mark', type: 'bold', data: {} }]
          }
        ]
      },
      {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [
          {
            object: 'text',
            text: '',
            marks: [{ object: 'mark', type: 'bold', data: {} }]
          }
        ]
      },
      {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'Please add your wording then add the dynamic fields you need from the above',
            marks: []
          },
          {
            object: 'text',
            text: ' Add Field',
            marks: [{ object: 'mark', type: 'bold', data: {} }]
          },
          { object: 'text', text: ' button', marks: [] }
        ]
      },
      {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [{ object: 'text', text: '', marks: [] }]
      },
      {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'e.g. Some text then a variable: ',
            marks: []
          },
          {
            object: 'inline',
            type: 'variable',
            data: { path: 'applicant.x500Name.CN', title: 'Applicant name' },
            nodes: [{ object: 'text', text: 'Applicant name', marks: [] }]
          },
          { object: 'text', text: '', marks: [] }
        ]
      }
    ]
  }
}
