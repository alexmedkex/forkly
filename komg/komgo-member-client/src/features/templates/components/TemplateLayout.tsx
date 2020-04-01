import React, { ReactElement, ReactNode } from 'react'
import Topbar, { ISidePanelButtonProps, InfoPosition, InfoAlign } from '../../../components/topbar/Topbar'
import styled from 'styled-components'
import { SPACES } from '@komgo/ui-components'
import { DefaultBackground } from '../../../components/styled-components'
import Helmet from 'react-helmet'

export interface TemplateLayoutProps {
  children?: ReactNode
  title: string
  actions?: ReactElement[]
  infos?: ReactElement[]
  infoAlign?: InfoAlign
  infoPosition?: InfoPosition
  withPadding: boolean
  sidePanelButtonProps?: ISidePanelButtonProps
}

export const TemplateLayout: React.FC<TemplateLayoutProps> = ({
  children,
  title,
  actions,
  infos,
  infoAlign,
  infoPosition,
  sidePanelButtonProps,
  withPadding
}) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <DefaultBackground>
        <Topbar
          title={title}
          actions={actions}
          infos={infos}
          infoAlign={infoAlign}
          infoPosition={infoPosition}
          sidePanelButtonProps={sidePanelButtonProps}
        />
        {withPadding ? <WithPadding>{children}</WithPadding> : <>{children}</>}
      </DefaultBackground>
    </>
  )
}

const WithPadding = styled.div`
  padding: ${SPACES.DEFAULT};
`
