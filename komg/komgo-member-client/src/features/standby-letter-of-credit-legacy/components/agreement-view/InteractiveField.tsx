import * as React from 'react'
import { scrollTo } from '../../utils/scrollTo'
import { SIZES } from '../../../../utils/media'

export interface InteractiveFieldProps {
  name: string
  fields: string[]
  htmlFor?: string
  activeClass?: string
  disabledClass?: string
  multiline?: boolean
  children: JSX.Element
}

export const InteractiveField: React.FC<InteractiveFieldProps> = ({
  name,
  children,
  fields,
  multiline = false,
  activeClass = 'template_link',
  disabledClass = 'template_disabled',
  htmlFor
}) => {
  // checking if children contain something like [[ Issuing Bank Address ]]
  const isPlaceholder = () => /\[\[.*\]\]/.test(children.props.children)
  // block is required only for multiline interactive fields e.g. overrideStandardTemplate
  const style = multiline ? { display: 'block' } : {}
  const id = `interactive_field_${name}`
  return fields.includes(name) ? (
    <label
      onClick={() => {
        scrollTo(htmlFor ? htmlFor : `#field_${name}`)
      }}
      htmlFor={htmlFor ? htmlFor : `field_${name}`}
      id={`preview_${name}`}
      className={activeClass}
      {...(multiline ? { style } : {})}
    >
      {React.cloneElement(children, {
        ['data-test-id']: id
      })}
    </label>
  ) : (
    React.cloneElement(children, {
      ...(isPlaceholder() ? { className: disabledClass } : {}),
      ['data-test-id']: id
    })
  )
}
