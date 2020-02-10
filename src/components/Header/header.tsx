import React from 'react'
import { getStyle } from "./header.style";
import { Button, Grid } from '@material-ui/core';

function Header() {
  const classes = getStyle()

  return (
    <div>
      <div className={classes.header}>
        <Grid container className={classes.container} spacing={0}>
          <Grid item xs={6}>
            <h1 className={classes.textArea}>Forkly</h1>
          </Grid>
          <Grid item xs={6}>
            <Button className={classes.button} variant='contained' color='secondary'>Upload recipe</Button>
          </Grid>
        </Grid>
      </div>
    </div>
  )
}

export default Header