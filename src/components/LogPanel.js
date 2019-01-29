import React, { Component } from 'react';

class LogPanel extends Component {
  constructor(props){
    super(props);
    this.state = {};
  }
  render(){
    let logQueue = this.props.logQueue.map((val,index)=>{
      return <div className="logMessage" key={"logMessage_" + index}>{val}</div>
    })
    return (
      <div className="logPanelWrapper roundedWrapper">
        <div className="logPanel">
          {logQueue}
        </div>
      </div>
    )
  }
}
export default LogPanel;