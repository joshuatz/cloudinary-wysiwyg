import React, { Component } from 'react';

class AccountSettingsPanel extends Component {
  constructor(props){
    super(props);
    // Constants
    this.LOCALSTORAGEKEY = 'accountSettings';
    // Set the initial state
    var defaultState = {
      cloudName : ''
    }
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
  handleChange(e){
    if (this.state.cloudName!==e.target.value){
      this.setState({
        cloudName : e.target.value
      });
      this.saveItDown();
      console.log(this.state);
    }
  }
  saveItDown(){
    localStorage.setItem(this.LOCALSTORAGEKEY,JSON.stringify(this.state));
  }
  render() {
    return (
        <div className="accountSettingsPanelWrapper row">
            <div className="accountSettingsPanel input-field col s6">
                <input id="cloudinaryCloudName" type="text" name="cloudinaryCloudName" value={this.state.cloudName} onChange={this.handleChange.bind(this)} onKeyUp={this.handleChange.bind(this)} />
                <label htmlFor="cloudinaryCloudName">Your Cloud Name</label>
            </div>
        </div>
    );
  }
}

export default AccountSettingsPanel;