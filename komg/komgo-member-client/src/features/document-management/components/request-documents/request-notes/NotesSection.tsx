import * as React from 'react'
import { Form, TextArea } from 'semantic-ui-react'
import styled from 'styled-components'

import { SectionCard } from '../SectionCard'
import { IncomingNotes } from './IncomingNotes'
import { NoteIndexControl } from './NoteIndexControl'
import { Note } from '../../../store'

export interface Props {
  noteInput: Note | null
  notes: Note[]
  setNoteContent(content: string): void
  getCounterpartyNameById(counterpartyId: string): string
}

export const NotesSection = (props: Props) => {
  const notes = [...props.notes] || []
  const { noteInput } = props

  const [textInput, setInput] = React.useState(noteInput ? noteInput.content : '')

  const hasNotes = notes && notes.length > 0
  const [noteIndex, setIndex] = React.useState(0)

  const atLatestNote = hasNotes && noteIndex + 1 === notes.length

  /*
    Track whether the textbox has focus for case where
    - replying to last existing note
    - textbox should expand from one row to three, shrinking area above
  */
  const [textAreaHasfocus, setFocus] = React.useState(false)

  return (
    <SectionCard title={renderNotesSectionTitle(noteIndex, setIndex, notes.length)}>
      <Form data-test-id="request-notes-form">
        {hasNotes && (
          <IncomingNotes
            note={notes[noteIndex || 0]}
            noteIndex={noteIndex}
            getCounterpartyNameById={props.getCounterpartyNameById}
            textAreaHasFocus={textAreaHasfocus}
            atLatestNote={atLatestNote}
          />
        )}
        {hasNotes ? (
          atLatestNote && (
            <ResizeTextArea
              data-test-id="request-notes-input"
              className="style-scroll"
              placeholder={REPLY_HERE}
              value={textInput}
              onInput={e => setInput(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => {
                setFocus(false)
                props.setNoteContent(textInput)
              }}
              rows={12}
            />
          )
        ) : (
          <NoResizeTextArea
            data-test-id="request-notes-input"
            className="style-scroll"
            placeholder={TYPE_HERE}
            value={textInput}
            onInput={e => setInput(e.target.value)}
            onBlur={() => props.setNoteContent(textInput)}
            rows={13}
          />
        )}
      </Form>
    </SectionCard>
  )
}

const renderNotesSectionTitle = (noteIndex: number, setIndex: (n: number) => void, maxIndex: number) => {
  return (
    <Title>
      <p>NOTES</p>
      {maxIndex > 0 && <NoteIndexControl currentIndex={noteIndex} maxIndex={maxIndex} setIndex={setIndex} />}
    </Title>
  )
}

const TYPE_HERE = 'Type here...'

const REPLY_HERE = 'Reply here...'

/**
 * Yes, we actually need two TextArea components.
 * One which is always the same size
 * One which resizes when it receives focus
 * But not from the original size, oh no, from a new one.
 */
const NoResizeTextArea = styled(TextArea)`
  &&& {
    resize: none;
    overflow-y: auto;
  }
`

const ResizeTextArea = styled(TextArea)`
  &&& {
    resize: none;
    height: 3em;
    overflow-y: auto;

    &:focus {
      height: 7em;
    }
  }
`

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  width: 105%;
`
