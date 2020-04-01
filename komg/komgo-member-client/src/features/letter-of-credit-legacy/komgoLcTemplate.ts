import { LetterOfCreditValues, BENEFICIARY_BANK_ROLE_OPTIONS } from './constants'
import { ITradeEnriched } from '../trades/store/types'
import { IMember } from '../members/store/types'
import { participantDetailsFromMember, findCounterpartyByStatic } from './utils/selectors'
import { sentenceCaseWithAcronyms, sentenceCase } from '../../utils/casings'
import { Counterparty } from '../counterparties/store/types'

// a stop-gap for now, TODO BAs - waiting on up to date template
export const komgoTemplate = `Issuing Bank:	{Issuing bank name}, {Issuing bank address }, {Issuing bank country}

Advise To:	

{^direct}PLEASE ADVISE THE LC THROUGH: {Beneficiary bank name}, {Beneficiary bank address}, {Beneficiary bank country}{/direct}
{#direct}PLEASE ADVISE THE LC DIRECTLY TO BENEFICIARY{/direct}

Form of Documentary Credit: 40A:	 {Type of LC}

Applicable Rules: 40E:	{Applicable rules}

Date and Place of Expiry: 31D:  {Expiry date}{Expiry place} counters 

Applicant: 50:  {Applicant name}, {Applicant address}, {Applicant country}

Beneficiary: 59:  {Beneficiary name}, {Beneficiary address}, {Beneficiary country}

Currency Code and Amount: 32B:  {Currency}{Amount}

Percentage Credit Amount Tolerance: 39A:  {Cargo minimum tolerance}/{Cargo maximum tolerance} 

Available With: 41A:  AVAILABLE WITH {Issuing bank name} BY {Available by}

Deferred Payment Details: 42P:	

{Cargo payment terms} OR DEEMED B/L DATE OR COMPLETION OF PUMPOVER DATE FOR FIP DELIVERY 
(SUCH DATE TO COUNT AS DAY ZERO)

Partial Shipments: 43P:	

{#Partial shipment allowed}ALLOWED {/Partial shipment allowed}{^Partial shipment allowed}NOT ALLOWED {/Partial shipment allowed}

Transhipment: 43T:	

{#Transhipment allowed}ALLOWED {/Transhipment allowed}{^Transhipment allowed}NOT ALLOWED {/Transhipment allowed}

Description of Goods and/or Services: 45A:

{Cargo quantity} NET US {Cargo price per unit} 
{#Cargo minimum tolerance == Cargo maximum tolerance} PLUS OR MINUS {Cargo minimum tolerance} PCT{/} {#Cargo minimum tolerance != Cargo maximum tolerance} PLUS {Cargo maximum tolerance} or MINUS {Cargo minimum tolerance}){/}
OF {Grade} CRUDE OIL
TO BE 
{#Grade === 'brent'}LOADED FOB SULLOM VOE UK{/}
{#Grade === 'fortis'}LOADED FOB HOUND POINT UK OR DELIVERED FIP KINNEIL UK{/}
{#Grade == 'oseberg'}LOADED FOB STURE NORWAY{/}
{#Grade == 'ekofisk'}LOADED FOB TEESPORT UK OR DELIVERED FIP TEESIDE UK{/}
{#Grade == 'troll'}LOADED FOB MONGSTAD NORWAY{/}
DURING THE PERIOD {Cargo delivery period start date} – {Cargo delivery period end date} (BOTH DATES INCLUSIVE)

PRICE: THE UNIT PRICE IN US DOLLARS PER NET US BARREL
IS USD {#Grade === 'brent' || Grade === 'oseberg' || Grade === 'troll'}FOB{/}
{#Grade != 'brent' && Grade != 'oseberg' && Grade != 'troll'}FOB or FIP  {/}PER NET U.S BARREL FIXED AND FLAT

{#Grade == 'forties'}PRICE FOR THE PRODUCT SHALL BE ADJUSTED BY A DE-ESCALATION FACTOR BASED ON THE SULPHUR CONTENT EXPRESSED AS A PERCENTAGE OF THE FORTIES CRUDE OIL CARGO BY MASS THE DE-ESCALATOR RATE (USD/BBL) FOR THIS AGREEMENT SHALL BE THE EFFECTIVE RATE APPLIED BY PLATTS FOR THE FORTIES CARGOES IN THE PLATTS NORTH SEA ASSESSMENT AT THE TIME OF LOADING OR DELIVERY.

THE PRICE IN USD PER NET US BARREL SHALL DE-ESCALATE BY THE EFFECTIVE RATE FOR EVERYFULL INCREMENT OF 0.001PERCENT (ZERO POINT ZERO ZERO ONE PERCENT) IN SULPHUR CONTENT ABOVE A BASE OF 0.600 PERCENT SULPHUR.

FOR THE AVOIDANCE OF DOUBT ANY ADJUSTMENTS TO THE FORTIES DE-ESCALATOR IN PLATTS CRUDE OIL MARKETSCAN SHALL BE APPLICABLE. THE FINAL PRICE SHALL BE CALCULATED TO THREE (3) DECIMAL PLACES AND THE FOLLOWING ARITHMETIC RULES SHALL BE APPLIED TO DO THIS:
1) IF THE FOURTH DECIMAL PLACE IS FIVE (5) OR GREATER THAN FIVE (5) THEN THE THIRD DECIMAL PLACE SHALL BE ROUNDED UP TO THE NEXT DIGIT.

2) IF THE FOURTH DECIMAL PLACE IS LESS THAN FIVE (5), THE THIRD DECIMAL PLACE SHALL REMAIN UNCHANGED.{/}
Documents Required: 46A:	{#Grade != 'brent' && Grade != 'oseberg' && Grade != 'troll'}FOR FOB DELIVERY: 
1)BENEFICIARY’S COMMERCIAL INVOICE SHOWING FULL PRICE CALCULATION AND ACTUAL SULPHUR CONTENT IN PERCENTAGE (IF APPLICABLE), QUANTITY IN NET US BARRELS, SULPHUR DE-ESCALATION (IF APPLICABLE AS PER PRICE CLAUSE), B/L DATE OR DEEMED B/L DATE.

2) INDEPENDENT INSPECTORS CERTIFICATE OF QUALITY AND/OR QUALITY REPORT AT THE LOADPORT BOTH SHOWING SULPHUR CONTENT (IF APPLICABLE).

3) INDEPENDENT INSPECTORS CERTIFICATE OF QUANTITY AND/OR QUANTITY REPORT AT THE LOADPORT.

4) FULL SET ORIGINAL CLEAN ON BOARD BILLS OF LADING ISSUED OR ENDORSED TO THE ORDER OF {billOfLadingEndorsement}.

5) CERTIFICATE OF ORIGIN.

{#LOI allowed}IN THE EVENT THAT ABOVE-MENTIONED DOCUMENTS NBR. TWO TO FIVE ARE NOT AVAILABLE AT THE TIME OF PRESENTATION BY THE BENEFICIARY, PAYMENT WILL BE MADEAGAINST PRESENTATION OF THE BENEFICIARY’S COMMERCIAL INVOICE AS PER DOCUMENT NUMBER ONE (EMAIL IN PDF FORMAT ACCEPTABLE) AND BENEFICIARY’S LETTER OF INDEMNITY IN THE FOLLOWING FORMAT (EMAIL IN PDF FORMAT ACCEPTABLE):

{LOI}{/LOI allowed}
{/}
{#Grade != 'brent' && Grade != 'oseberg' && Grade != 'troll'} FOR FIP DELIVERY:
1)BENEFICIARY’S COMMERCIAL INVOICE SHOWING FULL PRICE CALCULATION AND ACTUAL SULPHUR CONTENT IN PERCENTAGE (IF APPLICABLE), QUANTITY IN NET US BARRELS, SULPHUR DE-ESCALATION (IF APPLICABLE AS PER PRICE CLAUSE), DEEMED B/L DATE OR COMPLETION OF PUMPOVER DATE.

2) COPY OF PUMPOVER CERTIFICATE INDICATING EITHER THE DEEMED BL DATE AND/OR THE DATE OF COMPLETION OF PUMPOVER.

3) INDEPENDENT INSPECTORS CERTIFICATE OF QUALITY AND/OR QUALITY REPORT BOTH SHOWING SULPHUR CONTENT (IF APPLICABLE).

4)INDEPENDENT INSPECTORS CERTIFICATE OF QUANTITY AND/OR QUANTITY REPORT.
  
5) CERTIFICATE OF ORIGIN.

IN THE EVENT THAT ABOVE-MENTIONED DOCUMENTS NBR. TWO TO FIVE ARE NOT AVAILABLE AT THE TIME OF PRESENTATION BY THE BENEFICIARY, PAYMENT WILL BE MADE AGAINST PRESENTATION OF THE BENEFICIARY’S COMMERCIAL INVOICE AS PER DOCUMENT NUMBER ONE (EMAIL IN PDF FORMAT ACCEPTABLE) AND BENEFICIARY’S WARRANTY OF TITLE IN THE FOLLOWING FORMAT (EMAIL IN PDF FORMAT ACCEPTABLE):

QUOTE
TO : APPLICANT  
FROM: BENEFICIARY 
DATE: XXXXX

WARRANTY OF TITLE
WE REFER TO A QUANTITY OF XXXX NET US BARRELS OF XXXXX OIL DELIVERED TO YOU BY PIPELINE AT (LOCATION) WITH (EITHER DEEMED BL DATE OR COMPLETION OF PUMPOVER DATE) OF………….. 20XX

1. WE HEREBY WARRANT TO YOU THAT:

A)AT THE TIME OF THE TRANSFER OF TITLE AS SPECIFIED IN THE CONTRACT WE HAD THE RIGHT TO SELL THE SAID GOODS TO YOU, AND
B)TITLE IN THE SAID GOODS HAS BEEN PASSED OR SHALL PASS AS PROVIDED IN THE CONTRACT TO YOU FREE FROM ANY AND ALL LIENS, CHARGES AND ENCUMBRANCES OF ANY NATURE WHATSOEVER.

2)WE HEREBY IRREVOCABLY AND UNCONDITIONALLY UNDERTAKE TO INDEMNIFY YOU AND HOLD YOU HARMLESS AGAINST ANY CLAIMS MADE AGAINST YOU BY ANYONE AND ALL LOSS, COSTS (INCLUDING BUT NOT LIMITED TO REASONABLE LEGAL COSTS), DAMAGES AND EXPENSES WHICH YOU MAY SUFFER, INCUR OR BE PUT TO, AS A RESULT OF A BREACH BY US OF OUR WARRANTIES OR ANY OF THEM AS SET OUT IN CLAUSE 1 ABOVE.

3)YOUR ACCEPTANCE OF THIS WARRANTY OF TITLE SHALL NOT ESTABLISH A COURSE OF DEALING BETWEEN US.

4) WARRANTY OF TITLE THIS WARRANTY OF TITLE SHALL BE GOVERNED BY AND CONSTRUED IN ACCORDANCE WITH THE LAWS OF ENGLAND AND IN THE EVENT OF ANY DISPUTES HEREUNDER IT SHALL BE SUBJECT TO THE EXCLUSIVE JURISDICTION OF THE ENGLISH HIGH COURT IN LONDON.

AUTHORIZED SIGNATORY
(NAME AND TITLE)
BENEFICIARY
UNQUOTE{/}

Additional Conditions: 47A:	

1)FOR PAYMENT DUE ON A SUNDAY, OR ON A MONDAY WHICH IS A NEW YORK BANK HOLIDAY, PAYMENT SHALL BE MADE ON THE NEXT NEW YORK BANKING DAY AFTER SUCH PAYMENT DUE DATE. FOR PAYMENT DUE ON A SATURDAY, OR ON A NEW YORK BANK HOLIDAY OTHER THAN A MONDAY, PAYMENT SHALL BE MADE ON THE LAST NEW YORK BANKING DAY PRIOR TO SUCH PAYMENT DUE DATE.

2)TYPOGRAPHICAL/SPELLING ERRORS ARE NOT TO CONSTITUTE DISCREPANCY UNLESS SUCH ERROR(S) RELATE TO GOODS DESCRIPTION, AMOUNT(S), DATE(S) OR QUANTITY(IES).

3)WHERE COPY DOCUMENTS ARE REQUIRED PHOTOCOPIES AS COPIES OF ORIGINAL DOCUMENTS ARE ACCEPTABLE. 

4)PRESENTATION OF MORE THAN ONE SET OF DOCUMENTS IS ACCEPTABLE.

5)DOCUMENTS ISSUED BY THIRD PARTIES ARE ACCEPTABLE (EXCEPT FOR INVOICE, LOI AND/OR WARRANTY OF TITLE).

6)CHARTER PARTY BILLS OF LADING/TANKSHIP BILLS OF LADING AND/OR BILLS OF LADING SIGNED BY THE MASTER OR AGENT ON BEHALF OF MASTER ARE ACCEPTABLE.

7)THIS LETTER OF CREDIT AND ANY DISPUTE OR CLAIM ARISING OUT OF OR IN CONNECTION WITH IT OR ITS SUBJECT MATTER OR FORMATION (INCLUDING NON-CONTRACTUAL DISPUTES OR CLAIMS) SHALL BE GOVERNED BY, AND CONSTRUED IN ACCORDANCE WITH, ENGLISH LAW. THE PARTIES IRREVOCABLY AGREE THAT THE HIGH COURT IN LONDON – SHALL HAVE EXCLUSIVE JURISDICTION TO SETTLE ANY DISPUTE OR CLAIM WHATSOEVER (INCLUDING NON-CONTRACTUAL DISPUTES OR CLAIMS) ARISING OUT OF OR IN CONNECTION WITH THIS LETTER OF CREDIT OR ITS SUBJECT MATTER OR FORMATION.

8)PDF FORMAT FOR INVOICE AND/OR LETTER OF INDEMNITY AND/OR WARRANTY OF TITLE THROUGH ANY SECURE ELECTRONIC MEANS IS ACCEPTABLE.

9)THIS DOCUMENTARY CREDIT SHALL TAKE EFFECT IN ACCORDANCE WITH ITS TERMS, BUT SUCH TERMS SHALL NOT ALTER, ADD TO OR IN ANY WAY AMEND THE PROVISIONS OF THE CONTRACT BETWEEN THE BUYER AND SELLER TO WHICH THIS DOCUMENTARY CREDIT RELATES.

10)DOCUMENTS TO BE SENT IN ONE LOT BY SPECIAL COURIER TO OUR ADDRESS: {Issuing bank name}, {Issuing bank address }, {Issuing bank country }

11)THE AMOUNT OF THIS LC WILL AUTOMATICALLY FLUCTUATE IN ACCORDANCE WITH THE PRICE CLAUSE AND SULPHUR CONTENT (IF APPLICABLE AS PER PRICE ADJUSTMENT CLAUSE) WITHOUT ANY AMENDMENT FROM OUR PART.

12)COMBINED DOCUMENTS ARE ACCEPTABLE.

13)IN CASE OF FIP DELIVERY, THE DEEMED BL DATE AND/OR THE DATE OF COMPLETION OF PUMPOVER SHALL BE CONSIDERED AS THE DELIVERY DATE.

14)DOCUMENTS SHOWING A DIFFERENT TITLE OR NAME BUT WITH CONTENT SERVING THE SAME PURPOSE ARE ACCEPTABLE   EXCEPT BL, INVOICE, LOI AND WARRANTY OF TITLE.

15)ANY DISCREPANCY RESULTING FROM THE INVOICED QUANTITY EXCEEDING OR FALLING BELOW THE QUANTITY RANGE ALLOWED IN THIS LETTER OF CREDIT IS ACCEPTABLE. IN CASE THE INVOICED QUANTITY EXCEEDS THE MAXIMUM QUANTITY ALLOWED IN THIS LETTER OF CREDIT THE BANK WILL PAY ON THE MAXIMUM QUANTITY ALLOWED IN THIS LETTER OF CREDIT.
  
16)ALL DOCUMENTS MUST BE ISSUED IN ENGLISH.

Details of charges: 71B:  	

{#Fees payable by == 'Applicant'}ALL CHARGES ARE FOR THE ACCOUNT OF THE APPLICANT{/}
{#Fees payable by == 'Beneficiary'}ALL CHARGES ARE FOR THE ACCOUNT OF THE BENEFICIARY{/}
{#Fees payable by == 'Split'}ISSUING BANK CHARGES ARE FOR THE APPLICANTS ACCOUNT. 
OTHER BANK CHARGES (IF ANY) ARE FOR BENEFICIARY’S ACCOUNT.{/}

Period for Presentation: 48: 	

DOCUMENTS PRESENTED NO LATER THAN {Document presentation deadline} DAYS AFTER THE B/L DATE OR DEEMED B/L OR DATE OF COMPLETION OF PUMPOVER BUT WITHIN THE LC VALIDITY ARE ACCEPTABLE.

Confirmation Instructions: 49:	WITHOUT

Bank Instructions: 78	

UPON RECEIPT AT OUR COUNTERS OF DOCUMENTS AND PROVIDED WE RECOGNIZE THEM ISSUED IN STRICT CONFORMITY WITH THE TERMS AND CONDITIONS OF THIS LETTER OF CREDIT, WE UNDERTAKE TO COVER YOU AT MATURITY DATE AS PER YOUR INSTRUCTIONS PROVIDED THAT SUCH DOCUMENTS REACH OUR OFFICE LATEST TWO {Issuing bank locality}/NEW YORK BANK WORKING DAYS BEFORE DUE DATE. OTHERWISE PAYMENT WILL BE EFFECTED VALUE TWO {Issuing bank locality} NEW YORK BANK WORKING DAYS AFTER RECEIPT OF SUCH DOCUMENTS.`

export const filledInTemplate = (
  values: LetterOfCreditValues,
  counterparties: Counterparty[],
  trade?: ITradeEnriched
) => {
  const applicantDetails = participantDetailsFromMember(findCounterpartyByStatic(counterparties, values.applicantId))
  const beneficiaryDetails = participantDetailsFromMember(
    findCounterpartyByStatic(counterparties, values.beneficiaryId)
  )
  const issuingBankDetails = participantDetailsFromMember(
    findCounterpartyByStatic(counterparties, values.issuingBankId)
  )
  const beneficiaryBankDetails = participantDetailsFromMember(
    findCounterpartyByStatic(counterparties, values.beneficiaryBankId)
  )

  return `Issuing Bank:     ${issuingBankDetails.companyName}, ${issuingBankDetails.address}, ${
    issuingBankDetails.country
  }

Advise To:         

${
    values.direct
      ? `PLEASE ADVISE THE LC DIRECTLY TO BENEFICIARY’S EMAIL OR SWIFT: ${values.beneficiaryContactPerson}`
      : values.beneficiaryBankRole === BENEFICIARY_BANK_ROLE_OPTIONS.ADVISING &&
        `PLEASE ADVISE THE LC THROUGH: ${beneficiaryBankDetails.companyName}, ${beneficiaryBankDetails.address}, ${
          beneficiaryBankDetails.country
        }`
  }

Form of Documentary Credit :40A:         ${sentenceCase(values.type)}

Applicable Rules :40E:   ${sentenceCaseWithAcronyms(values.applicableRules, ['UCP'])}

Date and Place of Expiry :31D:  ${values.expiryDate} ${values.expiryPlace} counters

Applicant :50:  ${applicantDetails.companyName}, ${applicantDetails.address}, ${applicantDetails.country}

Beneficiary:59:  ${beneficiaryDetails.companyName}, ${beneficiaryDetails.address}, ${beneficiaryDetails.country}

Currency Code and Amount :32B:              ${values.currency} ${values.amount}

${trade &&
    `Percentage Credit Amount Tolerance :39A:              ${Number(trade.minTolerance).toFixed(2)}%/${Number(
      trade.maxTolerance
    ).toFixed(2)}%`}
`
}