import React, {Component} from 'react';
import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import SearchResult from './SearchResult';


import { Divider } from '@material-ui/core';


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

class SearchSideBar extends Component<Props>{
  props: Props

  constructor(props){
    super(props)
  }

  render(){
    const searchData = JSON.parse(this.props.searchData);
    const { classes } = this.props;
    return(
      <List
      component='nav'
      subheader={
        <ListSubheader component='div'>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Search Results
        </ListSubheader>}
      className={classes.root}>
      <Divider />
      {searchData.results.map(result =>
      <SearchResult key={result.count} store={this.props.store} filename={result.filename} count={result.count}/>
      )}
    </List>
    )
  }
}

export default withStyles(styles)(SearchSideBar);
