import * as React from 'react'
import { Header, Icon, Container } from 'semantic-ui-react'

const NoSearchResult: React.SFC = () => {
  return (
    <Container text={true}>
      <div style={{ textAlign: 'center', marginBottom: 0, marginTop: '25%' }}>
        <Header icon={true}>
          <Icon name="search" />
          <h3>Sorry, no documents found</h3>
        </Header>
        <h4 style={{ color: '#5d768f', marginTop: 0 }}>There are no results for that query</h4>
      </div>
    </Container>
  )
}

export default NoSearchResult
