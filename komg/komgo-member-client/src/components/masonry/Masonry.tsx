import React, { Component, createRef, ReactNode, RefObject } from 'react'
import styled from 'styled-components'
import { grey } from '../../styles/colors'

interface IStyledGrid {
  colWidth: number
  gap: number
}
const StyledGrid =
  styled.div <
  IStyledGrid >
  `
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${props => props.colWidth}px, 1fr));
  grid-gap: ${props => props.gap}px;
  grid-auto-rows: 0;
`

interface IStyledGridItem {
  span: number
}
export const StyledGridItem =
  styled.div <
  IStyledGridItem >
  `
  grid-row-end: span ${props => props.span};
  border: 1px solid ${grey};
  border-radius: 3px;
`

export interface MasonryProps {
  gap: number
  colWidth: number
  children: ReactNode[]
}
export interface MasonryState {
  spans: number[]
}

export default class Masonry extends Component<MasonryProps, MasonryState> {
  ref: RefObject<any>
  constructor(props: MasonryProps) {
    super(props)
    this.state = {
      spans: []
    }
    this.ref = createRef()
  }

  computeSpans = () => {
    const { gap } = this.props
    const spans: number[] = []
    Array.from(this.ref.current.children).forEach((child: HTMLElement) => {
      const childHeight: number = Array.from(child.children).reduce(
        (acc: number, node: HTMLElement) => acc + node.scrollHeight,
        gap
      )
      const span: number = Math.ceil(childHeight / gap)
      spans.push(span + 1)
    })
    this.setState({ spans })
  }

  componentDidMount() {
    this.computeSpans()
  }

  render() {
    const { children, colWidth, gap } = this.props
    const { spans } = this.state
    return (
      <StyledGrid innerRef={this.ref} colWidth={colWidth} gap={gap}>
        {children.map((child, i) => (
          <StyledGridItem key={i} span={spans[i]}>
            {child}
          </StyledGridItem>
        ))}
      </StyledGrid>
    )
  }
}
