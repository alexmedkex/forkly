import React from 'react'
import { Drawer, IconButton, ListItemIcon, List, ListItem, ListItemText } from "@material-ui/core"
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import InboxIcon from '@material-ui/icons/MoveToInbox'

export default function Menu() {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <Drawer
                open={open}
                variant="permanent"
                anchor="left">

                <List>
                    {['New recipe'].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{<InboxIcon />}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>

            </Drawer>
        </React.Fragment>
    )
}