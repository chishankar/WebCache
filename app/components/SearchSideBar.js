import React, {Component} from 'react';

import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';

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

type Props = {
  searchResults: Array
}

class SearchSideBar extends Component<Props>{
  props: Props

  constructor(props){
    super(props)
    this.state = {
      open: true
    }
  }

  render(){

    const searchData = this.props.searchData;

    return(
      <List
      component='nav'
      subheader={<ListSubheader component='div'><i className='fas fa-highlighter'/>Search Results</ListSubheader>}
      className={styles.root}>

      <Divider />
    </List>
    )

  }
}

export default withStyles(styles)(SearchSideBar);
