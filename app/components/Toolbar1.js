import React, {Component} from 'react';
import styles from './Toolbar.css';
import 'font-awesome/css/font-awesome.min.css';

import Highlight from './Highlight';
import ReactTooltip from 'react-tooltip';
import UrlSearch from './UrlSearch';


// type Props = {};

export default class Tools extends Component<Props>{
  // props: Props;
  constructor(props){
    super(props);
    this.state = {showHighlighter: false};
    this.store = this.props.store;
  }

  _showHighlighter = () =>{
    this.setState({showHighlighter: !this.state.showHighlighter});
  }
  // <hr className={styles.text} data-content="Toolbar" />


  render(){
    const highlighter = this.state.showHighlighter;
    return(
      <div>
        <ReactTooltip place="top" type="dark" effect="float" />

        <div className={styles.topnav} data-tid="container">
          <a data-tip="Annotation" href="#home">
            <i className="far fa-comment-alt" />
          </a>
          <a
            data-tip="Highlighter"
            onClick={this._showHighlighter}
            href="#home"
          >
            <i className="fas fa-highlighter" />
          </a>
          <a data-tip="Comment" href="#home">
            <i className="far fa-comment"></i>
          </a>
          <a data-tip="Link" href="#home">
            <i className="fas fa-external-link-alt" />
          </a>
          <UrlSearch store={this.store}/>
        </div>
        <div>
          {this.state.showHighlighter && <Highlight store={this.store} text="Pick Color: "/>}
        </div>
      </div>
    );
  }

}
