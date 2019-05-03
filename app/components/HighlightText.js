import React, { Component } from 'react';
import * as sideBarActions from '../actions/sidebar';

import { withStyles } from '@material-ui/core/styles';

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
    backgroundColor: theme.palette.background.paper,
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

// Makes a small preview of the highlighted text to show as the face of the hightext component
function preview(str){
  if (str.length > 15){
    return str.substring(0,15) + "...";
  }
  return str;
}

// Binding sideBarActions to this component for each of these components to be able to talk to the store
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    addComment: sideBarActions.addComment,
    delete: sideBarActions.deleteHighlights,
    showId: sideBarActions.viewHighlight

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
      comment: this.props.comment,
      fullText: false,
    }
  }

  // This handles updating the comment data for the specific highlighted text
  // Updates current state and updates the state in the store
  handleInput = (event) => {
    let value = event.target.value;
    this.setState({comment: value});
    let data = {
      id: this.id,
      comment: value
    }
    this.props.addComment(data);
  }

  // This updates the color of the highlighter to indicate the current color that is selected
  getHighlighterColorIcon = (color) => {
    return {color: color};
  }

  // Handles the first drop down to show the comments and full text drop down
  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleShowId = () => {
    this.props.showId(this.id)
  }

  // This is invoked when a user clicks on the delete button. It dispatches a delete action
  // to the store
  handleDeleteClick = () => {
    this.props.delete(this.id);
  }


  // This handles the state for full text drop down
  handleFullClick = () => {
    this.setState(state => ({ fullText: !state.fullText }));
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

          <ListItemText primary={this.preview} onClick={this.handleShowId}/>
          {this.state.open ?
            <ExpandLess style={black}/> :
            <ExpandMore style={black}/>}
        </ListItem>

        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button className={styles.nested} onClick={this.handleDeleteClick}>
              <ListItemIcon>
                  <IconButton aria-label="Delete">
                    <DeleteIcon />
                  </IconButton>
              </ListItemIcon>
              <ListItemText inset primary={"Delete"} />
            </ListItem>

            <ListItem button className={styles.nested}>
                <ListItemIcon>
                  <i className="far fa-comment-alt" />
                </ListItemIcon>
                <ListItemText inset primary={commentBox} />
            </ListItem>

            <ListItem button onClick={this.handleFullClick}>
              <ListItemIcon>
                <i className="fas fa-align-left"></i>
              </ListItemIcon>
              <ListItemText inset primary="Full Text" />
              {this.state.fullText ? <ExpandLess style={black}/> : <ExpandMore style={black}/>}
            </ListItem>

            <Collapse in={this.state.fullText} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button className={styles.nested}>
                  <ListItemIcon>
                    <i className="fas fa-align-left"></i>
                  </ListItemIcon>
                  <ListItemText inset primary={this.text} />
                </ListItem>
              </List>
            </Collapse>
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
)(withStyles(styles)(HighlightText))
