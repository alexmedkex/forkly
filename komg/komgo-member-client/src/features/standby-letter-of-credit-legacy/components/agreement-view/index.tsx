import * as React from 'react'
import { IStandbyLetterOfCreditBase, IStandbyLetterOfCredit, DuplicateClause, ITrade, ICargo } from '@komgo/types'

import { Counterparty } from '../../../counterparties/store/types'
import { IMember } from '../../../members/store/types'
import { findCounterpartyByStatic, findMembersByStatic } from '../../../letter-of-credit-legacy/utils/selectors'
import './template.css'
import { KomgoLogo } from '../../../../components/komgo-logo'
import { buildTemplate } from './TemplateBuilder'
import { InteractiveField } from './InteractiveField'

export interface AgreementViewProps {
  letter: IStandbyLetterOfCreditBase | IStandbyLetterOfCredit
  trade?: ITrade
  cargo?: ICargo
  applicant: IMember
  beneficiary: IMember
  // TODO LS replace issuingBanks and beneficiaryBanks with just issuingBank & beneficiaryBank
  issuingBanks: Counterparty[]
  beneficiaryBanks: IMember[]
  activeFields: string[]
}

export const AgreementView: React.FC<AgreementViewProps> = ({
  letter,
  issuingBanks,
  beneficiaryBanks,
  trade,
  cargo,
  applicant,
  beneficiary,
  activeFields
}: AgreementViewProps) => {
  const { issuingBankId, beneficiaryBankId, duplicateClause } = letter || ({} as any)
  const issuingBank = findCounterpartyByStatic(issuingBanks, issuingBankId)
  const beneficiaryBank = findMembersByStatic(beneficiaryBanks, beneficiaryBankId)

  const params = buildTemplate({
    trade,
    cargo,
    letter,
    issuingBank,
    beneficiaryBank,
    applicant,
    beneficiary
  })

  const {
    covering,
    expiryDate,
    contractDate,
    contractReference,
    currency,
    amount,
    overrideStandardTemplate,
    availableWith,
    feesPayableBy,
    issuingBank: {
      name: issuingBankCommonName,
      address: issuingBankAddress,
      issuingBankReference,
      issuingBankPostalAddress
    },
    beneficiaryBank: { name: beneficiaryBankCommonName, address: beneficiaryBankAddress },
    applicant: { name: applicantCommonName, address: applicantAddress },
    beneficiary: { name: beneficiaryCommonName, address: beneficiaryAddress }
  } = params

  return (
    <>
      <section style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <KomgoLogo />
      </section>
      <section className="template_section">
        <strong>TO:</strong>
        <p>
          <span>
            {beneficiaryCommonName}, {beneficiaryAddress}
          </span>
        </p>
        <p>
          WITH REFERENCE TO THE SALE/PURCHASE CONTRACT REF{' '}
          <InteractiveField name="contractReference" activeClass="template_link" fields={activeFields}>
            <span>{contractReference}</span>
          </InteractiveField>{' '}
          <InteractiveField name="contractDate" activeClass="template_link" fields={activeFields}>
            <span>{contractDate}</span>
          </InteractiveField>
        </p>
        <strong>BETWEEN:</strong>
        <p>
          {beneficiaryCommonName}, {beneficiaryAddress}
        </p>
        <strong>AND</strong>
        <p>
          {applicantCommonName}, {applicantAddress}
        </p>
      </section>
      <section className="template_section">
        <p>
          WE,{' '}
          <InteractiveField name="issuingBankId" activeClass="template_link" fields={activeFields}>
            <span>{issuingBankCommonName}</span>
          </InteractiveField>{' '}
          HEREBY OPEN OUR IRREVOCABLE STAND-BY LETTER OF CREDIT NO.{' '}
          <InteractiveField name="issuingBankReference" activeClass="template_link" fields={activeFields}>
            <span>{issuingBankReference}</span>
          </InteractiveField>
        </p>
      </section>
      <section className="template_section">
        <strong>BY ORDER OF:</strong>
        <p>
          {applicantCommonName}, {applicantAddress}
          <br />
          (APPLICANT)
        </p>
      </section>
      <section className="template_section">
        <strong>IN FAVOUR OF:</strong>
        <p>
          {beneficiaryCommonName}, {beneficiaryAddress}
          <br />
          (BENEFICIARY)
        </p>
      </section>
      <section className="template_section">
        <a id="preview_amount" className="template_anchor">
          <strong>FOR AMOUNT OF:</strong>
        </a>
        <p>
          <InteractiveField name="amount" activeClass="template_link" fields={activeFields}>
            <span>
              {currency} {amount}
            </span>
          </InteractiveField>
        </p>
      </section>
      <section className="template_section">
        <strong>COVERING:</strong>
        <p>{covering}</p>
      </section>
      {beneficiaryBank && (
        <section className="template_section">
          <strong>AVAILABLE WITH:</strong>
          <p>{availableWith}</p>
        </section>
      )}
      <section className="template_section">
        <a id="preview_expiryDate" className="template_anchor">
          <strong>DATE OF EXPIRY:</strong>
        </a>
        <p>
          <InteractiveField name="expiryDate" activeClass="template_link" fields={activeFields}>
            <span>{expiryDate}</span>
          </InteractiveField>
        </p>
      </section>

      <section className="template_section">
        <InteractiveField name="overrideStandardTemplate" multiline={true} fields={activeFields}>
          <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{overrideStandardTemplate}</p>
        </InteractiveField>
      </section>

      <section className="template_section">
        <a id="preview_issuingBankPostalAddress" className="template_anchor">
          <strong>DOCUMENTS TO BE SENT IN ONE LOT BY SPECIAL COURIER TO ISSUING BANK'S ADDRESS:</strong>
        </a>
        <br />
        <InteractiveField name="issuingBankPostalAddress" fields={activeFields}>
          <span>{issuingBankPostalAddress}</span>
        </InteractiveField>
      </section>

      <section className="template_section">
        <a id="preview_feesPayableBy" className="template_anchor">
          <strong>FEES PAYABLE BY:</strong>
        </a>
        <p>
          ALL CHARGES IN CONNECTION WITH THE OPERATION OF THIS IRREVOCABLE STAND-BY LETTER OF CREDIT ARE FOR THE{' '}
          <InteractiveField name="feesPayableBy" fields={activeFields}>
            <span>{feesPayableBy}</span>
          </InteractiveField>{' '}
          ACCOUNT.
        </p>
      </section>

      <a id="preview_duplicateClause" className="template_anchor">
        {duplicateClause === DuplicateClause.Yes && (
          <section className="template_section">
            <strong>DUPLICATE CLAUSE: </strong>

            <InteractiveField name="duplicateClause" multiline={true} fields={activeFields}>
              <p>
                SHOULD THIS STAND-BY LETTER OF CREDIT ALSO BE ISSUED AND TRANSMITTED TO THE BENEFICIARY THROUGH MEANS OF
                COMMUNICATION OTHER THAN THROUGH THE KOMGO PLATFORM (SUCH AS E.G. BY SWIFT MESSAGE, FAX OR OTHERWISE),
                IT IS CLEARLY UNDERSTOOD THAT SUCH MULTIPLE ISSUANCES AND/OR TRANSMITTALS SHALL NOT RESULT IN A DOUBLE
                COMMITMENT OF THE ISSUING BANK AND THAT SAID ISSUING BANK SHALL THEREFORE HONOUR THE SAID STAND-BY
                LETTER OF CREDIT ONLY ONCE AND BE THEREBY RELEASED FROM ANY AND ALL OBLIGATIONS INCURRED UNDER ANY SUCH
                ADDITIONAL ISSUANCE AND/OR TRANSMITTAL. SUCH STAND-BY LETTER OF CREDIT SHALL BE DEEMED THE SAME ONE, IF
                IT COVERS THE SAME UNDERLYING TRANSACTION AND BEARS THE SAME REFERENCE NUMBER AS THE ONE INDICATED
                HEREIN.
              </p>
            </InteractiveField>
          </section>
        )}
      </a>

      <section className="template_section">
        <strong>FOR:</strong>
        <p>
          <InteractiveField name="issuingBankId" fields={activeFields}>
            <span>
              {issuingBankCommonName}, {issuingBankAddress}
            </span>
          </InteractiveField>
          <br />
          (ISSUING BANK)
        </p>
      </section>
    </>
  )
}
