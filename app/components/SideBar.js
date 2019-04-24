import React, {Component} from 'react';

import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemText from '@material-ui/core/ListItemText';
import VisibilityOnIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';


import HighlightText from './HighlightText';
import { Divider } from '@material-ui/core';

const red = {
  color: 'red'
}

const blue = {
  color: 'blue'
}

const green={
  color: 'green'
}

const purple={
  color: 'purple'
}

const yellow={
  color: 'yellow'
}

const black={
  color: 'black'
}

type Props = {
  highlights: Array,
  url: String,
  addComment: Function,
  color: String
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

class HideButton extends Component<Props>{
  constructor(props){
    super(props)
    this.state = {
      hideHiglights: false,
    }
  }

  onHideIconClick = (prevProps) => {
    this.setState({
      hideHighlights: !prevProps
    })
    console.log(this.state.hideHighlights)
  }

  render(){
    return(
      <IconButton aria-label="Delete" onClick={this.onHideIconClick} >
        {this.state.highlightData ? <VisibilityOffIcon />  : <VisibilityOnIcon />  }
      </IconButton>
    )
  }

}


class SideBar extends Component<Props>{
  props: Props

  constructor(props){
    super(props)
    this.state = {
      open: true,
      hideHighlights: false,
    }
  }


  // onHideIconClick = () => {
  //   this.setState({hideHighlights: !this.state.hideHighlights})
  //   console.log(this.state.hideHighlights)
  // }

  getHighlighterColorIcon = (color) => {
    if (color === 'red'){
      return red
    } else if (color === 'blue'){
      return blue
    }else if (color === 'green'){
      return green
    }else if (color === 'purple'){
      return purple
    }else if (color === 'yellow'){
      return yellow
    }
  }

  render(){

    const { classes } = this.props;
    const highlightData = this.props.highlights;
    return(
      <List
      component='nav'
      subheader={<ListSubheader component='div'><i className='fas fa-highlighter' style={this.getHighlighterColorIcon(this.props.color)}/>  Highlighted Texts</ListSubheader>}
      className={classes.root}>
      <ListItem>
          <ListItemText
            primary="Hide Highlights"
          />
          <ListItemSecondaryAction>
            <HideButton />
          </ListItemSecondaryAction>
        </ListItem>,

      <Divider />

     {highlightData.map(highlight =>
      <HighlightText key={highlight.id} text={highlight.text} color={highlight.color} id={highlight.id} func={this.props.addComment}/>
      )}

    </List>
    )
  }
}

export default withStyles(styles)(SideBar);
