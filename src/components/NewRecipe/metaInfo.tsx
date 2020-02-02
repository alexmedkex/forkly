import React from 'react'
import { TextField, Grid } from '@material-ui/core'
import getStyle from './metaInfo.style'

export function MetaInfo() {
    const classes = getStyle()

    return (
        <React.Fragment>
            <Grid className={classes.root} item xs={12}>
                <div>
                    Cooking time: <TextField className={classes.textField}></TextField>
                </div>
                <div>
                    Cuisine: <TextField className={classes.textField}></TextField>
                </div>
            </Grid>
        </React.Fragment>
    )
}