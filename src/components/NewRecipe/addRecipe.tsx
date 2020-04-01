import React, { useState } from 'react'
import { Grid, Button } from '@material-ui/core'
import Ingredient from './Ingredient/ingredient'
import getStyle from './addRecipe.style'
import { Map } from 'immutable'
import { MetaInfo } from './MetaInfo/metaInfo'
import { DescriptionBox } from './DescriptionBox/descriptionBox'
import axios from 'axios'
import pako from 'pako'
import { RecipeMetaInfo, IngredientType } from './types'
import { EditorState, convertToRaw } from 'draft-js'

export default function AddRecipe() {
    const classes = getStyle()
    const eventHandlers = {
        addItemEvent: addIngredient,
        removeItemEvent: removeIngredient
    }
    let id = 0
    let initIngredientState: Map<Number, IngredientType> = Map()
    initIngredientState = initIngredientState.set(id, {
        element: <Ingredient enabled setValue={setIngredientValue} key={id} id={id}></Ingredient>,
        data: {
            name: '',
            quantity: '',
            measurement: 'gram'
        }
    })
    id++
    initIngredientState = initIngredientState.set(id, {
        element: <Ingredient enabled={false} key={id} id={id} setValue={setIngredientValue} eventHandlers={eventHandlers}></Ingredient>,
        data: {
            name: '',
            quantity: '',
            measurement: 'gram'
        }
    })
    const [ingredients, setIngredients] = useState(initIngredientState)
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    const [metaInfo, setMetaInfo] = useState<RecipeMetaInfo>({
        title: '',
        cookingTime: '',
        cuisine: ''
    })

    function addIngredient() {
        setIngredients(ingredients => {
            id++
            return ingredients.set(id,
                {
                    element: <Ingredient enabled={false} key={id} id={id} setValue={setIngredientValue} eventHandlers={eventHandlers}></Ingredient>,
                    data: {
                        name: '',
                        quantity: '',
                        measurement: 'gram'
                    }
                }
            )
        })
    }

    function removeIngredient(id: number) {
        setIngredients(ingredients => {
            let newIngredients = ingredients.delete(id)
            let ordered = newIngredients.sort((ingredient1, ingredient2) => {
                return ingredient1.element.props.id > ingredient2.element.props.id ? 1 : -1
            })
            return ordered.toMap()
        })
    }

    function setIngredientValue(id: number, dataType: string, value: string) {
        setIngredients(ingredients => {
            return ingredients.setIn([id, 'data', dataType], value)
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
                ingredients: getIngredientData(ingredients),
                description: convertToRaw(editorState.getCurrentContent())
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
                {ingredients.map(ingredient => ingredient.element).toList().toArray()}
                <Grid item xs={12}>
                    <h3 className={classes.header}>Instructions</h3>
                </Grid>
                <DescriptionBox setEditorState={setEditorState} editorState={editorState}></DescriptionBox>
            </Grid>
        </React.Fragment>
    )
}

function getIngredientData(ingredients: Map<Number, IngredientType>): {}[] {
    let data: {}[] = []
    ingredients.forEach(ingredient => {
        if (ingredient.data.name && ingredient.data.quantity && ingredient.data.measurement) {
            data.push({
                name: ingredient.data.name,
                quantity: ingredient.data.quantity,
                measurement: ingredient.data.measurement
            })
        }
    })
    return data
}