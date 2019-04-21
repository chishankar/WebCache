import React, { Component } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';


import 'font-awesome/css/font-awesome.min.css';
var classNames = require('classnames');

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

function preview(str){
  if (str.length > 15){
    return str.substring(0,15) + "...";
  }
  return str;
}

class HighlightText extends Component{
  // props: Props

  constructor(props){
    super(props)
    this.text = this.props.text;
    this.color = this.props.color;
    this.preview = preview(this.text);
    this.id = this.props.id;
    this.listref = React.createRef();
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

    return(
      <ListItem button ref={this.listref}>
        <ListItemIcon >
          <i className="fas fa-highlighter" style={this.getHighlighterColorIcon(this.color)}/>
        </ListItemIcon>
        <ListItemText primary={this.preview} />
      </ListItem>
    );
  }
}

export default withStyles(highlighterColor, { withTheme: false })(HighlightText);
