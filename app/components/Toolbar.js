import React, {Component} from 'react';
import styles from './Toolbar.css';

import * as SaveActions from '../actions/save';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import 'font-awesome/css/font-awesome.min.css';

import Highlight from './Highlight';
import ReactTooltip from 'react-tooltip';
import UrlSearch from './UrlSearch';
import FileSearch from './FileSearch';

import * as sideBarStateActions from '../actions/sidebarstate';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';


function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    save: SaveActions.SaveDoc,
  },dispatch)
}

function mapStateToProps(state) {
  return {
    saveDate: state.save.mostRecentUpdate
  };
}

const selectionstyles = themes => ({
  root:{
    flexGrow: 1,
    maxWidth: 500,
  },
  primary:{
    backgroundColor: '#232c39',
    color: '#232c39',
    textColor: '#232c39'
  },
  indicator:{
    color: '#232c39',
    backgroundColor: '#232c39'
  },
  textColor:{
    color: '#232c39',
    backgroundColor: '#232c39'
  }
})

const searchAPI = require('../../webcache_testing/main5.js');

/**
 * @class
 * @return {Component} Container for all the utility components
 */
class Tools extends Component<Props>{
  constructor(props){
    super(props);
    this.state = {
      showHighlighter: false,
      showUrlSearch: false,
      showFileSearch: false,
      value: 0
    };
    this.store = this.props.store;
  }

  componentWillMount(){
    searchAPI.search("");
  }

  // Handles the logic for showing the highlighter color options
  /**
   *  Handles the logic for showing the highlighter color options
   */
  _showHighlighter = () =>{
    this.setState({
      showHighlighter: !this.state.showHighlighter,
        showUrlSearch: false,
        showFileSearch: false
    });
    this.store.dispatch(sideBarStateActions.changeSideBarState(false));
  }

    /**
   *   Handles the logic for showing the the URL search input
   */
  _showUrlSearch = () => {
    this.setState({
      showUrlSearch: !this.state.showUrlSearch,
      showHighlighter: false,
      showFileSearch: false
    });
  }

  /**
   * Shows the file search bar when search is open
   */
  _showFileSearch = () => {
    this.store.dispatch(sideBarStateActions.changeSideBarState(true));
    this.setState({
      showFileSearch: !this.state.showFileSearch,
      showHighlighter: false,
      showUrlSearch: false
    });
  }

  /**
   * Sends save request to RenderText component to save the iFrame Virtual DOM
   * @param  {Event} event
   */
  handleSave = (event: Event) => {
    this.props.save()
  }

  /**
   * Handles the change of the indicator bar to indicate current selection
   * @param  {Event} event
   * @param  {Number} value
   */
  handleChange = (event: Event, value: Number) => {
    this.setState({ value });
  };

   /**
   * Handles the logic for showing the last update date
   */
  showLastUpdateDate = () => {
    if (this.props.saveDate != ""){
      return true
    }
    return false
  }

  render(){
    return(
      <div>
          <Paper square className={styles.root}>
            <ReactTooltip place="top" type="dark" effect="float" />
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >

              <Tab icon={<i className="fas fa-highlighter" />}  data-tip="Highlighter" onClick={this._showHighlighter}/>
              {this.state.showHighlighter && <Tab icon={<Highlight store={this.store} text="Pick Color: "/>} />}

              <Tab icon={<i className="fas fa-wifi"></i>} data-tip="URL search" onClick={this._showUrlSearch}/>
              {this.state.showUrlSearch && <UrlSearch store={this.store}/>}

              <Tab icon={<i className="far fa-save"></i>} onClick={this.handleSave} data-tip="Save" />

              <Tab icon={<i className="fa fa-search" />} data-tip="File Search" onClick={this._showFileSearch}/>
              {this.state.showFileSearch && <FileSearch store={this.store}/>}

              {this.showLastUpdateDate() && <Tab disabled icon={this.props.saveDate} />}
            </Tabs>
          </Paper>
      </div>
    )
  }


}


export default connect(
  mapStateToProps,
  mapDispatchToProps)(withStyles(selectionstyles)(Tools));
