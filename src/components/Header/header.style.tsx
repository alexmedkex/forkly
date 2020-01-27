import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core/styles'

export const getStyle = () => {
    const props = {}

    return makeStyles((theme: Theme) => ({
        header: {
            backgroundColor: theme.palette.primary.main,
            height: 400,
            fontSize: '40px',
            padding: '5%',
            margin: '0px',
            color: 'white',
            textAlign: 'center',
        },
        textArea: {
            fontWeight: 'bold',
            color: 'white',
            zIndex: 2,
            
            fontStyle: 'italic',
            maxWidth: '400px',
            textAlign: 'center',
            justifyContent: 'center',
        }
    }))(props)
}