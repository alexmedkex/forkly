import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export default function getStyle() {
    const props = {}

    return makeStyles((theme: Theme) => ({
        '@global': {
            '.editorImage': {
                padding: '1px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                maxWidth: '350px',
                height: 'auto',
            },
            'div.DraftEditor-root': {
                fontSize: '20px',
                fontFamily: 'Delius, cursive !important'
            }
        },
    }))(props)
}