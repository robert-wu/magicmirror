import 'styles/common.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import {Router, Route, Redirect} from 'react-router'
import createHistory from 'history/lib/createHashHistory'

import injectTapEventPlugin from 'react-tap-event-plugin'

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


import configureStore from './configureStore'
const store = configureStore();
window.store = store;

import App from './components/App'

var history = createHistory({
  queryKey: false
});

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>
			<Route component={App}>
			</Route>
		</Router>
	</Provider>,
	document.getElementById('content')
);
