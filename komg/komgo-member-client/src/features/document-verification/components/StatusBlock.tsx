import * as React from 'react'
import styled from 'styled-components'
import AnimationBar from './AnimationBar'
import { typeMap, RegisteredStatus } from './icons'
import { dark, grey } from '../../../styles/colors'
import { IVerifiedFile } from '../store/types'
import { displayDate } from '../../../utils/date'

export interface IAnimationBarProps {
  fileData: IVerifiedFile
}

const StyledBlockParams = styled.div`
  width: 500px;
  height: 40px;
  position: absolute;
  right: 20px;
  top: 14px;
`

const StyledBlockVerifying = styled.div`
  width: 329px;
  height: 24px;
  position: absolute;
  left: 5px;
  top: 5px;
  color: ${dark};
  font-family: 'Lota Grotesque', Roboto, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  text-transform: uppercase;
  font-size: 12px;
  line-height: 24px;
  text-align: left;
`

const StyledBlockFileName = styled.div`
  width: 425px;
  height: 19px;
  position: absolute;
  left: 0;
  top: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Lota Grotesque', Roboto, 'Helvetica Neue', Arial, Helvetica, sans-serif;
`

const StyledBlockAccepter = styled.div`
  width: 425px;
  height: 19px;
  position: absolute;
  left: 0;
  bottom: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Lota Grotesque', Roboto, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 18px;
`

const StyledBlockResultFalse = styled.div`
  width: 400px;
  height: 19px;
  position: absolute;
  left: 0;
  bottom: 0;
  text-align: left;
  color: ${dark};
  font-family: 'Lota Grotesque', Roboto, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StyledBlockResultIcon = styled.div`
  width: 28px;
  height: 28px;
  background-size: cover;
  position: absolute;
  right: 2px;
  top: 8px;
`

const StyledProcessedBlock = styled.li`
  height: 70px;
  width: 610px;
  background-color: white;
  margin: 6px 2px 16px 2px;
  padding: 5px;
  display: flex;
  box-shadow: 0 0 1px 0 rgba(93, 118, 143, 0.89), 0 1px 5px 0 rgba(127, 149, 170, 0.5);
  position: relative;
  border-radius: 5px;

  &:last-child {
    margin-bottom: 10px;
  }
`

const getFileType = (props: { type?: string; iconColor?: string }): JSX.Element => {
  const Icon = typeMap[props.type] || typeMap.file
  const color = props.iconColor || grey
  return Icon({ fill: color, width: '56px', height: '66px' })
}

const StyledBlockIcon = styled.div`
  background-size: cover;
  position: absolute;
  left: 17px;
  top: 2px;
`

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

  let verifPhrase = ''
  if (status !== 'pending') {
    verifPhrase = `registered on ${displayDate(
      parseInt(registeredAt, 10),
      'YYYY/MM/DD [at] hh:mm A'
    )} by ${registeredBy}`
  }

  const basedBlock =
    status === 'pending' ? (
      <StyledBlockParams key={`verif-block-${key}`}>
        <StyledBlockVerifying key={`verification-${key}`}> VERIFYING YOUR DOCUMENT . . . </StyledBlockVerifying>
        <AnimationBar key={`animation-${key}`} elementNumber={key} />
      </StyledBlockParams>
    ) : (
      <StyledBlockParams key={`result-block-${key}`}>
        <StyledBlockFileName>{fileName}</StyledBlockFileName>
        {status === 'success' ? (
          <StyledBlockAccepter title={verifPhrase}>{verifPhrase}</StyledBlockAccepter>
        ) : (
          <StyledBlockResultFalse>is not registered on komgo or has been tampered with</StyledBlockResultFalse>
        )}
        <StyledBlockResultIcon>{iconSrc({ width: '28px', height: '28px' })}</StyledBlockResultIcon>
      </StyledBlockParams>
    )

  const fileBlock = (
    <StyledProcessedBlock key={`process-${key}`}>
      <StyledBlockIcon>{getFileType({ iconColor, type })}</StyledBlockIcon>
      {basedBlock}
    </StyledProcessedBlock>
  )

  return fileBlock
}

export default StatusBlock
