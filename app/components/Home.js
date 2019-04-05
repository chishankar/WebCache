// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import Paper from '@material-ui/core/Paper';
// import styles from './Home.css';
import RenderTextPage from '../containers/RenderTextPage';

import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from './Toolbar';
import homeStyles from './Home.css';
import { blue } from '@material-ui/core/colors';

const drawerWidth = 175;
// JUST A TEST :)

const styles = theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#383535de'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
  },
  txt: {
    color: 'white !important'
  }
});



type Props = {};
class Home extends Component {
  state = {
    mobileOpen: false,
  };

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes, theme } = this.props;

    const drawer = (
      <div>
        <div className={classes.toolbar}><h1 align="center">WebCache</h1></div>
        <Divider />
        <List className={classes.txt}>
          {['File', 'Save', 'Edit', 'Settings'].map((text, index) => (
            <ListItem button className={classes.txt} key={text}>
              <ListItemIcon className={classes.txt}>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText className={classes.txt} primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar} classes={{colorPrimary: homeStyles.appBar}}>

            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap>
              <Toolbar store={this.store}/>
            </Typography>
        </AppBar>
        <nav className={classes.drawer}>
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden smUp implementation="css" >
            <Drawer
              container={this.props.container}
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={this.state.mobileOpen}
              onClose={this.handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
              <RenderTextPage />
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Home);


// export default class Home extends Component<Props> {
//   props: Props;

//   // <h2>Home</h2>
//   // <Link to={routes.COUNTER}>to Counter</Link>

//   render() {
//     return (
//       <div data-tid="container">
//         < RenderTextPage/>
//       </div>
//     );
//   }
// }


