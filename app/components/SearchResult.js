import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LabelIcon from '@material-ui/icons/Label';
import Typography from '@material-ui/core/Typography';
import * as urlsearchActions from '../actions/urlsearch';
const path = require('path');

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
  inline: {
    display: 'inline',
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
  console.log(filePath);
  this.store.dispatch(urlsearchActions.changeActiveUrl('/data/' + this.props.filename));
  };
  // <ListItemText inset primary={'Filename: ' + this.props.filename + '\n'} />
  // <ListItemText inset primary={'Matches: ' + this.props.count} />
  render() {
    var regexWebsite = this.props.filename.match(/(\w+\.\w+\.\w+)/);
    var regexDate = this.props.filename.match(/\-(\d+)\//);
    var regexFile = this.props.filename.match(/\/(.*)/);
    console.log(regexWebsite);
    console.log(regexDate);
    console.log(regexFile);
    return (
        <ListItem button onClick={this.handleClick}>
          <ListItemText
            primary={'Filename: ' + this.props.filename + '\n'}
            secondary={
              <React.Fragment>
                {'Matches: ' + this.props.count}
              </React.Fragment>
            }
        />
        </ListItem>
  )
}
}

export default withStyles(styles)(SearchResult);
