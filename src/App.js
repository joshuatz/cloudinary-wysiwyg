import React, { Component } from 'react';
import AccountSettingsPanel from './components/AccountSettingsPanel';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <AccountSettingsPanel />
      </div>
    );
  }
}

export default App;
