import React from 'react'
import { getStyle } from "./main.style"
import AddRecipe from "./NewRecipe/addRecipe";
import Menu from './Menu/menu';

function Main() {
    const classes = getStyle()

    return (
        <div className={classes.root}>
            <Menu></Menu>
            <AddRecipe></AddRecipe>
        </div>
    )
}

export default Main