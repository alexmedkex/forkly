import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export default function getStyle() {
    const props = {}

    return makeStyles((theme: Theme) => ({
        container: {
            maxWidth: 500,
            margin: "0 auto"
        },
        addButton: {
            display: "flex"
        }
    }))(props)
}