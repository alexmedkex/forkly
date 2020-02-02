import { makeStyles } from '@material-ui/styles'

export const getStyle = () => {
    const props = {}

    return makeStyles(theme => ({
        root: {
            padding: 10
        },
        container: {
            justifyContent: "center",
            marginBottom: 40,
            maxWidth: 800,
            marginLeft: "auto",
            marginRight: "auto"
        },
        item: {
            width: "20%",
            minWidth: "300px"
        },
        textArea: {
            maxWidth: 700,
            textAlign: 'center',
            display: 'inline-block',
            marginBottom: 40
        },
        text: {
            fontSize: 40,
            fontWeight: 'bold',
            display: 'inline-block'
        }
    }))(props)
}