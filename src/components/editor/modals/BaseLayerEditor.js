import React, {Component} from 'react';
import ImageSelector from '../modals/ImageSelector';
import Helpers from '../../../inc/Helpers';
import {ChromePicker} from 'react-color';
import underscore from 'underscore';

class BaseLayerEditor extends Component {
  constructor(props){
    super(props);
    this.$ = window.jQuery;
    // Basically a clone of masterState.editorData.baseLayer
    let initialState = {};
    this.state = initialState;
    this.helpers = new Helpers();
  }

  updateState(updatedState){
    let originalState = underscore.clone(this.props.masterState.editorData.baseLayer);
    updatedState = this.helpers.objectMerge(originalState,updatedState);
    this.props.mainMethods.app.mergeMasterState('editorData.baseLayer',updatedState);
    this.setState(updatedState);
    // Update canvas
    this.props.mainMethods.canvas.applyBaseLayer();
  }

  handleBaseTypeChange(evt){
    let baseLayerType = evt.target.value;
    let stateChanges = {
      type : baseLayerType
    }
    if (baseLayerType==='none'){
      // For none, set color to white, and set opacity at 100%
      stateChanges.colorHex = '#FFF';
      stateChanges.colorRGB = [255,255,255];
      stateChanges.opacity = 100;
    }
    this.updateState(stateChanges);
    // Re init Materialize slider
    this.helpers.mtz.initSliders('#opacitySlider');
  }

  handleColorChange(color,event){
    this.updateState({
      colorHex : color.hex,
      colorRGB : [color.rgb.r,color.rgb.b,color.rgb.g]
    });
  }

  handleOpacityChange(evt){
    let opacity = parseInt(evt.target.value);
    this.updateState({
      opacity : opacity
    });
  }

  shouldComponentUpdate(nextProps,nextState){
    if (JSON.stringify(this.state)!==JSON.stringify(nextState)){
      return true;
    }
    return false;
  }

  componentDidUpdate(){
    this.helpers.mtz.initSliders('#opacitySlider');
  }

  refresh(){
    //
  }
  
  render(){
    let opacitySlider = (
      <div className="opacitySliderWrapper">
        <div className="row">
          <p className="range-field col s9">
            <input type="range" value={this.props.masterState.editorData.baseLayer.opacity} name="opacitySlider" id="opacitySlider" min="0" max="100" onChange={this.handleOpacityChange.bind(this)} />
            <label htmlFor="opacitySlider">Opacity (from 0 to 100%)</label>
          </p>
          <div className="col s3">
            <div className="opacitySliderNumber">{this.props.masterState.editorData.baseLayer.opacity}%</div>
          </div>
        </div>
      </div>
    );
    let colorHex = typeof(this.props.masterState.editorData.baseLayer.colorHex)==='string' ? this.props.masterState.editorData.baseLayer.colorHex : '#FFF';
    return(
      <div className="baseLayerEditorWrapper">
        <div className="baseLayerEditor modal" id="baseLayerEditor">
          <div className="modal-content">
            <h3>Base Layer Editor</h3>
            {/* Type of BaseLayer selector */}
            <div className="row">
              <div className="horizontalRadioGroup">
                <p>
                  <label>
                    <input name="baseLayerTypeSelector" type="radio" value="none" checked={this.props.masterState.editorData.baseLayer.type==='none'||this.props.masterState.editorData.baseLayer.type===null} onClick={this.handleBaseTypeChange.bind(this)} />
                    <span>None</span>
                  </label>
                </p>
                <p>
                  <label>
                    <input name="baseLayerTypeSelector" type="radio" value="color" checked={this.props.masterState.editorData.baseLayer.type==='color'} onClick={this.handleBaseTypeChange.bind(this)} />
                    <span>Solid Color</span>
                  </label>
                </p>
                <p>
                  <label>
                    <input name="baseLayerTypeSelector" type="radio" value="image" checked={this.props.masterState.editorData.baseLayer.type==='image'} onClick={this.handleBaseTypeChange.bind(this)} />
                    <span>Image</span>
                  </label>
                </p>
              </div>
            </div>
            <div className="subConfigPanels row">
              <div className="valign-wrapper">
                <div className="col s9">
                  {this.props.masterState.editorData.baseLayer.type==='none' && 
                    <div className="card-panel">
                      {opacitySlider}
                    </div>
                  }
                  {this.props.masterState.editorData.baseLayer.type==='color' && 
                    <div className="card-panel">
                      {opacitySlider}
                      <ChromePicker className="autoCenter" onChangeComplete={this.handleColorChange.bind(this)} color={colorHex}/>
                    </div>
                  }
                  {this.props.masterState.editorData.baseLayer.type==='image' && 
                    <div className="card-panel">
                      {opacitySlider}
                      <ImageSelector inline={true} destination="baseLayer" mainMethods={this.props.mainMethods} masterState={this.props.masterState} />
                    </div>
                  }
                </div>
                <div className="col s3">
                  <div className="button btn modal-close">Save Settings</div>
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