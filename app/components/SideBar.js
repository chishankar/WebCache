import React, {Component} from 'react';

import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';

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



class SideBar extends Component<Props>{
  props: Props

  constructor(props){
    super(props)
    this.state = {
      open: true,
    }
  }

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
      subheader={<ListSubheader component='div'><i className='fas fa-highlighter' style={this.getHighlighterColorIcon(this.props.color)}/> Highlighted Texts</ListSubheader>}
      className={classes.root}>

      <Divider />

     {highlightData.map(highlight =>
      <HighlightText key={highlight.id} text={highlight.text} color={highlight.color} id={highlight.id} func={this.props.addComment}/>
      )}

    </List>
    )
  }
}

export default withStyles(styles)(SideBar);
