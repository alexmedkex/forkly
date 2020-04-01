import * as React from 'react'
import { SemanticSIZES, Image, Header } from 'semantic-ui-react'
import styled from 'styled-components'
import Text from '../text'
import { darkBlueGrey } from '../../styles/colors'
import { stringOrUndefined } from '../../utils/types'

export interface LoadingTransitionProps {
  title?: stringOrUndefined
  className?: stringOrUndefined
  imageSize?: SemanticSIZES
  fontColor?: stringOrUndefined
  fontSize?: stringOrUndefined
  marginTop?: stringOrUndefined
  top?: stringOrUndefined
}

const LoadingWrapper = styled.div`
  margin-top: ${(props: LoadingTransitionProps) => props.marginTop || '200px'};
  top: ${(props: LoadingTransitionProps) => props.top};
  position: relative;
  background-color: rgba(255, 255, 255, 0.85);
`

export const LoadingTransition: React.FC<LoadingTransitionProps> = (props: LoadingTransitionProps) => (
  <LoadingWrapper
    data-test-id="loadingTransition"
    className={props.className}
    marginTop={props.marginTop}
    top={props.top}
  >
    <Image src="/images/bars.svg" size={props.imageSize || 'mini'} centered={true} />

    <Header className="centered">
      <Text color={props.fontColor || darkBlueGrey} fontSize={props.fontSize}>
        {props.title}
      </Text>
    </Header>
  </LoadingWrapper>
)
