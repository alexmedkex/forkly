import React, { useState } from 'react'
import { Grid, InputBase } from '@material-ui/core'
import { getStyle } from './descriptionBox.style'
import { List } from 'immutable'
import { UploadImage } from './UploadImage/uploadImage'
import { Image } from './Image/image'
import { Fragment, FragmentType } from '../types'

interface DescriptionBoxProps {
    addFragmentInfo: (fragment: Fragment) => void
}

export function DescriptionBox(props: DescriptionBoxProps) {
    const classes = getStyle()
    const [fragments, setFragments] = useState(List<JSX.Element>())

    function addFragment(url: string, fileName: string, data: string) {
        setFragments(fragments => fragments
            .push(
                <Image
                    key={url}
                    url={url}
                />
            )
            .push(
                <InputBase
                    key={fragments.hashCode()}
                    style={{ fontSize: '20px' }}
                    multiline
                />
            )
        )

        props.addFragmentInfo({
            type: FragmentType.IMAGE,
            data: {
                name: fileName,
                content: data
            }
        })

        props.addFragmentInfo({
            type: FragmentType.TEXT,
            data: {
                content: data
            }
        })
    }

    return (
        <React.Fragment>
            <UploadImage onUpload={addFragment}></UploadImage>
            <Grid item xs={12}>
                <InputBase
                    className={classes.textBox}
                    multiline
                    placeholder="Describe your recipe..."
                />
            </Grid>
            {fragments}
        </React.Fragment>
    )
}