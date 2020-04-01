import * as React from 'react'
import styled from 'styled-components'
import { yellowBg } from '../../../styles/colors'

const StyledFooter = styled.div`
  &&& {
    opacity: 0.8;
    color: white;
    font-size: 14px;
    line-height: 19px;
    text-align: center;
    margin: auto;
    max-width: 1175px;
  }
`

const StyledLinkBlock = styled.div`
  width: fit-content;
  margin: 20px auto 70px auto;
`

const StyledLink = styled.a`
  color: ${yellowBg};
  font-family: 'Lota Grotesque', Roboto, 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    color: white;
    text-decoration: none;
  }
`

const Terms = () => {
  return (
    <>
      <StyledFooter className="disabled">
        As per the komgo Terms & Conditions, komgo's role is to maintain and operate the platform, and this role is
        purely administrative in nature. While komgo have made its best efforts to ensure the authenticity of the
        platform users during the on-boarding process, in no event komgo, its related partnerships or corporations,
        managers or employees thereof be liable to you or anyone else, makes representation of warranty of any kind
        (whether express or implied by law) (including, but not limited to warranties of performance, merchantability
        and fitness for a particular purpose) in respect of the attached document or for any decision made or action
        taken in reliance of the information in the attached document.
      </StyledFooter>
      <StyledLinkBlock>
        <StyledLink className="more-information" target="_blank" href="https://komgo.io/info/verification">
          More information
        </StyledLink>
      </StyledLinkBlock>
    </>
  )
}

export default Terms
