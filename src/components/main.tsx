import React from 'react'
import { getStyle } from "./main.style"
import AddRecipe from "./NewRecipe/addRecipe"
import Menu from './Menu/menu'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom'
import { DisplayRecipe } from './DisplayRecipe/displayRecipe'

function Main() {
    const classes = getStyle()

    return (
        <div className={classes.root}>
            <Router>
                <Switch>
                    <Route exact path="/main" render={() => <div>Home Page</div>} />
                    <Route path="/recipes/new" component={AddRecipe} />
                    <Route path="/recipes" component={DisplayRecipe} />
                </Switch>
            </Router>
        </div>
    )
}

export default Main