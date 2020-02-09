import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Grid } from '@material-ui/core'
import { getStyle } from './displayRecipe.style'
import { FragmentInfo } from '../NewRecipe/types'

interface DisplayRecipeProps {
    location: {
        pathname: string
    }
}

export function DisplayRecipe(props: DisplayRecipeProps) {
    const classes = getStyle()
    const id = props.location.pathname.split('/').pop()
    const [recipe, setRecipe] = useState()

    useEffect(() => {
        getRecipe(id).then(result => {
            console.log(result)
            setRecipe(result.data)
        })
    }, [id])

    if (!recipe) {
        return <React.Fragment />
    }

    let ingredients: JSX.Element[] = []
    recipe.ingredients.forEach((ingredient: any) => {
        ingredients.push(<div>{ingredient.name}, {ingredient.quantity}, {ingredient.measurement}</div>)
    })

    let fragments: JSX.Element[] = []
    recipe.description.forEach((fragment: FragmentInfo) => {
        switch (fragment.type) {
            case 'image':
                fragments.push(
                    <img src={fragment.data.content} />
                )
                break
            case 'text':
                fragments.push(
                    <p>{fragment.data.content}</p>
                )
        }
    })

    return (
        <React.Fragment>
            <Grid className={classes.container} container>
                <Grid item xs={12}>
                    <div>
                        {recipe.title}
                    </div>
                    <div>
                        Cooking time: {recipe.cookingTime}
                    </div>
                    <div>
                        Cuisine: {recipe.cuisine}
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <h3>Ingredients</h3>
                    {ingredients}
                </Grid>
                <Grid item xs={12}>
                    <h3>Description</h3>
                    {fragments}
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