import React, { useState, useRef } from 'react'
import { Grid, Button, TextField, TextFieldProps } from '@material-ui/core'
import RecipeItem from './recipeItem'
import getStyle from './addRecipe.style'
import { Map } from 'immutable'


export default function AddRecipe() {
    const classes = getStyle()
    const eventHandlers = {
        addItemEvent: addItem,
        removeItemEvent: removeItem
    }
    let id = 0
    let initialState: Map<Number, JSX.Element> = Map()
    id++
    initialState = initialState.set(id, <RecipeItem enabled key={id} id={id} setValues={setValues}></RecipeItem>)
    id++
    initialState = initialState.set(id, <RecipeItem enabled={false} key={id} id={id} setValues={setValues} eventHandlers={eventHandlers}></RecipeItem>)
    const [items, setItems] = useState(initialState)

    const initialItemValues = Map<number, string[]>()
    const [itemValues, setItemValues] = useState(initialItemValues)

    const textFieldRef: React.MutableRefObject<TextFieldProps> = useRef()

    function addItem() {
        setItems(items => {
            id++
            return items.set(id, <RecipeItem enabled={false} key={id} id={id} setValues={setValues} eventHandlers={eventHandlers}></RecipeItem>)
        })
    }

    function removeItem(id: number) {
        setItems(items => {
            let newItems = items.delete(id)
            let ordered = newItems.sort((item1, item2) => {
                return item1.props.id > item2.props.id ? 1 : -1
            })
            return ordered
        })
    }


    function setValues(id: number, values: string[]) {
        setItemValues(itemValues => {
            return itemValues.set(id, values)
        })
    }

    function addRecipe() {
        let itemsJson: { [key: string]: string } = {}

        itemValues.forEach((item, id) => {
            itemsJson[item[0]] = item[1]
        })

        fetch("http://localhost:3000/recipes/add",
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...itemsJson,
                    text: textFieldRef.current.value
                })
            })
            .then(res => res.text())
            .then(res => {
                console.log(res)
            })
    }

    return (
        <React.Fragment>
            <Grid className={classes.container} container spacing={2} direction="row">
                {items.toList().toArray()}
                <Grid item xs={12}>
                    <TextField inputRef={textFieldRef} variant="filled" multiline rowsMax="10" rows="10" fullWidth></TextField>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={addRecipe}>Save</Button>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}