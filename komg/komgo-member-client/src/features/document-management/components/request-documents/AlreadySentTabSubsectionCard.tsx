import * as React from 'react'

import { Request, DocumentType, Document, Category } from '../../store'
import { ListItemBorderLeft } from '../documents/document-library/ListItemBorderLeft'
import { AlreadySentCategoryTile } from './AlreadySentCategoryTile'
import { AlreadySentDoctypeTile } from './AlreadySentDoctypeTile'
import styled from 'styled-components'
import { sortCategories, sortDocumentTypes } from '../../../document-management/utils/sortingHelper'

interface IProps {
  counterpartyId: string
  alreadySentDocs: Map<string, Document[]>
  openViewDocument(previewDocumentId: string): void
}

const AlreadySentTabSubsectionCard: React.FC<IProps> = (props: IProps) => {
  const { alreadySentDocs } = props
  const [mapCategoriesSent, categories] = getAlreadySentCategories(alreadySentDocs)
  const sortedCats = sortCategories(categories)
  return (
    <StyledAlreadySentTabSubsection className="style-scroll">
      {sortedCats.map(cat => {
        const category: Category = categories.find(x => x.id === cat.id)
        const docTypes: Set<string> = mapCategoriesSent.get(cat.id)
        const countDocTypes = docTypes.size
        const sortedDocTypes = sortDocumentTypes(getDocumentType(docTypes, alreadySentDocs))
        return (
          <>
            <AlreadySentCategoryTile category={category} countDocumentTypes={countDocTypes} />
            {sortedDocTypes.map(doctype => {
              const documents = props.alreadySentDocs.get(doctype.id)
              return (
                <AlreadySentDoctypeTile
                  counterpartyId={props.counterpartyId}
                  key={category.id}
                  category={category}
                  docType={doctype}
                  active={true}
                  documents={documents}
                  openViewDocument={props.openViewDocument}
                />
              )
            })}
          </>
        )
      })}
    </StyledAlreadySentTabSubsection>
  )
}

const getDocumentType = (docTypes: Set<string>, alreadySentDocs: Map<string, Document[]>): DocumentType[] => {
  return Array.from(docTypes).map(idDoctype => {
    const documents = alreadySentDocs.get(idDoctype)
    return documents.length > 0 ? documents[0].type : undefined
  })
}

const StyledAlreadySentTabSubsection = styled.div`
  &&&&&& {
    height: 280px;
    overflow-y: auto;
  }
`

const getAlreadySentCategories = (alreadySentDocs: Map<string, Document[]>): [Map<string, Set<string>>, Category[]] => {
  const mapCategoriesSent = new Map<string, Set<string>>()
  const categories = new Array<Category>()
  alreadySentDocs.forEach((value, key) => {
    value.forEach(doc => {
      if (!categories.find(d => d.id === doc.category.id)) {
        categories.push(doc.category)
      }
      if (mapCategoriesSent.get(doc.category.id)) {
        mapCategoriesSent.set(doc.category.id, mapCategoriesSent.get(doc.category.id).add(doc.type.id))
      } else {
        mapCategoriesSent.set(doc.category.id, new Set([doc.type.id]))
      }
    })
  })
  return [mapCategoriesSent, categories]
}

export default AlreadySentTabSubsectionCard
