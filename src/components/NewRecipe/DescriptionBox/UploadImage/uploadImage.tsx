import React from 'react'
import { ButtonGroup, Button } from '@material-ui/core'
import PhotoCamera from '@material-ui/icons/PhotoCamera'
import { getStyle } from './uploadImage.style'

interface UploadImageProps {
    onUpload: (url: string, fileName: string, data: string) => void
}

export function UploadImage(props: UploadImageProps) {
    const classes = getStyle()

    function handleChange(event: any) {
        if (!event.target.files[0]) return

        const file = event.target.files[0]
        const reader = new FileReader()

        reader.onload = function (e) {
            props.onUpload(URL.createObjectURL(file), file.name, e.target.result as string)
        }
        reader.readAsDataURL(file)
    }

    return (
        <ButtonGroup className={classes.buttons} orientation="vertical">
            <input style={{ display: 'none' }} accept="image/*" id="icon-button-file" type="file" onChange={handleChange} />
            <label htmlFor="icon-button-file">
                <Button color="primary" component="span">
                    <PhotoCamera />
                </Button>
            </label>
        </ButtonGroup>
    )
}