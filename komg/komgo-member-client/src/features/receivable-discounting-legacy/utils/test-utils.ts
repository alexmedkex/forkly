import { fireEvent } from '@testing-library/react'

export function changeFormikField(el: HTMLInputElement, value: number | string) {
  fireEvent.change(el, { target: { value } })
  fireEvent.blur(el)
}
