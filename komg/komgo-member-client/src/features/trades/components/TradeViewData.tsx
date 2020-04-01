import * as H from 'history'
import * as React from 'react'
import { Fragment, SyntheticEvent } from 'react'
import { Accordion, Icon, List } from 'semantic-ui-react'
import { TruncatedText } from '../../../components/truncated-text/TruncatedText'
import { sentenceCase, sentenceCaseWithAcronyms, truncate } from '../../../utils/casings'
import { displayDate, displayPaymentTerms } from '../../../utils/date'
import { Document } from '../../document-management'
import {
  DOWNLOAD,
  DropdownOption,
  VIEW
} from '../../document-management/components/documents/my-documents/DocumentListDropdownOptions'
import { Products } from '../../document-management/constants/Products'
import { initiateDocumentsDownload } from '../../document-management/utils/downloadDocument'
import { CapitalizedHeader } from '../../letter-of-credit-legacy/components/CapitalizedHeader'
import { findFieldFromTradeSchema, displayPercentage } from '../../trades/utils/displaySelectors'
import { ITradeEnriched } from '../store/types'
import { ICargo, CARGO_SCHEMA, PriceOption, TRADE_SCHEMA, TradeSource, IHistory } from '@komgo/types'
import { displayCommodity, displayPrice, displayQuantity } from '../utils/displaySelectors'
import BasicPanel from './BasicPanel'
import { DocumentListItem, IDocumentItem } from './DocumentListItem'
import { Field } from './Field'
import Label from './Label'
import TradeMovementParcels from './TradeMovementParcels'
import { HideableLabelledField } from './HideableLabelledField'
import { HistoryPopup } from '../../receivable-discounting-legacy/components/tooltips/HistoryPopup'
import { getHistoryEntry, getTradeHistoryEntry, getCargoHistoryEntry } from '../utils/historyChangesUtil'
import { ITradeSnapshot } from '../../receivable-discounting-legacy/store/types'
import { paymentTermsHasValues } from '../utils/paymentTermsHasValues'
import { tradeHasContractData, tradeHasDeliveryTermsData } from '../utils/selectors'

export enum PANELS {
  Basic = 'BASIC',
  Goods = 'GOODS',
  Contract = 'CONTRACT',
  Terms = 'TERMS',
  Documents = 'DOCUMENTS',
  UploadedDocuments = 'UPLOADED_DOCUMENTS',
  Cargo = 'CARGO'
}

export interface TradeViewDataProps {
  actives: { [key in PANELS]: boolean }
  company: string
  handleClick?: (e: SyntheticEvent, titleProps: any) => void
  trade?: ITradeEnriched
  uploadedDocuments?: Document[]
  tradeMovements?: ICargo[]
  hideDropdownIcon?: boolean
  role?: string
  history?: H.History
  tradeCargoHistory?: IHistory<ITradeSnapshot>
}

export const TradeData: React.FC<TradeViewDataProps> = ({
  actives,
  handleClick,
  trade,
  hideDropdownIcon,
  tradeCargoHistory
}) => {
  const buyerEtrmIdHistory = getHistoryEntry('buyerEtrmId', getTradeHistoryEntry(tradeCargoHistory))
  const toBuyerEtrmIdChanges = (data: any) =>
    data.map(change => ({
      updatedAt: displayDate(change.updatedAt),
      values: [truncate(change.value, 30)]
    }))

  const dealDateHistory = getHistoryEntry('dealDate', getTradeHistoryEntry(tradeCargoHistory))
  const toDealDateChanges = (data: any) =>
    data.map(change => ({
      updatedAt: displayDate(change.updatedAt),
      values: [displayDate(change.value)]
    }))

  return (
    <Fragment>
      <Accordion.Title
        active={actives[PANELS.Basic]}
        index={PANELS.Basic}
        onClick={handleClick}
        style={{ paddingTop: 0, pointerEvents: handleClick ? 'initial' : 'none' }}
      >
        <CapitalizedHeader block={true}>{!hideDropdownIcon && <Icon name="dropdown" />}Trade data</CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={actives[PANELS.Basic]}>
        <BasicPanel>
          <Field data-test-id="header-text">
            <Label>{findFieldFromTradeSchema('title', 'source')}</Label>
            {sentenceCase(trade.source)}
          </Field>
          <Field>
            <Label>{findFieldFromTradeSchema('title', 'buyer')}</Label>
            <TruncatedText text={trade.buyerName} />
          </Field>
          {!!trade.buyerEtrmId && (
            <Field>
              <Label>{findFieldFromTradeSchema('title', 'buyerEtrmId')}</Label>
              {buyerEtrmIdHistory ? (
                <HistoryPopup
                  fieldName={'quantity'}
                  currentFieldValue={trade.buyerEtrmId}
                  historyValues={toBuyerEtrmIdChanges(buyerEtrmIdHistory)}
                />
              ) : (
                <TruncatedText text={trade.buyerEtrmId} />
              )}
            </Field>
          )}
          <Field>
            <Label>{findFieldFromTradeSchema('title', 'seller')}</Label>
            <TruncatedText text={trade.sellerName} />
          </Field>
          {!!trade.sellerEtrmId && (
            <Field>
              <Label>{findFieldFromTradeSchema('title', 'sellerEtrmId')}</Label>
              <TruncatedText text={trade.sellerEtrmId} />
            </Field>
          )}
          <Field>
            <Label>{findFieldFromTradeSchema('title', 'creditRequirement')}</Label>
            {sentenceCase(trade.creditRequirement)}
          </Field>
          <Field>
            <Label>{findFieldFromTradeSchema('title', 'dealDate')}</Label>
            {dealDateHistory ? (
              <HistoryPopup
                fieldName={'dealDate'}
                currentFieldValue={displayDate(trade.dealDate)}
                historyValues={toDealDateChanges(dealDateHistory)}
              />
            ) : (
              displayDate(trade.dealDate)
            )}
          </Field>
        </BasicPanel>
      </Accordion.Content>
    </Fragment>
  )
}

export const CommodityAndPrice: React.SFC<TradeViewDataProps> = ({
  actives,
  handleClick,
  trade,
  hideDropdownIcon,
  tradeMovements,
  tradeCargoHistory
}) => {
  const [cargo] = tradeMovements
  const cargosHistory = getCargoHistoryEntry(tradeCargoHistory)
  const firstCargoHistory = cargosHistory && cargosHistory[0] ? cargosHistory[0].historyEntry : undefined

  const tradeHistory = getTradeHistoryEntry(tradeCargoHistory)
  const quantityHistory = getHistoryEntry('quantity', tradeHistory)
  const toQuantityChanges = (data: any) =>
    data.map(change => ({
      updatedAt: displayDate(change.updatedAt),
      values: [displayQuantity(change.value, trade.priceUnit)]
    }))

  const priceHistory = getHistoryEntry('price', tradeHistory)
  const toPriceChanges = (data: any) =>
    data.map(change => ({
      updatedAt: displayDate(change.updatedAt),
      values: [displayPrice(change.value, trade.currency, trade.priceUnit)]
    }))

  const priceLabel = () => (
    <Label>
      {trade.priceOption === PriceOption.Floating ? 'Indicative price' : findFieldFromTradeSchema('title', 'price')} per{' '}
      {findFieldFromTradeSchema('title', 'unit')}
    </Label>
  )

  return (
    <Fragment>
      <Accordion.Title
        active={actives[PANELS.Goods]}
        index={PANELS.Goods}
        onClick={handleClick}
        style={{ pointerEvents: handleClick ? 'initial' : 'none' }}
      >
        <CapitalizedHeader block={true}>
          {!hideDropdownIcon && <Icon name="dropdown" />}Commodity and price
        </CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={actives[PANELS.Goods]}>
        <BasicPanel>
          <Field>
            <Label>{findFieldFromTradeSchema('title', 'commodity')}</Label>
            {displayCommodity(trade.commodity)}
          </Field>
          {!!cargo && (
            <>
              <HideableLabelledField schema={CARGO_SCHEMA} field={cargo.grade} fieldName="grade" />
              <HideableLabelledField
                schema={CARGO_SCHEMA}
                field={cargo.quality}
                fieldName="quality"
                historyEntry={firstCargoHistory}
              />
              <HideableLabelledField
                schema={CARGO_SCHEMA}
                field={cargo.originOfGoods}
                fieldName="originOfGoods"
                historyEntry={firstCargoHistory}
              />
            </>
          )}
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.invoiceQuantity}
            fieldName="invoiceQuantity"
            formatter={sentenceCase}
          />
          <Field>
            {quantityHistory ? (
              <>
                <Label>{findFieldFromTradeSchema('title', 'quantity')}</Label>
                <HistoryPopup
                  fieldName={'quantity'}
                  currentFieldValue={displayQuantity(trade.quantity, trade.priceUnit)}
                  historyValues={toQuantityChanges(quantityHistory)}
                />
              </>
            ) : (
              <HideableLabelledField
                schema={TRADE_SCHEMA}
                field={trade.quantity}
                fieldName="quantity"
                formatter={val => displayQuantity(val, trade.priceUnit)}
              />
            )}
          </Field>
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.minTolerance}
            fieldName="minTolerance"
            formatter={displayPercentage}
          />
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.maxTolerance}
            fieldName="maxTolerance"
            formatter={displayPercentage}
          />
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.priceOption}
            fieldName="priceOption"
            formatter={sentenceCase}
          />
          <HideableLabelledField schema={TRADE_SCHEMA} field={trade.priceFormula} fieldName="priceFormula" />
          <Field>
            {priceHistory ? (
              <>
                {priceLabel()}
                <HistoryPopup
                  fieldName={'price'}
                  currentFieldValue={displayPrice(trade.price, trade.currency, trade.priceUnit)}
                  historyValues={toPriceChanges(priceHistory)}
                />
              </>
            ) : trade.price ? (
              <>
                {priceLabel()}
                {displayPrice(trade.price, trade.currency, trade.priceUnit)}
              </>
            ) : null}
          </Field>
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.paymentTermsOption}
            fieldName="paymentTermsOption"
            formatter={sentenceCase}
          />
          {!!paymentTermsHasValues(trade.paymentTerms) && (
            <Field>
              <Label>{findFieldFromTradeSchema('title', 'paymentTerms')}</Label>
              {sentenceCaseWithAcronyms(displayPaymentTerms(trade.paymentTerms), ['BL'])}
            </Field>
          )}
        </BasicPanel>
      </Accordion.Content>
    </Fragment>
  )
}

export const ContractData: React.SFC<TradeViewDataProps> = ({
  actives,
  handleClick,
  trade,
  hideDropdownIcon,
  tradeCargoHistory
}) =>
  !tradeHasContractData(trade) && !tradeCargoHistory ? null : (
    <Fragment>
      <Accordion.Title
        active={actives[PANELS.Contract]}
        index={PANELS.Contract}
        onClick={handleClick}
        style={{ pointerEvents: handleClick ? 'initial' : 'none' }}
      >
        <CapitalizedHeader block={true}>{!hideDropdownIcon && <Icon name="dropdown" />}Contract data</CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={actives[PANELS.Contract]}>
        <BasicPanel>
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.contractReference}
            fieldName="contractReference"
            historyEntry={getTradeHistoryEntry(tradeCargoHistory)}
          />
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.contractDate}
            fieldName="contractDate"
            formatter={displayDate}
            historyEntry={getTradeHistoryEntry(tradeCargoHistory)}
          />
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.generalTermsAndConditions}
            fieldName="generalTermsAndConditions"
            historyEntry={getTradeHistoryEntry(tradeCargoHistory)}
          />
          <HideableLabelledField
            schema={TRADE_SCHEMA}
            field={trade.law}
            fieldName="law"
            formatter={sentenceCase}
            historyEntry={getTradeHistoryEntry(tradeCargoHistory)}
          />
        </BasicPanel>
      </Accordion.Content>
    </Fragment>
  )

export const DeliveryTerms: React.SFC<TradeViewDataProps> = ({
  actives,
  handleClick,
  trade,
  hideDropdownIcon,
  tradeMovements,
  tradeCargoHistory
}) => {
  const [cargo] = tradeMovements
  const deliveryStartDateHistory = getHistoryEntry('deliveryPeriod.startDate', getTradeHistoryEntry(tradeCargoHistory))
  const deliveryEndDateHistory = getHistoryEntry('deliveryPeriod.endDate', getTradeHistoryEntry(tradeCargoHistory))
  const toDateChanges = (data: any) =>
    data.map(change => ({
      updatedAt: displayDate(change.updatedAt),
      values: [displayDate(change.value)]
    }))

  const tradeDeliveryPeriod = trade.deliveryPeriod || { startDate: null, endDate: null }

  if (!tradeHasDeliveryTermsData(trade, cargo)) {
    return null
  }

  return (
    <Fragment>
      <Accordion.Title
        active={actives[PANELS.Terms]}
        index={PANELS.Terms}
        onClick={handleClick}
        style={{ pointerEvents: handleClick ? 'initial' : 'none' }}
      >
        <CapitalizedHeader block={true}>
          {!hideDropdownIcon && <Icon name="dropdown" />}Delivery terms
        </CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={actives[PANELS.Terms]}>
        <BasicPanel>
          <Field>
            {deliveryStartDateHistory ? (
              <>
                <Label>{findFieldFromTradeSchema('title', 'deliveryPeriod.properties.startDate')}</Label>
                <HistoryPopup
                  fieldName={'deliveryPeriod.startDate'}
                  currentFieldValue={displayDate(tradeDeliveryPeriod.startDate)}
                  historyValues={toDateChanges(deliveryStartDateHistory)}
                />
              </>
            ) : (
              <HideableLabelledField
                schema={TRADE_SCHEMA}
                field={tradeDeliveryPeriod.startDate}
                fieldName={'deliveryPeriod.startDate'}
                formatter={displayDate}
              />
            )}
          </Field>
          <Field>
            {deliveryEndDateHistory ? (
              <>
                <Label>{findFieldFromTradeSchema('title', 'deliveryPeriod.properties.endDate')}</Label>
                <HistoryPopup
                  fieldName={'deliveryPeriod.endDate'}
                  currentFieldValue={displayDate(tradeDeliveryPeriod.endDate)}
                  historyValues={toDateChanges(deliveryEndDateHistory)}
                />
              </>
            ) : (
              <HideableLabelledField
                schema={TRADE_SCHEMA}
                field={tradeDeliveryPeriod.endDate}
                fieldName={'deliveryPeriod.endDate'}
                formatter={displayDate}
              />
            )}
          </Field>
          <HideableLabelledField schema={TRADE_SCHEMA} field={trade.deliveryTerms} fieldName="deliveryTerms" />
          <HideableLabelledField schema={TRADE_SCHEMA} field={trade.deliveryLocation} fieldName="deliveryLocation" />
          <HideableLabelledField schema={TRADE_SCHEMA} field={trade.laytime} fieldName="laytime" />
          <HideableLabelledField schema={TRADE_SCHEMA} field={trade.demurrageTerms} fieldName="demurrageTerms" />
          {!!cargo && (
            <>
              {trade.source === TradeSource.Vakt && (
                <HideableLabelledField schema={CARGO_SCHEMA} field={cargo.cargoId} fieldName="cargoId" />
              )}
              {!!cargo.parcels && (
                <TradeMovementParcels
                  parcels={cargo.parcels}
                  movementHistory={getCargoHistoryEntry(tradeCargoHistory)[0]}
                />
              )}
            </>
          )}
        </BasicPanel>
      </Accordion.Content>
    </Fragment>
  )
}

export const DocumentaryRequirements: React.SFC<TradeViewDataProps> = ({
  actives,
  handleClick,
  trade,
  hideDropdownIcon
}) =>
  trade && trade.requiredDocuments && trade.requiredDocuments.length !== 0 ? (
    <Fragment>
      <Accordion.Title
        active={actives[PANELS.Documents]}
        index={PANELS.Documents}
        onClick={handleClick}
        style={{ pointerEvents: handleClick ? 'initial' : 'none' }}
      >
        <CapitalizedHeader block={true}>
          {!hideDropdownIcon && <Icon name="dropdown" />}Documentary requirements
        </CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={actives[PANELS.Documents]}>
        <List style={{ padding: '10px' }}>
          {trade.requiredDocuments &&
            trade.requiredDocuments.map(doc => (
              <List.Item key={doc}>
                <Label>{sentenceCase(doc)}</Label>
              </List.Item>
            ))}
        </List>
      </Accordion.Content>
    </Fragment>
  ) : null

const renderDropdownOptions = (history: H.History, document: Document): DropdownOption[] => {
  const view: DropdownOption = {
    ...VIEW,
    onClick: () => {
      history.push(`/documents/${document.id}?productId=${Products.TradeFinance}`)
    }
  }

  const download: DropdownOption = {
    ...DOWNLOAD,
    onClick: () => {
      initiateDocumentsDownload([document])
    }
  }

  const dropdownOptions = { download, view }
  return Object.values(dropdownOptions)
}

const createDocumentItem = (document: Document): IDocumentItem => {
  return {
    id: document.id,
    name: document.name,
    typeName: document.type.name
  }
}

export const UploadedDocuments: React.FC<TradeViewDataProps> = ({
  actives,
  handleClick,
  hideDropdownIcon,
  uploadedDocuments,
  history
}) => {
  return (
    <Fragment>
      <Accordion.Title
        active={actives[PANELS.UploadedDocuments]}
        index={PANELS.UploadedDocuments}
        onClick={handleClick}
        style={{ pointerEvents: handleClick ? 'initial' : 'none' }}
      >
        <CapitalizedHeader block={true}>{!hideDropdownIcon && <Icon name="dropdown" />}Documents</CapitalizedHeader>
      </Accordion.Title>
      <Accordion.Content active={actives[PANELS.UploadedDocuments]}>
        <List divided={true} verticalAlign="middle">
          {uploadedDocuments.map(doc => (
            <DocumentListItem
              document={createDocumentItem(doc)}
              renderDropdownOptions={() => renderDropdownOptions(history, doc)}
            />
          ))}
        </List>
      </Accordion.Content>
    </Fragment>
  )
}

export const TradeViewData: React.SFC<TradeViewDataProps> = props => (
  <Accordion fluid={true}>
    <TradeData {...props} />
    <CommodityAndPrice {...props} />
    <DeliveryTerms {...props} />
    <ContractData {...props} />
    {props.trade &&
      props.trade.requiredDocuments &&
      props.trade.requiredDocuments.length !== 0 && <DocumentaryRequirements {...props} />}
    {props.uploadedDocuments && props.uploadedDocuments.length !== 0 && <UploadedDocuments {...props} />}
  </Accordion>
)
