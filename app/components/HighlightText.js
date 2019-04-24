import React, { Component } from 'react';
import * as sideBarActions from '../actions/sidebar';

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import ReactTooltip from 'react-tooltip';
import List from '@material-ui/core/List';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Divider } from '@material-ui/core';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
});

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

function preview(str){
  if (str.length > 15){
    return str.substring(0,15) + "...";
  }
  return str;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    addComment: sideBarActions.addComment,
    delete: sideBarActions.deleteHighlights
  },dispatch)
}

class HighlightText extends Component{

  constructor(props){
    super(props)
    this.text = this.props.text;
    this.color = this.props.color;
    this.preview = preview(this.text);
    this.id = this.props.id;
    this.listref = React.createRef();
    this.addComment = this.props.addComment;
    this.state = {
      open: false,
      comment: ""
    }
  }

  handleInput = (event) => {
    let value = event.target.value;
    this.setState({comment: value});
    let data = {
      id: this.id,
      comment: value
    }
    this.props.addComment(data);
  }

  getHighlighterColorIcon = (color) => {
    return {color: color};
  }

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleDeleteClick = () => {
    this.props.delete(this.id);
  }

  render(){
    const commentBox =
      <TextField
      id="outlined-textarea"
      label="Comment"
      multiline
      value={this.state.comment}
      className={styles.textField}
      margin="normal"
      variant="outlined"
      onChange={this.handleInput}
    />

    return(
      <div>
        <ListItem button ref={this.listref} data-tip={this.text} onClick={this.handleClick}>

          <ListItemIcon >
            <i className="fas fa-highlighter" style={this.getHighlighterColorIcon(this.color)}/>
          </ListItemIcon>
          <ListItemText primary={this.preview} />
          {this.state.open ?
            <ExpandLess style={black}/> :
            <ExpandMore style={black}/>}
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
            <ListItem button className={styles.nested}>
                <ListItemIcon>
                  <i className="far fa-comment-alt" />
                </ListItemIcon>
                <ListItemText inset primary={commentBox} />
            </ListItem>
            <ListItem button className={styles.nested}>
            <ListItemIcon>
              <i className="fas fa-align-left"></i>
            </ListItemIcon>
            <ListItemText inset primary={this.text} />
            <ListItemSecondaryAction onClick={this.handleDeleteClick}>
              <IconButton aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
        </List>
        </Collapse>
        <Divider />
      </div>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps
)(HighlightText)
