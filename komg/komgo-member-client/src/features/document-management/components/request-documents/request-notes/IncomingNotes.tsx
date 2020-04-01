import * as React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { SPACES } from '@komgo/ui-components'
import { Note } from '../../../store'

import { displayDate } from '../../../../../utils/date'

export interface Props {
  note: Note
  noteIndex: number
  textAreaHasFocus: boolean
  atLatestNote: boolean
  getCounterpartyNameById(counterpartyId: string): string
}

export const IncomingNotes = (props: Props) => {
  const { note } = props

  return note && note.content ? (
    <StyledIncomingContent data-test-id="incoming-note-section">
      <SenderAndDate data-test-id="incoming-note-meta">
        {`${props.getCounterpartyNameById(note.sender)} - ${displayDate(
          note.date,
          ArbitraryDateFormatUsedHereOnlyForNoFuckingReason
        )} ${getTimeZone()}`}
      </SenderAndDate>
      <NoteContent
        className="style-scroll"
        data-test-id="incoming-note-content"
        textAreaHasFocus={props.textAreaHasFocus}
        atLatestNote={props.atLatestNote}
      >
        {note.content}
      </NoteContent>
    </StyledIncomingContent>
  ) : (
    <EmptyNote data-test-id="incoming-note-empty">{EMPTY_NOTE_TEXT}</EmptyNote>
  )
}

const getTimeZone = () => moment.tz(moment.tz.guess()).zoneAbbr()

const EMPTY_NOTE_TEXT = 'The counterparty did not add a note to this request'

const ArbitraryDateFormatUsedHereOnlyForNoFuckingReason = `D MMM YY - h.mmA`

const StyledIncomingContent = styled.div`
  margin: ${SPACES.EXTRA_SMALL} ${SPACES.SMALL};
`

const EmptyNote = styled.div`
  color: #5d768f;
  min-height: 10em;
  line-height: 10em;
  text-align: center;
  margin: ${SPACES.EXTRA_SMALL} ${SPACES.SMALL};
`

const SenderAndDate = styled.div`
  color: #5d768f;
  font-size: 14px;
  font-style: italic;
  font-weight: 300;
  line-height: 21px;
  margin: ${SPACES.EXTRA_SMALL} 0;
`

const calculateExistingInputHeight = ({
  textAreaHasFocus,
  atLatestNote
}: {
  textAreaHasFocus: boolean
  atLatestNote: boolean
}) => {
  return atLatestNote ? (textAreaHasFocus ? '8em' : '12em') : '15em'
}

const NoteContent = styled.div`
  color: #5d768f;
  font-size: 14px;
  line-height: 21px;
  margin: ${SPACES.EXTRA_SMALL} 0;
  overflow-wrap: break-word;
  overflow-y: auto;
  min-height: 8em;
  max-height: ${({ textAreaHasFocus, atLatestNote }: { textAreaHasFocus: boolean; atLatestNote: boolean }) =>
    calculateExistingInputHeight({ textAreaHasFocus, atLatestNote })};
`
