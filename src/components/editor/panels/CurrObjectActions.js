import React, {Component} from 'react';

class CurrObjectActions extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <div className={"CurrObjectActions" + (this.props.masterState.editorData.isItemSelected ? "" : " hidden")}>
        {/* Delete Button */}
        <button className={"button btn dangerColor"} onClick={this.props.mainMethods.canvas.deleteSelectedObjs.bind(this)}>Delete Selected</button>
        {/* Index buttons */}
        <button className="button btn defaultPrimaryColor" onClick={this.props.mainMethods.canvas.moveSelected.bind(this,'up')}><i className="material-icons">arrow_upward</i></button>
        <button className="button btn defaultPrimaryColor" onClick={this.props.mainMethods.canvas.moveSelected.bind(this,'down')}><i className="material-icons">arrow_downward</i></button>
      </div>
    )
  }
}

export default CurrObjectActions;