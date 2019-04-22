import React, { Component } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import ReactTooltip from 'react-tooltip';
import List from '@material-ui/core/List';
import * as sideBarActions from '../actions/sidebar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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
    marginRight: theme.spacing.unit,
  },
});


function preview(str){
  if (str.length > 15){
    return str.substring(0,15) + "...";
  }
  return str;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    addComment: sideBarActions.addComment,
  },dispatch)
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
    this.addComment = this.props.addComment;
    this.state = {
      open: true,
      comment: ""
    }
  }

  handleInput = (event) => {
    let value = event.target.value;
    this.setState({comment: value});
    let data = {
      id: this.id,
      comment: this.addtext
    }
    this.props.addComment(data);
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

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

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
        <ReactTooltip place="top" type="dark" effect="float" />
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
        </ListItem>
        </List>
        </Collapse>
      </div>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps
)(HighlightText)
