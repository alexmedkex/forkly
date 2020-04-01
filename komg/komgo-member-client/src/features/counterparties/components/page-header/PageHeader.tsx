import * as React from 'react'
import { Header, Button, Grid } from 'semantic-ui-react'
import { SearchProps } from 'semantic-ui-react'
import styled from 'styled-components'

import { CustomSearch } from '../../../../components'

export interface Props {
  pageName: string
  buttonContent: string
  shouldRenderButton: boolean
  searchValue: string
  handleButtonClick(addModalOpen: boolean): void
  handleSearch(event: React.MouseEvent<HTMLElement>, data: SearchProps): void
}

const StyledGrid = styled(Grid)`
  &&& {
    margin-bottom: 15px;
  }
`

const PageHeader: React.SFC<Props> = (props: Props) => {
  const { pageName, buttonContent, handleButtonClick, shouldRenderButton, handleSearch, searchValue } = props
  return (
    <StyledGrid>
      <Grid.Column width={8}>
        <Header as="h1" content={pageName} style={{ marginTop: '3px' }} />
      </Grid.Column>
      <Grid.Column width={8} style={{ textAlign: 'right' }}>
        <CustomSearch handleSearch={handleSearch} value={searchValue} disabled={false} />
        {shouldRenderButton && (
          <Button onClick={() => handleButtonClick(true)} primary={true}>
            {buttonContent}
          </Button>
        )}
      </Grid.Column>
    </StyledGrid>
  )
}

export default PageHeader
