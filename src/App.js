import React, { Component } from 'react';
import AccountSettingsPanel from './components/AccountSettingsPanel';
import LogPanel from './components/LogPanel';
import CanvasWrapper from './components/editor/CanvasWrapper';
import './App.css';

class App extends Component {
  constructor(){
    super();
    this.state = {
      logQueue : [],
      editor : {
        canvasObj : {},
        layers : []
      }
    }
  }
  addMsg(msg,callback){
    // Prepend timestamp to msg
    let stamp = (new Date()).toLocaleTimeString();
    msg = stamp + ' - ' + msg;
    callback = (callback || (()=>{}));
    let queue = this.state.logQueue;
    console.log(queue);
    // Push to the front of queue
    queue.unshift(msg);
    // Only keep 10 messages in queue
    if (queue.length > 10){
      queue = queue.slice(0,11);
    }
    this.setState({
      logQueue : queue
    },callback);
  }
  mainMethods = {
    addMsg : this.addMsg.bind(this)
  }
  render() {
    return (
      <div className="App">
        <AccountSettingsPanel mainMethods={this.mainMethods} />
        <CanvasWrapper mainMethods={this.mainMethods} editorData={this.state.editor} />
        <LogPanel logQueue={this.state.logQueue} />
      </div>
    );
  }
}

export default App;
