import * as React from 'react'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'

import { IProductExtended } from '../products'
import { paleGray, grey, yellow, purpleBg } from '../../../styles/colors'
import bg from './license-bg.svg'

const StyledRoot = styled.div`
  height: 100%;
`

interface IStyledHeader {
  color: string
}
const StyledHeader =
  styled.div <
  IStyledHeader >
  `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  width: 100%; 
  height: 176px;
  padding: 11px 8px;
  background: ${(props: IStyledHeader) => props.color} url(${bg}) center center no-repeat;
  background-size: cover;
  & span {
    line-height: 20px;
    font-size: 24px;
    color: ${yellow};
    padding: 3px;
    background-color: ${purpleBg};
  }
`
const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: space-between;
  height: calc(100% - 176px);
`
const StyledBodyHead = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 34px;
  padding: 0 15px;
  font-size: 11px;
  line-height: 0.8;
  text-transform: uppercase;
  background-color: ${paleGray};
`
const StyledBodyContent = styled.div`
  flex: 1;
`
const StyledText = styled.span`
  padding: 15px;
`
const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 145px;
`
const StyledBodyFooter = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  border-top: 1px solid ${grey};
  padding: 0 15px;
`

export interface Props {
  product: IProductExtended
  color: string
  sendRequest: (product: IProductExtended) => void
  licenseEnabled: boolean
}

export const ProductLicense: React.SFC<Props> = ({ product, sendRequest, color, licenseEnabled }: Props) => (
  <StyledRoot>
    <StyledHeader color={color}>
      {product.productFullName.split(' ').map((word: string, i: number) => <span key={i}>{word}</span>)}
    </StyledHeader>
    <StyledBody>
      <StyledBodyHead>{licenseEnabled ? 'Licensed' : 'No license'}</StyledBodyHead>
      <StyledBodyContent>
        <StyledWrapper>
          <StyledText>{product.productDescription}</StyledText>
          {!licenseEnabled && (
            <StyledBodyFooter>
              <Button primary={true} content={'Request more info'} onClick={() => sendRequest(product)} />
            </StyledBodyFooter>
          )}
        </StyledWrapper>
      </StyledBodyContent>
    </StyledBody>
  </StyledRoot>
)
