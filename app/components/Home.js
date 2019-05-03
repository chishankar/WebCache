import React, { Component } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
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
import NotificationCenter from './NotificationCenter';

import Footer from './Footer';
import Tools from './Toolbar';
import homeStyles from './Home.css';
import LegacyDataConverter from './LegacyDataConverter'
import FileDialogue from './FileSelector';
import SideBarPage from '../containers/SideBarPage';
import SearchSideBarPage from '../containers/SearchSideBarPage';
import RenderTextPage from '../containers/RenderTextPage';

// const theme = createMuiTheme({
//   palette: {
//     primary: '#303030',
//     secondary: '#707070',
//     error: '#8b0000',
//   }
// });

const drawerWidth = 250;

const styles = theme => ({
  root: {
    display: 'flex',
    padding: '0 !important'
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    color: 'black',
    backgroundColor: '#485665',
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
    color: 'black',
    backgroundColor: '485665 !important',
    padding: '0 !important',
    border: 'inherit'
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
    padding: 0,
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
  list:{
    padding: '0px !important'
  }
});

type Props = {};
class Home extends Component {
  // props: Props

  state = {
    open: false,
  }
  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  state = {
    open: false,
    showSearchSideBar: false
  };

  // These two functions handle opening and closes the file tree menu component
  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  componentDidUpdate(prevProps){
    if (!(this.props.sidebarState === prevProps.sidebarState)) {
      this.setState({
          showSearchSideBar: this.props.sidebarState
       });
     }
  }

  render(){
    const { classes, theme } = this.props;
    const { open } = this.state;

    const drawer = (
      <div>
        <div className={classes.toolbar}><h1 align='center'>WebCache</h1></div>
        <Divider />
        <LegacyDataConverter />
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

            <div className={classNames(classes.toolbar, classes.toolbarRight)}/>
            {!this.state.showSearchSideBar &&
            <List className={classes.list}>
                <SideBarPage store={this.store}/>
            </List>}
            {this.state.showSearchSideBar &&
            <List className={classes.list}>
               <SearchSideBarPage store={this.store}/>
            </List>}

          </Drawer>
          <NotificationCenter />
        </div>
      );
    };
  }


  export default withStyles(styles, { withTheme: true })(Home);
