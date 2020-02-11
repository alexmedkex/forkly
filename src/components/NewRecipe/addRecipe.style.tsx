import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export default function getStyle() {
    const props = {}

    return makeStyles((theme: Theme) => ({
        container: {
            maxWidth: 500,
            margin: "0 auto",
            fontSize: 12,
            border: `1px solid ${theme.palette.secondary.main}`,
            borderRadius: '12px',
            padding: '20px'
        },
        button: {
            fontSize: '12px'
        },
        header: {
            fontSize: '20px'
        }
    }))(props)
}