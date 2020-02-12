import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export function getStyle() {
    const props = {}
    
    return makeStyles((theme: Theme) => ({
        textBox: {
            fontSize: '20px',
        },
        toolbar: {
            backgroundColor: theme.palette.background.default,
            border: '0',
            '& .rdw-option-wrapper': {
                background: theme.palette.background.default,
                border: 'none'
            }
        }
    }))(props)
}