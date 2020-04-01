import * as React from 'react'
import { Component, SyntheticEvent } from 'react'
import { IParcel, PARCEL_SCHEMA, IHistoryEntry, ICargo, IHistory } from '@komgo/types'
import { Accordion, Icon } from 'semantic-ui-react'
import styled from 'styled-components'
import { sentenceCase } from '../../../utils/casings'
import BasicPanel from './BasicPanel'
import { HideableLabelledField } from './HideableLabelledField'
import { displayDate } from '../../../utils/date'

const Title = styled.span`
  font-weight: bold;
  font-size: 18px;
  margin: -25px;
  padding: 0 0 0 25px;
  display: inline-block;
  width: 100%;
  line-height: 2;
`

export interface TradeMovementParcelsProps {
  parcels: IParcel[]
  movementHistory?: IHistory<ICargo>
}

interface TradeMovementParcelsState {
  actives: any
}

const displayParcelField = (
  field: any,
  fieldName: string,
  formatter = undefined,
  parcelHistory?: IHistoryEntry<IParcel>
) => (
  <HideableLabelledField
    schema={PARCEL_SCHEMA}
    field={field}
    fieldName={fieldName}
    formatter={formatter}
    historyEntry={parcelHistory}
  />
)

export default class TradeMovementParcels extends Component<TradeMovementParcelsProps, TradeMovementParcelsState> {
  constructor(props: any) {
    super(props)
    this.state = {
      actives: this.props.parcels.reduce((memo, parcel) => {
        return {
          ...memo,
          [parcel._id!]: true
        }
      }, {})
    }
  }

  handleClick = (e: SyntheticEvent, titleProps: any) => {
    const { index } = titleProps
    const { actives } = this.state
    this.setState({
      actives: {
        ...actives,
        [index]: !actives[index]
      }
    })
  }

  render() {
    const { actives } = this.state
    return (
      <div>
        <Accordion fluid={true}>
          {this.props.parcels &&
            this.props.parcels.map((parcel: IParcel, index: number) => {
              let parcelHistoryEntry: IHistoryEntry<IParcel>
              if (this.props.movementHistory) {
                const parcels = this.props.movementHistory.historyEntry.parcels as Array<IHistory<IParcel>>
                if (parcels) {
                  const entry = parcels.find(movement => {
                    return movement.id === parcel._id
                  })
                  parcelHistoryEntry = entry ? entry.historyEntry : undefined
                }
              }

              return (
                <div
                  style={{ border: '1px solid rgba(34,36,38,.15)', padding: '20px', marginBottom: '5px' }}
                  key={`${parcel._id} ${index}`}
                >
                  <Accordion.Title active={actives[parcel._id!]} index={parcel._id} onClick={this.handleClick}>
                    <Icon name="dropdown" />
                    <Title> Parcel #{index + 1} </Title>
                  </Accordion.Title>
                  <Accordion.Content active={actives[parcel._id!]}>
                    <BasicPanel>
                      {displayParcelField(parcel.id, 'id')}
                      {displayParcelField(
                        parcel.laycanPeriod.startDate,
                        'laycanPeriod.startDate',
                        displayDate,
                        parcelHistoryEntry
                      )}
                      {displayParcelField(
                        parcel.laycanPeriod.endDate,
                        'laycanPeriod.endDate',
                        displayDate,
                        parcelHistoryEntry
                      )}
                      {displayParcelField(parcel.modeOfTransport, 'modeOfTransport', sentenceCase, parcelHistoryEntry)}
                      {displayParcelField(parcel.vesselIMO, 'vesselIMO', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.vesselName, 'vesselName', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.pipelineName, 'pipelineName', undefined, parcelHistoryEntry)}
                      {displayParcelField(
                        parcel.tankFarmOperatorName,
                        'tankFarmOperatorName',
                        undefined,
                        parcelHistoryEntry
                      )}
                      {displayParcelField(
                        parcel.tankFarmOperatorName,
                        'tankFarmOperatorName',
                        undefined,
                        parcelHistoryEntry
                      )}
                      {displayParcelField(
                        parcel.warehouseOperatorName,
                        'warehouseOperatorName',
                        undefined,
                        parcelHistoryEntry
                      )}
                      {displayParcelField(parcel.deemedBLDate, 'deemedBLDate', displayDate, parcelHistoryEntry)}
                      {displayParcelField(parcel.loadingPlace, 'loadingPlace', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.loadingPort, 'loadingPort', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.destinationPlace, 'destinationPlace', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.dischargeArea, 'dischargeArea', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.inspector, 'inspector', undefined, parcelHistoryEntry)}
                      {displayParcelField(parcel.quantity, 'quantity', undefined, parcelHistoryEntry)}
                    </BasicPanel>
                  </Accordion.Content>
                </div>
              )
            })}
        </Accordion>
      </div>
    )
  }
}
