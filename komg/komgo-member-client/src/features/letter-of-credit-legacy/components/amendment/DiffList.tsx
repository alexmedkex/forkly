import * as React from 'react'
import { Checkbox, List } from 'semantic-ui-react'
import { displayValue } from '../../../trades/utils/displaySelectors'
import { dotNotationToTitleize, diffToDotNotation } from '../../../../utils/casings'
import { green, charcoalGrey } from '../../../../styles/colors'
import { IDiff } from '@komgo/types'

interface IProps<T> {
  name: string
  options: IDiff[]
  values?: IDiff[]
  onChange?: (name, value: any) => any
  onBlur?: (name, value: any) => any
}

interface IState<T> {
  values: IDiff[]
}

interface DiffProps<T> {
  diff: IDiff
  checked: boolean
  onChange: (e, target, diff: IDiff) => any
}

const ItemStyle = { padding: '5px 0 0 0' }
const ListStyle = { margin: '0px 0px 10px 30px', padding: 0 }
const ListDescription = { padding: 0, fontSize: '0.9em' }

// TODO LS it should be DiffProps<ITrade>
export const DiffView: React.FC<DiffProps<any>> = ({ diff, checked, onChange }) => {
  const prop = `${diffToDotNotation(diff.path)}`

  return (
    <div key={prop}>
      <Checkbox
        label={dotNotationToTitleize(prop)}
        as="strong"
        name={prop}
        checked={checked}
        style={{ margin: 0 }}
        onClick={onChange.bind(undefined, diff)}
      />
      <List style={ListStyle}>
        <List.Item style={ItemStyle}>
          <List.Content>
            <List.Description style={ListDescription} data-test-id={`${diff.type}${diff.path}-current`}>
              Current Value:<span style={{ color: charcoalGrey, whiteSpace: 'pre' }}>
                {' '}
                {displayValue(diff.oldValue, prop)}
              </span>
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item style={ItemStyle}>
          <List.Content>
            <List.Description style={ListDescription} data-test-id={`${diff.type}${diff.path}-new`}>
              New Value:<span style={{ color: green, whiteSpace: 'pre' }}> {displayValue(diff.value, prop)}</span>
            </List.Description>
          </List.Content>
        </List.Item>
      </List>
    </div>
  )
}

export class DiffList<T> extends React.Component<IProps<T>, IState<T>> {
  static defaultProps = {
    values: []
  }

  constructor(props) {
    super(props)
    this.state = {
      values: props.values
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange(diff, event, target) {
    event.preventDefault()
    event.stopPropagation()

    this.setState((state, props) => {
      const [diff] = props.options.filter(d => diffToDotNotation(d.path) === target.name)
      const values = state.values.filter(d => diffToDotNotation(d.path) !== target.name)
      return {
        values: target.checked ? [...values, diff] : values
      }
    }, () => this.props.onChange && this.props.onChange(this.props.name, this.state.values))
  }
  render() {
    return this.props.options.map(diff => (
      <DiffView
        key={`${diff.type}::${diff.path}`}
        diff={diff}
        checked={this.state.values.some(value => value.path === diff.path && value.type === diff.type)}
        onChange={this.onChange}
      />
    ))
  }
}
