import React, { Component } from 'react';

class LogPanel extends Component {
  constructor(props){
    super(props);
  }
  render(){
    let logQueue = this.props.logQueue.map((val,index)=>{
      return <div className="logMessage" key={"logMessage_" + index}>{val}</div>
    })
    return (
      <div className="logPanel">
        {logQueue}
      </div>
    )
  }
}
export default LogPanel;