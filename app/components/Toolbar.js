import React, {Component} from 'react';
import styles from './Toolbar.css';
import 'font-awesome/css/font-awesome.min.css';
import tooltip from './Tooltip.css';
import Highlight from './Highlight';
import ReactTooltip from 'react-tooltip';

type Props = {};

export default class Toolbar extends Component<Props>{
  props: Props;
  constructor(props){
    super(props);
    this.state = {showHighlighter: false};

    // this._showHighlighter.bind(this);
  }
  // <i className="far fa-comment-alt"></i><br></br>Annotation


  _showHighlighter = () =>{
    this.setState({showHighlighter: !this.state.showHighlighter});
  }

  render(){
    const highlighter = this.state.showHighlighter;

    return(
      <div>
        <ReactTooltip  place="top" type="dark" effect="float"/>

        <div className={styles.topnav} data-tid="container">
          <hr className={styles.text} data-content="Toolbar"></hr>
          <a data-tip="Annotation" href="#home">
            <i className="far fa-comment-alt"></i>
          </a>
          <a data-tip="Highlighter" onClick={this._showHighlighter} href="#home">
            <i className="fas fa-highlighter"></i>
          </a>
          <a data-tip="Comment" href="#home">
            <i className="far fa-comment"></i>
          </a>
          <a data-tip="Link" href="#home">
            <i className="fas fa-external-link-alt"></i>
          </a>
        </div>
        <div>
          {this.state.showHighlighter && <Highlight text="Pick Color: "/>}
        </div>
      </div>
    );
  }

}
