import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Grid } from '@material-ui/core'
import { getStyle } from './displayRecipe.style'
import { EditorState, convertFromRaw } from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createImagePlugin from 'draft-js-image-plugin'
import getDescriptionStyle from '../NewRecipe/DescriptionBox/descriptionBox.style'
import getMetaInfoStyle from '../NewRecipe/MetaInfo/metaInfo.style'

interface DisplayRecipeProps {
    location: {
        pathname: string
    }
}

export function DisplayRecipe(props: DisplayRecipeProps) {
    const classes = getStyle()
    const metaInfoClasses = getMetaInfoStyle()
    getDescriptionStyle()

    const id = props.location.pathname.split('/').pop()
    const [recipe, setRecipe] = useState()
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    const imagePlugin = createImagePlugin({
        theme: {
            image: 'editorImage'
        }
    })

    useEffect(() => {
        getRecipe(id).then(result => {
            console.log(result)
            setRecipe(result.data)
            setEditorState(EditorState.createWithContent(convertFromRaw(result.data.description)))
        })
    }, [id])

    if (!recipe) {
        return <React.Fragment />
    }


    console.log(recipe)

    const ingredients = generateIngredientElements(recipe.ingredients)

    return (
        <React.Fragment>
            <Grid className={classes.container} container>
                <Grid item xs={12}>
                    <div className={metaInfoClasses.title}>
                        {recipe.title}
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div className={metaInfoClasses.textField}>
                        Cooking time: {recipe.cookingTime}
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <div className={metaInfoClasses.textField}>
                        Cuisine: {recipe.cuisine}
                    </div>
                </Grid>

                <Grid item xs={12}>
                    <h3>Ingredients</h3>
                    {ingredients}
                </Grid>
                <Grid item xs={12}>
                    <h3>Description</h3>
                    <Editor
                        readOnly
                        editorState={editorState}
                        onChange={setEditorState}
                        plugins={[imagePlugin]}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

function getRecipe(id: string): Promise<any> {
    const instance = axios.create({
        baseURL: `http://localhost:3000/`,
        timeout: 5000
    })
    return instance.get(`recipes/${id}`)
}

function generateIngredientElements(ingredients: any[]) {
    let elements: JSX.Element[] = []
    ingredients.forEach(ingredient => {
        elements.push(
            <Grid item xs={12}>
                <div>{ingredient.name} {ingredient.quantity} {ingredient.measurement}</div>
            </Grid>
        )
    })
    return elements
}