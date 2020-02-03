import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export default function getStyle(enabled: boolean) {
    const props = {}

    return makeStyles((theme: Theme) => ({
        textField: {
            animation: enabled ? null : `$fadeIn 1000ms ${theme.transitions.easing.easeInOut}`,
            opacity: enabled ? 1 : 0.2
        },
        "@keyframes fadeIn": {
            "0%": {
                opacity: 0,
            },
            "100%": {
                opacity: 0.2,
            }
        },
    }))(props)
}