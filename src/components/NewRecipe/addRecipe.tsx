import React, { useState } from 'react'
import { Grid, Button } from '@material-ui/core'
import RecipeItem from './RecipeItem/recipeItem'
import getStyle from './addRecipe.style'
import { Map, List } from 'immutable'
import { MetaInfo } from './MetaInfo/metaInfo'
import { DescriptionBox } from './DescriptionBox/descriptionBox'
import axios from 'axios'
import pako from 'pako'
import { Fragment, FragmentInfo, RecipeMetaInfo } from './types'

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
    const [fragments, setFragments] = useState(List<Fragment>())
    const [metaInfo, setMetaInfo] = useState<RecipeMetaInfo>({
        title: '',
        cookingTime: '',
        cuisine: ''
    })

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
        const instance = axios.create({
            baseURL: 'http://localhost:3000/',
            timeout: 5000,
            headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'deflate' }
        })
        instance.post(
            'recipes',
            pako.deflate(JSON.stringify({
                ...metaInfo,
                ingredients: getIngredients(itemValues),
                description: getFragmentInfo(fragments)
            }), { level: 9 })
        ).then(result => {
            console.log(result)
        })
    }

    return (
        <React.Fragment>
            <Grid className={classes.container} container spacing={1} direction="row">
                <Grid item xs={12}>
                    <Button className={classes.button} variant="contained" color="primary" onClick={addRecipe}>Save</Button>
                </Grid>
                <MetaInfo setMetaInfo={setMetaInfo}></MetaInfo>
                <Grid item xs={12}>
                    <h3 className={classes.header}>Ingredients</h3>
                </Grid>
                {items.toList().toArray()}
                <Grid item xs={12}>
                    <h3 className={classes.header}>Instructions</h3>
                </Grid>
                <DescriptionBox setFragments={setFragments} fragments={fragments}></DescriptionBox>
            </Grid>
        </React.Fragment>
    )
}

function getFragmentInfo(fragments: List<Fragment>): FragmentInfo[] {
    let info: FragmentInfo[] = []
    fragments.forEach(fragment => {
        info.push(fragment.fragmentInfo)
    })
    return info
}

function getIngredients(itemValues: Map<number, string[]>): {}[] {
    let ingredients: {}[] = []
    itemValues.forEach(ingredient => {
        ingredients.push({
            name: ingredient[0],
            quantity: ingredient[1],
            measurement: ingredient[2]
        })
    })
    return ingredients
}