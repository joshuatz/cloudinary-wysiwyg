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
      editorData : this.props.editorData,
      accountSettings : this.props.masterState.accountSettings
    }
    this.jQuery = window.jQuery;
    this.$ = window.jQuery;
    this.Materialize = window.M;
    this.cloudinary = window.cloudinary;
    this.cloudinaryInstance = window.cloudinaryInstance;
    this.helpers = new Helpers();
    this.appMethods = this.props.appMethods;
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

  /**
   * canvasMethods - START
   */
  canvasMethods = {
    clear : function(){
      this.state.editorData.canvasObj.clear();
    },
    addRect : function(){
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
        this.canvasMethods.handleShapeSelect.bind(this)(rect);
      });
    },
    renderAll : function(){
      let canvas = this.state.editorData.canvasObj;
      canvas.renderAll();
    },
    getSelectedObjs : function(){
      let selected = [];
      let canvas = this.state.editorData.canvasObj;
      if (this.state.editorData.isItemSelected){
        if (!canvas.getActiveObject()){
          // Nothing selected
          this.appMethods.mergeEditorData('isItemSelected',false);
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
    },
    handleShapeSelect : function(shape){
      this.appMethods.mergeEditorData('isItemSelected',true);
      console.log(shape);
    },
    addImage : function(urlOrImgElem){
      var _this = this;
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      let imageElem = urlOrImgElem;
      if (typeof(urlOrImgElem)==='string'){
        let url = urlOrImgElem;
        // Need to create IMG element. Update state and wil prompt re-render and creation of element
        let currImages = this.state.editorData.images;
        currImages.urls.push(url);
        this.appMethods.mergeEditorData('images',currImages,(newState)=>{
          //@TODO refactor this to use a componentDidUpdate hook or something else to make sure image is now in DOM and can use, instead of timeout
          setTimeout(()=>{
            console.log(_this);
            imageElem = _this.getPseudoImage(url);
            // Callback self
            _this.canvasMethods.addImage.bind(_this)(imageElem);
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
        imgInstance.on('selected',()=>{
          //
        });
        return imgInstance;
      }
    }
  }
  // canvasMethods - END

  cloudinaryMethods = {
    /**
     * Note - all cloudinary transformations, including layering, have to fall onto a base layer in order to get a final result. If there really is no base (e.g. no background) you could fake by using a completely transparent PNG or white image.
     */
    setConfig : function(){
      debugger;
      if (this.state.accountSettings.cloudinaryCloudName!==''){
        this.cloudinaryInstance.config({'cloud_name' : this.state.accountSettings.cloudinaryCloudName});
      }
    },
    getBaseImage : function(){
      return this.state.editorData.baseImage!==null ? this.state.editorData.baseImage : 'transparent_1x1';
    },
    getTransformation : function(type){
      let perTypes = {
        'image' : function(src,width,height,xOffset,yOffset){
        
        }
      }
      return {
        'get' : perTypes[type]
      }
    },
    generateFromCanvas : function(canvas){
      this.cloudinaryMethods.setConfig.bind(this)();
      let cloudinaryInstance = this.cloudinaryInstance;
      let cloudinary = this.cloudinary;
      canvas = typeof(canvas._objects)==='object' ? canvas : this.canvas;
      // Start the transformation chain by create the base cloudinary imageTag
      //debugger;
      let cloudinaryImageTag = cloudinaryInstance.imageTag(this.cloudinaryMethods.getBaseImage.bind(this)());
      let test = '';
      //debugger;
      let canvasObjects = canvas._objects;
      canvasObjects.forEach((val,index)=>{
        console.log(val);
        let currObj = val;

        // Create new tranformation
        let tr = cloudinary.Transformation.new();

        let objType = currObj.get('type');
        let objMatched = true;
        if (objType==='rect'){

        }
        else if (objType==='image'){
          //tr.overlay(new cloudinary.Layer())

          // @TODO - check if image is already uploaded to cloudinary - if so, get publicid instead of using remote fetch
          let useRemote = true;
          let publicId = false;
          // use remote fetch - https://cloudinary.com/documentation/image_transformations#fetching_images_from_remote_locations - chain
          // THIS TOOK A WHILE TO STUMBLE ACROSS - https://cloudinary.com/product_updates/overlay_and_underlay_a_fetched_image - if you want to use fetch in combo with overlay, the id should be "fetch:{{base64-remote-src}}" - so together, the final URL would look something like res.cloudinary.com/demo/image/upload/l_fetch:{{base64_overlay_remote_src}}/{{underlay_image_id}}
          if (useRemote){
            let remoteSrc = currObj._originalElement.currentSrc;
            tr.overlay({
              resourceType : 'fetch',
              url : remoteSrc
            });
          }
          // https://cloudinary.com/documentation/image_transformations#adding_image_overlays
          // https://cloudinary.com/documentation/jquery_image_manipulation#chaining_transformations
          // https://cloudinary.com/documentation/jquery_image_manipulation#adding_text_and_image_overlays
          //cloudinaryImageTag.transformation().overlay(new cloudinary.Layer().publicId(publicId)); 
          //cloudinaryImageTag.transformation().overlay(new cloudinary.Layer().publicId(publicId)); 
        }
        else {
          objMatched = false;
        }
        if (objMatched){
          debugger;
          console.log(tr);
          test = cloudinaryImageTag.transformation().chain().transformation(tr);
        }
      });
      console.log(cloudinaryImageTag);
      console.log(cloudinaryImageTag.toHtml());
      console.log(test);
    }
  }
  
  handleNoSelection(){
    this.appMethods.mergeEditorData('isItemSelected',false);
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

  getSelectedObjs(){
    let selected = [];
    let canvas = this.state.editorData.canvasObj;
    if (this.state.editorData.isItemSelected){
      if (!canvas.getActiveObject()){
        // Nothing selected
        this.appMethods.mergeEditorData('isItemSelected',false);
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
  

  getPseudoImage(url){
    return this.$('img[src="' + url + '"]')[0];
  }

  

  generateCloudinaryAsset(){
    let canvasObjects = this.canvas._objects;
    canvasObjects.map((val,index)=>{
      
    });
  }

  modals = {
    imageSelector : {
      launch : function(){
        this.helpers.mtz.modal('.imageHostingMethodSelector').open();
      }.bind(this)
    }
  }

  mainMethods = {
    appMethods : this.appMethods,
    colors : {
      handleColorSelect : this.handleColorSelect.bind(this)
    },
    canvas : (new Helpers()).bindObjectMethod(this.canvasMethods,this),
    modals : this.modals,
    cloudinary : (new Helpers()).bindObjectMethod(this.cloudinaryMethods,this)
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
        {/* Probably move this to separate component - cloudinary buttons */}
        <div className="col s12 center">
          <div className="center">
            <button className="button btn" onClick={this.mainMethods.cloudinary.generateFromCanvas.bind(this)}>Get Cloudinary</button>
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