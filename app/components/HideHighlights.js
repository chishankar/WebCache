import React, {Component} from 'react';
import * as sideBarActions from '../actions/sidebar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import VisibilityOnIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    hideHighlights: sideBarActions.hideHighlights
  },dispatch)
}

/**
 * Hides the highlights the button on the page
 *
 * @class
 * @return {Component} HideButton Component
 */
class HideButton extends Component{

  constructor(props){
    super(props)
    this.state = {
      hideHighlights: false,
    }
  }


  //
  /**
   *  On icon click, it changes the icon and dispatches a hideHighlights action
   *  @fires hideHighlights
   */
  onHideIconClick = () => {
    this.setState({
      hideHighlights: !this.state.hideHighlights
    })
    this.props.hideHighlights();
  }

  render(){
    return(
      <IconButton aria-label="Delete" onClick={this.onHideIconClick} >
        {this.state.hideHighlights ? <VisibilityOffIcon />  : <VisibilityOnIcon />  }
      </IconButton>
    )
  }

}

export default connect(
  null,
  mapDispatchToProps
)(HideButton)

