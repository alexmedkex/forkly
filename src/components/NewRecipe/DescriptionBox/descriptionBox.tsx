import React, { Dispatch, SetStateAction } from 'react'
import { Grid, InputBase } from '@material-ui/core'
import { getStyle } from './descriptionBox.style'
import { List } from 'immutable'
import { UploadImage } from './UploadImage/uploadImage'
import { Image } from './Image/image'
import { Fragment, FragmentType } from '../types'

interface DescriptionBoxProps {
    setFragments: Dispatch<SetStateAction<List<Fragment>>>,
    fragments: List<Fragment>
}

export function DescriptionBox(props: DescriptionBoxProps) {
    const classes = getStyle()
    const fragmentElements = getFragmentElements(props.fragments)

    function updateInputField(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const id = e.target.id
        const value = e.target.value

        props.setFragments(fragments => {
            return fragments.map(fragment => {
                if(fragment.element.key == id) {
                    const newFragment = {
                        ...fragment
                    }
                    newFragment.fragmentInfo.data.content = value
                    return newFragment
                }
                return fragment
            })
        })
    }

    function addImageFragment(url: string, fileName: string, data: string) {
        const inputKey = url+'input'
        const image = <Image key={url} url={url} />
        const input = <InputBase onChange={updateInputField} key={inputKey} id={inputKey} style={{ fontSize: '20px' }} multiline />

        const imageFragment: Fragment = {
            element: image,
            fragmentInfo: {
                type: FragmentType.IMAGE,
                data: {
                    name: fileName,
                    content: data
                }
            }
        }
        const inputFragment: Fragment = {
            element: input,
            fragmentInfo: {
                type: FragmentType.TEXT,
                data: {
                    content: ''
                }
            }
        }

        props.setFragments(fragments => fragments.push(imageFragment).push(inputFragment))
    }

    return (
        <div>
            <UploadImage onUpload={addImageFragment}></UploadImage>
            <Grid item xs={12}>
                <InputBase
                    className={classes.textBox}
                    multiline
                    placeholder="Describe your recipe..."
                />
            </Grid>
            {fragmentElements}
        </div>
    )
}

function getFragmentElements(fragments: List<Fragment>): List<JSX.Element> {
    let elements = List<JSX.Element>()
    fragments.forEach(fragment => {
        elements = elements.push(fragment.element)
    })
    return elements
}