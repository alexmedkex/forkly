import React from 'react'
import ReactDOM from 'react-dom'
import Header from "./components/Header/header"
import Main from './components/main'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { CssBaseline } from '@material-ui/core'

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#17EF5C',
            contrastText: '#fff',
            light: '#73628A'

        },
        secondary: {
            main: '#37718E',
            contrastText: '#fff'
        },
        type: 'dark',
        background: {
            default: "#494947"
        }
    },
    typography: {
        fontSize: 12,
        fontFamily: 'Delius, Cursive'
    }
})

function App() {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline></CssBaseline>
            <Header></Header>
            <Main></Main>
        </MuiThemeProvider>
    )
}

ReactDOM.render(<App />, document.getElementById('root'))