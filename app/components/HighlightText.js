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


/**
 * Makes a small preview of the highlighted text to show as the face of the hightext component
 * @name {preview}
 * @param  {String} str Highlighted text
 * @return {String} first 15 characters of string
 */
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

/**
 * @class
 * @param {String} text Text that is highlighted
 * @param {String} color The color that the highlight is in
 * @param {String} iD The id of the highlight on the page
 * @return {HighlightText} Highlight Text Component, a component that allows you to interact with what you highlighted (shows up on sidebar)
 */
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


  /**
   *  This handles updating the comment data for the specific highlighted text
   *  Updates current state and updates the state in the store
   * @param {Event} event Click event
   * @fires addComment Which is an acction trigger for adding a comment
   */
  handleInput = (event: Event) => {
    let value = event.target.value;
    this.setState({comment: value});
    let data = {
      id: this.id,
      comment: value
    }
    this.props.addComment(data);
  }

  /**
   * This updates the color of the highlighter to indicate the current color that is selected
   * @param  {String} color The current highlight color
   */
  getHighlighterColorIcon = (color: String) => {
    return {color: color};
  }

  /**
   * Handles the first drop down to show the comments
   */
  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  /**
   * Triggers showId() function to make this highlight centered on the page
   * @fires showId
   */
  handleShowId = () => {
    this.props.showId(this.id)
  }

  /**
   * Triggers delete() function to delete this highlight
   * @fires delete
   */
  handleDeleteClick = () => {
    this.props.delete(this.id);
  }


/**
 * Handles the dropdown for full text
 */
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
