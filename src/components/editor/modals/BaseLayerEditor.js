import React, {Component} from 'react';
import ImageSelector from '../modals/ImageSelector';
import Helpers from '../../../inc/Helpers';

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

  handleBaseTypeChange(evt){
    let $ = this.$;
    let baseLayerType = evt.target.value;
    this.props.mainMethods.app.mergeMasterState('editorData.baseLayer.type',baseLayerType);
    this.setState(this.helpers.objectMerge(this.state,{
      type : baseLayerType
    }));
    // Reinit materialize
    // @todo
  }

  refresh(){
    //
  }
  
  render(){
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
            <div className="subConfigPanels">
              {this.state.type==='none' && 
                <div className="card-panel">
                  <p>Nothing to configure :)</p>
                </div>
              }
              {this.state.type==='color' && 
                <div className="card-panel">
                </div>
              }
              {this.state.type==='image' && 
                <ImageSelector inline={true} destination="baseLayer" />
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BaseLayerEditor;