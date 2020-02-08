import React from 'react' 

interface ImageProps {
    url: string
}

export function Image(props: ImageProps) {
    return (
        <img src={props.url} />
    )
}