import React from 'react'
import { getStyle } from "./header.style";

function Header() {
  const classes = getStyle()

  return (
    <div>
      <div className={classes.header}>
        <h1>Forkly</h1>
      </div>
    </div>
  )
}

export default Header