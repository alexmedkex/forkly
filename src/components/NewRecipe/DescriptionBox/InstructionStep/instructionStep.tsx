import React, { useRef } from 'react'
import { InputBase, TextFieldProps } from '@material-ui/core'
import { getStyle } from './instructionStep.style'

interface InstructionStepProps {
    stepNbr: number
    remove: (nbr: number) => void
}

export function InstructionStep(props: InstructionStepProps) {
    const classes = getStyle()
    const inputRef: React.MutableRefObject<TextFieldProps> = useRef()

    function handleKeyDown(event: React.KeyboardEvent<{ value: unknown }>) {
        if(event.keyCode === 8 && inputRef.current.value == '') {
            props.remove(props.stepNbr)
        }
     }

    return (
        <div className={classes.root}>
            {props.stepNbr}. <InputBase inputRef={inputRef} onKeyDown={handleKeyDown} className={classes.textField} multiline></InputBase>
        </div>
    )
}