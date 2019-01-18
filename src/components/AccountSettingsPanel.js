import React, { Component } from 'react';
import LogPanel from './LogPanel';
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
      //this.state = newState;
    }

    // Attach this components state to master
    this.state = this.props.masterState[MASTER_STATE_KEY];
  }

  getDefaultState(){
    return {
      cloudinaryCloudName : 'demo',
      fetchInstantly : false,
      lastFetched : (new Date()).getTime() - (1000 * 60 * 60 * 24)
    }
    return this.props.masterState[MASTER_STATE_KEY];
  }

  getAccountSettingsState(){
    return this.props.masterState[MASTER_STATE_KEY];
  }

  handleChange(e){
    console.log(e.target);

    // Use the id of the input as the storage key
    let settingKey = e.target.id;

    // Get value dependent on type of input
    let value = (e.target.type==='checkbox' ? e.target.checked : e.target.value);
    /*
    if (this.state[settingKey]!==value){
      // Make sure to use callback!
      this.setState({
        [settingKey] : value
      },()=>{
        console.group('state');
          console.log(this.state);
        console.groupEnd();
        this.saveItDown();
      });
    }
    */

    let stateCopy = this.getAccountSettingsState();
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
  
  saveItDown(){
    //localStorage.setItem(this.LOCALSTORAGEKEY,JSON.stringify(this.state));
    localStorage.setItem(this.LOCALSTORAGEKEY,JSON.stringify(this.props.masterState[MASTER_STATE_KEY]));
  }

  reset(){
    //this.setState(this.getDefaultState());
    this.props.appMethods.mergeMasterState(MASTER_STATE_KEY,this.getDefaultState());
    localStorage.removeItem(this.LOCALSTORAGEKEY);
    this.props.appMethods.addMsg('Reset Settings');
    this.props.appMethods.resetEverything();
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
        <div className="row center">
          
          <div className="col s4 offset-s2 center">
            <div className="btn warningColor" onClick={this.props.appMethods.resetCanvas.bind(this)}>Reset Canvas</div>
          </div>
          <div className="col s4 offset-s2 center">
            <div className="btn dangerColor" onClick={this.reset.bind(this)}>Reset Everything</div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountSettingsPanel;