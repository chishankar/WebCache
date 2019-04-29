import React, { Component }from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ifError } from 'assert';


const fs = require('fs');
const cheerio = require('cheerio')

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

class LegacyDataConverter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: ''
    };
    this.store = this.props.store;
  }

  // Handles path changes and updates state
  onChange = (e) => {
    console.log(e.target.file);
    if (e.target.files[0]!=null){
      this.setState({ path: e.target.files[0].path });

      fs.readdir(e.target.files[0].path, (err, items) => {
        //console.log(items);
        if(!err){
          for (var i=0; i<items.length; i++) {
              if (items[i].indexOf("index.html")>=0) {
                console.log(items[i]);
                console.log(this.state.path+'/'+items[i]);
                this.convertTags(this.state.path+'/'+items[i]);
              }
          }
        }
        return;
      });

    }
  };


  convertTags(indexPath) {
    fs.readFile(indexPath, (err, data) => {
      if (!err) {
        // var htmcheerio.load(items[i]);
        //       console.log(cheerio);
        //       console.log(cheerio('span[class=linemarker-marked-line]').html());

        console.log(data.toString());

        var htmlContent=data.toString();

        var $ = cheerio.load(htmlContent);
        if ($('span[class=linemarker-marked-line]') != null){
          $('.linemarker-marked-line').addClass('new-marker').html()
          htmlContent = $('.linemarker-marked-line').removeClass('linemarker-marked-line').html()
          console.log($.html());
        }
        console.log($('span[class=new-marker]').html());
      }
      return;
    });
  }


  render() {
    const { classes } = this.props;
    return (
      <div>
        <input type="file" webkitdirectory="true" onChange={this.onChange} className={classes.input} id="import" />
        <label htmlFor="import">
          <Button variant="contained" component="span" className={classes.button}>
            Import
          </Button>
        </label>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LegacyDataConverter);
