import React, { Component } from 'react';

// type Props = {}

export default class HighlightText extends Component{
  // props: Props

  cunstructor(props){
    // super(props);
    this.text = this.props.text;
  }

  createSpan(){
    var span = document.createElement("span");
    span.style.display = 'inline';
    span.style.backgroundColor="blue";
  }


  render(){
    return(
      <span>{this.text}</span>
    );
  }
}
