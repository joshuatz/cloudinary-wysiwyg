import React, { Component } from 'react';
import Init from './components/Init';
import AccountSettingsPanel from './components/AccountSettingsPanel';
import LogPanel from './components/LogPanel';
import StatsPanel from './components/StatsPanel';
import CanvasWrapper from './components/editor/CanvasWrapper';
import './App.css';
import ImageSelector from './components/editor/modals/ImageSelector';
import OutputResults from './components/editor/modals/OutputResults';
import Helpers from './inc/Helpers';
import $ from 'jquery';
import 'jquery-ui';
import 'blueimp-file-upload/js/vendor/jquery.ui.widget.js';
import 'blueimp-file-upload/js/jquery.iframe-transport.js';
import 'blueimp-file-upload/js/jquery.fileupload.js';
// import * as cloudinary from 'cloudinary-jquery-file-upload/cloudinary-jquery-file-upload.min.js';
import * as cloudinary from 'cloudinary-jquery-file-upload/cloudinary-jquery-file-upload.js';
import underscore from 'underscore';
window.$ = $;
window.jQuery = $;
window.cloudinary = cloudinary;
window.cloudinaryInstance = cloudinary.CloudinaryJQuery.new();

class App extends Component {
  constructor(){
    super();
    // Using this as top-level state
    let initialState = {
      logQueue : [],
      editorData : {
        canvasObj : {},
        canvasDimensions : {
          width : 400,
          height : 400
        },
        isItemSelected : false,
        currSelectedItemType : false,
        currSelectedItemGenericProps : {},
        images : {
          urls : []
        },
        layers : [],
        currSelectedColor : {
          'hex' : '#4a90e2'
        },
        currSelectedFont : {
          'size' : 16,
          'fontFamilySlim' : 'Roboto',
          'fontFamilyFull' : '"Roboto", sans-serif',
          'color' : false,
          'style' : false,
          'bold' : false,
          'underline' : false,
          'strikethrough' : false
        },
        updateHooks : [],
        baseImage : null
      },
      accountSettings : {
        cloudinaryCloudName : 'demo',
        fetchInstantly : false
      },
      output : {
        transformations : {
          transformationArr : []
        },
        img : {
          raw : {},
          html : '',
          src : ''
        },
        imgSrc : ''
      },
      livePreviewSrc : '',
      lastFetched : (new Date()).getTime() - (1000 * 60 * 60 * 24),
      fetchCount : 0,
      performance : {
        generationTimeSec : 0
      }
    }
    initialState.editorData.lastSelectedFont = underscore.clone(initialState.editorData.currSelectedFont);
    this.state = initialState;
    window.getMasterState = this.getMasterState.bind(this);
    this.jQuery = window.jQuery;
    this.$ = this.jQuery;
    this.Materialize = window.M;
    window.Materialize = window.M;

    this.helpers = new Helpers();
  }

  /**
   * Use this to update the master state, by picking out a key via dot notation and specifying a new value
   * @param {string} targetProp - dot notation string for accessing value in state object - e.g. "editorData.images"
   * @param {*} newVal - the new value to assign
   * @param {function} [OPT_Callback] - Optional callback
   */
  mergeMasterState(targetProp,newVal,OPT_Callback){
    let callback = (OPT_Callback || (()=>{}));
    let updatedState = this.state;
    this.helpers.index(updatedState,targetProp,newVal);
    this.setState(updatedState,callback);
  }

  getMasterState(){
    return this.state;
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

  materializeInit(){
    let $ = this.$;
    this.Materialize.AutoInit();
    $('[data-tooltip]').tooltip();
  }

  resetEverything(){
    this.resetCanvas();
  }
  resetCanvas(){
    let canvas = this.state.editorData.canvasObj;
    if (canvas && canvas['targets']){
      canvas.clear();
    }
    this.mergeMasterState('livePreviewSrc','');
  }

  getSecondsSinceLastFetch(){
    return (this.getMsSinceLastFetch() / 1000);
  }

  getMsSinceLastFetch(){
    let msPast = (new Date()).getTime() - this.state.lastFetched;
    return msPast;
  }

  appMethods = {
    addMsg : this.addMsg.bind(this),
    resetEverything : this.resetEverything.bind(this),
    resetCanvas : this.resetCanvas.bind(this),
    mergeMasterState : this.mergeMasterState.bind(this),
    mergeEditorData : this.mergeEditorData.bind(this),
    getMasterState : this.getMasterState.bind(this),
    getSecondsSinceLastFetch : this.getSecondsSinceLastFetch.bind(this),
    getMsSinceLastFetch : this.getMsSinceLastFetch.bind(this)
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
    this.materializeInit();
  }
  render() {
    return (
      <div className="App container">
        <Init />
        <AccountSettingsPanel appMethods={this.appMethods} masterState={this.state} />
        <div className="myDivider"></div>
        <CanvasWrapper appMethods={this.appMethods} masterState={this.state} editorData={this.state.editorData} />
        <div className="myDivider"></div>
        <LogPanel logQueue={this.state.logQueue} />
        <StatsPanel masterState={this.state}></StatsPanel>
      </div>
    );
  }
}

export default App;
