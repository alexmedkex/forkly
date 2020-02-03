import React from 'react'
import ReactDOM from 'react-dom'
import Header from "./components/Header/header"
import Main from './components/main'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { Divider, CssBaseline } from '@material-ui/core'

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#00e676',
            contrastText: '#fff'
        },
        type: 'dark',
        background: {
            default: "#303030"
        }
    },
    typography: {
        fontSize: 10,
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