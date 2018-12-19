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
      fabric : window.fabric,
      editorData : this.props.editorData
    }
  }
  mergeEditorData(prop,val,OPT_Callback){
    let callback = (OPT_Callback || (()=>{}));
    let state = this.state;
    let editorData = this.state.editorData;
    editorData[prop] = val;
    state.editorData = editorData;
    this.setState(state,()=>{
      callback(state);
    });
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
    let editorData = this.state.editorData;
    editorData.canvasObj = canvas;
    this.setState({
      editorData : editorData
    });
    window.canvas = canvas;

    // Attach global event listeners
    canvas.on('selection:cleared',()=>{
      this.handleNoSelection();
    });
  }

  clearCanvas(){
    this.state.editorData.canvasObj.clear();
  }

  handleShapeSelect(shape){
    this.mergeEditorData('isItemSelected',true);
    console.log(shape);
  }
  handleNoSelection(){
    this.mergeEditorData('isItemSelected',false);
  }
  handleColorSelect(color,event){
    console.log(color);
    console.log(event);
    let editorData = this.state.editorData;
    editorData.currSelectedColor = color;
    this.setState({
      editorData : editorData
    });
    if (this.state.editorData.isItemSelected){
      // items are selected, iterate through all of them and set color
      this.getSelectedObjs().forEach((item)=>{
        item.set('fill',color.hex);
      });
      this.canvasRenderAll();
    }
  }
  canvasRenderAll(){
    let canvas = this.state.editorData.canvasObj;
    canvas.renderAll();
  }
  getSelectedObjs(){
    let selected = [];
    let canvas = this.state.editorData.canvasObj;
    if (this.state.editorData.isItemSelected){
      if (!canvas.getActiveObject()){
        // Nothing selected
        this.mergeEditorData('isItemSelected',false);
      }
      else if (typeof(canvas.getActiveObject()['_objects'])!=='undefined'){
        // Group selected
        selected = canvas.getActiveObject()._objects;
      }
      else {
        selected = [canvas.getActiveObject()];
      }
    }
    return selected;
  }
  getSelectedObjColor(){
    
  }
  getCurrSelectedColor(){
    return this.state.editorData.currSelectedColor;
  }
  addRect(){
    let canvas = this.state.editorData.canvasObj;
    let fabric = this.state.fabric;
    let rect = new fabric.Rect({
      top : 50,
      left : 50,
      width: 100,
      height : 100,
      fill : this.getCurrSelectedColor().hex
    });
    canvas.add(rect);
    rect.on('selected',()=>{
      this.handleShapeSelect(rect);
    });
  }
  mainMethods = {
    colors : {
      handleColorSelect : this.handleColorSelect.bind(this)
    },
    canvas : {
      handleShapeSelect : this.handleShapeSelect.bind(this),
      addRect : this.addRect.bind(this),
      clearCanvas : this.clearCanvas.bind(this)
    }
  }
  render(){
    return(
      <div className="canvasWrapper">
        <div className="row">
          <div className="col s7">
            <canvas id="editorCanvas" style={this.canvasStyles}></canvas>
          </div>
          <div className="col s5">
            <ToolPanel editorData={this.state.editorData} mainMethods={this.mainMethods}/>
          </div>
          <div className="col s5">
            <PaintSelector mainMethods={this.mainMethods} startingColor={this.state.editorData.currSelectedColor} />
          </div>
          <div className="col s5">
            <LayersPanel />
          </div>
          <div className="col s5">
            <ImageAssets />
          </div>
        </div>
      </div>
    );
  }
}

export default CanvasWrapper;