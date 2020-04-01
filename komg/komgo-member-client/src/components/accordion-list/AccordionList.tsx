import * as React from 'react'
import styled from 'styled-components'
import {
  Accordion,
  AccordionPanelProps,
  List,
  ListProps,
  AccordionTitleProps,
  ListItemProps,
  AccordionAccordionProps,
  Divider
} from 'semantic-ui-react'

import { HasName, HasId } from '../../features/document-management/store'

export interface HasIdAndName extends HasId, HasName {}

type Identifier = string | number | symbol

export type PanelRenderer<P extends HasIdAndName> = (el: P) => AccordionPanelProps | null

export type PanelTitleRenderer<P extends HasIdAndName> = (el: P) => AccordionTitleProps | null

export type ListRenderer<P extends HasIdAndName> = (el: P) => ListProps | null

export type ListItemRenderer<LI extends HasIdAndName> = (el: LI) => ListItemProps
export interface Props<P extends HasIdAndName, LI extends HasIdAndName> extends AccordionAccordionProps {
  groupedPanelItems: Map<Identifier, P[]>
  groupedListItems: Map<Identifier, LI[]>
  panelRenderer: PanelRenderer<P>
  // panelTitleRenderer: PanelTitleRenderer<P>
  // listRenderer: ListRenderer<LI>
  // listItemRenderer: ListItemRenderer<LI>
  className?: string
}

export const AccordionList = <P extends HasIdAndName, LI extends HasIdAndName>(props: Props<P, LI>) => {
  return (
    <Accordion
      data-test-id={'accordionlist-accordion'}
      className={props.className || ''}
      exclusive={false}
      fluid={true}
      styled={false}
      panels={Array.from(props.groupedListItems.entries()).map(([key, values]: [keyof P, LI[]]) => {
        const [panelItem] = props.groupedPanelItems.get(key)
        return {
          key: `panel-${panelItem.id}`,
          name: panelItem.name,
          title: Title(panelItem, props.panelTitleRenderer),
          content: PanelContent(panelItem, key, values, props.listItemRenderer)
        }
      })}
    />
  )
}

export const Title = <P extends HasIdAndName>(panelItem: P, panelTitleRenderer: PanelTitleRenderer<P>) => {
  return (
    <Accordion.Title key={`panel-title-${panelItem.id}`} name={panelItem.name}>
      {panelTitleRenderer(panelItem)}
    </Accordion.Title>
  )
}

export const PanelContent = <P extends HasIdAndName, LI extends HasIdAndName>(
  panelItem: P,
  key: keyof P,
  values: LI[],
  listItemRenderer: ListItemRenderer<LI>
) => {
  return (
    <Accordion.Content key={`panel-content-${key}`}>
      <UnpaddedList key={`list-for-${panelItem.id}`} items={values.map(listItemRenderer)} />
      <Divider />
    </Accordion.Content>
  )
}

const UnpaddedList = styled(List)`
  && {
    padding: 0;
  }
`
