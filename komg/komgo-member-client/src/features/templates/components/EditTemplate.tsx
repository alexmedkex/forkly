import React, { SyntheticEvent, useState } from 'react'
import { Button, Form, Header, Input } from 'semantic-ui-react'
import { Preview } from '../components/Preview'
import { ViewContainer } from '../components/ViewContainer'
import { SPACES, Template, TemplateMode } from '@komgo/ui-components'
import { buildFields, ITemplate, ITemplateBinding } from '@komgo/types'
import { findTemplateBindingType, resolveBindings } from '../utils/schemaUtils'
import { findLetterOfCreditSchema } from '../../letter-of-credit/utils/findLetterOfCreditSchema'
import { Formik, FormikProps } from 'formik'
import { ServerError } from '../../../store/common/types'
import { RouteComponentProps } from 'react-router'
import { ImmutableObject } from '../../../utils/types'
import { FILTERED_FIELDS } from '../../letter-of-credit/constants'
import { TopHeader } from './TopHeader'
import { ISelection } from '../utils/selectionUtil'
import { Spacer } from '../../../components/spacer/Spacer'

export interface EditTemplateProps extends RouteComponentProps<any> {
  selection?: ISelection
  template: ImmutableObject<ITemplate>
  templateBinding: ImmutableObject<ITemplateBinding>
  updateTemplate: (template: ITemplate) => void
  getTemplateWithTemplateBindings: (params: { staticId: string }) => void
  isUpdating: boolean
  updatingErrors: ServerError[]
}

export const EditTemplate = ({
  templateBinding,
  template,
  updateTemplate,
  isUpdating,
  updatingErrors,
  history,
  selection = {} as any
}: EditTemplateProps) => {
  // Cache toJS result
  const [templateModel] = useState<ITemplate>(() => template.toJS())
  const [templateBindingModel] = useState<ITemplateBinding>(() => templateBinding.toJS())

  const { bindings, dataSchemaId, templateSchemaId, example } = templateBindingModel
  // FIXME LS move buildFields as internal of Template
  // New TemplateOptions:
  // - schemas: map or array of schemas => contains all the schemas used by the template
  // - dataSchema: string
  // - templateSchema: string

  const fields = bindings
    ? buildFields({
        bindings: resolveBindings(bindings, findLetterOfCreditSchema),
        dataSchema: findLetterOfCreditSchema(dataSchemaId),
        templateSchema: findLetterOfCreditSchema(templateSchemaId)
      }).filter(f => !FILTERED_FIELDS.includes(f.dataPath))
    : []

  const [error] = updatingErrors

  const type = findTemplateBindingType(templateSchemaId) // e.g. SBLC / LC

  const onSelectClick = (template: ImmutableObject<ITemplate>, e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    history.push(`${selection.redirectTo}&templateId=${template.get('staticId')}`)
  }

  return (
    <>
      <Formik
        onSubmit={(values, actions) => {
          updateTemplate(values)
          actions.resetForm(values)
        }}
        initialValues={templateModel}
        render={({ values, handleSubmit, setFieldValue, setFieldTouched, dirty }: FormikProps<ITemplate>) => {
          const onTemplateChange = (value, mode) => {
            // FIXME the template should return the immutable object
            if (template.get('template') !== value) {
              setFieldValue('template', value)
              setFieldTouched('template', true)
            }
          }

          const onNameChange = (_, { name, value }) => {
            setFieldValue(name, value)
            setFieldTouched(name, true)
          }

          return (
            <Form onSubmit={handleSubmit}>
              <TopHeader>
                <Header as="h1" style={{ margin: 0 }}>
                  {/* TODO LS keep until we decide <Breadcrumb as="small">Financial Instruments / Templates</Breadcrumb>*/}
                  {selection.select ? (
                    `Templates`
                  ) : (
                    <Form.Field inline={true} style={{ fontSize: '14px' }}>
                      <label htmlFor="field_name">{type}:</label>
                      <Input
                        id="field_name"
                        onChange={onNameChange}
                        type="text"
                        style={{ width: '300px' }}
                        name="name"
                        value={values.name}
                      />
                    </Form.Field>
                  )}
                </Header>

                {selection.select ? (
                  <Button
                    data-test-id="select-template"
                    type="button"
                    onClick={onSelectClick.bind(undefined, template)}
                  >
                    Select
                  </Button>
                ) : (
                  <Button
                    data-test-id="save-template"
                    type="submit"
                    disabled={!dirty && !error}
                    primary={true}
                    loading={isUpdating}
                  >
                    Save
                  </Button>
                )}
              </TopHeader>

              <Spacer marginBottom={SPACES.DEFAULT} paddingRight={SPACES.DEFAULT} paddingLeft={SPACES.DEFAULT}>
                {selection.select && (
                  <p>
                    Choose <strong>{values.name}</strong> template to begin your application
                  </p>
                )}
              </Spacer>

              <ViewContainer>
                <Preview height={'104px'}>
                  {/*
                  // FIXME LS we need to dig into this one on the Template. It happens when we leave the page
                  // Warning: Can't perform a React state update on an unmounted component.
                  // This is a no-op, but it indicates a memory leak in your application.
                  // To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
                  */}
                  <Template
                    modeLocked={selection.select}
                    mode={selection.select ? TemplateMode.ReadOnly : TemplateMode.Write}
                    ownerCompanyStaticId={template.get('ownerCompanyStaticId')}
                    fields={fields}
                    data={example}
                    template={templateModel.template}
                    onChange={onTemplateChange}
                  />
                </Preview>
              </ViewContainer>
            </Form>
          )
        }}
      />
    </>
  )
}
