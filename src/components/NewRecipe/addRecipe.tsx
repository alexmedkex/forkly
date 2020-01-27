import React, { useState } from 'react'
import { Grid } from '@material-ui/core'
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
    initialState = initialState.set(id, <RecipeItem enabled key={id} id={id}></RecipeItem>)
    id++
    initialState = initialState.set(id, <RecipeItem enabled={false} key={id} id={id} eventHandlers={eventHandlers}></RecipeItem>)
    const [items, setItems] = useState(initialState)

    function addItem() {
        setItems(items => {
            id++
            return items.set(id, <RecipeItem enabled={false} key={id} id={id} eventHandlers={eventHandlers}></RecipeItem>)
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

    return (
        <React.Fragment>
            <Grid className={classes.container} container spacing={2} direction="row">
                {items.toList().toArray()}
            </Grid>
        </React.Fragment>
    )
}