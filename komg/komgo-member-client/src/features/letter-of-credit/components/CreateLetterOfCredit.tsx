import React, { useState, useEffect } from 'react'
import {
  ITrade,
  ICargo,
  ITemplate,
  ITemplateBinding,
  buildFields,
  templateIsValid,
  ILetterOfCreditBase,
  IDataLetterOfCreditBase,
  IField,
  LetterOfCreditType
} from '@komgo/types'
import { ImmutableObject } from '../../../utils/types'
import { IMember } from '../../members/store/types'
import { Counterparty } from '../../counterparties/store/types'
import { Header } from 'semantic-ui-react'
import { SPACES, TemplateMode } from '@komgo/ui-components'
import { StandbyLetterOfCreditApplication } from './StandbyLetterOfCreditApplication'
import { TEMPLATE_INSTANCE_VERSIONS } from '@komgo/types/dist/template-library/template/TemplateInstanceSchema'
import { resolveBindings } from '../../templates/utils/schemaUtils'
import { TemplateWithSidePanel } from '../../templates/components/TemplateWithSidePanel'
import { findLetterOfCreditSchema } from '../utils/findLetterOfCreditSchema'
import { ButtonLink } from '../../../components/button-link/ButtonLink'
import { FILTERED_FIELDS } from '../constants'
import { formatTemplateData } from '../utils/formatTemplateData'
import { buildDataLetterOfCredit } from '../utils/buildDataLetterOfCredit'
import { buildFormDataLetterOfCredit } from '../utils/buildFormDataLetterOfCredit'

export interface CreateLetterOfCreditProps {
  trade: ImmutableObject<ITrade>
  cargo?: ICargo
  applicant: IMember
  beneficiary: IMember
  issuingBanks: Counterparty[]
  beneficiaryBanks: IMember[]
  template: ImmutableObject<ITemplate>
  templateBinding: ImmutableObject<ITemplateBinding>
  onSubmit: (letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase>) => void
}

export const CreateLetterOfCredit = ({
  trade,
  onSubmit,
  template: initialTemplate,
  templateBinding,
  cargo,
  applicant,
  beneficiary,
  issuingBanks,
  beneficiaryBanks
}: CreateLetterOfCreditProps) => {
  // use a function with useState to avoid calculating buildFields every render
  const [templateFields] = useState<IField[]>(() =>
    buildFields({
      bindings: resolveBindings(templateBinding.get('bindings').toJS()),
      dataSchema: findLetterOfCreditSchema(templateBinding.get('dataSchemaId')),
      templateSchema: findLetterOfCreditSchema(templateBinding.get('templateSchemaId'))
    }).filter(f => !FILTERED_FIELDS.includes(f.dataPath))
  )

  const [dataLetterOfCreditBase, setDataLetterOfCreditBase] = useState<IDataLetterOfCreditBase>(
    buildFormDataLetterOfCredit({ trade, cargo, applicant, beneficiary })
  )

  const [templateMode, setTemplateMode] = useState<TemplateMode>(TemplateMode.ReadOnly)

  const [templateModel, setTemplateModel] = useState<{}>(initialTemplate.get('template').toJS())

  const [dataLetterOfCredit, setDataLetterOfCredit] = useState(
    formatTemplateData(
      buildDataLetterOfCredit({
        cargo,
        trade,
        applicant,
        beneficiary,
        issuingBanks,
        beneficiaryBanks,
        dataLetterOfCreditBase
      })
    )
  )

  useEffect(
    () => {
      setDataLetterOfCredit(
        formatTemplateData(
          buildDataLetterOfCredit({
            cargo,
            trade,
            applicant,
            beneficiary,
            issuingBanks,
            beneficiaryBanks,
            dataLetterOfCreditBase
          })
        )
      )
    },
    [dataLetterOfCreditBase]
  )

  return (
    <>
      <div style={{ padding: SPACES.SMALL, margin: 0, maxHeight: '78px' }}>
        <div style={{ fontSize: '1.28571429rem', paddingBottom: SPACES.EXTRA_SMALL }}>
          Standby Letter of Credit Application
        </div>
        <div style={{ color: '#5D768F' }}>Template: {initialTemplate.get('name')}</div>
      </div>
      <TemplateWithSidePanel
        data={dataLetterOfCredit}
        fields={templateFields}
        template={templateModel}
        ownerCompanyStaticId={initialTemplate.get('ownerCompanyStaticId')}
        onChange={(value, newMode) => {
          if (newMode === TemplateMode.ReadOnly) {
            setTemplateModel(value)
          }
          if (templateMode !== newMode) {
            setTemplateMode(newMode)
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 0, paddingBottom: SPACES.SMALL }}>
          <Header>Apply for SBLC</Header>
          <ButtonLink to={`/trades/${trade.get('_id')}?hideDeleteButton=true&hideApplyButtons=true`} target="_blank">
            View trade details
          </ButtonLink>
        </div>
        <StandbyLetterOfCreditApplication
          issuingBanks={issuingBanks}
          beneficiaryBanks={beneficiaryBanks}
          onSubmit={(data: IDataLetterOfCreditBase) =>
            onSubmit({
              version: TEMPLATE_INSTANCE_VERSIONS.V1,
              type: LetterOfCreditType.Standby,
              templateInstance: {
                version: initialTemplate.get('version'),
                templateStaticId: initialTemplate.get('staticId'),
                template: templateModel,
                templateSchemaId: templateBinding.get('templateSchemaId'),
                data,
                dataSchemaId: templateBinding.get('dataSchemaId'),
                bindings: templateBinding.get('bindings').toJS()
              }
            })
          }
          onChange={data => setDataLetterOfCreditBase(data)}
          initialValues={dataLetterOfCreditBase}
          templateModel={templateModel}
          disableSubmit={
            templateMode !== TemplateMode.ReadOnly ||
            !templateIsValid(templateModel, findLetterOfCreditSchema(templateBinding.get('templateSchemaId')))
          }
        />
      </TemplateWithSidePanel>
    </>
  )
}
