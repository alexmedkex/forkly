import React from 'react'
import { getStyle } from './image.style'
import { Grid, IconButton } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

interface ImageProps {
    url: string,
    removeImage: (url: string) => void
}

export function Image(props: ImageProps) {
    const classes = getStyle()

    function remove() {
        props.removeImage(props.url)
    }

    return (
        <Grid className={classes.gridItem} item xs={12}>
            <div>
                <IconButton onClick={remove} className={classes.deleteButton}>
                    <DeleteIcon />
                </IconButton>
                <img className={classes.image} src={props.url} />
            </div>
        </Grid>
    )
}