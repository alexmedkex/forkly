import React, { Dispatch, SetStateAction, useState } from 'react'
import { Grid, InputBase, Button } from '@material-ui/core'
import { getStyle } from './descriptionBox.style'
import { List } from 'immutable'
import { Image } from './Image/image'
import { Fragment, FragmentType } from '../types'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState } from 'draft-js'
import ImageIcon from '@material-ui/icons/Image'
import image from '../../../../assets/img.png'

interface DescriptionBoxProps {
    setFragments: Dispatch<SetStateAction<List<Fragment>>>,
    fragments: List<Fragment>
}

export function DescriptionBox(props: DescriptionBoxProps) {
    const classes = getStyle()
    const fragmentElements = getFragmentElements(props.fragments)
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    function updateInputField(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const id = e.target.id
        const value = e.target.value

        props.setFragments(fragments => {
            return fragments.map(fragment => {
                if (fragment.element.key == id) {
                    const newFragment = {
                        ...fragment
                    }
                    newFragment.fragmentInfo.data.content = value
                    return newFragment
                }
                return fragment
            }).toList()
        })
    }

    function addImageFragment(url: string, fileName: string, data: string) {
        const inputKey = url + 'input'
        const image = <Image key={url} url={url} removeImage={removeImageFragment} />
        const input = <InputBase onChange={updateInputField} key={inputKey} id={inputKey} style={{ fontSize: '20px' }} multiline fullWidth />

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

    function removeImageFragment(url: string) {
        props.setFragments(fragments => fragments.filter(fragment => {
            if (
                fragment.fragmentInfo.type === 'image' &&
                fragment.element.props.url === url
            ) {
                return false
            }
            return true
        }).toList())
    }

    function onEditorStateChange(editorState: any) {
        setEditorState(editorState)
    };


    return (
        <React.Fragment>
            <Grid item xs={12}>
                <Editor
                    editorState={editorState}
                    toolbarClassName={classes.toolbar}
                    onEditorStateChange={onEditorStateChange}
                    toolbar={{
                        options: ['list', 'emoji', 'image'],
                    }}
                    placeholder="Describe your recipe..."
                />
            </Grid>
            {fragmentElements}
        </React.Fragment>
    )
}

function getFragmentElements(fragments: List<Fragment>): List<JSX.Element> {
    let elements = List<JSX.Element>()
    fragments.forEach(fragment => {
        elements = elements.push(fragment.element)
    })
    return elements
}