import { makeStyles } from '@material-ui/styles'
import { Theme, fade } from '@material-ui/core/styles'

export const getStyle = () => {
    const props = {}

    return makeStyles((theme: Theme) => ({
        header: {
            backgroundColor: theme.palette.primary.main,
            height: 70,
            fontSize: '15px',
            margin: '0px',
            marginBottom: '20px',
            padding: '10px',
            color: 'white',
            textAlign: 'left',
            borderBottom: `3px solid ${theme.palette.primary.light}`
        },
        textArea: {
            fontFamily: 'Delius, cursive',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            maxWidth: '400px',
        },
        container: {
            maxWidth: '300px'
        },
        button: {
            marginTop: '8px',
            fontSize: '12px'
        }
    }))(props)
}