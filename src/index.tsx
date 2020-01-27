import React from 'react'
import ReactDOM from 'react-dom'
import Header from "./components/Header/header"
import Main from './components/main'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { Divider, CssBaseline } from '@material-ui/core'

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#a6ffbf',
            main: '#6fff8e',
            dark: '#2fcb5f',
            contrastText: '#fff',
        },
    },
    typography: {
        fontSize: 10,
    },
})

var divStyle = {
    marginLeft: "30%",
    marginRight: "30%"
};

function App() {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline></CssBaseline>
            <Header></Header>
            <Main></Main>
            <div style={divStyle}>
                <Divider variant="middle"></Divider>
            </div>
        </MuiThemeProvider>
    )
}

ReactDOM.render(<App />, document.getElementById('root'))