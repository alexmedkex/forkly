import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import { darken } from '@material-ui/core/styles/colorManipulator'

export function getStyle() {
    const props = {}
    const fadeValue = 0.3

    return makeStyles((theme: Theme) => ({
        textBox: {
            fontSize: '20px'
            // backgroundColor: darken(theme.palette.background.default, 0.1)
        },
        buttons: {
            transform: 'translate(-510px, 85px)',
            margin: '-30px',
            opacity: fadeValue,
            animation: `$fadeOut 700ms ${theme.transitions.easing.easeInOut}`,
            "&:hover": {
                opacity: 1,
                animation: `$fadeIn 700ms ${theme.transitions.easing.easeInOut}`,
            },
        },
        "@keyframes fadeIn": {
            "0%": {
                opacity: fadeValue,
            },
            "100%": {
                opacity: 1,
            }
        },
        "@keyframes fadeOut": {
            "0%": {
                opacity: 1,
            },
            "100%": {
                opacity: fadeValue,
            }
        },
    }))(props)
}