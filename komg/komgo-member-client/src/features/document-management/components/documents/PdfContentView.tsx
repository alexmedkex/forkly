import * as React from 'react'
import { pdfjs, Document, Page } from 'react-pdf'
import { Pagination, PaginationProps, Segment, Dimmer, Loader } from 'semantic-ui-react'
import styled from 'styled-components'

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`

interface Props {
  documentContent: string
}

interface State {
  currentPage: number
  totalPages: number
  pdfData: Uint8Array
  pdfLoaded: boolean
  renderFull: boolean
}

interface PdfLoadedEvent {
  numPages: number
}

const StyledDocument = styled(Document)`
  display: flex;
  flex-direction: column;
  align-items: center;
`

class PdfContentView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      currentPage: 1,
      totalPages: 1,
      pdfData: this.convertDataURIToBinary(props.documentContent),
      pdfLoaded: false,
      renderFull: false
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return this.state.currentPage !== nextState.currentPage || this.state.totalPages !== nextState.totalPages
  }

  render() {
    return (
      <Segment>
        <StyledDocument
          file={{
            data: this.state.pdfData
          }}
          onLoadSuccess={this.onDocumentLoadSuccess}
          loader={this.renderLoader()}
          loading="Loading file"
        >
          {this.renderDocument()}
        </StyledDocument>
      </Segment>
    )
  }

  onDocumentLoadSuccess = (pdfLoaded: PdfLoadedEvent) => {
    if (!this.state.pdfLoaded) {
      this.setState({
        currentPage: 1,
        totalPages: pdfLoaded.numPages,
        pdfLoaded: true,
        renderFull: pdfLoaded.numPages < 100
      })
    }
  }

  private renderDocument() {
    return this.state.renderFull ? this.renderFullDocument() : this.renderSinglePage()
  }

  private renderFullDocument = () => {
    return Array.from(new Array(this.state.totalPages), (page, index) => (
      <Page key={`page_${index + 1}`} pageNumber={index + 1} className="pdf-viewer" renderMode="canvas" loading="" />
    ))
  }

  private renderSinglePage = () => {
    return (
      <>
        <Pagination
          activePage={this.state.currentPage}
          onPageChange={this.handlePaginationChange}
          totalPages={this.state.totalPages}
          style={{ marginBottom: '6px' }}
        />
        <Page pageNumber={this.state.currentPage} className="pdf-viewer" renderMode="canvas" loading="" />
      </>
    )
  }

  private renderLoader() {
    return (
      <Dimmer active={true}>
        <Loader indeterminate={true} />
      </Dimmer>
    )
  }

  private handlePaginationChange = (e: React.MouseEvent<HTMLAnchorElement>, data: PaginationProps) => {
    if (data.activePage) {
      const pageNumber = this.getPageNumber(data.activePage)
      this.setState({ currentPage: pageNumber })
    }
  }

  private getPageNumber(page: number | string): number {
    if (typeof page === 'number') {
      return page
    }

    return parseInt(page, 10)
  }

  private convertDataURIToBinary(base64: string): Uint8Array {
    const raw = atob(base64)
    const rawLength = raw.length
    const array = new Uint8Array(new ArrayBuffer(rawLength))

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i)
    }
    return array
  }
}

export default PdfContentView
