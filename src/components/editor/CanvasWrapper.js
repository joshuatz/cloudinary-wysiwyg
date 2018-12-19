import React, {Component} from 'react';
import LayersPanel from './LayersPanel';
import ImageAssets from './ImageAssets';
import ToolPanel from './ToolPanel';
import PaintSelector from './PaintSelector';

class CanvasWrapper extends Component {
  constructor(props){
    super(props);
    this.state = {
      counter : 0,
      editorData : this.props.editorData
    }
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
    //this.props.editorData.canvasObj = canvas;
    let editorData = this.state.editorData;
    editorData.canvasObj = canvas;
    console.log(this.props);
    //debugger;
    this.setState({
      counter : ++this.state.counter,
      editorData : editorData
    });
  }
  render(){
    return(
      <div className="canvasWrapper">
        <div className="row">
          <div className="col s9">
            <canvas id="editorCanvas" style={this.canvasStyles}></canvas>
          </div>
          <div className="col s3">
            <ToolPanel editorData={this.state.editorData} counter={this.state.counter} />
          </div>
          <div className="col s3">
            <PaintSelector />
          </div>
          <div className="col s3">
            <LayersPanel />
          </div>
          <div className="col s3">
            <ImageAssets />
          </div>
        </div>
      </div>
    );
  }
}

export default CanvasWrapper;