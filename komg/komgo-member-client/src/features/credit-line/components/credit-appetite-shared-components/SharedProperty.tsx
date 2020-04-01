import React, { Fragment } from 'react'
import styled from 'styled-components'
import { blueGrey } from '../../../../styles/colors'
import { SharedIcon } from './SharedIcon'
import { NotSharedIcon } from './NotSharedIcon'
import { toKebabCase } from '../../../../utils/casings'

export interface IProps {
  shared: boolean
  label: string
  value?: string
}

export default class SharedProperty extends React.Component<IProps> {
  renderInfo() {
    return (
      <span
        data-test-id={`${toKebabCase(this.props.label)}-label`}
        style={!this.props.shared ? { color: blueGrey } : {}}
      >
        {this.props.label}
        {this.props.value ? <span> - {this.props.value}</span> : null}
      </span>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.props.shared ? (
          <Fragment>
            <SharedIcon />
            {this.renderInfo()}
          </Fragment>
        ) : (
          <Fragment>
            <NotSharedIcon />
            {this.renderInfo()}
          </Fragment>
        )}
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  display: inline-block span {
    vertical-align: middle;
  }

  svg {
    margin-right: 10px;
    width: 14px;
    height: 14px;
    vertical-align: middle;
  }
`
