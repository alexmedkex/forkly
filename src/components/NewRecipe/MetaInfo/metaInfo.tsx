import React, { Dispatch, SetStateAction } from 'react'
import { TextField, Grid, InputBase } from '@material-ui/core'
import getStyle from './metaInfo.style'
import { RecipeMetaInfo } from '../types'

interface MetaInfoProps {
    setMetaInfo: Dispatch<SetStateAction<RecipeMetaInfo>>
}

export function MetaInfo(props: MetaInfoProps) {
    const classes = getStyle()

    function updateInfo(value: {}) {
        props.setMetaInfo(metaInfo => {
            return {
                ...metaInfo,
                ...value
            }
        })
    }

    function updateTitle(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = e.target.value
        updateInfo({
            title: value
        })
    }

    function updateCookingTime(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = e.target.value
        updateInfo({
            cookingTime: value
        })
    }

    function updateCuisine(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = e.target.value
        updateInfo({
            cuisine: value
        })
    }

    return (
        <React.Fragment>
            <Grid className={classes.root} item xs={12}>
                <div>
                    <InputBase onChange={updateTitle} placeholder='Title' className={classes.title}></InputBase>
                </div>
                <div>
                    Cooking time: <TextField onChange={updateCookingTime} className={classes.textField}></TextField>
                </div>
                <div>
                    Cuisine: <TextField onChange={updateCuisine} className={classes.textField}></TextField>
                </div>
            </Grid>
        </React.Fragment>
    )
}