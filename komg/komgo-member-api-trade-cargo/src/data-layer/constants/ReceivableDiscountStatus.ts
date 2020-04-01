export enum ReceivableDiscountStatus {
  // Initial status for trades with "Open Account" credit terms
  ToBeDiscounted = 'TO_BE_DISCOUNTED',
  // Trader has submitted a discounting request to bank(s)
  Requested = 'REQUESTED',
  // Bank has declined the discounting request
  RequestDeclined = 'REQUEST_DECLINED',
  // Bank has accepted the discounting request and submitted a quote for the Trader to review
  QuoteSubmitted = 'QUOTE_SUBMITTED',
  // Trader has declined the quote
  QuoteDeclined = 'QUOTE_DECLINED',
  // Trader has accepted the banks quote
  QuoteAccepted = 'QUOTE_ACCEPTED',
  // Bank has submitted the confirmation of discounting
  Discounted = 'DISCOUNTED',
  // Bank has submitted confirmation of repayment by the Buyer
  RePayed = 'RE_PAYED'
}
