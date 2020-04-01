import * as React from 'react'
import styled from 'styled-components'
import { grey } from '../../../styles/colors'
import { displayDate } from '../../../utils/date'
import { IVerifiedFile } from '../store/types'
import AnimationBar from './AnimationBar'
import { typeMap, RegisteredStatus } from './icons'

export interface IAnimationBarProps {
  fileData: IVerifiedFile
}

const StyledBlockParams = styled.div`
  flex-grow: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
`

const StyledRow = styled.div`
  display: flex;
  align-items: center;
`

const StyledBlockVerifying = styled.div`
  font-size: 12px;
`

const StyledBlockAccepter = styled.div`
  font-size: 16px;
`

const StyledBlockResultFalse = styled.div`
  font-size: 16px;
`

const StyledProcessedBlock = styled.li`
  background-color: white;
  margin: 6px 2px 10px 2px;
  padding: 5px;
  display: flex;
  align-items: center;
  box-shadow: 0 0 2px 0 rgba(93, 118, 143, 0.89), 0 1px 7px 0 rgba(127, 149, 170, 0.5);
  position: relative;
  border-radius: 5px;
  font-family: sans-serif;

  &:last-child {
    margin-bottom: 10px;
  }
`

const getFileType = (props: { type?: string; iconColor?: string }): JSX.Element => {
  const Icon = typeMap[props.type] || typeMap.file
  const color = props.iconColor || grey
  return Icon({ fill: color, width: '30px', height: '30px', 'margin-top': '5px' })
}

const StatusBlock = (props: IAnimationBarProps) => {
  const { fileData } = props
  if (!fileData) {
    return
  }

  const { status, key, registeredAt, registeredBy, fileName, type, iconColor } = fileData
  let iconSrc = RegisteredStatus.success

  if (status !== 'pending') {
    iconSrc = status === 'success' ? RegisteredStatus.success : RegisteredStatus.error
  }

  let verifPhrase
  if (status !== 'pending') {
    verifPhrase = (
      <>
        <div>
          registered on <strong>{displayDate(parseInt(registeredAt, 10), 'DD MMM YYYY')}</strong>
        </div>
        <div>
          by <strong>{registeredBy}</strong>
        </div>
      </>
    )
  }

  const basedBlock =
    status === 'pending' ? (
      <div key={`verif-block-${key}`}>
        <StyledBlockVerifying key={`verification-${key}`}> VERIFYING YOUR DOCUMENT . . . </StyledBlockVerifying>
        <AnimationBar key={`animation-${key}`} elementNumber={key} />
      </div>
    ) : (
      <>
        <StyledBlockParams key={`result-block-${key}`}>
          <StyledRow>
            <div>{getFileType({ iconColor, type })}</div>
            <div>{fileName}</div>
          </StyledRow>
          <StyledRow>
            <div>{iconSrc({ width: '30px', height: '20px' })}</div>
            {status === 'success' ? (
              <StyledBlockAccepter title={verifPhrase}>{verifPhrase}</StyledBlockAccepter>
            ) : (
              <StyledBlockResultFalse>is not registered on komgo or has been tampered with</StyledBlockResultFalse>
            )}
          </StyledRow>
        </StyledBlockParams>
      </>
    )

  return <StyledProcessedBlock key={`process-${key}`}>{basedBlock}</StyledProcessedBlock>
}

export default StatusBlock
