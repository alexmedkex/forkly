export enum FragmentType {
    IMAGE = 'image',
    TEXT = 'text'
}

export interface ImageFragmentData extends FragmentData {
    name: string,
}

export interface TextFragmentData extends FragmentData {

}

export interface FragmentData {
    content: string
}

export interface Fragment {
    type: FragmentType,
    data: ImageFragmentData | TextFragmentData
}