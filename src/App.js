import React, { Component } from 'react';
import Init from './components/Init';
import AccountSettingsPanel from './components/AccountSettingsPanel';
import LogPanel from './components/LogPanel';
import CanvasWrapper from './components/editor/CanvasWrapper';
import './App.css';
import ImageSelector from './components/editor/modals/ImageSelector';
import Helpers from './inc/Helpers';

class App extends Component {
  constructor(){
    super();
    // Using this as top-level state
    this.state = {
      logQueue : [],
      editorData : {
        canvasObj : {},
        isItemSelected : false,
        images : {
          urls : []
        },
        layers : [],
        currSelectedColor : {
          'hex' : '#4a90e2'
        },
        updateHooks : []
      }
    }
    this.jQuery = window.jQuery;
    this.helpers = new Helpers();
  }

  mergeMasterState(targetProp,newVal,OPT_Callback){
    let callback = (OPT_Callback || (()=>{}));
    let updatedState = this.state;
    this.helpers.index(updatedState,targetProp,newVal);
    this.setState(updatedState,callback);
  }

  mergeEditorData(targetProp,newVal,OPT_Callback){
    targetProp = 'editorData.' + targetProp;
    this.mergeMasterState(targetProp,newVal,OPT_Callback);
  }

  addMsg(msg,callback){
    // Prepend timestamp to msg
    msg = (new Date()).toLocaleTimeString() + ' - ' + msg;
    callback = (callback || (()=>{}));
    let queue = this.state.logQueue;
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
  resetEverything(){
    let canvas = this.state.editorData.canvasObj;
    if (canvas && canvas['targets']){
      canvas.clear();
    }
  }
  appMethods = {
    addMsg : this.addMsg.bind(this),
    resetEverything : this.resetEverything.bind(this),
    mergeMasterState : this.mergeMasterState.bind(this),
    mergeEditorData : this.mergeEditorData.bind(this)
  }

  fireUpdateHooks(){
    this.state.updateHooks.forEach((hook)=>{
      if (typeof(hook)==='function'){
        hook(this.state);
      }
    });
  }

  componentDidUpdate(){
    this.fireUpdateHooks.bind(this);
  }
  componentDidMount(){
    this.fireUpdateHooks.bind(this);
  }
  render() {
    return (
      <div className="App">
        <Init />
        <AccountSettingsPanel appMethods={this.appMethods} />
        <CanvasWrapper appMethods={this.appMethods} editorData={this.state.editorData} />
        <LogPanel logQueue={this.state.logQueue} />
      </div>
    );
  }
}

export default App;
