import * as React from 'react'
import styled from 'styled-components'
import { Portal, Button, Segment, Icon } from 'semantic-ui-react'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose } from 'redux'

import withBottomSheet from '../hoc/withBottomSheet'
import { BottomSheetHeader } from '../components'
import { StyledBottomSheetItem } from '../components/BottomSheetRow'
import { BottomSheetItem, BottomSheetStatus, BottomSheetItemType } from '../store/types'
import { DocumentBottomSheetItem } from '../components/BottomSheetRowFactory'
import { Products } from '../../document-management/constants/Products'
interface Props extends RouteComponentProps<any> {
  visible: boolean
  items: BottomSheetItem[]
  removeBottomSheetItem(id: string): void
  retryItem(item: BottomSheetItem): void
}

interface State {
  open: MaximumVisibleRows
}

type BottomSheetClickHandler = (item: BottomSheetItem) => void

export enum MaximumVisibleRows {
  CLOSED = 0,
  ONE_ROW = 1,
  OPEN = 5,
  MAXIMIZED = 99
}

export class BottomSheet extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      open: MaximumVisibleRows.CLOSED
    }
  }

  componentDidUpdate(newProps: Props) {
    const newItems = newProps.items.length !== this.props.items.length
    if (newItems && this.state.open === MaximumVisibleRows.CLOSED) {
      this.setState({ open: MaximumVisibleRows.ONE_ROW })
    }
  }

  render() {
    const { items, visible } = this.props
    return visible ? (
      <Portal open={visible} closeOnDocumentClick={false} closeOnEscape={false}>
        <StyledPortalContent className="bottom-sheet">
          <BottomSheetHeader
            items={items}
            minimizeOrMaximize={this.getNextOpenState() === MaximumVisibleRows.CLOSED}
            minimizeMaximizeHandler={this.toggleOpenState}
          />
          <Segment style={{ overflow: 'auto', maxHeight: 252, margin: 0, padding: 0, borderRadius: 0 }}>
            {items.map((item, index, items) => this.itemToBottomSheetRow(item, index + 1, items))}
          </Segment>
        </StyledPortalContent>
      </Portal>
    ) : null
  }

  toggleOpenState = () => {
    this.setState({ open: this.getNextOpenState() })
  }

  getNextOpenState = () => {
    switch (this.state.open) {
      case MaximumVisibleRows.CLOSED:
        return MaximumVisibleRows.OPEN
      case MaximumVisibleRows.ONE_ROW:
        return this.props.items.length > 1 ? MaximumVisibleRows.OPEN : MaximumVisibleRows.CLOSED
      case MaximumVisibleRows.OPEN:
      case MaximumVisibleRows.MAXIMIZED: {
        return MaximumVisibleRows.CLOSED
      }
    }
  }

  private loadMoreActivitiesButton(): React.ReactNode {
    return (
      <StyledBottomSheetItem
        key="bottomsheet-more-activities"
        data-test-id="bottomsheet-more-activities"
        style={{ justifyContent: 'center', paddingTop: '10px' }}
      >
        <StyledButton>
          <Button fluid={true} onClick={() => this.setMaximised()}>
            <b>More activities</b> <Icon name="chevron down" style={{ paddingLeft: '5px' }} />
          </Button>
        </StyledButton>
      </StyledBottomSheetItem>
    )
  }

  private setMaximised() {
    this.setState({ open: MaximumVisibleRows.MAXIMIZED })
  }

  private itemToBottomSheetRow = (item: BottomSheetItem, i: number, items): React.ReactNode => {
    if (items.length > MaximumVisibleRows.OPEN && this.state.open === MaximumVisibleRows.OPEN && i === 5) {
      return this.loadMoreActivitiesButton()
    }
    switch (item.itemType) {
      case BottomSheetItemType.REGISTER_KYC_DOCUMENT:
      default:
        const actions = this.onClickHandlersFromItemType(item)
        return DocumentBottomSheetItem({
          item,
          actions,
          rowNumber: i,
          openState: this.state.open,
          removeBottomSheetItem: this.props.removeBottomSheetItem
        })
    }
  }

  private onClickHandlersFromItemType = (item: BottomSheetItem) => {
    switch (item.itemType) {
      case BottomSheetItemType.REGISTER_KYC_DOCUMENT:
      default:
        return new Map<BottomSheetStatus, BottomSheetClickHandler>()
          .set(BottomSheetStatus.FAILED, this.props.retryItem)
          .set(BottomSheetStatus.REGISTERED, this.onNavigateToClick)
    }
  }

  private onNavigateToClick = (item: BottomSheetItem) => {
    switch (item.itemType) {
      case BottomSheetItemType.REGISTER_RD_DOCUMENT:
      case BottomSheetItemType.REGISTER_TRADE_DOCUMENT: {
        return this.props.history.push(`/documents/${item.id}?productId=${Products.TradeFinance}`)
      }
      case BottomSheetItemType.REGISTER_KYC_DOCUMENT: {
        if (this.isRequestDocumentsWorkflow()) {
          /* In case we are in the request-documents screen, we open a 
          new tab in the browser and point to that document in the document library */
          window.open(this.generateURLToSearchDocument(item.id))
        } else {
          /* In case of being in any other screen, we reuse the same tab to redirect to the document library */
          return this.props.history.push({ pathname: '/documents', state: { highlightDocumentId: item.id } })
        }
      }
      default: {
        return this.props.history.push({ pathname: item.navigationLink })
      }
    }
  }

  private generateURLToSearchDocument(documnetId: string): string {
    const baseUrl = window.location.href
    const docLibrary = '/request-documents'
    const redirectUrl = baseUrl.substring(0, baseUrl.indexOf(docLibrary))
    return `${redirectUrl}/documents?highlight=${documnetId}`
  }

  private isRequestDocumentsWorkflow(): boolean {
    return this.props.location.pathname.includes('/request-documents/')
  }
}

const StyledButton = styled.div`
  .ui.fluid.button {
    background: #dbe5ec;
    color: #5d768f;
    width: 424px;
    padding-bottom: -1px;
  }
`

const StyledPortalContent = styled.div`
  position: fixed;
  margin: -1px 2em;
  bottom: 0px;
  right: calc(38px - 2em);
  animation: 1.5s ease-in-out 0s infinite normal none running back-to-docs;
  z-index: 9999;
`

export default compose(withBottomSheet, withRouter)(BottomSheet)
