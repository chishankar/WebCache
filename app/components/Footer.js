import React,{Component} from 'react';
import zIndex from '@material-ui/core/styles/zIndex';
import getDirectories from '../utilities/GetCaches';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';

const footerStyle = {
  backgroundColor: '#383535',
  fontSize: '15px',
  color: 'white',
  textAlign: 'center',
  padding: '10px',
  position: 'fixed',
  left: '0',
  bottom: '0',
  width: '100%',
  zIndex: '10'
};

const phantomStyle = {
  display: 'block',
  padding: '20px',
  height: '10px',
  width: '100%'
};

const styles = {
  root: {
    width: 500,
  },
};

function listDirectories(){
  let currDir = __dirname.toString().replace('app','data');
  let dirs = getDirectories.getDirectories(currDir);
  let html = '';
  dirs.forEach(function (p){
    html += p.replace(currDir +'/','') + ' | '
  });
  return (html);
}


export default class Footer extends Component{

  constructor(props){
    super(props)
    this.state = {
      value: 0
    }
  }

  handleChange = (event, value) => {
    this.setState({state: value });
  };

  render(){
    return(
       <BottomNavigation
        value={this.state.value}
        onChange={this.handleChange}
        showLabels
      >
        WebCache V2.1
      </BottomNavigation>
    )
  }
}
