import React, { Component, PropTypes } from 'react'
import {StyleRoot} from 'radium';
import { connect } from 'react-redux'
import {Link} from 'react-router'

import AppBar from 'material-ui/lib/app-bar';
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';

import ThemeManager from 'material-ui/lib/styles/theme-manager';
import ThemeDecorator from 'material-ui/lib/styles/theme-decorator';
import CustomTheme from '../theme';

const styles = {
  leftNav: {
    marginTop: 64
  }
};

@ThemeDecorator(ThemeManager.getMuiTheme(CustomTheme))
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navOpen: false
    }
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, this.props);
    });
    return (
      <StyleRoot>
        <div style={{width: '100%', height: '100%'}}>
          <AppBar
            title="Scout"
            iconClassNameRight="muidocs-icon-navigation-expand-more"
            onLeftIconButtonTouchTap={this._toggleNav.bind(this)}
          />
          <LeftNav style={styles.leftNav} open={this.state.navOpen}>
            <MenuItem><Link to={`/`}>Home</Link></MenuItem>
            <MenuItem><Link to={`/schedule`}>Schedule</Link></MenuItem>
          </LeftNav>
          {childrenWithProps}
        </div>
      </StyleRoot>
    );
  }

  _toggleNav() {
    this.setState({navOpen: !this.state.navOpen});
  }
}

function mapStateToProps(state) {
  //TODO: this might be gross, will have to investigate more
  return Object.assign({}, state, {});
}

export default connect(mapStateToProps)(App);
