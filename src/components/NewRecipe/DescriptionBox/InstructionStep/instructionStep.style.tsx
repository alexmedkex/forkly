import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export function getStyle() {
    const props = {}

    return makeStyles((theme: Theme) => ({
        root: {
            fontSize: '20px',
            paddingLeft: '20px'
        },
        textField: {
            padding: '2px',
            fontSize: '20px'
        },
    }))(props)
}