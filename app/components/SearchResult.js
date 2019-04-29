import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LabelIcon from '@material-ui/icons/Label';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class SearchResult extends React.Component {
 constructor(props){
    super(props)
  }

  render() {

    return (
        <ListItem>
          <ListItemIcon>
            <LabelIcon />
          </ListItemIcon>
          <ListItemText inset primary={'Filename: ' + this.props.filename + '\n'} />
          <ListItemText inset primary={'Matches: ' + this.props.count} />
        </ListItem>     
  )
}
}

export default withStyles(styles)(SearchResult);
