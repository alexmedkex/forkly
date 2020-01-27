import React from 'react'
import { getStyle } from "./main.style"
import AddRecipe from "./NewRecipe/addRecipe"
import Menu from './Menu/menu'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom'

function Main() {
    const classes = getStyle()

    return (
        <div className={classes.root}>
            <Router>
                <Menu></Menu>
                <Switch>
                    <Route exact path="/Main" render={() => <div>Home Page</div>} />
                    <Route path="/Recipe">
                        <AddRecipe></AddRecipe>
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}

export default Main