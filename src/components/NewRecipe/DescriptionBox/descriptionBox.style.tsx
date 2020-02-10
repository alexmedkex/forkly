import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export function getStyle() {
    const props = {}
    
    return makeStyles((theme: Theme) => ({
        textBox: {
            fontSize: '20px',
        }
    }))(props)
}