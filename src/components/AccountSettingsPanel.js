import React, { Component } from 'react';
import Helpers from '../inc/Helpers';
const MASTER_STATE_KEY = 'accountSettings';

class AccountSettingsPanel extends Component {
  constructor(props){
    super(props);

    // Constants
    this.LOCALSTORAGEKEY = 'accountSettings';

    // Set the initial state
    var defaultState = this.getDefaultState();
    if (localStorage.getItem(this.LOCALSTORAGEKEY)){
      // Attempt to fill state from storage
      let newState = defaultState;
      let savedState = JSON.parse(localStorage.getItem(this.LOCALSTORAGEKEY));
      Object.keys(defaultState).forEach((key)=>{
        if (typeof(savedState[key])!=='undefined'){
          newState[key] = savedState[key];
        }
      });
      // Merge back up
      this.props.appMethods.mergeMasterState(MASTER_STATE_KEY,newState);
    }

    this.helpers = new Helpers();

    // Attach this components state to master
    this.state = this.props.masterState[MASTER_STATE_KEY];
    this.copyDimensionsToCanvas();
  }
  
  componentDidMount(){
    //
  }

  /**
   * Gets the "default" state of account settings - used for reset() function
   */
  getDefaultState(){
    return {
      cloudinaryCloudName : 'demo',
      fetchInstantly : false,
      lastFetched : (new Date()).getTime() - (1000 * 60 * 60 * 24),
      outputWidth : 400,
      outputHeight : 400,
      editorScale : 1
    }
  }

  /**
   * Get the account settings JSON from state
   */
  getAccountSettingsState(){
    return this.props.masterState[MASTER_STATE_KEY];
  }

  copyDimensionsToCanvas(){
    this.props.appMethods.mergeMasterState('editorData.canvasDimensions',{
      width : this.state.outputWidth,
      height : this.state.outputHeight
    });
  }

  handleChange(e){
    console.log(e.target);
    // Get state
    let stateCopy = this.getAccountSettingsState();

    // Use the id of the input as the storage key
    let settingKey = e.target.id;

    // Get value dependent on type of input
    let value = (e.target.type==='checkbox' ? e.target.checked : e.target.value);

    // Special - Dimensions
    if (settingKey==='outputWidth' || settingKey === 'outputHeight'){
      // Force to number
      value = parseInt(value);
      // Copy dimension to canvas settings
      this.props.appMethods.mergeMasterState('editorData.canvasDimensions.' + settingKey.replace('output','').toLowerCase(),value,()=>{
        //
      });
    }

    
    if (stateCopy[settingKey]!==value){
      // Update copy
      stateCopy[settingKey]=value;
      // Update master, then save to localstorage - make sure to use callback!
      this.props.appMethods.mergeMasterState(MASTER_STATE_KEY,stateCopy,()=>{
        console.group('state');
          console.log(this.getAccountSettingsState());
        console.groupEnd();
        this.saveItDown();
      });
    }
  }
  
  /**
   * Saves accounts settings JSON to localstorage
   */
  saveItDown(){
    localStorage.setItem(this.LOCALSTORAGEKEY,JSON.stringify(this.props.masterState[MASTER_STATE_KEY]));
  }

  /**
   * Resets account settings to the default state
   */
  reset(){
    this.props.appMethods.mergeMasterState(MASTER_STATE_KEY,this.getDefaultState());
    localStorage.removeItem(this.LOCALSTORAGEKEY);
    this.props.appMethods.addMsg('Reset Settings');
    this.props.appMethods.resetEverything();
  }

  componentDidUpdate(){
    this.helpers.mtz.initSliders('#editorScale');
  }

  render() {
    return (
      <div className="accountSettingsPanelWrapper roundedWrapper">
        <div className="row valign-wrapper">
            <div className="input-field col s5">
              <input id="cloudinaryCloudName" type="text" name="cloudinaryCloudName" value={this.state.cloudinaryCloudName} onChange={this.handleChange.bind(this)} onKeyUp={this.handleChange.bind(this)} />
              <label htmlFor="cloudinaryCloudName">Your Cloud Name</label>
            </div>
            <div className="col s6 offset-s1 center instantRenderingSwitchWrapper">
              <div className="valign-wrapper">
                <div className="switchHeading">Instant Rendering</div>
                <div className="switch">
                  <label>
                    Off
                    <input id="fetchInstantly" type="checkbox" checked={this.state.fetchInstantly} onChange={this.handleChange.bind(this)} />
                    <span className="lever"></span>
                    On
                  </label>
                </div>
              </div>
            </div>
        </div>
        <div className="row">
          <div className="col s4 offset-s1 input-field">
            <input id="outputWidth" type="number" min="2" max="8000" step="1" value={this.state.outputWidth} onChange={this.handleChange.bind(this)}></input>
            <label htmlFor="#outputWidth">Output Width:</label>
          </div>
          <div className="col s4 offset-s1 input-field">
            <input id="outputHeight" type="number" min="2" max="8000" step="1" value={this.state.outputHeight} onChange={this.handleChange.bind(this)}></input>
            <label htmlFor="#outputHeight">Output Height:</label>
          </div>
        </div>
        <div className="row editorScaleWrapper">
          <p className="range-field col s6">
            <input type="range" value={this.state.editorScale} name="editorScale" id="editorScale" min="1" max="100" onChange={this.handleChange.bind(this)} />
            <label htmlFor="editorScale">Output Scale</label>
          </p>
          <div className="col s6 row">
            <div className="col s6">
              On-screen editor will be scaled to {this.state.editorScale}%
            </div>
            <div className="col s6">
              Editor dimensions = {this.state.outputWidth * this.state.editorScale/100}px X {this.state.outputHeight * this.state.editorScale/100}px
            </div>
          </div>
        </div>
        <div className="row center resetButtonsWrapper">
          <div className="col s5 offset-s1 center">
            <div className="btn warningColor" onClick={this.props.appMethods.resetCanvas.bind(this)}>Reset Canvas</div>
          </div>
          <div className="col s5 offset-s1 center">
            <div className="btn dangerColor" onClick={this.reset.bind(this)}>Reset Everything</div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountSettingsPanel;