import React, {Component} from 'react';
import Helpers from '../../inc/Helpers';
import LayersPanel from './panels/LayersPanel';
import ImageAssets from './panels/ImageAssets';
import ToolPanel from './panels/ToolPanel';
import PaintSelector from './panels/PaintSelector';
import FontSelector from './panels/FontSelector';
import ImageSelector from './modals/ImageSelector';
import OutputResults from './modals/OutputResults';
import CurrObjectActions from './panels/CurrObjectActions';
import underscore from 'underscore';

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
    // Note - cloudinary seems to prefer GIF over PNG for working with transparency in fetch layers.
    this.fallbackTransparentPixelSrc = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png';
    this.fallbackSolidPixelSrc = 'https://via.placeholder.com/2x2';
    this.masterState = this.props.masterState;
    this.canvasReRenderIp = false;
    this.CANVAS_ELEMENT_ID = 'editorCanvas';
    // Refs
    this.outputResultsClass = React.createRef();
    // Important const - use this list with any calls to canvas.toJSON() to make sure object props are included
    this.CANVAS_PROPERTIES_TO_KEEP = ['__controlsVisibility'];
  }

  componentDidMount(){
    let fabric = window.fabric;
    var canvas = new fabric.Canvas(this.CANVAS_ELEMENT_ID,{
      width : this.state.editorData.canvasDimensions.width,
      height : this.state.editorData.canvasDimensions.height,
      preserveObjectStacking : true,
      /* group selection is disabled, as it is complicated to implement and handle groups of text vs shapes vs images, etc. This should be worked on with layers if want to add */
      selection : false
    });
    let editorData = this.state.editorData;
    editorData.canvasObj = canvas;
    this.setState({
      editorData : editorData
    });
    window.canvas = canvas;
    window.mainMethods = this.mainMethods;

    // Attach global event listeners
    canvas.on('selection:cleared',(evt)=>{
      this.handleNoSelection();
    });
    canvas.on('object:selected',(evt)=>{
      this.mainMethods.canvas.getSelectedObjs(true);
      this.mainMethods.app.addMsg('object:selected');
    });
    canvas.on('object:modified',(evt)=>{
      this.mainMethods.app.addMsg('object:modified');
      this.mainMethods.canvas.renderAll();
    });
    canvas.on('text:changed',(evt)=>{
      console.log(evt);
      // Prevent multi-line text
      this.mainMethods.canvas.removeMultiLineText(evt.target);
    });
    this.canvas = canvas;
  }

  componentDidUpdate(prevProps,prevState){
    // Check for canvas dimensions change
    if (prevState.editorData.canvasDimensions.width!==this.state.editorData.canvasObj.width || prevState.editorData.canvasDimensions.height!==this.state.editorData.canvasObj.height){
      console.log('canvas dimensions changed');
      this.mainMethods.canvas.updateDimensions();
    }
  }

  /**
   * canvasMethods - START
   */
  canvasMethods = {
    reset : function(){
      let canvas = this.state.editorData.canvasObj;
      if (canvas && canvas['targets']){
        canvas.clear();
      }
      this.mainMethods.app.mergeMasterState('livePreviewSrc','');
    },
    clear : function(){
      this.state.editorData.canvasObj.clear();
    },
    updateLivePreview : function(force){
      force = typeof(force)==='boolean' ? force : false;
      if (force || (this.state.accountSettings.fetchInstantly && this.mainMethods.app.getMsSinceLastFetch() > 250)){
        // Get updated image src
        this.mainMethods.cloudinary.generateFromCanvas.get.bind(this)();
        // Update livePreviewSrc state, which will prompt render of preview
        this.mainMethods.app.mergeMasterState('livePreviewSrc',this.mainMethods.app.getMasterState().output.imgSrc);
      }
      // Also update if livePreview is off, that way state will be ready if live preview is sudddenly opened
      else if (this.state.accountSettings.fetchInstantly===false){
        this.mainMethods.canvas.updateLivePreview(true);
      }
    },
    renderAll : function(force,OPT_skipCloudinaryGeneration){
      let skipGen = typeof(OPT_skipCloudinaryGeneration)==='boolean' ? OPT_skipCloudinaryGeneration : false;
      let canvas = this.state.editorData.canvasObj;
      this.canvasReRenderIp = true;
      if (force){
        canvas.renderAndReset();
      }
      else {
        canvas.renderAll();
      }
      this.canvasReRenderIp = false;
      if (!skipGen){
        this.mainMethods.canvas.updateLivePreview(force);
      }
    },
    // This can be used to retrieve selectd objects on the canvas, but is also called whenever something is selected, as a way to update various state things
    getSelectedObjs : function(triggerUpdates){
      let selectedArr = [];
      let canvas = this.state.editorData.canvasObj;

      if (!canvas.getActiveObject()){
        // Nothing selected
        this.mainMethods.app.mergeEditorData('isItemSelected',false);
        this.handleNoSelection();
      }
      else {
        this.mainMethods.app.mergeEditorData('isItemSelected',true);
        if (typeof(canvas.getActiveObject()['_objects'])!=='undefined'){
          // Group selected
          selectedArr = canvas.getActiveObject()._objects;
        }
        else {
          // Single thing selected
          let selectedObj = canvas.getActiveObject()
          selectedArr = [selectedObj];
          this.mainMethods.app.mergeEditorData('currSelectedItemType',selectedObj.get('type'));
          if (triggerUpdates){
            // Update input panels from selected object
            this.updateInputPanelFromCanvasObj(selectedObj);
          }
        }
      }
      return selectedArr;
    },
    moveSelected : function(direction){
      let selected = this.mainMethods.canvas.getSelectedObjs(false);
      let canvas = this.state.editorData.canvasObj;
      switch (direction) {
        case 'up':
          selected.forEach((obj,index)=>{canvas.bringForward(obj)});
          break;
        case 'down':
          selected.forEach((obj,index)=>{canvas.sendBackwards(obj)});
          break;
        default:
          console.warn('moveSelected was called without specifying direction - no action taken.');
          break;
      }
    },
    bringToFront(canvasObj){
      // You have to re-render canvas object before moving it to front
      let canvas = this.state.editorData.canvasObj;
      this.mainMethods.canvas.renderAll(false,true);
      canvas.bringToFront(canvasObj);
      this.mainMethods.canvas.renderAll(false,false);
    },
    getCanvObjOriginalLeft : function(obj){
      let left = obj.get('left');
      if (!('angle' in obj)|| obj.angle === 0){
        return left;
      }
      else {
        // @todo - fix this up
        return obj.aCoords.bl.x;
      }
    },
    deleteSelectedObjs : function(){
      let canvas = this.state.editorData.canvasObj;
      this.mainMethods.canvas.getSelectedObjs(true).forEach((obj,index)=>{
        canvas.remove(obj);
      });
      this.mainMethods.canvas.renderAll(true);
    },
    handleShapeSelect : function(shape){
      this.mainMethods.app.mergeEditorData('isItemSelected',true);
      console.log(shape);
    },
    handleTextSelect : function(canvasObj){
      //this.updateFontSelectorFromCanvasObj(canvasObj);
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
      this.mainMethods.canvas.bringToFront(rect);
      rect.on('selected',()=>{
        this.canvasMethods.handleShapeSelect.bind(this)(rect);
      });
    },
    addLine : function(){
      // A line is simply a rectangle with width controls disabled and constrained.
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      let line = new fabric.Rect({
        top : 10,
        left : 15,
        width : 2,
        height : 100,
        fill : this.getCurrSelectedColor().hex,
        lockScalingX : true
      });
      // http://fabricjs.com/docs/fabric.Object.html#setControlsVisibility
      line.setControlsVisibility({
        bl : false,
        br : false,
        mb : true,
        ml : false,
        mr : false,
        mt : true,
        tl : false,
        tr : false,
        mtr : true
      });
      canvas.add(line);
      this.mainMethods.canvas.bringToFront(line);
      line.on('selected',()=>{
        this.canvasMethods.handleShapeSelect.bind(this)(line);
      });
    },
    addCircle : function(OPT_props){
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      let props = {
        top : 50,
        left : 50,
        radius : 80,
        fill : this.getCurrSelectedColor().hex
      };
      props = typeof(OPT_props)==='object' ? this.helpers.objectMerge(props,OPT_props) : props;
      let circle = new fabric.Circle(props);
      canvas.add(circle);
      this.mainMethods.canvas.bringToFront(circle);
      circle.on('selected',()=>{
        this.canvasMethods.handleShapeSelect.bind(this)(circle);
      });
    },
    addOval : function(){
      // It is much simpler just to use scaleX and scaleY on a circle, rather than switching to the ellipse canvasObj type
      this.mainMethods.canvas.addCircle({
        scaleX : 0.5
      });
    },
    addTriangle : function(){
      // Make sure you add a perfect equilateral triangle. The user can scale it to be other types, but the original element should have equal sides to make math easier for transformations
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      let triangle = new fabric.Triangle({
        width : 50,
        height : 50,
        fill : this.getCurrSelectedColor().hex,
        left : 60,
        top : 30
      });
      canvas.add(triangle);
      this.mainMethods.canvas.renderAll();
      canvas.bringToFront(triangle);
      this.mainMethods.canvas.updateLivePreview();
      triangle.on('selected',()=>{
        this.canvasMethods.handleShapeSelect.bind(this)(triangle);
      });
    },
    addImage : function(urlOrImgElem,OPT_callback,OPT_macroKey,OPT_constrain,OPT_cloudinaryPublicId){
      let cloudinaryPublicId = typeof(OPT_cloudinaryPublicId)==='string' && OPT_cloudinaryPublicId.length > 0 ? OPT_cloudinaryPublicId : false;
      let constrain = (typeof(OPT_constrain)==='boolean') ? OPT_constrain : true;
      let callback = typeof(OPT_callback)==='function' ? OPT_callback : function(){};
      let _this = this;
      let canvas = this.state.editorData.canvasObj;
      let canvasDimensions = this.state.editorData.canvasDimensions;
      let fabric = this.state.fabric;
      let imageElem = urlOrImgElem;
      if (typeof(urlOrImgElem)==='string'){
        let url = urlOrImgElem;
        // Need to create IMG element. Update state and wil prompt re-render and creation of element
        let currImages = this.state.editorData.images;
        currImages.urls.push(url);
        this.mainMethods.app.mergeEditorData('images',currImages,(newState)=>{
          //@TODO refactor this to use a componentDidUpdate hook or something else to make sure image is now in DOM and can use, instead of timeout
          setTimeout(()=>{
            console.log(_this);
            imageElem = _this.getPseudoImage(url);
            // Callback self
            _this.canvasMethods.addImage.bind(_this)(imageElem,callback,OPT_macroKey);
            _this.canvasMethods.renderAll.bind(_this)();
            console.log(_this.state);
          },400);
        });
      }
      else {
        let imgProps = {
          left : parseInt(canvasDimensions.width*0.1,10),
          top : parseInt(canvasDimensions.height*0.1,10),
          isMacro : false,
          cloudinaryPublicId : cloudinaryPublicId
        }
        if (constrain){
          if (imageElem.width > canvasDimensions.width || imageElem.height > canvasDimensions.height){
            let scaledWidth = imageElem.width;
            let scaledHeight = imageElem.height;
            // Which side is longer?
            let widthIsLonger = imageElem.width > imageElem.height;
            // Calculate new dimensions based on fitting longest side to canvas - 20%
            if (widthIsLonger){
              scaledWidth = (canvasDimensions.width * 0.8);
              scaledHeight = (scaledWidth * imageElem.height) / imageElem.width;
              imgProps.scaleX = (scaledWidth / imageElem.width);
              imgProps.scaleY = imgProps.scaleX;
            }
            else {
              scaledHeight = (canvasDimensions.height * 0.8);
              scaledWidth = (scaledHeight * imageElem.width) / imageElem.height;
              imgProps.scaleY = (scaledHeight / imageElem.height);
              imgProps.scaleX = imgProps.scaleY;
            }
          }
        }
        if (typeof(OPT_macroKey)==='string'){
          imgProps.isMacro = true;
          imgProps.macroKey = OPT_macroKey;
        }
        let imgInstance = new fabric.Image(imageElem,imgProps);
        canvas.add(imgInstance);
        this.mainMethods.canvas.bringToFront(imgInstance);
        imgInstance.on('selected',()=>{
          //
        });
        callback(imgInstance);
        return imgInstance;
      }
    },
    getTextPropsFromFontPanel : function(){
      let currSelectedFont = this.state.editorData.currSelectedFont;
      return {
        fontSize : currSelectedFont.size,
        fill : this.getCurrSelectedColor().hex,
        myTextObj : underscore.clone(currSelectedFont),
        fontWeight : currSelectedFont.bold===true ? 'bold' : 'normal',
        underline : currSelectedFont.underline,
        linethrough : currSelectedFont.strikethrough
      }
    },
    addText : function(text,OPT_fontFamily,OPT_fontSize,OPT_fontColor,OPT_macroKey){
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      let currSelectedFont = this.state.editorData.currSelectedFont;
      text = (text || 'Edit Me!');
      console.log(currSelectedFont);
      let textProps = this.helpers.objectMerge(this.mainMethods.canvas.getTextPropsFromFontPanel(),{
        left : 100,
        top : 100,
        lockUniScaling : true,
      });

      if (typeof(OPT_macroKey)==='string'){
        textProps.isMacro = true;
        textProps.macroKey = OPT_macroKey;
      }
      let textInstance = new fabric.IText(text,textProps);
      canvas.add(textInstance);
      this.mainMethods.canvas.bringToFront(textInstance);
      textInstance.on('selected',()=>{
        this.canvasMethods.handleTextSelect.bind(this)(textInstance);
        // @TODO handle callback to allow editing already added text
      });
      textInstance.on('deselected',()=>{
        this.handleObjectDeselection(textInstance);
      });
      return textInstance;
    },
    removeMultiLineText : function(textObj){
      let hasMultiLine = /[\r\n]/gm.test(textObj.text);
      if (hasMultiLine){
        this.helpers.toast('Multiline text fields are not supported. Please use multiple text objects if you want to span multiple lines','warning');
        let fixedText = textObj.text.replace(/[\r\n]/gm,'');
        textObj.set('text',fixedText);
        // Cursor jumps forward one time with each enter press, so need to move it back
        textObj._moveCursorLeftOrRight('Left',{});
      }
    },
    updateDimensions : function(){
      let width = this.state.editorData.canvasDimensions.width;
      let height = this.state.editorData.canvasDimensions.height;
      // Update dimensions
      this.state.editorData.canvasObj.setHeight(height);
      this.state.editorData.canvasObj.setWidth(width);
      // Prompt re-render with force
      this.mainMethods.canvas.renderAll(true);
    }
  }
  // canvasMethods - END

  // cloudinaryMethods - START
  cloudinaryMethods = {
    /**
     * Note - all cloudinary transformations, including layering, have to fall onto a base layer in order to get a final result. If there really is no base (e.g. no background) you could fake by using a completely transparent PNG or white image.
     */
    setConfig : function(){
      if (this.state.accountSettings.cloudinaryCloudName!==''){
        this.cloudinaryInstance.config({'cloud_name' : this.state.accountSettings.cloudinaryCloudName});
      }
    },
    getImageSrcFromPublicId : function(publicId){
      return 'https://res.cloudinary.com/' + this.state.accountSettings.cloudinaryCloudName + '/image/upload/' + publicId;
    },
    getTransparentPixelSrc : function(){
      return typeof(this.state.editorData.transparentPixelSrc)==='string' ? this.state.editorData.transparentPixelSrc : this.fallbackTransparentPixelSrc;
    },
    getSolidPixelSrc : function(){
      return typeof(this.state.editorData.solidPixelSrc)==='string' ? this.state.editorData.solidPixelSrc : this.fallbackSolidPixelSrc;
    },
    applyTrArrayToCloudinaryImgTag(trObjs,cloudinaryImageTag){
      let tr = this.cloudinary.Transformation.new();
      for (var x=0; x< trObjs.length; x++){
        let currTransObj = trObjs[x];
        if (Object.keys(currTransObj).length > 0){
          if ('resourceType' in currTransObj && currTransObj.resourceType === 'fetch'){
            tr.overlay(currTransObj);
          }
          else {
            if (x>0){
              tr = tr.chain();
            }
            tr.transformation(currTransObj);
          }
        }
      }
      // Apply
      cloudinaryImageTag.transformation().chain().transformation(tr);
      return cloudinaryImageTag;
    },
    getFallbackBasePicId : function(){
      if (this.state.accountSettings.cloudinaryCloudName==='demo'){
        return 'flowers';
      }
      else {
        return 'sample';
      }
    },
    getBaseImage : function(){
      return this.state.editorData.baseImage!==null ? this.state.editorData.baseImage : this.cloudinaryMethods.getFallbackBasePicId.bind(this)();
    },
    /**
     * Generates a final cloudinary hosted URL based on an array of transformations
     * @param {array} trObjs - array of transformation objects
     * @returns {string} cloudinary Image URL
     */
    generateUrlFromTrans(trObjs){
      // Base has to be an actual cloudinary resource, so use settings for base
      let cloudinaryImageInstance = this.cloudinaryInstance.imageTag(this.mainMethods.cloudinary.getFallbackBasePicId());
      // Modify base to be 1x1 transparent
      trObjs.unshift({
        width : 1,
        height : 1,
        opacity : 0,
        crop : 'scale'
      });
      // Apply transformations
      cloudinaryImageInstance = this.mainMethods.cloudinary.applyTrArrayToCloudinaryImgTag(trObjs,cloudinaryImageInstance);
      // Return just the URL
      return cloudinaryImageInstance.getAttr('src');
    },
    /**
     * Generates an overlay fetchlayer based on an array of transformations
     * @param {array} trObjs - array of transformation objects to apply on top of empty base to generate fetchlayer
     * @returns {object} overlay / fetchlayer config
     */
    generateFetchLayerFromTrans(trObjs){
      return {
        overlay : {
          resourceType : 'fetch',
          url : this.mainMethods.cloudinary.generateUrlFromTrans(trObjs)
        }
      }
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
     * @param {boolean} OPT_forceBounding - optional setting. If true, forces the object to render inside the bounding box of the overall canvas dimensions. Otherwise, if not applied, an overlay being position overlapping the boundary of the canvas can cause the final cloudinary output to be exceed the dimensions of the canvas.
     */
    mapCanvasObjPropsToTrans(canvasObj,OPT_trans,OPT_forceBounding){
      let _this = this;
      let cloudinary = this.cloudinary;
      let canvasDimensions = this.state.editorData.canvasDimensions;
      let forceBounding = typeof(OPT_forceBounding)==='boolean' ? OPT_forceBounding : true;
      let canvasObjType = canvasObj.get('type');
      let trObjs = [];
      let chainLast = [];
      let chainLastButMerge = [];
      let trObj = (typeof(OPT_trans)==='object' && OPT_trans!==null) ? OPT_trans : {};
      let chainedTrObj = {};
      let cropTrObj = {};
      let somethingClippedPast = false;

      function resetTrObjs(){
        trObjs = [];
        chainLast = [];
        chainLastButMerge = [];
        chainedTrObj = {};
        cropTrObj = {};
      }

      const chainTogether = ['effect','color','flags','x','y','radius','gravity','angle'];
      const colorProps = ['background','color','effect','flags','x','y','radius'];
      const mappings = {
        'rect' : {
          supportsColor : true,
          supportsAngle : true,
          type : 'shape',
          mustChain : colorProps
        },
        'circle' : {
          supportsColor : true,
          supportsAngle : false,
          type : 'shape',
          mustChain : colorProps
        },
        'triangle' : {
          supportsColor : true,
          supportsAngle : true,
          type : 'shape',
          mustChain : colorProps
        },
        'text' : {
          supportsColor : true,
          supportsAngle : true,
          type : 'text'
        },
        'i-text' : {
          supportsColor : true,
          supportsAngle : true,
          type : 'text'
        },
        'image' : {
          supportsColor : false,
          supportsAngle : true,
          type : 'image',
          mustChain : ['flags','x','y','gravity']
        }
      };

      let objMatched = typeof(mappings[canvasObjType])==='object' ? true : false;
      let mapping = objMatched ? mappings[canvasObjType] : {};

      /**
       * Get Generic Properties
       */
      let width = parseFloat(canvasObj.get('width'));
      let height = parseFloat(canvasObj.get('height'));
      let angle = parseFloat(canvasObj.get('angle'));
      let x = this.mainMethods.canvas.getCanvObjOriginalLeft(canvasObj);
      let y = parseFloat(canvasObj.get('top'));
      let scaleX = parseFloat(canvasObj.get('scaleX'));
      let scaleY = parseFloat(canvasObj.get('scaleY'));
      // Handle scaling by using x and y factors and multiplying width and height
      let scaledWidth = width * scaleX;
      let scaledHeight = height * scaleY;
      // Note - X and Y should be integers
      // Note - angle should be an integer
      let genericProps = {
        width : parseInt(scaledWidth,10),
        height : parseInt(scaledHeight,10),
        x : parseInt(x,10),
        y : parseInt(y,10),
        gravity : 'north_west'
      };
      if (angle!==0 && mapping.supportsAngle){
        genericProps.angle = parseInt(angle,10);
        // Make sure angle gets applid to layer, not to overall object
        genericProps.flags = ['layer_apply'];
      }
      // merge generic props into transformation object
      trObj = this.helpers.objectMerge(trObj,genericProps);

      /**
       * Colors
       */
      if (mapping.supportsColor){
        trObj = this.helpers.objectMerge(trObj,{
          background : 'rgb:' + this.getObjColor(canvasObj).hex.replace('#',''),
          color : 'rgb:' + this.getObjColor(canvasObj).hex.replace('#',''),
          effect : 'colorize',
          flags : ['layer_apply'],
          x : parseInt(x,10),
          y : parseInt(y,10)
        });
        // A little strange, but 'colorize' needs to be accompanied with coordinates and gravity if chained
        if (mapping.mustChain && mapping.mustChain.indexOf('color')!==-1){
          chainedTrObj = this.helpers.objectMerge(chainedTrObj,{
            x : trObj.x,
            y : trObj.y,
            gravity : trObj.gravity
          });
        }
      }

      /**
       * Type Specific Processing
       */
      if (mapping.type==='shape'){
        // NOTE - order of operations and chaining is important. Size and position should always come first and as separate transformations to avoid conflicts
        // Current way of doing shapes - use a transparent PNG - crop to size, and fill with color
        trObj = this.helpers.objectMerge(trObj,this.mainMethods.cloudinary.getTransformationObj('pixel').get('solid'));
        if (canvasObjType==='circle'){
          trObj.radius = parseInt((scaledWidth*0.5),10)
        }
        else if (canvasObjType==='triangle'){
          /** This is a little complicated... currently my way to this is to rotate a rect, and then cut off at a 45 degree angle
           *    An alternative to explore later would be using the "distort" effect and/or shear - https://cloudinary.com/documentation/image_transformation_reference#effect_parameter
           */
          let method = 'sliceRect';
          if (method==='sliceRect'){
            /**
             * Math:
             *  We gonna go old school for this - good ol' pythag - A^2 + B^2 = C^2
             *    If you divide the triangle into two smaller right triangles, than the width is really 2 x the bottom, and the height is the side joined to the bottom by the right angle. The hypotenuse is unknown, but when calculated, will give us the dimensions for the sides of the rectangle
             * Before the triangle is rotated by the user, assuming it is facing up, you can think of it being half a rectangle with a skew, where the top of the triangle is the top left of the rectangle, and the bottom left of the triangle is the bottom left of the rectangle. So before even touched by the user, there should already be a 45 degree angle applied
             *   Normally, you would have to "skew" that rectangle if you wanted to get a triangle that is NOT a perfect 90 degrees out of half of it, but the same thing can be achieved by also futzing with the scale... normally I take scale out and just compute a new height and width, but for this I want to do the opposite and add it back
             */
            angle = 45 + angle;
            let base = (0.5 * width);
            // C = Square Root of (A^2 + B^2)
            let hypotenuse = Math.sqrt((base * base) + (height * height));
            console.log(hypotenuse);
            // Lets reset a bunch of trObj props
            trObj = this.helpers.objectMerge(trObj,{
              width : parseInt((hypotenuse),10),
              height : parseInt((hypotenuse),10),
              angle : parseInt(angle,10)
            });
            delete trObj.x;
            delete trObj.y;
            // Add scale by passing adjusted width and height with crop set to scale in secondary
            let trObjSecondary = this.helpers.objectMerge({},{
              width : parseInt((hypotenuse * scaleX),10),
              height : parseInt((hypotenuse * scaleY * 2),10),
              crop : 'scale',
              flags : ['layer_apply'],
              fetch_format : 'png'
            });
            // Since we are generating the overlay separately, to chain as a fetchlayer, we should position at 0,0 so we just get the triangle itself and not any padding
            trObjSecondary.x = 0;
            trObjSecondary.y = 0;
            chainLastButMerge.push(trObjSecondary);
            // OK, now we should have skew and size correct, but have 2 of the triangles put together - essentially a parallelogram - so we need to slice it down the middle. However, this need to be chained, since it has a different crop method, and can't be combined with the skewing / sizing above
            // ISSUE: you can't chain multiple crops without having a layer inbetween (i.e. you can't chain multiple fl_layer_apply) - workaround - take transformations so far and shove into cloudinary URL, then use that as a fetchlayer
            trObjs = processTrObjs();
            trObj = this.helpers.objectMerge(this.mainMethods.cloudinary.generateFetchLayerFromTrans(trObjs),{
              x : parseInt(x,10),
              y : parseInt(y,10),
              width : parseInt((hypotenuse * scaleX),10),
              height : parseInt(((hypotenuse * scaleY * 2) * 0.5),10),
              crop : 'crop',
              gravity : 'north',
              flags : ['layer_apply'],
              keepInPrimary : ['gravity']
            });
            // Reset
            resetTrObjs();
            // Need to set position of the (now sliced) triangle overlay
            let trObjThird = {
              x : parseInt(x,10),
              y : parseInt(y,10),
              gravity : 'north_west',
              flags : ['layer_apply']
            };
            chainLastButMerge.push(trObjThird);
          }
          else if (method==='distort'){
            // @TODO
          }
        }
      }
      else if (mapping.type==='text'){
        // Text is technically an overlay layer
        // Note - Font Family and Font Size are REQUIRED
        // Note that the space that font takes up is calculated by the font-size, not width and height. If the canvas object is scaled, you should use the ratio (X and Y are the same) to figure out what to multiply the original font size by
        // Note - for text, x and y position (offset) should be passed directly with the textLayer rather than chaining it as a secondary transformation
        let textConfig = typeof(canvasObj.myTextObj)==='object' ? canvasObj.myTextObj : {};
        let fontSize = canvasObj.fontSize;
        if (scaleX> 1){
          fontSize = parseInt((scaleX * fontSize));
        }
        trObj = this.helpers.objectMerge(trObj,{
          overlay : new cloudinary.TextLayer({
            fontFamily : 'Roboto',
            fontSize : fontSize,
            text : canvasObj.text,
            fontWeight : (textConfig.bold===true || canvasObj.fontWeight==='bold') ? 'bold' : 'normal',
            textDecoration : (textConfig.underline===true || canvasObj.underline===true) ? 'underline' : ((textConfig.strikethrough===true || canvasObj.linethrough===true) ? 'strikethrough' : 'normal')
          })
        });
        // Set text decoration flag
        // @TODO
        // Remove background color
        delete trObj.background;
        // Remove width and height since that is best controlled through font size
        delete trObj.width;
        delete trObj.height;
      }
      else if (mapping.type==='image'){
        // NOTE - X and Y should be chained as a separate transformation, with the "layer_apply" flag, while width and height can be passed directly with image
        // c_scale,h_188,l_fetch:...,w_215/x_34,y_107,g_north_west,fl_layer_apply/
        // @TODO - check if image is already uploaded to cloudinary - if so, get publicid instead of using remote fetch
        let useRemote = true;
        let publicId = canvasObj.cloudinaryPublicId;
        if (typeof(publicId)==='string' && publicId.length > 0){
          useRemote = false;
        }
        trObj.crop = 'scale';
        trObj.flags = ['layer_apply'];
        if (useRemote){
          let remoteSrc = canvasObj._originalElement.currentSrc;
          trObj = this.helpers.objectMerge(trObj,{
            overlay : {
              resourceType : 'fetch',
              url : remoteSrc
            }
          });
        }
        else {
          trObj = this.helpers.objectMerge(trObj,{
            overlay : {
              publicId : publicId
            }
          });
        }
      }

      /**
       * Calculation of boundaries / clipping
       */
      somethingClippedPast = ((x + scaledWidth > canvasDimensions.width) || (y + scaledHeight > canvasDimensions.height));
      if (forceBounding){
        let modPrimary = true;
        let doesClip = false;
        let croppedWidth = scaledWidth;
        let croppedHeight = scaledHeight;
        // Need to test to see if object protrudes over boundary of canvas, and if so, clip it
        let trObjSecondary = {
          width : parseInt(scaledWidth,10),
          height : parseInt(scaledHeight,10),
          gravity : 'north_west'
        };
        cropTrObj = {
          width : parseInt(scaledWidth,10),
          height : parseInt(scaledHeight,10)
        }
        if (x + scaledWidth > canvasDimensions.width){
          doesClip = true;
          croppedWidth = canvasDimensions.width - x;
          cropTrObj.width = croppedWidth;
          trObjSecondary.width = croppedWidth;
        }
        if (y + scaledHeight > canvasDimensions.height){
          doesClip = true;
          croppedHeight = canvasDimensions.height - y;
          cropTrObj.height = croppedHeight;
          trObjSecondary.height = croppedHeight;
        }
        
        if (doesClip){
          // Calculate a crop based on how much of the object does NOT clip past the boundary of the canvas
          trObjSecondary.crop = 'scale';
          trObjSecondary.flags = ['layer_apply'];

          if ('radius' in trObj){
            // This is a little more complicated... 
            // Reset trObjSecondary since crop should be its own transformation
            trObjSecondary = {}

            // To crop to a specific region (the region not overlapping) I need to manually set the crop region by offseting x and y from 0,0 (top left) of the original image
            // https://cloudinary.com/cookbook/crop_pictures_by_custom_coordinates
            cropTrObj.x = parseInt((width - croppedWidth),10);
            cropTrObj.y = parseInt((height - croppedHeight),10);
            cropTrObj.crop = 'crop';
            cropTrObj.gravity = 'south_east';
            modPrimary = false;
          }
        }
        
        if (modPrimary===false){
          chainedTrObj = this.helpers.objectMerge(chainedTrObj,trObjSecondary);
        }
        else {
          trObj = this.helpers.objectMerge(trObj,cropTrObj);
        }
      }

      /**
       * Separate out any props that need to be part of their own transformation / chained
       */
      function processTrObjs(){
        for (var prop in trObj){
          if ((mapping.mustChain && mapping.mustChain.indexOf(prop)!==-1) || chainTogether.indexOf(prop)!==-1){
            // Must chain
            chainedTrObj[prop] = trObj[prop];
            // Don't delete if specified in keepInPrimary prop
            if (!Array.isArray(trObj.keepInPrimary) || trObj.keepInPrimary.indexOf(prop)===-1){
              delete trObj[prop];
            }
          }
        }

        // Push results together
        chainLastButMerge.forEach((el)=>{
          chainedTrObj = _this.helpers.objectMerge(chainedTrObj,el);
        });
        trObjs.push(trObj,cropTrObj,chainedTrObj);
        chainLast.reverse();
        chainLast.forEach((el)=>{trObjs.push(el)});

        // output
        let finalTrObjs = trObjs;

        // Reset inputs
        resetTrObjs();

        // Return
        return finalTrObjs;
      }
      trObjs = processTrObjs();

      let retInfo = {
        trObjs : trObjs,
        objMatched : objMatched,
        somethingClippedPast : somethingClippedPast
      }
      console.log(retInfo);

      // Return transformations and mapping info
      return retInfo;
    },
    generateFromCanvasRaw : function(canvas,OPT_forceBoundingStyle){
      // Timing mark
      let generationStartTime = performance.now();

      let _this = this;

      // Cropping / Bounding setting
      const acceptedBoundingStyles = ['perObject','atEnd','off'];
      let forceBoundingStyle = (OPT_forceBoundingStyle && acceptedBoundingStyles.indexOf(OPT_forceBoundingStyle)!==-1) ? OPT_forceBoundingStyle : 'atEnd';
      let perObjectBounding = forceBoundingStyle==='perObject' ? true : false;

      let canvasDimensions = this.state.editorData.canvasDimensions;

      // TESTING
      let useArr = true;
      console.log(this);
      if ('generateFromCanvasRaw' in _this){
        _this.cloudinaryMethods = _this;
      }
      // Setup cloudinary config and make sure refs are set
      _this.cloudinaryMethods.setConfig.bind(this)();
      let cloudinaryInstance = this.cloudinaryInstance;
      canvas = (canvas && typeof(canvas._objects)==='object') ? canvas : this.canvas;

      // Start the transformation chain by create the base cloudinary imageTag
      let baseImageId = _this.cloudinaryMethods.getBaseImage.bind(this)();
      let cloudinaryImageTag = cloudinaryInstance.imageTag(baseImageId);

      // Get every object on the canvas
      let canvasObjects = canvas._objects;
      let transformationArr = [];

      // The very first step, before even looking at which objects are on the canvas, should be to get the "base" image (i.e. the background) on which all objects will be laid. Should be resized to current canvas size
      let baseTransformationObj = {
        width : canvas.width,
        height : canvas.height,
        crop : 'scale'
      };
      // Next, if the base image is set as the default fallback - meaning that the user wants to overlay on top of a solid or transparent background, we should make sure the base image will show that way...
      // @TODO allow for solid fill instead of transparent
      if (baseImageId === _this.mainMethods.cloudinary.getFallbackBasePicId()){
        baseTransformationObj = this.helpers.objectMerge(baseTransformationObj,{
          opacity : 0
        });
      }
      if (!useArr){
        cloudinaryImageTag.transformation().chain().transformation(baseTransformationObj).chain();
      }
      transformationArr.push(baseTransformationObj);

      // MAIN ITERATOR OVER CANVAS OBJECTS
      let outputNeedsCropping = false;
      canvasObjects.forEach((val,index)=>{
        let currObj = val;

        // Get transformation objs from mapper
        let trInfo = _this.mainMethods.cloudinary.mapCanvasObjPropsToTrans(currObj,null,perObjectBounding);
        let trObjs = trInfo.trObjs;
        if (trInfo.somethingClippedPast === true){
          outputNeedsCropping = true;
        }

        // If the current canvas object got matched to a known type and triggered a transformation...
        if (trInfo.objMatched){
          for (var x=0; x<trObjs.length; x++){
            if (Object.keys(trObjs[x]).length > 0){
              transformationArr.push(trObjs[x]);
            }
          }
        }
      });
      if (forceBoundingStyle==='atEnd' && outputNeedsCropping===true){
        transformationArr.push({
          crop : 'crop',
          gravity : 'north_west',
          width : canvasDimensions.width,
          height : canvasDimensions.height
        });
      }

      // @TODO
      if (useArr){
        cloudinaryImageTag = this.mainMethods.cloudinary.applyTrArrayToCloudinaryImgTag(transformationArr,cloudinaryImageTag);
      }

      // Extract actual image URL
      let imgSrc = (/src="([^"]*)"/.exec(cloudinaryImageTag.toHtml())[1]);
      // Escape slashes inside base64 fetchlayers
      imgSrc = imgSrc.replace(/(l_fetch:)([^\/,]+)\/([^,]+)/gim,(match,p1,p2,p3,offset,string)=>{
        // First, make sure we haven't captured a slash that is natural.
        // Example : l_fetch:DFf98w0384/c_crop,...
        if (/(l_fetch:[^\/,]+)\/\w_{1}\w+:/.exec(match)){
          return p1 + p2 + '/' + p3;
        }
        else {
          // Convert from base64 back into the raw URL
          let encodedUrl = p2 + '/' + p3;
          let rawImageUrl = atob(encodedUrl);
          // Try adding characters to the URL until it no longer generates a slash. Not a great solution, but the only workaround I have at the moment, because I can't find anything on escaping slashes IN base64 strings for cloudinary
          let maxAttempts = 100;
          let currAttempt = 0;
          let moddedImageUrl = rawImageUrl;
          while ((currAttempt < maxAttempts) && /\//.test(btoa(moddedImageUrl))){
            // Check for existing query string
            let joiner = /\?.+/.test(moddedImageUrl) ? '&' : (/\?$/.test(moddedImageUrl) ? '' : '?');
            // Check for mod already started
            if (/cdwysslashbust=/gim.test(moddedImageUrl)===false){
              // Start the mod
              moddedImageUrl = moddedImageUrl + joiner + 'cdwysslashbust='
            }
            // Add rand
            moddedImageUrl = moddedImageUrl + _this.helpers.randomChar();
            console.log(moddedImageUrl);
            console.log(btoa(moddedImageUrl));
            currAttempt++;
          }
          console.log(currAttempt);
          console.log(moddedImageUrl);
          console.log(btoa(moddedImageUrl));
          return p1 + btoa(moddedImageUrl); 
        }
      });

      console.log(transformationArr);
      let generationTimeSec = ((performance.now()) - generationStartTime)/1000;
      this.mainMethods.app.mergeMasterState('performance.generationTimeSec',generationTimeSec);
      this.mainMethods.app.addMsg('Canvas-to-Cloudinary generation complete || Time = ' + generationTimeSec.toFixed(4) + 's || transformations = ' + transformationArr.length);

      return {
        open : function(){
          window.open(/src="([^"]*)"/.exec(cloudinaryImageTag.toHtml())[1])
        },
        log : function(){
          console.group('Cloudinary Output:');
            console.group('Transformation Array');
              console.log(transformationArr);
            console.groupEnd();
            console.group('Transformation Class');
              let transformationInstance = cloudinaryImageTag.transformation();
              console.log(transformationInstance);
              console.group('Serialized:');
                console.log(transformationInstance.serialize());
              console.groupEnd();
            console.groupEnd();
            console.log(cloudinaryImageTag);
            console.log(cloudinaryImageTag.toHtml());
            console.log(imgSrc);
        },
        get : function(OPT_updateState){
          let shouldUpdateState = (OPT_updateState || true);
          // Compose object to passback
          let transformationInstance = cloudinaryImageTag.transformation();
          let results = {
            transformations : {
              transformationArr : transformationArr,
              tranformationClassInstance : transformationInstance,
              serialized : transformationInstance.serialize()
            },
            img : {
              raw : cloudinaryImageTag,
              html : cloudinaryImageTag.toHtml(),
              src : imgSrc
            },
            imgSrc : imgSrc
          }
          console.log(results);
          if (shouldUpdateState){
            // Update state
            _this.mainMethods.app.mergeMasterState('output',results);
            _this.mainMethods.app.mergeMasterState('lastFetched',(new Date()).getTime());
          }
          // return
          return results;
        }
      }
    },
    generateFromCanvas : {
      open : function(canvas){
        this.mainMethods.cloudinary.generateFromCanvasRaw.bind(this)(canvas).open();
      }.bind(this),
      log : function(canvas){
        this.mainMethods.cloudinary.generateFromCanvasRaw.bind(this)(canvas).log();
      }.bind(this),
      get : function(canvas,OPT_updateState){
        return this.mainMethods.cloudinary.generateFromCanvasRaw.bind(this)(canvas).get(OPT_updateState);
      }.bind(this)
    },
    showResultsModal : function(){
      this.outputResultsClass.current.refresh();
      this.helpers.mtz.modal('.outputResultModal').open();
    }
  }
  // cloudinaryMethods - END
  
  /**
   * What should occur when the user goes from an active selection to everything deselected
   */
  handleNoSelection(){
    this.mainMethods.app.mergeEditorData('isItemSelected',false);
    this.mainMethods.app.mergeEditorData('currSelectedItemType',false);
    this.mainMethods.app.mergeEditorData('currSelectedItemGenericProps',{});
  }

  handleObjectDeselection(canvasObj){
    // @TODO - update when implementing group selection ability
    this.mainMethods.app.addMsg('object:deselected');
    // Check if object that was deselected was text
    if (canvasObj.get('type')==='text'){
      // Revert font panel to setting before text was selected
      this.revertFontSettings();
    }
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
    this.mainMethods.app.mergeEditorData('currSelectedColor',this.getObjColor(canvasObj));
  }

  revertFontSettings(){
    // Get current and last selected fonts
    let currSelectedFont = this.state.editorData.currSelectedFont;
    let lastSelectedFont = this.state.editorData.lastSelectedFont;
    // Check for equality of objects
    let fontChanged = !underscore.isEqual(currSelectedFont,lastSelectedFont);
    if (fontChanged){
      this.mainMethods.app.addMsg('Reverting font');
      this.mainMethods.app.mergeEditorData('currSelectedFont',lastSelectedFont);
      return true;
    }
    return false
  }

  updateFontSelectorFromCanvasObj(canvasObj){
    // @TODO
    // First, take a snapshot of the currently selected font, so it can be reverted if the object is unselected
    let currSelectedFont = underscore.clone(this.state.editorData.currSelectedFont);
    // Now get font settings based on canvasObj
    let canvasFont = underscore.clone(canvasObj.myTextObj);
    // Then map the new settings and the snapshot to state and prompt update
    this.mainMethods.app.mergeEditorData('currSelectedFont',canvasFont);
    this.mainMethods.app.mergeEditorData('lastSelectedFont',currSelectedFont);
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
    app : this.props.appMethods,
    colors : {
      handleColorSelect : this.handleColorSelect.bind(this)
    },
    canvas : (new Helpers()).bindObjectMethod(this.canvasMethods,this),
    modals : this.modals,
    cloudinary : (new Helpers()).bindObjectMethod(this.cloudinaryMethods,this)
  }

  getInstantPreviewElement(){
    let previewWrapperStyle = {
      minHeight : this.state.editorData.canvasDimensions.height,
      maxHeight : this.state.editorData.canvasDimensions.height,
      minWidth : this.state.editorData.canvasDimensions.width,
    }
    if (typeof(this.props.masterState.output.imgSrc)==='string' && this.props.masterState.livePreviewSrc !== ''){
      return (
        <div className="instantPreview" style={previewWrapperStyle}>
          <img src={this.props.masterState.livePreviewSrc} alt="Cloudinary Instant Preview"></img>
        </div>
      )
    }
    else {
      return (
        <div className="instantPreview" style={previewWrapperStyle}>
          <div className="valign-wrapper noPreviewToShowContainer">
            <div style={{textAlign : 'center', width : '100%'}}>Nothing to show...</div>
          </div>
        </div>
      );
    }
  }

  render(){
    let pseudoImages = this.state.editorData.images.urls.map((val,index)=>{
      return <img className="pseudoImage" key={index} src={val} alt="" />
    });


    return(
      <div className="canvasWrapperWrapper" data-instantpreview={this.state.accountSettings.fetchInstantly.toString()}>
        <div className="row">

          <div className="canvasWrapper leftSide roundedWrapper">
            <h3 className="areaTitle">Editor:</h3>
            {/* THE ACTUAL CANVAS ELEMENT */}
            <canvas id="editorCanvas"></canvas>
            <CurrObjectActions masterState={this.masterState} mainMethods={this.mainMethods}></CurrObjectActions>
          </div>

          {/* OPTIONAL - Instant Preview - Conditional rendering */}
          {this.state.accountSettings.fetchInstantly &&
            <div className="instantPreviewWrapper roundedWrapper">
              <h3 className="areaTitle">Preview:</h3>
              {this.getInstantPreviewElement()}
            </div>
          }

          <div className="sidebar rightSide row roundedWrapper">
            <div className="col 12 toolPanelWrapper sidebarComponent">
              <ToolPanel editorData={this.state.editorData} mainMethods={this.mainMethods}/>
            </div>

            <div className="col s12 sidebarComponent">
              <PaintSelector mainMethods={this.mainMethods} color={this.state.editorData.currSelectedColor} />
            </div>

            <div className="col s12 sidebarComponent">
              <FontSelector mainMethods={this.mainMethods} masterState={this.masterState} currSelectedFont={this.state.editorData.currSelectedFont} />
            </div>

            <div className="col s12 sidebarComponent">
              <LayersPanel />
            </div>

            <div className="col s12 sidebarComponent">
              <ImageAssets mainMethods={this.mainMethods} />
            </div>
          </div>

        </div>

        

        {/* Probably move this to separate component - cloudinary buttons */}
        <div className="col s12 center">
          <div className="center cloudinaryActionButtons">
            <button className="button btn darkPrimaryColor" onClick={this.mainMethods.cloudinary.showResultsModal.bind(this)}>Get Cloudinary</button>
            <button className="button btn darkPrimaryColor" onClick={this.mainMethods.cloudinary.generateFromCanvas.open.bind(this)}>Open Cloudinary</button>
          </div>
        </div>
        {/* Modals */}
        <div className="modals">
          <ImageSelector mainMethods={this.mainMethods} />
          <OutputResults ref={this.outputResultsClass} mainMethods={this.mainMethods} />
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