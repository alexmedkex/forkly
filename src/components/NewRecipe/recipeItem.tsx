import React, { useState, useRef } from 'react'
import { Grid, TextField, TextFieldProps } from '@material-ui/core'
import getStyle from './recipeItem.style'

interface InputEvents {
    addItemEvent: () => void,
    removeItemEvent: (id: number) => void
}

interface RecipeItemProps {
    enabled: boolean,
    id: number,
    setValues: (id: number, values: string[]) => void,
    eventHandlers?: InputEvents
}

export default function RecipeItem(props: RecipeItemProps) {
    const [enabled, setEnabled] = useState(props.enabled)
    const classes = getStyle(enabled)
    const inputFieldRef1: React.MutableRefObject<TextFieldProps> = useRef()
    const inputFieldRef2: React.MutableRefObject<TextFieldProps> = useRef()

    const textFieldProps = {
        variant: "outlined",
        fullWidth: true,
        size: "small"
    }

    function onChange() {
        props.setValues(props.id, [inputFieldRef1.current.value as string, inputFieldRef2.current.value as string])

        if (!props.eventHandlers) {
            return
        }

        if (inputFieldIsEmpty(inputFieldRef1) && inputFieldIsEmpty(inputFieldRef2)) {
            props.eventHandlers.removeItemEvent(props.id)
        } else if (!enabled) {
            setEnabled(true)
            props.eventHandlers.addItemEvent()
        }
    }

    return (
        <React.Fragment>
            <Grid item xs={6}>
                <TextField className={classes.textField} inputRef={inputFieldRef1} onChange={onChange} {...textFieldProps} label="Ingredient"></TextField>
            </Grid>
            <Grid item xs={3}>
                <TextField className={classes.textField} inputRef={inputFieldRef2} onChange={onChange} {...textFieldProps} label="Quantity"></TextField>
            </Grid>
        </React.Fragment>
    )
}

function inputFieldIsEmpty(inputRef: React.MutableRefObject<TextFieldProps>) {
    return inputRef.current && inputRef.current.value == ''
}