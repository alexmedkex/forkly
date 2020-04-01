import * as React from 'react'
import { DocumentLibraryPanel } from '../documents/document-library/OurDocumentsPanelItem'
import { CategoryWithColourTag } from '../documents/document-library/CategoryWithColourTag'
import { CategoryDocumentCount } from '../documents/document-library/OurDocumentsPanelItem'
import styled from 'styled-components'
import { Category } from '../../store'

interface IProps {
  category: Category
  countDocumentTypes: number
}

export const AlreadySentCategoryTile: React.FC<IProps> = (props: IProps) => {
  const { category, countDocumentTypes } = props
  return (
    <StyledCategoryTyle>
      <DocumentLibraryPanel key={`panel-content-${category.id}`}>
        <CategoryWithColourTag category={category} />
        <CategoryDocumentCount
          data-test-id={`category-tile-document-count-${category.id}`}
        >{`[ ${countDocumentTypes} ]`}</CategoryDocumentCount>
      </DocumentLibraryPanel>
    </StyledCategoryTyle>
  )
}

const StyledCategoryTyle = styled.div`
  padding-top: 10px;
`
