import React, { Component } from 'react';

class StatsPanel extends Component {
  constructor(props){
    super(props);
    this.state = {};
  }
  render(){
    let editorData = this.props.masterState.editorData;
    let canvas = editorData.canvasObj;
    let canvasObjs = typeof(canvas._objects) !== 'undefined' ? canvas._objects : [];
    let output = this.props.masterState.output;
    let performanceStats = this.props.masterState.performance;
    let transformationsCount = output.transformations.transformationArr.length;
    return (
      <div className="StatsPanelWrapper roundedWrapper">
        <div className="statPanel">
          <div className="row">
            {/* Canvas */}
            <div className="col s6 statsModule">
              <div className="card-panel z-depth-2 row">
                <div className="title col s12">Canvas</div>
                <div className="col s8 key">Total Objects:</div><div className="col s4 val">{canvasObjs.length}</div>
                <div className="col s8 key">Canvas Dimensions:</div><div className="col s4 val">{editorData.canvasDimensions.width + ' x ' + editorData.canvasDimensions.height}</div>
              </div>
            </div>
            {/* Cloudinary */}
            <div className="col s6 statsModule">
              <div className="card-panel z-depth-2 row">
                <div className="title col s12">Cloudinary</div>
                <div className="col s8 key">Transformation Count:</div><div className="col s4 val">{transformationsCount}</div>
                <div className="col s8 key">URL Length:</div><div className="col s4 val">{output.img.src.length}</div>
              </div>
            </div>
            {/* Performance */}
            <div className="col s6 statsModule">
              <div className="card-panel z-depth-2 row">
                <div className="title col s12">Performance</div>
                <div className="col s8 key">Generation Time:</div><div className="col s4 val">{performanceStats.generationTimeSec.toFixed(3)}s</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default StatsPanel;