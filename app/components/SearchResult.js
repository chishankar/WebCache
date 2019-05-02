import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LabelIcon from '@material-ui/icons/Label';
import * as urlsearchActions from '../actions/urlsearch';

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
    this.store = this.props.store;
  }

  handleClick = () => {
  console.log("Search result got pressed!");
  let filePath = path.join(__dirname, "../../data/" + this.props.filename);
  this.store.dispatch(urlsearchActions.changeActiveUrl(filePath));
  };

  render() {

    return (
        <ListItem button onClick={this.handleClick}>
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
