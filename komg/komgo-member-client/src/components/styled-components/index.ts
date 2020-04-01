import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { paleGrey } from '../../styles/colors'
import { GridDropdownController } from '../../features/letter-of-credit-legacy/components'
import { Tab, Card } from 'semantic-ui-react'
import { blueGrey, violetBlue, SPACES, grey } from '@komgo/ui-components'
import { LightHeaderWrapper, BoldHeaderWrapper } from './HeaderWrapper'

const PageWrapper = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 80px);
  box-sizing: border-box;
`

const PageMenu = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 160px;
  padding: 0 40px;
`

const PageMenuLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`

const PageContent = styled.div`
  flex: 1;
  overflow: hidden;
  background-color: ${paleGrey};
`

const StyledLink = styled(Link)`
  &:hover {
    text-decoration: none;
  }
`

const MultiSelectDropdown = styled(GridDropdownController)`
  &&&& {
    background-image: none;

    .label {
      display: inline-block; /* For IE11/ MS Edge bug */
      text-decoration: none;
      text-transform: inherit;
    }
  }
`

const HorizontalRadioLayoutWrapper = styled.div`
  & > .field {
    display: flex;
    flex-wrap: wrap;
    & > label {
      width: 100%;
      font-weight: bold;
    }
    .field {
      margin: 1rem 1rem 1rem 0;
      .ui.radio.checkbox {
        label {
          line-height: calc(18px * 1.15);
        }
      }
    }
  }
`

const FieldGrouping = styled.div`
  &&& {
    margin: 15px 0 35px 0;
    & > label {
      font-weight: bold;
    }
  }
`

const DefaultBackground = styled.div`
  background-color: ${paleGrey};
  height: 100vh;
  overflow-y: scroll;
  width: 100%;
`

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  height: 100vh;
`

const StyledCard = styled(Card)`
  &&&& {
    padding: ${SPACES.DEFAULT};
    width: 100%;
    border: 1px solid ${grey};
    border-radius: 4px;
    box-shadow: 0 1px 4px 0 rgba(192, 207, 222, 0.5);
  }
`

// Semantic UI secondary pointing tab: https://react.semantic-ui.com/modules/tab/#types-secondary-pointing
const StyledSecondaryPointingTab = styled(Tab)`
  &&& {
    .pointing.secondary.menu {
      border-bottom: 1px solid #e0e6ed;
      padding: ${SPACES.SMALL} ${SPACES.DEFAULT} 0 ${SPACES.DEFAULT};

      .item {
        color: ${blueGrey};
        font-weight: 700;
        padding: 0 0 15px 0;
        margin: 10px 20px 0 0;
        border-bottom-width: 0;
      }
      .active.item {
        color: ${violetBlue}
        border-color: ${violetBlue};
        padding: 0 0 10px 0;
        border-width: 5px;
      }
    }

    .ui.attached.segment {
      margin: 0;
      padding: ${SPACES.SMALL} ${SPACES.DEFAULT} ${SPACES.SMALL} ${SPACES.DEFAULT};
    }
  }
`

export {
  PageWrapper,
  PageMenu,
  PageMenuLeft,
  PageContent,
  StyledLink,
  MultiSelectDropdown,
  HorizontalRadioLayoutWrapper,
  FieldGrouping,
  DefaultBackground,
  ColumnWrapper,
  StyledSecondaryPointingTab,
  LightHeaderWrapper,
  BoldHeaderWrapper,
  StyledCard
}
