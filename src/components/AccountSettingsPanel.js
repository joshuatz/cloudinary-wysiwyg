import React, { Component } from 'react';
import LogPanel from './LogPanel';

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
      this.state = newState;
    }
    else {
      this.state = defaultState;
    }
    console.log(this.state);
  }

  getDefaultState(){
    return {
      cloudinaryCloudName : '',
      fetchInstantly : false
    }
  }
  handleChange(e){
    console.log(e.target);

    // Use the id of the input as the storage key
    let settingKey = e.target.id;

    // Get value dependent on type of input
    let value = (e.target.type==='checkbox' ? e.target.checked : e.target.value);
    
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
  }
  saveItDown(){
    localStorage.setItem(this.LOCALSTORAGEKEY,JSON.stringify(this.state));
  }
  reset(){
    this.setState(this.getDefaultState());
    localStorage.removeItem(this.LOCALSTORAGEKEY);
    this.props.mainMethods.addMsg('Reset Settings');
    this.props.mainMethods.resetEverything();
  }
  render() {
    return (
      <div className="accountSettingsPanelWrapper">
        <div className="row valign-wrapper">
            <div className="input-field col s5">
              <input id="cloudinaryCloudName" type="text" name="cloudinaryCloudName" value={this.state.cloudinaryCloudName} onChange={this.handleChange.bind(this)} onKeyUp={this.handleChange.bind(this)} />
              <label htmlFor="cloudinaryCloudName">Your Cloud Name</label>
            </div>
            <div className="col s6 offset-s1 center">
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
          <div className="col s4 offset-s4 center">
            <div className="btn red" onClick={this.reset.bind(this)}>Reset</div>
          </div>
        </div>
      </div>
    );
  }
}

export default AccountSettingsPanel;