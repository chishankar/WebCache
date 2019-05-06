import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LabelIcon from '@material-ui/icons/Label';
import Badge from '@material-ui/core/Badge';
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
  }
});

/**
 * @class
 * @return {SearchResult} SearchResult Component that holds each serach result information
 * @param {Object} store
 */
class SearchResult extends React.Component {
 constructor(props){
    super(props)
    this.store = this.props.store;
  }

  /**
   * Handles the logic for clicking on a search result
   */
  handleClick = () => {
    let filePath = path.join(__dirname, "../data/" + this.props.filename);
    this.store.dispatch(urlsearchActions.changeActiveUrl('LOCAL' + filePath));
  };

  render() {
    var regexWebsite = this.props.filename.match(/((\w+\.)?\w+\.\w+)/);
    var regexDate = this.props.filename.match(/\-(\d+)\//);
    var regexFile = this.props.filename.match(/\/(.*)/);
    var website = regexWebsite[1];
    var date = regexDate[1];
    var file = regexFile[1];

    const unixEpochTimeMS = parseInt(date, 10);
    const d = new Date(unixEpochTimeMS);
    const strDate = d.toLocaleString();

    return (

          <ListItem button onClick={this.handleClick}>
            <ListItemText
              primary={'Filename: ' + file + '\n'}
              secondary={
                  <React.Fragment>
                    <b>Website: </b>{website + '\n'}
                    <b>Date: </b>{(new Date(unixEpochTimeMS)) + '\n'} <br/>
                    <b>Matches: </b>{this.props.count + '\n'}
                  </React.Fragment>
              }
          />
          </ListItem>
  )
}
}

export default withStyles(styles)(SearchResult);
