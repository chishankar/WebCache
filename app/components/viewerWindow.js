import React, { Component } from 'react';

type Props = {
  color: string
};

export default class Viewer extends Component<Props>{
  props: Props

  constructor(props){
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount(){
    window.addEventListener('message',this.handleIFrameTask)
  }

  handleIFrameTask = (e) => {
    if (e.data == 'clicked button'){
      console.log('It has reached me!');
    }
    if (e.data == 'highlighted text'){
      console.log('Someone highlighted text (.)(.)');
      let data = {color: this.props.color};
      window.postMessage(data,'*');
    }
  }

  render(){
    console.log(this.props.color)
    return(
      <div>
        <iframe
        ref = {this.ref}
        src="about:blank"
        frameBorder="0"
        height="625px"
        width="100%"/>
      </div>
    );
  }

}
