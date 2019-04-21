import React, {Component} from 'react';
var createReactClass = require('create-react-class');

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import HighlightText from './HighlightText';

type Props = {
  highlights: Array,
  url: String
};

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

class SideBar extends Component<Props>{
  props: Props

  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }

  render(){

    const { classes } = this.props;
    const highlightData = this.props.highlights;
    return(
      <List
      component="nav"
      subheader={<ListSubheader component="div">Highlighted Texts</ListSubheader>}
      className={classes.root}>

     {highlightData.map(highlight =>
      <HighlightText key={highlight.id} text={highlight.text} color={highlight.color} id={highlight.id} />
      )}

    </List>
    )
  }
}

export default withStyles(styles)(SideBar);
