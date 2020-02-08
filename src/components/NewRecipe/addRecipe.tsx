import React, { useState, createRef } from 'react'
import { Grid, Button, TextFieldProps } from '@material-ui/core'
import RecipeItem from './RecipeItem/recipeItem'
import getStyle from './addRecipe.style'
import { Map, List } from 'immutable'
import { MetaInfo } from './MetaInfo/metaInfo'
import { DescriptionBox } from './DescriptionBox/descriptionBox'
import { Fragment } from './types'
import axios from 'axios'
import pako from 'pako'

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

    const [itemValues, setItemValues] = useState(Map<number, string[]>())
    const [descriptionFragments, setDescriptionFragments] = useState(List<Fragment>())

    const textFieldRef: React.MutableRefObject<TextFieldProps> = createRef()

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

    function addFragment(fragment: Fragment) {
        setDescriptionFragments(fragments => fragments.push(fragment))
    }

    function addRecipe() {
        /*
        fetch("http://localhost:3000/recipes/add",
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
                body: gzip.zip(JSON.stringify({
                    ...itemValues.toJSON(),
                    description: descriptionFragments.toJSON()
                }))
            })
            .then(res => res.text())
            .then(res => {
                console.log(res)
            })
        */
        const instance = axios.create({
            baseURL: 'http://localhost:3000/',
            timeout: 5000,
            headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'deflate' }
        })
        instance.post(
            'recipes/add',
            pako.deflate(JSON.stringify({
                ...itemValues.toJSON(),
                description: descriptionFragments.toJSON()
            }), { level: 9 })
        ).then(result => {
            console.log(result)
        })
    }

    return (
        <React.Fragment>
            <Grid className={classes.container} container spacing={1} direction="row">
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={addRecipe}>Save</Button>
                </Grid>
                <MetaInfo></MetaInfo>
                <Grid item xs={12}>
                    <h3>Ingredients</h3>
                </Grid>
                {items.toList().toArray()}
                <Grid item xs={12}>
                    <h3>Instructions</h3>
                </Grid>
                <DescriptionBox addFragmentInfo={addFragment}></DescriptionBox>
            </Grid>
        </React.Fragment>
    )
}