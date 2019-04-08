import React,{Component} from 'react';
import zIndex from '@material-ui/core/styles/zIndex';
import getDirectories from '../utilities/GetCaches';

const footerStyle = {
  backgroundColor: "#383535",
  fontSize: "15px",
  color: "white",
  textAlign: "center",
  padding: "10px",
  position: "fixed",
  left: "0",
  bottom: "0",
  width: "100%",
  zIndex: "10"
};

const phantomStyle = {
  display: "block",
  padding: "20px",
  height: "10px",
  width: "100%"
};

function listDirectories(){
  let currDir = __dirname.toString().replace('app','data');
  let dirs = getDirectories.getDirectories(currDir);
  let html = '';
  dirs.forEach(function (p){
    html += p.replace(currDir +"/","") + " | "
  });
  return (html);
}


export default class Footer extends Component{
  render(){
    return(
      <div>
        <div style={phantomStyle} />
        <div style={footerStyle}>Current Cached Sites: {listDirectories()}
        </div>
      </div>
    )
  }
}
