/*
Trade To Be Financed
L/C Application Submitted
L/C Application Refused
L/C Issued
L/C Received
L/C Advised
L/C Amendment Requested
L/C Amendment Under Negotation
L/C Amendment Accepted

// TODO LS implement status for LOI
LOI Requested
LOI Countersignature Requested
LOI Signed

// TODO LS implement status for Presentation
Document Presentation
Presentation Amendement Requested
Presentation Under Negotation
Presentation Amendment Accepted
Presentation Under Negotiation
Payment Date Confirmed

L/C Paid
L/C Expired*/

export const LOC_STATUS = {
  TO_BE_FINANCED: 'TO_BE_FINANCED',
  SUBMITTED: 'SUBMITTED',
  REFUSED: 'REFUSED',
  ISSUED: 'ISSUED',
  RECEIVED: 'RECEIVED',
  ADVISED: 'ADVISED',
  AMENDMENT_REQUESTED: 'AMENDMENT_REQUESTED',
  AMENDMENT_UNDER_NEGOTIATION: 'AMENDMENT_UNDER_NEGOTIATION',
  AMENDMENT_ACCEPTED: 'AMENDMENT_ACCEPTED',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED'
}
