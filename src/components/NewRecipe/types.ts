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

export interface FragmentInfo {
    type: FragmentType,
    data: ImageFragmentData | TextFragmentData
}

export interface Fragment {
    element: JSX.Element,
    fragmentInfo: FragmentInfo
}

export interface RecipeMetaInfo {
    title: string,
    cookingTime: string,
    cuisine: string
}

export interface IngredientType {
    element: JSX.Element,
    data: {
        name: string,
        quantity: string,
        measurement: string
    }
}