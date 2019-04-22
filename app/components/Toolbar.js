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
    this.setState({showHighlighter: !this.state.showHighlighter});
  }

  _showUrlSearch = () => {
    this.setState({showUrlSearch: !this.state.showUrlSearch});
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
              indicatorColor="secondary"
              textColor="secondary"
            >
              <Tab icon={<i className="far fa-comment-alt" />} data-tip="Annotation"/>
              <Tab icon={<i className="fas fa-highlighter" />}  data-tip="Highlighter" onClick={this._showHighlighter}/>
              {this.state.showHighlighter && <Tab icon={<Highlight store={this.store} text="Pick Color: "/>} />}

              <Tab icon={<i className="far fa-comment"></i>} data-tip="Comment" />

              <Tab icon={<i class="fas fa-wifi"></i>} data-tip="URL search" onClick={this._showUrlSearch}/>
              {this.state.showUrlSearch && <UrlSearch store={this.store}/>}

            </Tabs>
          </Paper>
      </div>
    )
  }


}


export default withStyles(styles)(Tools);
