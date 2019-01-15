import React, {Component} from 'react';
import Helpers from '../../inc/Helpers';
import LayersPanel from './panels/LayersPanel';
import ImageAssets from './panels/ImageAssets';
import ToolPanel from './panels/ToolPanel';
import PaintSelector from './panels/PaintSelector';
import FontSelector from './panels/FontSelector';
import ImageSelector from './modals/ImageSelector';
import TextEntry from './modals/TextEntry';

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
    // Note - cloudinary seems to prefer GIF over PNG for working with transparency in fetch layers.
    this.fallbackTransparentPixelSrc = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png';
    this.fallbackSolidPixelSrc = 'https://via.placeholder.com/1';
    this.fallbackBasePicId = 'flowers';
    this.masterState = this.props.masterState;
    this.canvasReRenderIp = false;
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
    canvas.on('object:selected',()=>{
      this.mainMethods.canvas.getSelectedObjs(true);
    })
    this.canvas = canvas;
  }

  /**
   * canvasMethods - START
   */
  canvasMethods = {
    clear : function(){
      this.state.editorData.canvasObj.clear();
    },
    renderAll : function(){
      let canvas = this.state.editorData.canvasObj;
      this.canvasReRenderIp = true;
      canvas.renderAll();
      this.canvasReRenderIp = false;
    },
    // This can be used to retrieve selectd objects on the canvas, but is also called whenever something is selected, as a way to update various state things
    getSelectedObjs : function(triggerUpdates){
      let selectedArr = [];
      let canvas = this.state.editorData.canvasObj;

      if (!canvas.getActiveObject()){
        // Nothing selected
        this.appMethods.mergeEditorData('isItemSelected',false);
        this.handleNoSelection();
      }
      else {
        this.appMethods.mergeEditorData('isItemSelected',true);
        if (typeof(canvas.getActiveObject()['_objects'])!=='undefined'){
          // Group selected
          selectedArr = canvas.getActiveObject()._objects;
        }
        else {
          // Single thing selected
          //debugger;
          let selectedObj = canvas.getActiveObject()
          selectedArr = [selectedObj];
          this.appMethods.mergeEditorData('currSelectedItemType',selectedObj.get('type'));
          if (triggerUpdates){
            // Update input panels from selected object
            this.updateInputPanelFromCanvasObj(selectedObj);
          }
        }
      }
      return selectedArr;
    },
    handleShapeSelect : function(shape){
      this.appMethods.mergeEditorData('isItemSelected',true);
      console.log(shape);
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
    addImage : function(urlOrImgElem){
      let _this = this;
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
            _this.canvasMethods.renderAll.bind(_this)();
            console.log(_this.state);
          },200);
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
    },
    addText : function(text,OPT_fontFamily,OPT_fontSize,OPT_fontColor){
      let _this = this;
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      console.log(this.state.editorData.currSelectedFont);
      let textInstance = new fabric.Text(text,{
        left : 100,
        top : 100,
        fontSize : this.state.editorData.currSelectedFont.size
      });
      canvas.add(textInstance);
      textInstance.on('selected',()=>{
        // @TODO handle callback to allow editing already added text
      });
      return textInstance;
    }
  }
  // canvasMethods - END

  // cloudinaryMethods - START
  cloudinaryMethods = {
    /**
     * Note - all cloudinary transformations, including layering, have to fall onto a base layer in order to get a final result. If there really is no base (e.g. no background) you could fake by using a completely transparent PNG or white image.
     */
    setConfig : function(){
      //debugger;
      if (this.state.accountSettings.cloudinaryCloudName!==''){
        this.cloudinaryInstance.config({'cloud_name' : this.state.accountSettings.cloudinaryCloudName});
      }
    },
    getTransparentPixelSrc : function(){
      return typeof(this.state.editorData.transparentPixelSrc)==='string' ? this.state.editorData.transparentPixelSrc : this.fallbackTransparentPixelSrc;
    },
    getSolidPixelSrc : function(){
      return typeof(this.state.editorData.solidPixelSrc)==='string' ? this.state.editorData.solidPixelSrc : this.fallbackSolidPixelSrc;
    },
    getBaseImage : function(){
      return this.state.editorData.baseImage!==null ? this.state.editorData.baseImage : this.fallbackBasePicId;
    },
    getTransformationObj : function(type){
      let perTypes = {
        'image' : function(src,width,height,xOffset,yOffset){

        },
        'pixel' : function(solidOrTransparent){
          let pixelSrc = solidOrTransparent==='transparent' ? this.mainMethods.cloudinary.getTransparentPixelSrc() : this.mainMethods.cloudinary.getSolidPixelSrc();
          if(typeof(pixelSrc)==='string' && pixelSrc!==''){
            if (/http/.test(pixelSrc)){
              return {
                overlay : {
                  resourceType : 'fetch',
                  url : pixelSrc
                }
              }
            }
            else {
              return {
                overlay : {
                  resourceType : 'publicId',
                  publicId : pixelSrc
                }
              }
            }
          }
          return {};
        }
      }
      return {
        'get' : perTypes[type].bind(this)
      }
    },
    /**
     * Maps the generic settings that should map almost directly from the canvas to cloudinary transformation (e.g. width, height)
     * @param {object} canvasObj - A fabric.js canvas object (e.g. rectangle, image, etc.)
     * @param {object} [OPT_trans] - Optional existing tranformation object to augment with the new settings 
     */
    mapCanvasObjPropsToTrans(canvasObj,OPT_trans){
      let transObj = (OPT_trans || {});
      let width = parseFloat(canvasObj.get('width'));
      let height = parseFloat(canvasObj.get('height'));
      // Handle scaling by using x and y factors and multiplying width and height
      width = width * parseFloat(canvasObj.get('scaleX'));
      height = height * parseFloat(canvasObj.get('scaleY'));
      let updatedProps = this.helpers.objectMerge(transObj,{
        width : width,
        height : height,
        x : canvasObj.get('left'),
        y : canvasObj.get('top'),
        gravity : 'north_west'
      });
      return updatedProps;
    },
    generateFromCanvas : function(canvas){
      let _this = this;

      // Setup cloudinary config and make sure refs are set
      this.cloudinaryMethods.setConfig.bind(this)();
      let cloudinaryInstance = this.cloudinaryInstance;
      let cloudinary = this.cloudinary;
      canvas = typeof(canvas._objects)==='object' ? canvas : this.canvas;

      // Start the transformation chain by create the base cloudinary imageTag
      let baseImageId = this.cloudinaryMethods.getBaseImage.bind(this)();
      let cloudinaryImageTag = cloudinaryInstance.imageTag(baseImageId);

      // Get every object on the canvas
      let canvasObjects = canvas._objects;
      let transformationArr = [];

      // The very first step, before even looking at which objects are on the canvas, should be to get the "base" image (i.e. the background) on which all objects will be laid. Should be resized to current canvas size
      let baseTransformationObj = {
        width : canvas.width,
        height : canvas.height,
        crop : 'pad'
      };
      // Next, if the base image is set as the default fallback - meaning that the user wants to overlay on top of a solid or transparent background, we should make sure the base image will show that way...
      // @TODO allow for solid fill instead of transparent
      if (baseImageId === this.fallbackBasePicId){
        baseTransformationObj = this.helpers.objectMerge(baseTransformationObj,{
          opacity : 0
        });
      }
      cloudinaryImageTag.transformation().chain().transformation(baseTransformationObj).chain();
      transformationArr.push(baseTransformationObj);

      // MAIN ITERATOR OVER CANVAS OBJECTS
      canvasObjects.forEach((val,index)=>{
        console.log(val);
        let currObj = val;
        let objType = currObj.get('type');
        let objMatched = true;

        // Generic mapping of canvas object attr to cloudinary transformation attrs
        let genericTransformationObj = _this.mainMethods.cloudinary.mapCanvasObjPropsToTrans(currObj);

        // Create new tranformation
        let tr = cloudinary.Transformation.new();
        let trObjs = [];
        let trObj = {};
        
        if (objType==='rect'){
          // Current way of doing shapes - use a transparent PNG - crop to size, and fill with color
          trObj = _this.mainMethods.cloudinary.getTransformationObj('pixel').get('solid');
          // Set fill color, size, and offset
          trObj = _this.helpers.objectMerge([trObj,genericTransformationObj,{
            background : 'rgb:' + _this.getObjColor(currObj).hex.replace('#',''),
            color : 'rgb:' + _this.getObjColor(currObj).hex.replace('#',''),
            effect : 'colorize'
          }]);
          trObjs.push(trObj);
          tr = trObj;
        }
        else if (objType==='image'){
          // @TODO - check if image is already uploaded to cloudinary - if so, get publicid instead of using remote fetch
          let useRemote = true;
          let publicId = false;
          // use remote fetch - https://cloudinary.com/documentation/image_transformations#fetching_images_from_remote_locations - chain
          // THIS TOOK A WHILE TO STUMBLE ACROSS - https://cloudinary.com/product_updates/overlay_and_underlay_a_fetched_image - if you want to use fetch in combo with overlay, the id should be "fetch:{{base64-remote-src}}" - so together, the final URL would look something like res.cloudinary.com/demo/image/upload/l_fetch:{{base64_overlay_remote_src}}/{{underlay_image_id}}
          if (useRemote){
            let remoteSrc = currObj._originalElement.currentSrc;
            trObj = {
              overlay : {
                resourceType : 'fetch',
                url : remoteSrc
              }
            };
            let trObjSecondary = _this.helpers.objectMerge([genericTransformationObj,{
              flags : ['layer_apply']
            }]);
            trObjs.push(trObj,trObjSecondary);

            // First, apply just the overlay
            tr.overlay(trObj.overlay);
            // Then chain with generic size and position
            tr = tr.chain().transformation(trObjSecondary);
          }
          // https://cloudinary.com/documentation/image_transformations#adding_image_overlays
          // https://cloudinary.com/documentation/jquery_image_manipulation#chaining_transformations
          // https://cloudinary.com/documentation/jquery_image_manipulation#adding_text_and_image_overlays
        }
        else if (objType==='text'){
          // Text is technically an overlay layer
          // Note - Font Family and Font Size are REQUIRED
          // Note that the space that font takes up is calculated by the font-size, not width and height. If the canvas object is scaled, you should use the ratio (X and Y are the same) to figure out what to multiply the original font size by
          let fontSize = currObj.fontSize;
          if (currObj.scaleX > 1){
            fontSize = parseInt((currObj.scaleX * fontSize));
          }

          tr.overlay(new cloudinary.TextLayer({
            fontFamily : 'Roboto',
            fontSize : fontSize,
            text : currObj.text
          }));
          let trObjSecondary = _this.helpers.objectMerge([genericTransformationObj,{
            flags : ['layer_apply']
          }]);
          trObjs.push(trObj,trObjSecondary);
          tr = tr.chain().transformation(trObjSecondary);
        }
        else {
          objMatched = false;
        }
        // If the current canvas object got matched to a known type and triggered a transformation...
        if (objMatched){
          cloudinaryImageTag.transformation().chain().transformation(tr);
          for (var x=0; x<trObjs.length; x++){
            transformationArr.push(trObjs[x]);
          }
        }
      });

      // @TODO
      if (false){
        let tr = cloudinary.Transformation.new();
        for (var x=0; x< transformationArr.length; x++){
          if (x>0){
            tr = tr.chain();
          }
          let currTransObj = transformationArr[x];
          if ('overlay' in currTransObj){
            tr.overlay(currTransObj);
          }
          else {
            tr.transformation(currTransObj);
          }
        }
        // Apply
        cloudinaryImageTag.transformation().chain().transformation(tr);
      }
      console.log(transformationArr);
      console.log(cloudinaryImageTag);
      console.log(cloudinaryImageTag.toHtml());
      window.open(/src="([^"]*)"/.exec(cloudinaryImageTag.toHtml())[1])
    }
  }
  // cloudinaryMethods - END
  
  handleNoSelection(){
    this.appMethods.mergeEditorData('isItemSelected',false);
    this.appMethods.mergeEditorData('currSelectedItemType',false);
    this.appMethods.mergeEditorData('currSelectedItemGenericProps',{});
  }
  handleColorSelect(color,event){
    console.group('handleColorSelect');
    console.log(color);
    console.log(event);
    console.groupEnd();
    let editorData = this.state.editorData;
    editorData.currSelectedColor = color;
    this.setState({
      editorData : editorData
    });
    if (this.state.editorData.isItemSelected){
      // items are selected, iterate through all of them and set color
      this.mainMethods.canvas.getSelectedObjs().forEach((item)=>{
        item.set('fill',color.hex);
      });
      this.mainMethods.canvas.renderAll();
    }
  }

  updateInputPanelFromCanvasObj(canvasObj){
    console.log(canvasObj);
    this.updateColorSelectorFromCanvasObj(canvasObj);
    this.updateFontSelectorFromCanvasObj(canvasObj);
    this.mainMethods.canvas.renderAll();
  }

  updateColorSelectorFromCanvasObj(canvasObj){
    console.log(this.getObjColor(canvasObj));
    this.appMethods.mergeEditorData('currSelectedColor',this.getObjColor(canvasObj));
  }
  updateFontSelectorFromCanvasObj(canvasObj){

  }

  getObjColor(canvasObj){
    let val = false;
    if (canvasObj.fill && canvasObj.fill!==''){
      val = canvasObj.fill;
    }
    else if (canvasObj.backgroundColor) {
      val = canvasObj.backgroundColor;
    }
    if (/^#/.test(val)){
      return {
        hex : val
      }
    }
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
    appMethods : this.props.appMethods,
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
            <PaintSelector mainMethods={this.mainMethods} color={this.state.editorData.currSelectedColor} />
          </div>
          <div className="col s5">
            <FontSelector mainMethods={this.mainMethods} masterState={this.masterState} />
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
          <TextEntry mainMethods={this.mainMethods} />
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