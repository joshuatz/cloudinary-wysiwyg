import React, { Component } from 'react';
import Init from './components/Init';
import AccountSettingsPanel from './components/AccountSettingsPanel';
import LogPanel from './components/LogPanel';
import CanvasWrapper from './components/editor/CanvasWrapper';
import './App.css';
import ImageSelector from './components/editor/modals/ImageSelector';

class App extends Component {
  constructor(){
    super();
    this.state = {
      logQueue : [],
      editorData : {
        canvasObj : {},
        isItemSelected : false,
        images : {},
        layers : [],
        currSelectedColor : {
          'hex' : '#4a90e2'
        }
      }
    }
    this.jQuery = window.jQuery;
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
    console.log(this.state);
  }
  resetEverything(){
    let canvas = this.state.editorData.canvasObj;
    if (canvas && canvas['targets']){
      canvas.clear();
    }
  }
  mainMethods = {
    addMsg : this.addMsg.bind(this),
    resetEverything : this.resetEverything.bind(this)
  }
  render() {
    return (
      <div className="App">
        <Init />
        <AccountSettingsPanel mainMethods={this.mainMethods} />
        <CanvasWrapper mainMethods={this.mainMethods} editorData={this.state.editorData} />
        <LogPanel logQueue={this.state.logQueue} />
        <div className="modals">
          <ImageSelector />
        </div>
      </div>
    );
  }
}

export default App;
