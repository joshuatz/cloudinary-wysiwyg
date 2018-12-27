import React, {Component} from 'react';
import Helpers from '../../inc/Helpers';
import LayersPanel from './panels/LayersPanel';
import ImageAssets from './panels/ImageAssets';
import ToolPanel from './panels/ToolPanel';
import PaintSelector from './panels/PaintSelector';
import ImageSelector from './modals/ImageSelector';

class CanvasWrapper extends Component {
  constructor(props){
    super(props);
    this.state = {
      counter : 0,
      fabric : window.fabric,
      editorData : this.props.editorData
    }
    this.jQuery = window.jQuery;
    this.$ = window.jQuery;
    this.Materialize = window.M;
    this.Helpers = new Helpers();
  }
  /**
   * Update state.editorData with any prop-val pair
   */
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
    this.canvas = canvas;
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

  getPseudoImage(url){
    return this.$('img[src="' + url + '"]')[0];
  }

  addImage(urlOrImgElem){
    var _this = this;
    let canvas = this.state.editorData.canvasObj;
    let fabric = this.state.fabric;
    let imageElem = urlOrImgElem;
    if (typeof(urlOrImgElem)==='string'){
      let url = urlOrImgElem;
      // Need to create IMG element. Update state and wil prompt re-render and creation of element
      let currImages = this.state.editorData.images;
      currImages.urls.push(url);
      this.mergeEditorData('images',currImages,(newState)=>{
        //@TODO refactor this to use a componentDidUpdate hook or something else to make sure image is now in DOM and can use, instead of timeout
        setTimeout(()=>{
          console.log(_this);
          imageElem = _this.getPseudoImage(url);
          // Callback self
          _this.addImage(imageElem);
          console.log(_this.state);
        },100);
      });
    }
    else {
      let imgInstance = new fabric.Image(imageElem,{
        left : 100,
        top : 100
      });
      canvas.add(imgInstance);
      return imgInstance;
    }
  }

  generateCloudinaryAsset(){
    
  }

  modals = {
    imageSelector : {
      launch : function(){
        this.Helpers.mtz.modal('.imageHostingMethodSelector').open();
      }.bind(this)
    }
  }

  mainMethods = {
    colors : {
      handleColorSelect : this.handleColorSelect.bind(this)
    },
    canvas : {
      handleShapeSelect : this.handleShapeSelect.bind(this),
      addRect : this.addRect.bind(this),
      clearCanvas : this.clearCanvas.bind(this),
      addImage : this.addImage.bind(this)
    },
    modals : this.modals
  }
  render(){
    let pseudoImages = this.state.editorData.images.urls.map((val,index)=>{
      return <img className="pseudoImage" key={index} src={val} />
    });
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
            <ImageAssets mainMethods={this.mainMethods} />
          </div>
        </div>
        {/* Modals */}
        <div className="modals">
          <ImageSelector mainMethods={this.mainMethods} />
        </div>
        {/* Hidden Elements that necessary */}
        <div className="dynamicData hidden">
          {pseudoImages}
        </div>
      </div>
    );
  }
}

export default CanvasWrapper;