import React,{Component} from 'react';
import zIndex from '@material-ui/core/styles/zIndex';
import getDirectories from '../utilities/GetCaches';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

const footerStyle = {
  footer: {
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
  }
};

const phantomStyle = {
  display: 'block',
  padding: '20px',
  height: '10px',
  width: '100%'
};

const drawerWidth = 250;


const styles = themes => ({
  root: {
    width: 500,
    position: 'fixed',
    bottom: 0,
    width: drawerWidth
  },
  bottom: {
    width: 500,
    position: 'fixed',
    bottom: 0,
    width: drawerWidth
  }
});

function listDirectories(){
  let currDir = __dirname.toString().replace('app','data');
  let dirs = getDirectories.getDirectories(currDir);
  let html = '';
  dirs.forEach(function (p){
    html += p.replace(currDir +'/','') + ' | '
  });
  return (html);
}


class Footer extends Component{

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
        className = {styles.root}
        showLabels
      >
        <BottomNavigationAction label="WebCache V2.1"/>

      </BottomNavigation>
    )
  }
}

export default withStyles(styles)(Footer);

