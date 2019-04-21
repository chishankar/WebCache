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

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  createHighlight = (data) => {
    let text = data.text;
    let color = data.color;
    let thing =
        <div>
          <ListItemIcon>
              {color}
          </ListItemIcon>
          <ListItemText inset primary={text} />
        </div>
    console.log(text)
    console.log(thing)
    return thing;
  }

  parseHighlights = () => {
    let highlightlist = this.props.highlights;
    for (let i = 0; i < highlightlist.length ; i++) {
      var highlight = highlightlist[i];
      console.log("BRO: " + JSON.stringify(highlight));
      html += this.createHighlight(highlight.text,highlight.color)
    }
    return html;
  }



  render(){

    const HighlightList = createReactClass({
      render : function () {
        return (
          <div>
              {
                Object.keys(this.props.highlightdata).map = (key) => {
                  var highlight = this.props.highlightdata[i];
                  return <li className="list-group-item list-group-item-info">{highlight.text}</li>
                }
              }
           </div>
        );
       }
     });

    const { classes } = this.props;
    const highlightData = this.props.highlights;
    const createDataUI = this.createHighlight;
    console.log(this.props.highlights)
    return(
      <List
      component="nav"
      subheader={<ListSubheader component="div">Highlighted Texts</ListSubheader>}
      className={classes.root}>

      <HighlightList highlightdata={highlightData} />

      <Collapse in={this.state.open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button className={classes.nested}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText inset primary="Starred" />
          </ListItem>
        </List>
      </Collapse>
    </List>
    )
  }
}

export default withStyles(styles)(SideBar);
