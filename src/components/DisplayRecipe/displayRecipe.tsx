import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Grid, InputBase, TextField } from '@material-ui/core'

interface DisplayRecipeProps {
    location: {
        pathname: string
    }
}

export function DisplayRecipe(props: DisplayRecipeProps) {
    const id = props.location.pathname.split('/').pop()

    const [recipe, setRecipe] = useState()

    useEffect(() => {
        getRecipe(id).then(result => {
            setRecipe(result.data)
        })
    }, [id])

    if(!recipe) {
        return <React.Fragment />
    }

    return (
        <React.Fragment>
            <Grid item xs={12}>
                <div>
                    <InputBase disabled>{recipe.title}</InputBase>
                </div>
                <div>
                    Cooking time: <TextField disabled>{recipe.cookingTime}</TextField>
                </div>
                <div>
                    Cuisine: <TextField disabled>{recipe.cuisine}</TextField>
                </div>
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