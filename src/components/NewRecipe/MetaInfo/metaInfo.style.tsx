import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export default function getStyle() {
    const props = {}

    return makeStyles((theme: Theme) => ({
        root: {
            textAlign: 'left',
            fontSize: '12px',
            margin: '10px 0',
        },
        textField: {
            '& input': {
                padding: '2px'
            },
            display: 'inline'
        },
        title: {
            '& input': {
                fontSize: '20px'
            },
            marginBottom: '10px'
        }
    }))(props)
}