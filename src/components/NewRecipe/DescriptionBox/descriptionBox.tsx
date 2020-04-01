import React, { Dispatch } from 'react'
import { Grid } from '@material-ui/core'
import getStyle from './descriptionBox.style'
import Editor from 'draft-js-plugins-editor'
import { EditorState } from 'draft-js'
import 'draft-js/dist/Draft.css'
import createImagePlugin from 'draft-js-image-plugin'
import 'draft-js-image-plugin/lib/plugin.css'
import { UploadImage } from './UploadImage/uploadImage'

interface DescriptionBoxProps {
    editorState: EditorState,
    setEditorState: Dispatch<React.SetStateAction<EditorState>>
}



export function DescriptionBox(props: DescriptionBoxProps) {
    const classes = getStyle()

    const imagePlugin = createImagePlugin({
        theme: {
            image: 'editorImage'
        }
    })

    return (
        <React.Fragment>
            <Grid item xs={12}>
                <UploadImage editorState={props.editorState} setEditorState={props.setEditorState} modifier={imagePlugin.addImage} />
                <Editor
                    editorState={props.editorState}
                    onChange={props.setEditorState}
                    plugins={[imagePlugin]}
                    placeholder='Write your recipe...'
                />
            </Grid>
        </React.Fragment>
    )
}