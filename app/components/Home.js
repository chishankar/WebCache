import React, { Component } from 'react';

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import Tools from './Toolbar';
import homeStyles from './Home.css';
import FileDialogue from './FileSelector';
import SideBarPage from '../containers/SideBarPage';
import RenderTextPage from '../containers/RenderTextPage';

const drawerWidth = 250;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: 'white',
    zIndex: theme.zIndex.drawer + 1,
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: 'darkslategrey',
    color: 'black !importnat',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  toolbar: theme.mixins.toolbar,
});

type Props = {};
class Home extends Component {
  // props: Props

  state = {
    open: false
  }
  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render(){
    const { classes, theme } = this.props;
    const { open } = this.state;

    const drawer = (
      <div>
        <div className={classes.toolbar}><h1 align='center'>WebCache</h1></div>
        <Divider />
        <FileDialogue store={this.store}/>
      </div>
    );

    return (
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            position='fixed'
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
            },{colorPrimary: homeStyles.appBar})}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                aria-label='Open drawer'
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant='h6' color='inherit' noWrap>
                <Tools store={this.store} />
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant='persistent'
            anchor='left'
            open={open}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider />
            {drawer}
          </Drawer>
          <main
            className={classNames(classes.content, {
              [classes.contentShift]: open,
            })}
          >
            <div className={classes.drawerHeader} />
                <RenderTextPage store={this.store}/>
          </main>
          <Drawer
            className={classes.drawer}
            variant='permanent'
            anchor='right'
            classes={{
              paper: classes.drawerPaper,
            }}>

            <div className={classes.toolbar} />
            <List>
              <SideBarPage store={this.store}/>
            </List>
          </Drawer>
        </div>
      );
    };
}

  export default withStyles(styles, { withTheme: true })(Home);
