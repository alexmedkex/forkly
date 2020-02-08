import React from 'react'
import { Drawer, ListItemIcon, List, ListItem, ListItemText } from '@material-ui/core'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import {
    Link
} from 'react-router-dom'

export default function Menu() {
    return (
        <Drawer
            variant="permanent"
            anchor="left">

            <List>
                {['Main', 'New recipe'].map((text, index) => {
                    let route = ''
                    switch (text) {
                        case 'Main':
                            route = '/main'
                            break
                        case 'New recipe':
                            route = '/recipes/new'
                            break
                    }

                    return (
                        <ListItem button key={text} component={Link} to={route}>
                            <ListItemIcon>{<InboxIcon />}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    )
                })}
            </List>
        </Drawer>
    )
}