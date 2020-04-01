import React, { useState, useRef } from 'react'
import { Grid, TextField, TextFieldProps, MenuItem } from '@material-ui/core'
import getStyle from './ingredient.style'

interface InputEvents {
    addItemEvent: () => void,
    removeItemEvent: (id: number) => void
}

interface IngredientProps {
    enabled: boolean,
    id: number,
    setValue: (id: number, data: string, value: string) => void,
    eventHandlers?: InputEvents
}

export default function Ingredient(props: IngredientProps) {
    const [enabled, setEnabled] = useState(props.enabled)
    const [measurement, setMeasurement] = useState("gram")
    const classes = getStyle(enabled)
    const inputFieldRef1: React.MutableRefObject<TextFieldProps> = useRef()
    const inputFieldRef2: React.MutableRefObject<TextFieldProps> = useRef()
    const inputFieldRef3: React.MutableRefObject<TextFieldProps> = useRef()

    const textFieldProps = {
        fullWidth: true,
        size: "small"
    }

    function onChangeName() {
        props.setValue(props.id, 'name', inputFieldRef1.current.value as string)
        onChange()
    }

    function onChangeQuantity() {
        props.setValue(props.id, 'quantity', inputFieldRef2.current.value as string)
        onChange()
    }

    function onChangeMeasurement(event: React.ChangeEvent<{ value: unknown }>) {
        setMeasurement(event.target.value as string)
        props.setValue(props.id, 'quantity', inputFieldRef2.current.value as string)
    }

    function onChange() {
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
                <TextField className={classes.textField} inputRef={inputFieldRef1} onChange={onChangeName} {...textFieldProps} placeholder="Ingredient"></TextField>
            </Grid>
            <Grid item xs={3}>
                <TextField className={classes.textField} inputRef={inputFieldRef2} onChange={onChangeQuantity} {...textFieldProps} placeholder="Quantity"></TextField>
            </Grid>
            <Grid item xs={3}>
                <TextField className={classes.textField} value={measurement} select inputRef={inputFieldRef3} onChange={onChangeMeasurement} {...textFieldProps} placeholder="Measurement">
                    <MenuItem value={"gram"}>gram</MenuItem>
                    <MenuItem value={"milligram"}>milligram</MenuItem>
                    <MenuItem value={"deciliter"}>deciliter</MenuItem>
                </TextField>
            </Grid>
        </React.Fragment>
    )
}

function inputFieldIsEmpty(inputRef: React.MutableRefObject<TextFieldProps>) {
    return inputRef.current && inputRef.current.value == ''
}