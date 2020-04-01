import * as React from 'react'
import {
  Form,
  Input,
  Grid,
  Select,
  Header,
  Button,
  Modal,
  Confirm,
  Container,
  Dropdown,
  Accordion,
  Icon,
  Search,
  Table,
  Checkbox,
  Radio,
  Divider,
  List,
  Progress,
  Label,
  Popup,
  Menu,
  SemanticCOLORS,
  Breadcrumb,
  Pagination,
  Tab
} from 'semantic-ui-react'
import SimpleButton from '../components/buttons/SimpleButton'

const tableData = [
  { name: 'John', age: 15, gender: 'Male' },
  { name: 'Amber', age: 40, gender: 'Female' },
  { name: 'Leslie', age: 25, gender: 'Female' },
  { name: 'Ben', age: 70, gender: 'Male' }
]

const colors: SemanticCOLORS[] = [
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
  'grey',
  'black'
]

const opt = {
  key: 'today',
  text: 'today',
  value: 'today',
  content: 'Today'
}

const options2 = [opt]

const panes = [
  { menuItem: 'Tab 1', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
  { menuItem: 'Tab 2', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
  { menuItem: 'Tab 3', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> }
]

interface State {
  confirm1: boolean
  confirm2: boolean
  modal1: boolean
  activeIndex: any
  checkbox1: boolean
  checkbox2: boolean
  radio1: boolean
  radio2: boolean
  menuOpen: string
}

class SemanticComponents extends React.Component<{}, State> {
  options = [{ key: 'm', text: 'Male', value: 'male' }, { key: 'f', text: 'Female', value: 'female' }]

  constructor(props: {}) {
    super(props)
    this.state = {
      modal1: false,
      confirm1: false,
      confirm2: false,
      activeIndex: null,
      checkbox1: false,
      checkbox2: false,
      radio1: false,
      radio2: false,
      menuOpen: ''
    }
  }

  render() {
    const { activeIndex, checkbox1, checkbox2, radio1, radio2, menuOpen } = this.state
    return (
      <Container>
        <Grid divided="vertically">
          <Grid.Row columns={2}>
            <Grid.Column>
              <Header as="h1">Forms - Input</Header>

              <Form error={true}>
                <Form.Input label="Field name" type="text" />
                <Form.Input label="Field name" type="text" placeholder="Field placeholder" />
                <Form.Input label="Field name" type="text" value="test@test.com" />
                <Form.Input label="Field name" type="text" disabled={true} value="Test" />
                <Form.Input label="Field name" type="text" error={true} />
                <br />
                <br />
                <br />

                <Header as="h1">Forms - Input Group</Header>

                <Form.Group widths="equal">
                  <Form.Input fluid={true} label="First name" placeholder="First name" value="Stefan" />
                  <Form.Input fluid={true} label="Last name" placeholder="Last name" value="Bankovic" />
                </Form.Group>
                <Form.Input label="Email" type="text" placeholder="Enter email" value="test@test.com" />
                <br />
                <br />
                <br />

                <Header as="h1">Forms - Select</Header>
                <Form.Field control={Select} label="Gender" options={this.options} placeholder="Gender" />
                <Form.Field
                  control={Select}
                  label="Gender"
                  options={this.options}
                  placeholder="Gender"
                  disabled={true}
                />
                <br />
                <br />
                <br />
              </Form>

              <Header as="h1">Basic Inputs - Without Form</Header>

              <p>Search component</p>
              <div style={{ marginBottom: '20px' }}>
                <Search
                  onSearchChange={() => {
                    console.info('ok')
                  }}
                  placeholder="Search placeholder"
                  open={false}
                  input={{ icon: 'search', iconPosition: 'left' }}
                />
              </div>

              <p>Basic input</p>
              <div style={{ marginBottom: '20px' }}>
                <Input placeholder="test" />
              </div>

              <p>Search component with button</p>
              <div style={{ marginBottom: '20px' }}>
                <Search
                  onSearchChange={() => {
                    console.info('ok')
                  }}
                  placeholder="Search placeholder"
                  open={false}
                  input={{ icon: 'search', iconPosition: 'left' }}
                  style={{ display: 'inline-block', marginRight: '5px' }}
                />
                <Button primary={true}>Button</Button>
              </div>

              <Header as="h1">Form Components - Checkbox and Radio</Header>

              <Form>
                <Form.Checkbox
                  label="I agree"
                  checked={checkbox1}
                  onChange={() => {
                    this.setState({ checkbox1: !checkbox1 })
                  }}
                />
                <Form.Checkbox
                  label="I agree"
                  indeterminate={true}
                  checked={checkbox2}
                  onChange={() => {
                    this.setState({ checkbox2: !checkbox2 })
                  }}
                />
                <Form.Checkbox label="I agree" />
                <Form.Checkbox label="I agree" checked={true} disabled={true} />
                <Form.Checkbox label="I agree" indeterminate={true} checked={true} disabled={true} />
                <Form.Checkbox label="I agree" disabled={true} />

                <Form.Radio
                  label="Small"
                  checked={radio1}
                  onChange={() => {
                    this.setState({ radio1: !radio1 })
                  }}
                />
                <Form.Radio label="Small" />
                <Form.Radio label="Small" checked={true} disabled={true} />
                <Form.Radio label="Small" disabled={true} />

                <Divider />
                <Checkbox
                  label="I agree"
                  checked={checkbox1}
                  onChange={() => {
                    this.setState({ checkbox1: !checkbox1 })
                  }}
                />
                <Radio
                  label="Small"
                  checked={radio1}
                  onChange={() => {
                    this.setState({ radio1: !radio1 })
                  }}
                />
              </Form>
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: '200px' }}>
              <Header as="h1">Headers</Header>

              <h1>Lorem ipsum - H1</h1>
              <Header size="huge">Lorem ipsum - H1</Header>
              <Header as="h1">Lorem ipsum - H1</Header>
              <h2>Lorem ipsum - H2</h2>
              <Header size="large">Lorem ipsum - H2</Header>
              <Header as="h2">Lorem ipsum - H2</Header>
              <h3>Lorem ipsum - H3</h3>
              <Header size="medium">Lorem ipsum - H3</Header>
              <Header as="h3">Lorem ipsum - H3</Header>
              <h4>Lorem ipsum - H4</h4>
              <h5>Lorem ipsum - H5</h5>
              <Header size="tiny"> Lorem ipsum - H5</Header>
              <h6>Lorem ipsum - H6</h6>

              <Header as="h1">Links</Header>

              <div style={{ marginBottom: '20px' }}>
                <a href="/test">Regular - Link</a>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <a href="/test2">
                  <b>Bold - Link</b>
                </a>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <a href="/" className="secondary">
                  Link
                </a>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <a href="/" className="secondary">
                  <b>Link</b>
                </a>
              </div>

              <Header as="h1">Text</Header>

              <div>
                <p>Lorem ipshupm - P</p>
              </div>
              <div>
                <b>Lorem ipsum - B</b>
              </div>
              <div>
                <span>Lorem ipshupm - Span</span>
              </div>
              <div>
                <small>Lorem ipshupm - small</small>
              </div>
              <div>
                <p className="error"> Lorem ipshupm - P</p>
              </div>
              <div>
                <p className="grey"> Lorem ipshupm - P</p>
              </div>
              <div>
                <p className="disabled"> Lorem ipshupm - P</p>
              </div>
              <div>
                <p className="double-space"> Lorem ipshupm - P</p>
              </div>
            </Grid.Column>

            <Grid.Column>
              <Header as="h1">Buttons</Header>

              <p>Default button</p>
              <div style={{ marginBottom: '20px' }}>
                <Button>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button active={true}>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button disabled={true}>Button</Button>
              </div>

              <p>Small button</p>
              <div style={{ marginBottom: '20px' }}>
                <Button size="small">Button</Button>
              </div>

              <p>Primary button</p>
              <div style={{ marginBottom: '20px' }}>
                <Button primary={true}>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button primary={true}>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button primary={true} active={true}>
                  Button
                </Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button primary={true} disabled={true}>
                  Button
                </Button>
              </div>

              <p>Negative button</p>
              <div style={{ marginBottom: '20px' }}>
                <Button negative={true}>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button negative={true}>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button negative={true}>Button</Button>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <Button disabled={true} negative={true}>
                  Button
                </Button>
              </div>

              <p>Group button</p>
              <div style={{ marginBottom: '20px' }}>
                <Button.Group>
                  <Button>One</Button>
                  <Button>Two</Button>
                  <Button>Three</Button>
                </Button.Group>
              </div>

              <p>Simple button</p>
              <SimpleButton>Simple button</SimpleButton>
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: '200px' }}>
              <Header as="h1">Modals</Header>

              <div style={{ marginBottom: '20px' }}>
                <p>default: ordinary, toggle:size="large"</p>
                <Button
                  onClick={() => {
                    this.setState({ modal1: true })
                  }}
                >
                  Modal1
                </Button>
                <Modal
                  dimmer={true}
                  open={this.state.modal1}
                  onClose={() => {
                    this.setState({ modal1: true })
                  }}
                >
                  <Modal.Header>Share documents</Modal.Header>
                  <Modal.Content>
                    <Modal.Description>
                      <p>We've found the following gravatar image associated with your e-mail address.</p>
                    </Modal.Description>
                    <Modal.Description>
                      <div style={{ marginBottom: '10px', marginTop: '10px' }}>
                        <Checkbox label="BANK 1" checked={true} />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <Checkbox label="BANK 2" checked={false} />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <Checkbox label="BANK 3" checked={true} />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <Checkbox label="BANK 4" checked={false} />
                      </div>
                    </Modal.Description>
                  </Modal.Content>
                  <Modal.Actions>
                    <Button
                      onClick={() => {
                        this.setState({ modal1: false })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      primary={true}
                      onClick={() => {
                        this.setState({ modal1: false })
                      }}
                    >
                      Confirm
                    </Button>
                  </Modal.Actions>
                </Modal>
              </div>

              <Header as="h1">Confims</Header>

              <div style={{ marginBottom: '20px' }}>
                <Button
                  onClick={() => {
                    this.setState({ confirm1: true })
                  }}
                >
                  Confirm1
                </Button>
                <Confirm
                  open={this.state.confirm1}
                  header="This is a positive confirm"
                  cancelButton="Cancel"
                  confirmButton="Confirm"
                  onCancel={() => {
                    this.setState({ confirm1: false })
                  }}
                  onConfirm={() => {
                    this.setState({ confirm1: false })
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Button
                  onClick={() => {
                    this.setState({ confirm2: true })
                  }}
                >
                  Confirm2
                </Button>
                <Confirm
                  open={this.state.confirm2}
                  header="This is a delete confirm"
                  cancelButton="Cancel"
                  confirmButton={<Button negative={true}>Delete</Button>}
                  onCancel={() => {
                    this.setState({ confirm2: false })
                  }}
                  onConfirm={() => {
                    this.setState({ confirm2: false })
                  }}
                />
              </div>

              <Header as="h1">Dropdown</Header>

              <div style={{ marginBottom: '20px' }}>
                <Dropdown text="File">
                  <Dropdown.Menu>
                    <Dropdown.Item text="New" />
                    <Dropdown.Item text="Open..." description="ctrl + o" />
                    <Dropdown.Item text="Save as..." description="ctrl + s" />
                    <Dropdown.Item text="Rename" description="ctrl + r" />
                    <Dropdown.Item text="Make a copy" />
                    <Dropdown.Item icon="folder" text="Move to folder" />
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Dropdown icon="ellipsis horizontal">
                  <Dropdown.Menu direction="left">
                    {' '}
                    <Dropdown.Item text="Remove" />
                    <Dropdown.Item text="Edit" />
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Dropdown inline={true} header="Adjust time span" options={options2} defaultValue={options2[0].value} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Dropdown inline={true} button={true} options={options2} text="Filter Posts" />
              </div>

              <Header as="h1">Accordion</Header>

              <div style={{ marginBottom: '20px' }}>
                <Accordion>
                  <Accordion.Title
                    active={activeIndex === 0}
                    index={0}
                    onClick={() => {
                      this.setState({ activeIndex: 0 })
                    }}
                  >
                    <Icon name="chevron down" />
                    What is a dog?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 0}>
                    <p>
                      A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as
                      a welcome guest in many households across the world.
                    </p>
                  </Accordion.Content>
                  <Accordion.Title
                    active={activeIndex === 1}
                    index={1}
                    onClick={() => {
                      this.setState({ activeIndex: 1 })
                    }}
                  >
                    <Icon name="dropdown" />
                    What kinds of dogs are there?
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 1}>
                    <p>
                      There are many breeds of dogs. Each breed varies in size and temperament. Owners often select a
                      breed of dog that they find to be compatible with their own lifestyle and desires from a
                      companion.
                    </p>
                  </Accordion.Content>
                </Accordion>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Accordion as={Menu} vertical={true}>
                  <Menu.Item>
                    <Accordion.Title
                      active={menuOpen === 'first'}
                      index={0}
                      onClick={() => {
                        this.setState({ menuOpen: 'first' })
                      }}
                    >
                      Size
                      <Icon name="chevron down" />
                    </Accordion.Title>
                    <Accordion.Content
                      active={menuOpen === 'first'}
                      content={
                        <div>
                          <div>
                            <a className="active">Link1</a>
                          </div>{' '}
                          <div>
                            <a>Link2</a>
                          </div>
                        </div>
                      }
                    />
                  </Menu.Item>
                  <Menu.Item>
                    <Accordion.Title
                      active={menuOpen === 'second'}
                      index={1}
                      onClick={() => {
                        this.setState({ menuOpen: 'second' })
                      }}
                    >
                      Colors
                      <Icon name="chevron down" />
                    </Accordion.Title>
                    <Accordion.Content
                      active={menuOpen === 'second'}
                      content={
                        <div>
                          <div>
                            <a className="active">Link1</a>
                          </div>{' '}
                          <div>
                            <a>Link2</a>
                          </div>
                        </div>
                      }
                    />
                  </Menu.Item>
                </Accordion>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Accordion fluid={true} styled={true}>
                  <Accordion.Title
                    active={menuOpen === 'first'}
                    index={0}
                    onClick={() => {
                      this.setState({ menuOpen: 'first' })
                    }}
                  >
                    <Icon name="chevron down" />
                    What is a dog?
                  </Accordion.Title>
                  <Accordion.Content active={menuOpen === 'first'}>
                    <p>
                      A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as
                      a welcome guest in many households across the world.
                    </p>
                  </Accordion.Content>
                  <Accordion.Title
                    active={menuOpen === 'second'}
                    index={1}
                    onClick={() => {
                      this.setState({ menuOpen: 'second' })
                    }}
                  >
                    <Icon name="chevron down" />
                    What kinds of dogs are there?
                  </Accordion.Title>
                  <Accordion.Content active={menuOpen === 'second'}>
                    <p>
                      There are many breeds of dogs. Each breed varies in size and temperament. Owners often select a
                      breed of dog that they find to be compatible with their own lifestyle and desires from a
                      companion.
                    </p>
                  </Accordion.Content>
                </Accordion>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">Label </Header>

                <div>
                  {colors.map(color => (
                    <Label color={color} key={color} style={{ marginRight: '10px', marginBottom: '10px' }}>
                      {color}
                    </Label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">Popuop</Header>

                <div style={{ marginBottom: '10px' }}>
                  <Popup trigger={<Button content="Ordinary" />} content="Add users to your feed" />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <Popup
                    trigger={<Button content="Right" />}
                    content="Add users to your feed, add users to your feed. Add users to your feed"
                    header="Title"
                    position="right center"
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <Popup trigger={<Button content="Inverted" />} content="Add users to your feed" inverted={true} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <Popup
                    trigger={<Button content="Tiny" />}
                    content="Add users to your feed"
                    inverted={true}
                    size="tiny"
                  />
                </div>
              </div>
            </Grid.Column>

            <Grid.Column>
              <Header as="h1">Table</Header>

              <p>Basic - very Table</p>
              <Table sortable={true} basic="very">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell sorted="ascending">Age</Table.HeaderCell>
                    <Table.HeaderCell sorted="descending">Gender</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {tableData.map(item => (
                    <Table.Row key={item.name}>
                      <Table.Cell>
                        <Icon name="building outline" />
                        {item.name}
                      </Table.Cell>
                      <Table.Cell>{item.age}</Table.Cell>
                      <Table.Cell>
                        <Dropdown icon="ellipsis horizontal" style={{ float: 'right' }}>
                          <Dropdown.Menu direction="left">
                            {' '}
                            <Dropdown.Item text="Remove" />
                            <Dropdown.Item text="Edit" />
                          </Dropdown.Menu>
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* LS NOT USED YET <p>Celled Table</p>
              <Table celled={true} sortable={true}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell sorted="ascending">Name</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Notes</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Jamie</Table.Cell>
                    <Table.Cell>Approved</Table.Cell>
                    <Table.Cell>Requires call</Table.Cell>
                  </Table.Row>
                  <Table.Row active={true}>
                    <Table.Cell>John</Table.Cell>
                    <Table.Cell>Selected</Table.Cell>
                    <Table.Cell>None</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Jamie</Table.Cell>
                    <Table.Cell>Approved</Table.Cell>
                    <Table.Cell>Requires call</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell active={true}>Jill</Table.Cell>
                    <Table.Cell>Approved</Table.Cell>
                    <Table.Cell>None</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>*/}

              <Header as="h1">Progress</Header>

              <p>Small</p>
              <Progress percent={0} size="small" />
              <Progress percent={80} size="small" />
              <Progress percent={100} size="small" />
              <p>Medium</p>
              <Progress percent={0} />
              <Progress percent={80} />
              <Progress percent={100} />
            </Grid.Column>

            <Grid.Column style={{ paddingLeft: '200px' }}>
              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">List</Header>

                <List divided={true}>
                  <List.Item>
                    <List.Content>
                      <List.Header as="a">Semantic-Org/Semantic-UI</List.Header>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content>
                      <List.Header as="a">Semantic-Org/Semantic-UI-Docs</List.Header>
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content>
                      <List.Header as="a">Semantic-Org/Semantic-UI-Meteor</List.Header>
                    </List.Content>
                  </List.Item>
                </List>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">Breadcrumb</Header>

                <Breadcrumb>
                  <Breadcrumb.Section link={true}>Home</Breadcrumb.Section>
                  <Breadcrumb.Divider />
                  <Breadcrumb.Section link={true}>Store</Breadcrumb.Section>
                  <Breadcrumb.Divider />
                  <Breadcrumb.Section active={true}>T-Shirt</Breadcrumb.Section>
                </Breadcrumb>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">Menu Secondary</Header>

                <Menu secondary={true}>
                  <Menu.Item name="home" active={true} />
                  <Menu.Item name="messages" active={false} />
                  <Menu.Item name="friends" active={false} />
                </Menu>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">Pagination</Header>
                <Pagination defaultActivePage={5} totalPages={10} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <Header as="h1">Tab</Header>
                <Tab panes={panes} activeIndex={1} />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

export default SemanticComponents
