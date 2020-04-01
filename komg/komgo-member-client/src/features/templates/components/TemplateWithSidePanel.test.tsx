import * as React from 'react'
import { buildFields } from '@komgo/types'
import { render } from '@testing-library/react'
import { TemplateWithSidePanel } from './TemplateWithSidePanel'
import { buildFakeTemplateInstance } from '@komgo/types/dist/template-library/template/faker'
import { resolveBindings } from '../utils/schemaUtils'
import { findLetterOfCreditSchema } from '../../letter-of-credit/utils/findLetterOfCreditSchema'
import { FILTERED_FIELDS } from '../../letter-of-credit/constants'
import { Product } from '../../document-management'
import { fromJS } from 'immutable'

const templateInstance = buildFakeTemplateInstance()

const fields = buildFields({
  bindings: resolveBindings(templateInstance.bindings, findLetterOfCreditSchema),
  dataSchema: findLetterOfCreditSchema(templateInstance.dataSchemaId),
  templateSchema: findLetterOfCreditSchema(templateInstance.templateSchemaId)
}).filter(f => !FILTERED_FIELDS.includes(f.dataPath))

const globalAsAny = global as any
const originalGetSelection = globalAsAny.window.getSelection

describe('TemplateWithSidePanel', () => {
  beforeEach(() => {
    globalAsAny.window.getSelection = jest.fn(() => {
      return {}
    })
  })
  afterEach(() => {
    globalAsAny.window.getSelection = originalGetSelection
  })
  it('matches snapshot with a template and a side panel', () => {
    const sidePanel = <div>my side panel content</div>

    const { asFragment } = render(
      <TemplateWithSidePanel template={templateInstance.template} data={templateInstance.data} fields={fields}>
        {sidePanel}
      </TemplateWithSidePanel>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('matches snapshot without a child element', () => {
    const { asFragment } = render(
      <TemplateWithSidePanel template={templateInstance.template} data={templateInstance.data} fields={fields} />
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('matches snapshot with a document', () => {
    const product: Product = {
      id: 'tradeFinance',
      name: 'productName'
    }

    const issuanceDocumentMetadata = true as any

    const issuanceDocument = fromJS({
      documentRaw: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOs1Vv6HwAE0QJRJ/jTdwAAAABJRU5ErkJggg==',
      isLoadingContent: false,
      documentType: 'image/png'
    })

    const { asFragment } = render(
      <TemplateWithSidePanel
        template={templateInstance.template}
        data={templateInstance.data}
        fields={fields}
        issuanceDocumentMetadata={issuanceDocumentMetadata}
        issuanceDocument={issuanceDocument}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
