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
                {['Main', 'Recipe'].map((text, index) => (
                    <ListItem button key={text} component={Link} to={"/" + text}>
                        <ListItemIcon>{<InboxIcon />}</ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItem>
                ))}
            </List>

        </Drawer>
    )
}