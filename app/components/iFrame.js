import React, {Component} from 'react';


class iFrame extends Component{
  constructor(props){
    super(props);
    this.url = this.props.url;
  }

  formatUrl = () => {
    var updatedDirname = __dirname;

    if (this.props.url.startsWith('data')){
      updatedDirname = __dirname.toString().replace("app","")
    }
    let fullPath = "file://" + updatedDirname +filePath
    this.setState({url: fullPath})
  }

  componentDidMount(){
    this.formatUrl();
  };



}

