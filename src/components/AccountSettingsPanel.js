import React, { Component } from 'react';

class AccountSettingsPanel extends Component {
  constructor(props){
    super(props);
    // Set the initial state
    this.state = {
      cloudName : ''
    }
  }
  handleChange(e){
    if (this.state.cloudName!==e.target.value){
      this.setState({
        cloudName : e.target.value
      });
      console.log(this.state);
    }
  }
  render() {
    return (
        <div className="accountSettingsPanelWrapper row">
            <div className="accountSettingsPanel input-field col s6">
                <input id="cloudinaryCloudName" type="text" name="cloudinaryCloudName" value={this.props.cloudName} onChange={this.handleChange.bind(this)} onKeyUp={this.handleChange.bind(this)} />
                <label htmlFor="cloudinaryCloudName">Your Cloud Name</label>
            </div>
        </div>
    );
  }
}

export default AccountSettingsPanel;