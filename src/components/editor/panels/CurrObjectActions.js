import React, {Component} from 'react';
import Helpers from '../../../inc/Helpers';

class CurrObjectActions extends Component {
  constructor(props){
    super(props);
    this.dpadButtonPressTimer = null;
    this.dpadButtonPressInterval = null;
    this.helpers = new Helpers();
  }
  handleDpadButtonPress(direction){
    // Immediately trigger move
    this.props.mainMethods.canvas.moveSelected(direction);
    // For long press, wait until button has been held down for 700 ms
    this.dpadButtonPressTimer = setTimeout(() => {
      // Start interval to trigger move every 50ms
      this.dpadButtonPressInterval = setInterval(() => {
        this.props.mainMethods.canvas.moveSelected(direction);
      }, 50);
    }, 700);
  }
  handleDpadButtonRelease(){
    if (this.dpadButtonPressTimer){
      clearTimeout(this.dpadButtonPressTimer);
    }
    if (this.dpadButtonPressInterval){
      clearInterval(this.dpadButtonPressInterval);
    }
  }
  generateDpadButton(direction,materialIcon){
    return (
      <button className={"button btn defaultPrimaryColor dpad" + this.helpers.properCase(direction)} onTouchStart={this.handleDpadButtonPress.bind(this,direction)} onTouchEnd={this.handleDpadButtonRelease.bind(this)} onMouseDown={this.handleDpadButtonPress.bind(this,direction)} onMouseUp={this.handleDpadButtonRelease.bind(this)} onMouseLeave={this.handleDpadButtonRelease.bind(this)} onClick={this.props.mainMethods.canvas.moveSelected.bind(this,direction)}><i className="material-icons">{materialIcon}</i></button>
    );
  }
  render(){
    return(
      <div className={"CurrObjectActions"}>
        <div className={(this.props.masterState.editorData.isItemSelected ? "" : " hidden")}>
          <div className="row">
            {/* Delete Button */}
            <button className={"button btn dangerColor"} onClick={this.props.mainMethods.canvas.deleteSelectedObjs.bind(this)}>Delete Selected</button>
            {/* Index buttons */}
            <div className="zIndexButtonsLabel">Z-Index:</div>
            <button className="button btn defaultPrimaryColor zIndexButton" onClick={this.props.mainMethods.canvas.moveSelectedZIndex.bind(this,'up')}><i className="material-icons">arrow_upward</i></button>
            <button className="button btn defaultPrimaryColor zIndexButton" onClick={this.props.mainMethods.canvas.moveSelectedZIndex.bind(this,'down')}><i className="material-icons">arrow_downward</i></button>
          </div>
          <div className="row">
            <div className="center full">Nudge Selected by Pixel</div>
            <div className="dpadWrapper">
              {this.generateDpadButton('left','arrow_left')}
              <div className="dpadUpAndDown">
                {this.generateDpadButton('up','arrow_upward')}
                {this.generateDpadButton('down','arrow_downward')}
              </div>
              {this.generateDpadButton('right','arrow_right')}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CurrObjectActions;