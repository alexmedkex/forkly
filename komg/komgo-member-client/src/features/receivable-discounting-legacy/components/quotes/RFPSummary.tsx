import React from 'react'
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { cloudyBlue } from '../../../../styles/colors'
import { RFPSummaryStatusIndicator } from '../status-indicators'
import QuoteTerm from './QuoteTerm'
import ViewCommentModal from './ViewCommentModal'
import { dark } from '@komgo/ui-components'

export interface IQuoteTerm {
  header: string
  values: string[]
}

export interface IRFPSummaryProps {
  id: string
  status: string
  company: string
  canAcceptOrDecline: boolean
  showTerms: boolean
  date: string
  comment?: string
  quoteTerms?: IQuoteTerm[][]
  rdId: string
  selectBankViewQuote(id: string, rdId: string): void
}

interface IRFPSummaryState {
  viewCommentsModalOpen: boolean
}

class RFPSummary extends React.Component<IRFPSummaryProps, IRFPSummaryState> {
  state = {
    viewCommentsModalOpen: false
  }

  handleViewCommentsModalClosed() {
    this.setState({ viewCommentsModalOpen: false })
  }

  handleViewCommentsClicked() {
    this.setState({ viewCommentsModalOpen: true })
  }

  render() {
    const {
      company,
      status,
      comment,
      showTerms,
      quoteTerms,
      date,
      id,
      selectBankViewQuote,
      canAcceptOrDecline
    } = this.props

    const { viewCommentsModalOpen } = this.state

    const viewComment = comment ? (
      <>
        <QuoteTerm
          data-test-id="view-comment"
          header={'comment'}
          values={[]}
          prompt={'View comment'}
          handlePromptClicked={() => this.handleViewCommentsClicked()}
        />
        <ViewCommentModal
          data-test-id="view-comment-modal"
          open={viewCommentsModalOpen}
          commentText={comment}
          bankName={company}
          date={date}
          handleClosed={() => this.handleViewCommentsModalClosed()}
        />
      </>
    ) : null

    const acceptDecline = canAcceptOrDecline ? (
      <QuoteActions>
        {/* <Button data-test-id="decline" onClick={() => null}>
          Decline quote
        </Button> */}

        <Button
          primary={true}
          data-test-id="accept-quote"
          onClick={() => selectBankViewQuote(this.props.id, this.props.rdId)}
        >
          Select bank
        </Button>
      </QuoteActions>
    ) : null

    const showQuoteTerms = quoteTerms && quoteTerms.length !== 0 && showTerms
    const commentBesideBankName = comment && !showQuoteTerms

    const top = (
      <Top>
        <BankHeader maxWidth={canAcceptOrDecline ? 'auto' : '33%'}>
          <CompanyName>{company}</CompanyName>
          <RFPSummaryStatusIndicator status={status} />
        </BankHeader>
        {commentBesideBankName ? viewComment : null}
        {acceptDecline}
      </Top>
    )

    const bottom = showQuoteTerms ? (
      <Bottom data-test-id="quote-terms">
        {quoteTerms.map((terms: IQuoteTerm[], index: number) => (
          <Row key={`${id}-row-${index}`}>
            {terms.map(term => <QuoteTerm header={term.header} values={term.values} key={`${id}-${term.header}`} />)}
            {index === quoteTerms.length - 1 ? viewComment : null}
          </Row>
        ))}
      </Bottom>
    ) : null

    return (
      <SummaryCardStyle>
        {top}
        {bottom}
      </SummaryCardStyle>
    )
  }
}

const cardPadding = '20px'
const Top = styled.section`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  min-height: 56px;

  > * {
    margin: auto 0px;
  }
`

interface IBankHeaderStyleProps {
  maxWidth: string
}

const BankHeader = styled.div`
  height: 100%;
  flex-grow: 1;
  max-width: ${(p: IBankHeaderStyleProps) => p.maxWidth};
  min-width: 300px;
`

const QuoteActions = styled.div`
  padding: 12px 0px;
`

const Bottom = styled.section`
  border-top: 1px solid ${cloudyBlue};
  display: flex;
  flex-direction: column;
  padding: 0px 0px ${cardPadding} 0px;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: left;

  > * {
    padding: 12px 0px 0px 0px;
    min-width: 200px;
  }
`

const SummaryCardStyle = styled.article`
  padding: 0px ${cardPadding};
  margin: 10px 0px;
  border-radius: 1px;
  display: block;
  box-shadow: 0 1px 4px 0 rgba(192, 207, 222, 0.5);
  border: 1px solid ${cloudyBlue};
  background-color: white;
`

const CompanyName = styled.span`
  font-size: 19px;
  color: ${dark};
  display: inline-block;
  vertical-align: bottom;
  font-family: LotaGrotesque;
  margin-right: 30px;
`

export default RFPSummary
