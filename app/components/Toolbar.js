import React, {Component} from 'react';
import styles from './Toolbar.css';
import 'font-awesome/css/font-awesome.min.css';

import Highlight from './Highlight';
import ReactTooltip from 'react-tooltip';
import UrlSearch from './UrlSearch';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';


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

class Tools extends Component<Props>{
  constructor(props){
    super(props);
    this.state = {
      showHighlighter: false,
      showUrlSearch: false,
      value: 0
    };
    this.store = this.props.store;
  }

  _showHighlighter = () =>{
    this.setState({
      showHighlighter: !this.state.showHighlighter,
        showUrlSearch: false
    });
  }

  _showUrlSearch = () => {
    this.setState({
      showUrlSearch: !this.state.showUrlSearch,
      showHighlighter: false
    });
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render(){
    return(
      <div>
          <Paper square className={styles.root}>
            <ReactTooltip place="top" type="dark" effect="float" />
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              variant="fullWidth"
              class={{indicator: selectionstyles.indicator}}
              indicatorColor="primary"
              textColor="primary"
            >

              <Tab icon={<i className="fas fa-highlighter" />}  data-tip="Highlighter" onClick={this._showHighlighter}/>
              {this.state.showHighlighter && <Tab icon={<Highlight store={this.store} text="Pick Color: "/>} />}

              <Tab icon={<i className="fas fa-wifi"></i>} data-tip="URL search" onClick={this._showUrlSearch}/>
              {this.state.showUrlSearch && <UrlSearch store={this.store}/>}

              <Tab icon={<i className="far fa-comment"></i>} data-tip="Comment" />

              <Tab icon={<i className="far fa-comment-alt" />} data-tip="Annotation"/>

            </Tabs>
          </Paper>
      </div>
    )
  }


}


export default withStyles(selectionstyles)(Tools);
