// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import webview from 'electron';
import styles from './Text.css';
import HighlightText from './HighlightText';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';

const fs = require('fs');

function gettext(){
  return   <div><h1>Hi there!</h1><p>When I first brought my cat home from the humane society she was a mangy, pitiful animal. It cost a lot to adopt her: forty dollars. And then I had to buy litter, a litterbox, food, and dishes for her to eat out of. Two days after she came home with me she got taken to the pound by the animal warden. There's a leash law for cats in Fort Collins. If they're not in your yard they have to be on a leash. Anyway, my cat is my best friend.I'm glad I got her. She sleeps under the covers with me when it's cold. Sometimes she meows a lot in the middle of the night and wakes me up, though When I first brought my cat home from the Humane Society she was a mangy, pitiful animal. She was so thin that you could count her vertebrae just by looking at her. Apparently she was declawed by her previous owners, then abandoned or lost. Since she couldn't hunt, she nearly starved. Not only that, but she had an abscess on one hip. The vets at the Humane Society had drained it, but it was still scabby and without fur. She had a terrible cold, to@2o. She was sneezing and sniffling and her meow was just a hoarse squeak. And she'd lost half her tail somewhere. Instead of tapering gracefully, it had a bony knob at the end</p></div>;
}

function getRenderText(filePath) {
  // var someHtml = fs.readFileSync(filePath).toString();
  // TODO: Rewrite so that it does not convert HTML to JSX this way
  //       There should be a HTML to React library floating out there.
  // TODO: also render the css files associated with it
  //       <div contenteditable="true" ref='myTextarea' onMouseUp={this.handleHighlight}>{getRenderText(filePath)}</div>

  // <div className="Container" dangerouslySetInnerHTML={{__html: someHtml}}>
  // </div>
  let updatedDirname = __dirname.toString().replace("app","")
  let fullPath = "file://" + updatedDirname +filePath
  console.log("updated: "+fullPath);
  return (
    <webview className={styles.setWidth} id = "foo" src={fullPath}>
    </webview>
  );
}

type Props = {
  color: string
}

export default class RenderText extends Component<Props> {
  props: Props;

  handleHighlight = (event) =>{
    console.log(this.props.color)

    if (this.props.color != "DEFAULT"){
      var _selection = window.getSelection();
      let _range = _selection.getRangeAt(0);
      var span = document.createElement(span);

      span.style.backgroundColor = this.props.color;
      span.style.display = 'inline';
//this code is wrong
      if (_selection) {
          var range = _range.cloneRange();
          range.surroundContents(span);
          _selection.removeAllRanges();
          _selection.addRange(range);
      }
    }
  };

  componentDidUpdate(prevProps) {
    console.log("detected updated");
    if(!(this.props.activeUrl === prevProps.activeUrl)) // Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
    {
      this.render();
    }
  }

  render() {
    console.log(this.props.activeUrl);
    const testPath = './test/';
    const legacyPath = 'legacy-data/ScrapBook/data/20190327234416/';
    var filePath = `${testPath + legacyPath}index.html`;
    let displayInput = this.props.activeUrl.startsWith('data');

    return (
      <div>
      {displayInput && getRenderText(this.props.activeUrl)}
      {!displayInput && <div contenteditable="true" ref='myTextarea' className="divStuff" onMouseUp={this.handleHighlight}>{gettext()}</div>}
      </div>
    );
  }
}
