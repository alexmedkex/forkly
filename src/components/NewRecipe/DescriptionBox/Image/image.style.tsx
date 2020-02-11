import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'

export function getStyle() {
    const fadeValue = 0.7

    return makeStyles((theme: Theme) => ({
        gridItem: {
            textAlign: 'center',
        },
        deleteButton: {
            position: 'absolute',
            zIndex: 2,
        },
        image: {
            padding: '1px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            maxWidth: '350px',
            height: 'auto',
            animation: `$fadeIn 500ms ${theme.transitions.easing.easeInOut}`,
            "&:hover": {
                opacity: fadeValue,
                animation: `$fadeOut 500ms ${theme.transitions.easing.easeInOut}`,
            }
        },
        "@keyframes fadeIn": {
            "0%": {
                opacity: fadeValue,
            },
        },
        "100%": {
            opacity: 1,
        },
        "@keyframes fadeOut": {
            "0%": {
                opacity: 1,
            },
            "100%": {
                opacity: fadeValue,
            }
        }
    }))()
}