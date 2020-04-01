import * as React from 'react'
import { Accordion, Icon, List } from 'semantic-ui-react'
import styled from 'styled-components'
import { DocumentWithAlreadyShared } from './ConfirmShareStep'
import { PanelItemColorIcon } from '../document-library/PanelItemColorIcon'
import { SPACES, greyLight } from '@komgo/ui-components'
import { blueGrey } from '../../../../../styles/colors'
import { ListItemBorderLeft } from '../document-library/ListItemBorderLeft'

interface IProps {
  docsByType: {
    [type: string]: DocumentWithAlreadyShared[]
  }
}

const ShareDocumentsGroupByType: React.FC<IProps> = (props: IProps) => {
  const { docsByType } = props

  const title = (typeName: string) => {
    if (docsByType[typeName].length) {
      return (
        <Accordion.Title key={`panel-title-${typeName}`} name={typeName} style={{ padding: 0 }}>
          <StyledAccordionTitle>
            <PanelItemColorIcon categoryId={docsByType[typeName][0].category.id} />
            <TypeName data-test-id={`type-name-${typeName}`}>{typeName}</TypeName>
            <NumberOfDocuments data-test-id={`number-of-documents-${typeName}`}>
              [{docsByType[typeName].length}]
            </NumberOfDocuments>
            <StyledIcon data-test-id={`row-chevron-${typeName}`} name="chevron right" size="large" />
          </StyledAccordionTitle>
        </Accordion.Title>
      )
    }
    return null
  }

  const docItem = (document: DocumentWithAlreadyShared) => {
    return (
      <DocumentItem>
        <ListItemBorderLeft categoryId={document.category.id} />
        <b data-test-id={`document-name-${document.name}`}>{document.name}</b>
      </DocumentItem>
    )
  }

  const content = (typeName: string) => {
    return (
      <Accordion.Content key={`panel-content-${typeName}`}>
        <List key={`list-for-${typeName}`} items={docsByType[typeName].map(docItem)} />
      </Accordion.Content>
    )
  }

  const panels = Object.keys(docsByType).map(typeName => ({
    key: `panel-${typeName}`,
    name: typeName,
    title: title(typeName),
    content: { content: content(typeName) }
  }))

  const defaultOpenIndex = panels.map((_, i) => i)

  return (
    <Wrapper className="style-scroll">
      <Accordion panels={panels} exclusive={false} defaultActiveIndex={defaultOpenIndex} />
    </Wrapper>
  )
}

const StyledAccordionTitle = styled.div`
  display: flex;
  align-items: center;
  line-height: 21px;
  padding: ${SPACES.EXTRA_SMALL} 0;
  position: relative;
`

const TypeName = styled.div`
  margin: 0 ${SPACES.SMALL};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`

const NumberOfDocuments = styled.div`
  font-size: 11px;
  color: ${blueGrey};
`

const Wrapper = styled.div`
  max-height: 310px;
  overflow-y: auto;
  .accordion {
    .title {
      border-bottom: 1px solid ${greyLight};
      &.active {
        border-bottom: unset;
        .icon {
          transform: rotate(90deg);
        }
      }
    }
  }
`

const StyledIcon = styled(Icon)`
  position: absolute;
  right: ${SPACES.DEFAULT};
`

const DocumentItem = styled.div`
  height: 42px;
  display: grid;
  grid-gap: ${SPACES.SMALL};
  grid-template-columns: 5px auto;
  margin-bottom: ${SPACES.EXTRA_SMALL};
  align-items: center;
  border: 1px solid ${greyLight};
`

export default ShareDocumentsGroupByType
