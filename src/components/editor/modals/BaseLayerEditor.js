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
      colorHex : null,
      opacity : 100,
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
    // Re init Materialize slider
    this.helpers.mtz.initSliders('#opacitySlider');
  }

  handleColorChange(color,event){
    this.updateState({
      colorHex : color.hex
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
            <input type="range" value={this.state.opacity} name="opacitySlider" id="opacitySlider" min="0" max="100" onChange={this.handleOpacityChange.bind(this)} />
            <label htmlFor="opacitySlider">Opacity (from 0 to 100%)</label>
          </p>
          <div className="col s3">
            <div className="opacitySliderNumber">{this.state.opacity}%</div>
          </div>
        </div>
      </div>
    );
    let colorHex = typeof(this.state.colorHex)==='string' ? this.state.colorHex : '#FFF';
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
                      {opacitySlider}
                      <ChromePicker className="autoCenter" onChangeComplete={this.handleColorChange.bind(this)} color={colorHex}/>
                    </div>
                  }
                  {this.state.type==='image' && 
                    <div className="card-panel">
                      {opacitySlider}
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