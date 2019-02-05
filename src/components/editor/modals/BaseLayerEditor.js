import React, {Component} from 'react';
import ImageSelector from '../modals/ImageSelector';
import Helpers from '../../../inc/Helpers';
import {ChromePicker} from 'react-color';

class BaseLayerEditor extends Component {
  constructor(props){
    super(props);
    this.$ = window.jQuery;
    // Basically a clone of masterState.editorData.baseLayer
    let initialState = {
      image : null,
      type : 'none',
      isId : false,
      color : null,
      opacity : 1,
      crop : 'scale'
    };
    this.state = initialState;
    this.helpers = new Helpers();
  }

  updateState(updatedState){
    let originalState = this.state;
    updatedState = this.helpers.objectMerge(originalState,updatedState);
    this.props.mainMethods.app.mergeMasterState('editorData.baseLayer',updatedState);
    this.setState(updatedState);
  }

  handleBaseTypeChange(evt){
    let baseLayerType = evt.target.value;
    this.updateState({
      type : baseLayerType
    });
  }

  handleColorChange(color,event){
    this.updateState({
      color : color.hex
    });
  }

  refresh(){
    //
  }
  
  render(){
    let colorHex = typeof(this.state.color)==='string' ? this.state.color : '#FFF';
    return(
      <div className="baseLayerEditorWrapper">
        <div className="baseLayerEditor">
          <div className="modal-content">
            <h3>Base Layer Editor</h3>
            {/* Type of BaseLayer selector */}
            <div className="row">
              <div className="horizontalRadioGroup">
                <p>
                  <label>
                    <input name="baseLayerTypeSelector" type="radio" value="none" checked={this.state.type==='none'||this.state.type===null} onClick={this.handleBaseTypeChange.bind(this)} />
                    <span>None</span>
                  </label>
                </p>
                <p>
                  <label>
                    <input name="baseLayerTypeSelector" type="radio" value="color" checked={this.state.type==='color'} onClick={this.handleBaseTypeChange.bind(this)} />
                    <span>Solid Color</span>
                  </label>
                </p>
                <p>
                  <label>
                    <input name="baseLayerTypeSelector" type="radio" value="image" checked={this.state.type==='image'} onClick={this.handleBaseTypeChange.bind(this)} />
                    <span>Image</span>
                  </label>
                </p>
              </div>
            </div>
            <div className="subConfigPanels row">
              <div className="valign-wrapper">
                <div className="col s9">
                  {this.state.type==='none' && 
                    <div className="card-panel">
                      <p>Nothing to configure :)</p>
                    </div>
                  }
                  {this.state.type==='color' && 
                    <div className="card-panel">
                      <ChromePicker className="autoCenter" onChangeComplete={this.handleColorChange.bind(this)} color={colorHex}/>
                    </div>
                  }
                  {this.state.type==='image' && 
                    <div className="card-panel">
                      <ImageSelector inline={true} destination="baseLayer" />
                    </div>
                  }
                </div>
                <div className="col s3">
                  <div className="button btn modal-trigger modal-close">Save Settings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BaseLayerEditor;