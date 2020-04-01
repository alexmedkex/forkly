import React, { useState, useEffect } from 'react'
import {
  ILetterOfCredit,
  IDataLetterOfCredit,
  IField,
  buildFields,
  templateIsValid,
  LetterOfCreditTaskType
} from '@komgo/types'
import { ImmutableObject, ImmutableMap } from '../../../utils/types'
import { Header, Button } from 'semantic-ui-react'
import { TemplateWithSidePanel } from '../../templates/components/TemplateWithSidePanel'
import { ViewLetterOfCreditDetails } from './ViewLetterOfCreditDetails'
import { resolveBindings } from '../../templates/utils/schemaUtils'
import { findLetterOfCreditSchema } from '../utils/findLetterOfCreditSchema'
import { FILTERED_FIELDS } from '../constants'
import { formatTemplateData } from '../utils/formatTemplateData'
import { TemplateMode, SPACES } from '@komgo/ui-components'
import { ReviewStandbyLetterOfCreditIssuingBank, IssueFormData } from './ReviewStandbyLetterOfCreditIssuingBank'
import { buildDataLetterOfCreditBase } from '../utils/dataLetterOfCreditBaseFromDataLetterOfCredit'
import { ButtonLink } from '../../../components/button-link/ButtonLink'
import { Document, DocumentStateFields } from '../../document-management/store/types'
import { DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { initiateFileDownload } from '../../document-management/utils/downloadDocument'

export interface ViewLetterOfCreditProps {
  letterOfCredit: ImmutableObject<ILetterOfCredit<IDataLetterOfCredit>>
  onSubmit?: (data: IssueFormData, templateModel: any) => void
  companyStaticId: string
  taskType: LetterOfCreditTaskType | null
  issuanceDocument?: ImmutableMap<DocumentStateFields>
  issuanceDocumentMetadata?: Document
  onDownloadClicked?: () => void
}

const onDownload = (letterOfCreditDocumentMetadata?: Document) => () => {
  if (letterOfCreditDocumentMetadata) {
    const contentUrl = `${
      process.env.REACT_APP_API_GATEWAY_URL
    }/api${DOCUMENTS_BASE_ENDPOINT}/trade-finance/documents/${letterOfCreditDocumentMetadata.id}/content/`
    initiateFileDownload(letterOfCreditDocumentMetadata, contentUrl)
  }
}

export const ViewLetterOfCredit = ({
  letterOfCredit: immutableLetterOfCredit,
  companyStaticId,
  onSubmit,
  taskType,
  issuanceDocument,
  issuanceDocumentMetadata
}: ViewLetterOfCreditProps) => {
  const [letterOfCredit] = useState<ILetterOfCredit<IDataLetterOfCredit>>(() => immutableLetterOfCredit.toJS())
  const {
    templateInstance: { data: initialData, template, bindings, dataSchemaId, templateSchemaId },
    reference
  } = letterOfCredit

  const [templateFields] = useState<IField[]>(() =>
    buildFields({
      bindings: resolveBindings(bindings),
      dataSchema: findLetterOfCreditSchema(dataSchemaId),
      templateSchema: findLetterOfCreditSchema(templateSchemaId)
    }).filter(f => !FILTERED_FIELDS.includes(f.dataPath))
  )

  const [templateMode, setTemplateMode] = useState<TemplateMode>(TemplateMode.ReadOnly)

  const [templateModel, setTemplateModel] = useState<{}>(template)

  const [dataLetterOfCreditBase, setDataLetterOfCreditBase] = useState(buildDataLetterOfCreditBase(initialData))

  const [dataLetterOfCredit, setDataLetterOfCredit] = useState<IDataLetterOfCredit>(initialData)

  useEffect(
    () => {
      setDataLetterOfCredit({
        ...initialData,
        amount: dataLetterOfCreditBase.amount,
        currency: dataLetterOfCreditBase.currency,
        expiryDate: dataLetterOfCreditBase.expiryDate,
        issuingBankReference: dataLetterOfCreditBase.issuingBankReference
      })
    },
    [dataLetterOfCreditBase, initialData]
  )

  const handleTemplateChange = (value: any, newMode: TemplateMode) => {
    if (newMode === TemplateMode.ReadOnly) {
      setTemplateModel(value)
    }
    if (templateMode !== newMode) {
      setTemplateMode(newMode)
    }
  }

  const isReviewingRequestedLetterOfCredit = taskType === LetterOfCreditTaskType.ReviewRequested

  return (
    <>
      <Header as="h1" style={{ padding: SPACES.DEFAULT, margin: 0 }}>
        {issuanceDocumentMetadata ? (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>{reference}</div>
            <Button size="small" onClick={onDownload(issuanceDocumentMetadata)}>
              Download
            </Button>
          </div>
        ) : (
          <>{reference}</>
        )}
      </Header>
      <TemplateWithSidePanel
        issuanceDocument={issuanceDocument}
        issuanceDocumentMetadata={issuanceDocumentMetadata}
        data={formatTemplateData(dataLetterOfCredit)}
        template={template}
        fields={templateFields}
        modeLocked={!isReviewingRequestedLetterOfCredit}
        mode={TemplateMode.ReadOnly}
        onChange={handleTemplateChange}
      >
        {isReviewingRequestedLetterOfCredit ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: SPACES.DEFAULT,
                paddingBottom: SPACES.DEFAULT
              }}
            >
              <Header>Review application</Header>
              <br />
              <ButtonLink to={`/letters-of-credit/${letterOfCredit.staticId}/trade`} target="_blank">
                View trade details
              </ButtonLink>
            </div>
            <ReviewStandbyLetterOfCreditIssuingBank
              templateModel={templateModel}
              initialValues={{ ...dataLetterOfCreditBase, reviewDecision: '', comment: '', file: null }}
              onSubmit={(data: IssueFormData) => onSubmit(data, templateModel)}
              onChange={data => setDataLetterOfCreditBase(data)}
              disableSubmit={
                templateMode !== TemplateMode.ReadOnly ||
                !templateIsValid(templateModel, findLetterOfCreditSchema(templateSchemaId))
              }
              beneficiaryIsMember={dataLetterOfCredit.beneficiary.isMember}
              applicantName={dataLetterOfCredit.applicant.x500Name.CN}
            />
          </>
        ) : (
          <ViewLetterOfCreditDetails companyStaticId={companyStaticId} letterOfCredit={letterOfCredit} />
        )}
      </TemplateWithSidePanel>
    </>
  )
}
