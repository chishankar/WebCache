import React, {Component} from 'react';
import styles from './UrlSearch.css';
import 'font-awesome/css/font-awesome.min.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as fileSearchActions from '../actions/filesearch';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const UIstyles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    margin: theme.spacing.unit * 2,
  },
  placeholder: {
    height: 40,
  },
});

export default class FileSearch extends Component<Props>{

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  // Handles logic for when user presses enter on a valid website
  handleEnter = (event) => {
    if (event.key === 'Enter'){
      var elem = event.srcElement || event.target;
      this.store.dispatch(fileSearchActions.changeSearchTerms(elem.value));
    }
  }

  render(){
      return(
        <div>
            <TextField
            id="outlined-full-width"
            label="File Search"
            style={{ margin: 8 }}
            placeholder="Search archivers"
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            onKeyUp={this.handleEnter}
          />
        </div>
      )
  }
}
