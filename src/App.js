/**
 * @author Joshua Tzucker
 */

import React, { Component } from 'react';
import Fabs from './components/Fabs';
import Warnings from './components/Warnings';
import Init from './components/Init';
import AccountSettingsPanel from './components/AccountSettingsPanel';
import LogPanel from './components/LogPanel';
import StatsPanel from './components/StatsPanel';
import CanvasWrapper from './components/editor/CanvasWrapper';
import './App.css';
import Helpers from './inc/Helpers';
import $ from 'jquery';
import 'blueimp-file-upload/js/vendor/jquery.ui.widget.js';
import 'blueimp-file-upload/js/jquery.iframe-transport.js';
import 'blueimp-file-upload/js/jquery.fileupload.js';
import underscore from 'underscore';
window.$ = $;
window.jQuery = $;
const cloudinary = require('cloudinary-jquery-file-upload/cloudinary-jquery-file-upload');
window.cloudinary = cloudinary;
window.cloudinaryInstance = cloudinary.CloudinaryJQuery.new();

class App extends Component {
  constructor(){
    super();
    this.helpers = new Helpers();
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
        baseLayer : {
          image : null,
          // null | 'none' | 'image' | 'color'
          type : 'none',
          isId : false,
          colorHex : '#FFF',
          colorRGB : [255,255,255],
          opacity : 100,
          crop : 'scale'
        },
        baseImage : null
      },
      accountSettings : {
        cloudinaryCloudName : '',
        fetchInstantly : false,
        preferHttps : false,
        outputWidth : 400,
        outputHeight : 400,
        editorScale : 100,
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
    // Special debug state
    if (this.helpers.getIsDebug()){
      initialState.accountSettings.cloudinaryCloudName = 'demo';
    }
    this.state = initialState;
    window.getMasterState = this.getMasterState.bind(this);
    this.jQuery = window.jQuery;
    this.$ = this.jQuery;
    this.Materialize = window.M;
    window.Materialize = window.M;
    this.firstLoadComplete = false;

    /**
     * Try to load config file if exists
     */
    this.appConfig = this.helpers.getAppConfig().appConfig;
    this.hasAppConfig = typeof(this.appConfig)==='object';
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
    getMsSinceLastFetch : this.getMsSinceLastFetch.bind(this),
    getIsValidCloudinaryAcct : this.getIsValidCloudinaryAcct.bind(this)
  }

  getIsValidCloudinaryAcct(){
    let cloudinaryCloudName = this.state.accountSettings.cloudinaryCloudName;
    let prohibited = ['demo','null'];
    if(cloudinaryCloudName!==''){
      if (this.helpers.getIsDebug()){
        return true;
      }
      else return prohibited.indexOf(cloudinaryCloudName)===-1
    };
  }

  fireUpdateHooks(){
    this.state.updateHooks.forEach((hook)=>{
      if (typeof(hook)==='function'){
        hook(this.state);
      }
    });
  }

  runOnlyOnFirstLoad(){
    if(!this.firstLoadComplete){
      // do stuff
      this.helpers.fireGaPageView();
      this.firstLoadComplete = true;
      this.helpers.debugConsole.log('runOnlyOnFirstLoad complete!');
    }
    else {
      this.helpers.debugConsole.warn('runOnlyOnFirstLoad was called but first load already complete');
    }
  }

  componentDidUpdate(){
    this.fireUpdateHooks.bind(this);
  }
  componentDidMount(){
    this.fireUpdateHooks.bind(this);
    this.runOnlyOnFirstLoad();
  }
  render() {
    let hasValidCloudinaryAcct = this.getIsValidCloudinaryAcct();
    let generatorHasOutput = this.state.output.img.src.length > 0;
    return (
      <div className="App">
        <Fabs hasValidCloudinaryAcct={hasValidCloudinaryAcct} generatorHasOutput={generatorHasOutput} />
        <Warnings masterState={this.state} />
        <div className="mainContainer">
          <Init />
          <AccountSettingsPanel appMethods={this.appMethods} masterState={this.state} />
          <div className="myDivider"></div>
          <div className="appLower">
            {hasValidCloudinaryAcct ? (
              <CanvasWrapper appMethods={this.appMethods} masterState={this.state} editorData={this.state.editorData} />
            ) : (
              <div className="obscureBlocker">
                <div className="valign-wrapper">
                  <div className="errorMessage">Please enter valid account settings</div>
                </div>
              </div>
            )}
            <div className="myDivider"></div>
            <LogPanel logQueue={this.state.logQueue} />
            <StatsPanel masterState={this.state}></StatsPanel>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
