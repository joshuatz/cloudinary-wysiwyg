import React, {Component} from 'react';

class BaseLayerEditor extends Component {
  constructor(props){
    super(props);
    this.$ = window.jQuery;
    let initialState = {};
    this.state = initialState;
  }
  
  render(){
    return(
      <div className="baseLayerEditorWrapper">
        <div className="baseLayerEditor">
          <div className="modal-content">
            <h3>Base Layer Editor</h3>
            <div className="row">
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default BaseLayerEditor;