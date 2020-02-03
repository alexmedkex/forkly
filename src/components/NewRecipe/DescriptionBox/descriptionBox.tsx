import React, { useState } from 'react'
import { Grid, InputBase, ButtonGroup, IconButton} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { getStyle } from './descriptionBox.style'
import { List } from 'immutable'
import { InstructionStep } from './InstructionStep/instructionStep'

export function DescriptionBox(props: any) {
    const classes = getStyle()
    const [items, setItems] = useState(List())

    function addItem() {
        setItems(items => items.push(<InstructionStep></InstructionStep>))
    }

    return (
        <React.Fragment>
            <ButtonGroup className={classes.buttons} orientation="vertical">
                <IconButton onClick={addItem}>
                    <DeleteIcon></DeleteIcon>
                </IconButton>
                <IconButton>
                    <DeleteIcon></DeleteIcon>
                </IconButton>
            </ButtonGroup>
            <Grid item xs={12}>
                <InputBase className={classes.textBox}
                    inputRef={props.textFieldRef}
                    multiline
                    fullWidth
                    placeholder="Describe your recipe..."></InputBase>
            </Grid>
            {items}
        </React.Fragment>
    )
}