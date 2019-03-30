// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';


// type Props = {
//   text: string,
//   start: number,
//   end: number
// };

function replaceBetween(str,start,end){
  return str.substring(0, start) +str+ str.substring(end);

}

function getText(start,end,text){
  let highlightedText = text.substring(start,end);
  console.log(highlightedText)
  let complete = '<i>'+highlightedText+'</i>';
  let overallText = text.replaceBetween(complete,start,end);
  console.log(overallText);
  return overallText;
}

export default class Highlighter extends Component<Props> {
  // props: Props;

  constructor(props){
    super(props);
    this.text = this.props.text;
    this.start = this.props.start;
    this.end = this.props.end
  }


  //      <Highlight search="brown">The quick brown fox jumps over the lazy dog, brown, brown</Highlight>


  render() {

    return (
      <div className={styles.container} data-tid="container">
        {getText(this.start,this.end,this.text)}
      </div>
    );
  }
}
