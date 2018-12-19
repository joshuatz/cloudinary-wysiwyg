import React, {Component} from 'react';
import LayersPanel from './LayersPanel';
import ImageAssets from './ImageAssets';
import ToolPanel from './ToolPanel';

class CanvasWrapper extends Component {
  constructor(props){
    super(props);
  }
  canvasStyles = {
    // width : '100%'
  }
  componentDidMount(){
    let fabric = window.fabric;
    var canvas = new fabric.Canvas('editorCanvas',{
      width : 400,
      height : 400
    });
 
    var rect = new fabric.Rect({
        top : 100,
        left : 100,
        width : 60,
        height : 70,
        fill : 'red'
    });

    canvas.add(rect);
    this.props.editorData.canvasObj = canvas;
    console.log(this.props);
  }
  render(){
    return(
      <div className="canvasWrapper">
        <div className="row">
          <div className="col s12">
            <canvas id="editorCanvas" style={this.canvasStyles}></canvas>
          </div>
        </div>
        <div className="row">
          <div className="col s6">
            <LayersPanel />
            <ToolPanel />
            <ImageAssets />
          </div>
        </div>
      </div>
    );
  }
}

export default CanvasWrapper;