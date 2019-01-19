import React, {Component} from 'react';
import Helpers from '../../inc/Helpers';
import LayersPanel from './panels/LayersPanel';
import ImageAssets from './panels/ImageAssets';
import ToolPanel from './panels/ToolPanel';
import PaintSelector from './panels/PaintSelector';
import FontSelector from './panels/FontSelector';
import ImageSelector from './modals/ImageSelector';
import TextEntry from './modals/TextEntry';
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
    this.appMethods = this.props.appMethods;
    // Note - cloudinary seems to prefer GIF over PNG for working with transparency in fetch layers.
    this.fallbackTransparentPixelSrc = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png';
    this.fallbackSolidPixelSrc = 'https://via.placeholder.com/2x2';
    this.masterState = this.props.masterState;
    this.canvasReRenderIp = false;
    this.CANVAS_ELEMENT_ID = 'editorCanvas';
  }

  canvasStyles = {
    // width : '100%'
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

    // Attach global event listeners
    canvas.on('selection:cleared',(evt)=>{
      this.handleNoSelection();
    });
    canvas.on('object:selected',(evt)=>{
      this.mainMethods.canvas.getSelectedObjs(true);
      this.mainMethods.appMethods.addMsg('object:selected');
    });
    canvas.on('object:modified',(evt)=>{
      this.mainMethods.appMethods.addMsg('object:modified');
      this.mainMethods.canvas.renderAll();
    });
    canvas.on('text:changed',(evt)=>{
      console.log(evt);
      // Prevent multi-line text
      this.mainMethods.canvas.removeMultiLineText(evt.target);
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
    updateLivePreview : function(force){
      if (force || (this.state.accountSettings.fetchInstantly && this.mainMethods.appMethods.getMsSinceLastFetch() > 250)){
        // Get updated image src
        this.mainMethods.cloudinary.generateFromCanvas.get.bind(this)();
        // Update livePreviewSrc state, which will prompt render of preview
        this.mainMethods.appMethods.mergeMasterState('livePreviewSrc',this.mainMethods.appMethods.getMasterState().output.imgSrc);
      }
      // Also update if livePreview is off, that way state will be ready if live preview is sudddenly opened
      else if (this.state.accountSettings.fetchInstantly===false){
        this.mainMethods.canvas.updateLivePreview(true);
      }
    },
    renderAll : function(force){
      //debugger;
      let canvas = this.state.editorData.canvasObj;
      this.canvasReRenderIp = true;
      canvas.renderAll();
      //debugger;
      this.canvasReRenderIp = false;
      this.mainMethods.canvas.updateLivePreview(force);
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
    getCanvObjOriginalLeft : function(obj){
      let left = obj.get('left');
      if (!'angle' in obj || obj.angle === 0){
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
      this.appMethods.mergeEditorData('isItemSelected',true);
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
      canvas.renderAll();
      canvas.bringToFront(rect);
      this.mainMethods.canvas.updateLivePreview();
      rect.on('selected',()=>{
        this.canvasMethods.handleShapeSelect.bind(this)(rect);
      });
    },
    addImage : function(urlOrImgElem,OPT_callback,OPT_macroKey){
      let callback = (OPT_callback || function(){});
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
            _this.canvasMethods.addImage.bind(_this)(imageElem,callback,OPT_macroKey);
            _this.canvasMethods.renderAll.bind(_this)();
            console.log(_this.state);
          },500);
        });
      }
      else {
        let imgProps = {
          left : 100,
          top : 100,
          isMacro : false
        }
        if (typeof(OPT_macroKey)==='string'){
          imgProps.isMacro = true;
          imgProps.macroKey = OPT_macroKey;
        }
        let imgInstance = new fabric.Image(imageElem,imgProps);
        canvas.add(imgInstance);
        canvas.renderAll();
        canvas.bringToFront(imgInstance);
        this.mainMethods.canvas.updateLivePreview();
        imgInstance.on('selected',()=>{
          //
        });
        callback(imgInstance);
        return imgInstance;
      }
    },
    addText : function(text,OPT_fontFamily,OPT_fontSize,OPT_fontColor,OPT_macroKey){
      let _this = this;
      let canvas = this.state.editorData.canvasObj;
      let fabric = this.state.fabric;
      text = (text || 'Edit Me!');
      console.log(this.state.editorData.currSelectedFont);
      let textProps = {
        left : 100,
        top : 100,
        fontSize : this.state.editorData.currSelectedFont.size,
        lockUniScaling : true,
        fill : this.getCurrSelectedColor().hex,
        myTextObj : underscore.clone(this.state.editorData.currSelectedFont)
      }

      if (typeof(OPT_macroKey)==='string'){
        textProps.isMacro = true;
        textProps.macroKey = OPT_macroKey;
      }
      let textInstance = new fabric.IText(text,textProps);
      canvas.add(textInstance);
      canvas.renderAll();
      textInstance.on('selected',()=>{
        this.canvasMethods.handleTextSelect.bind(this)(textInstance);
        // @TODO handle callback to allow editing already added text
      });
      textInstance.on('deselected',()=>{
        this.handleObjectDeselection(textInstance);
      });
      canvas.bringToFront(textInstance);
      this.mainMethods.canvas.updateLivePreview();
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
      let angle = parseFloat(canvasObj.get('angle'));
      // Handle scaling by using x and y factors and multiplying width and height
      width = width * parseFloat(canvasObj.get('scaleX'));
      height = height * parseFloat(canvasObj.get('scaleY'));
      // Note - X and Y should be integers
      // Note - angle should be an integer
      let props = {
        width : parseInt(width,10),
        height : parseInt(height,10),
        x : parseInt(this.mainMethods.canvas.getCanvObjOriginalLeft(canvasObj),10),
        y : parseInt(canvasObj.get('top'),10),
        gravity : 'north_west'
      };
      if (angle!==0){
        props.angle = parseInt(angle,10);
      }
      let updatedProps = this.helpers.objectMerge(transObj,props);
      return updatedProps;
    },
    generateFromCanvasRaw : function(canvas){
      let generationStartTime = performance.now();
      let _this = this;
      // TESTING
      let useArr = true;
      console.log(this);
      if ('generateFromCanvasRaw' in _this){
        _this.cloudinaryMethods = _this;
      }
      // Setup cloudinary config and make sure refs are set
      _this.cloudinaryMethods.setConfig.bind(this)();
      let cloudinaryInstance = this.cloudinaryInstance;
      let cloudinary = this.cloudinary;
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
        crop : 'pad'
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
          // NOTE - order of operations and chaining is important. Size and position should always come first and as separate transformations to avoid conflicts
          trObj = _this.mainMethods.cloudinary.getTransformationObj('pixel').get('solid');
          // Set size and offset
          trObj = _this.helpers.objectMerge([trObj,genericTransformationObj]);
          // Apply color
          let trObjSecondary = {
            background : 'rgb:' + _this.getObjColor(currObj).hex.replace('#',''),
            color : 'rgb:' + _this.getObjColor(currObj).hex.replace('#',''),
            effect : 'colorize',
            flags : ['layer_apply']
          }
          trObjSecondary = _this.helpers.objectMerge([trObjSecondary,genericTransformationObj]);
          delete trObjSecondary.width;
          delete trObjSecondary.height;
          // REMOVE ANGLE FROM TRANSFORMATION - it needs to be chained instead, and after size and color is set and apply with flags. Very picky about this...
          if (trObj.angle && trObj.angle  > 0){
            let angle = trObj.angle;
            delete trObj.angle;
            // layer_apply flag with angle transformation tells it to apply it to the overlay rather than the entire base (it would rotate the entire image if omitted)
            trObjSecondary.angle = angle;
          }
          trObjs.push(trObj,trObjSecondary);
          if (!useArr){
            tr.chain().transformation(trObj);
            tr = tr.chain().transformation(trObjSecondary);
          }
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
            if (!useArr){
              // First, apply just the overlay
              tr.overlay(trObj.overlay);
              // Then chain with generic size and position
              tr = tr.chain().transformation(trObjSecondary);
            }
          }
          // https://cloudinary.com/documentation/image_transformations#adding_image_overlays
          // https://cloudinary.com/documentation/jquery_image_manipulation#chaining_transformations
          // https://cloudinary.com/documentation/jquery_image_manipulation#adding_text_and_image_overlays
        }
        else if (objType==='text' || objType==='i-text'){
          // Text is technically an overlay layer
          // Note - Font Family and Font Size are REQUIRED
          // Note that the space that font takes up is calculated by the font-size, not width and height. If the canvas object is scaled, you should use the ratio (X and Y are the same) to figure out what to multiply the original font size by
          // Note - for text, x and y position (offset) should be passed directly with the textLayer rather than chaining it as a secondary transformation
          let fontSize = currObj.fontSize;
          if (currObj.scaleX > 1){
            fontSize = parseInt((currObj.scaleX * fontSize));
          }
          trObj = {
            overlay : new cloudinary.TextLayer({
              fontFamily : 'Roboto',
              fontSize : fontSize,
              text : currObj.text
            }),
            x : genericTransformationObj.x,
            y : genericTransformationObj.y,
            gravity : genericTransformationObj.gravity,
            angle : genericTransformationObj.angle,
            effect : 'colorize',
            color : 'rgb:' + _this.getObjColor(currObj).hex.replace('#','')
          }
          trObjs.push(trObj);
          if (!useArr){
            tr.chain().transformation(trObj);
          }
        }
        else {
          objMatched = false;
          console.warn('Unmapped Canvas Object Type encountered - ' + objType);
          console.log(currObj);
        }
        // If the current canvas object got matched to a known type and triggered a transformation...
        if (objMatched){
          for (var x=0; x<trObjs.length; x++){
            transformationArr.push(trObjs[x]);
          }
          if (!useArr){
            cloudinaryImageTag.transformation().chain().transformation(tr);
          }
        }
      });

      // @TODO
      if (useArr){
        let tr = cloudinary.Transformation.new();
        for (var x=0; x< transformationArr.length; x++){
          if (x>0){
            //tr = tr.chain();
          }
          let currTransObj = transformationArr[x];
          if ('resourceType' in currTransObj && currTransObj.resourceType === 'fetch'){
            //debugger;
            tr.overlay(currTransObj);
          }
          else {
            if (x>0){
              tr = tr.chain();
            }
            tr.transformation(currTransObj);
          }
        }
        // Apply
        cloudinaryImageTag.transformation().chain().transformation(tr);
      }
      else {
        
      }

      // Extract actual image URL
      let imgSrc = (/src="([^"]*)"/.exec(cloudinaryImageTag.toHtml())[1]);

      console.log(transformationArr);

      let generationTime = ((performance.now()) - generationStartTime)/1000;
      this.mainMethods.appMethods.mergeMasterState('performance.generationTime',generationTime);

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
          //debugger;
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
          // Update state
          _this.mainMethods.appMethods.mergeMasterState('output',results);
          _this.mainMethods.appMethods.mergeMasterState('lastFetched',(new Date()).getTime());
          // return
          return results;
        }
      }
    },
    generateFromCanvas : {
      open : function(canvas){
        this.mainMethods.cloudinary.generateFromCanvasRaw.bind(this)(canvas).open();
      },
      log : function(canvas){
        this.mainMethods.cloudinary.generateFromCanvasRaw.bind(this)(canvas).log();
      },
      get : function(canvas,OPT_updateState){
        //debugger;
        this.mainMethods.cloudinary.generateFromCanvasRaw.bind(this)(canvas).get(OPT_updateState);
      }
    }
  }
  // cloudinaryMethods - END
  
  handleNoSelection(){
    this.appMethods.mergeEditorData('isItemSelected',false);
    this.appMethods.mergeEditorData('currSelectedItemType',false);
    this.appMethods.mergeEditorData('currSelectedItemGenericProps',{});
  }

  handleObjectDeselection(canvasObj){
    // @TODO - update when implementing group selection ability
    this.mainMethods.appMethods.addMsg('object:deselected');
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
    this.appMethods.mergeEditorData('currSelectedColor',this.getObjColor(canvasObj));
  }

  revertFontSettings(){
    // Get current and last selected fonts
    let currSelectedFont = this.state.editorData.currSelectedFont;
    let lastSelectedFont = this.state.editorData.lastSelectedFont;
    // Check for equality of objects
    let fontChanged = !underscore.isEqual(currSelectedFont,lastSelectedFont);
    if (fontChanged){
      this.mainMethods.appMethods.addMsg('Reverting font');
      this.mainMethods.appMethods.mergeEditorData('currSelectedFont',lastSelectedFont);
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
    this.appMethods.mergeEditorData('currSelectedFont',canvasFont);
    this.appMethods.mergeEditorData('lastSelectedFont',currSelectedFont);
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

  getInstantPreviewElement(){
    let previewWrapperStyle = {
      minHeight : this.state.editorData.canvasDimensions.height,
      maxHeight : this.state.editorData.canvasDimensions.height,
      minWidth : this.state.editorData.canvasDimensions.width,
    }
    if (typeof(this.props.masterState.output.imgSrc)==='string' && this.props.masterState.livePreviewSrc !== ''){
      return (
        <div className="instantPreview" style={previewWrapperStyle}>
          <img src={this.props.masterState.livePreviewSrc}></img>
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
      return <img className="pseudoImage" key={index} src={val} />
    });


    return(
      <div className="canvasWrapperWrapper" data-instantpreview={this.state.accountSettings.fetchInstantly.toString()}>
        <div className="row">

          <div className="canvasWrapper leftSide roundedWrapper">
            <h3 className="areaTitle">Editor:</h3>
            {/* THE ACTUAL CANVAS ELEMENT */}
            <canvas id="editorCanvas" style={this.canvasStyles}></canvas>
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
          <div className="center">
            <button className="button btn darkPrimaryColor" onClick={this.mainMethods.cloudinary.generateFromCanvas.get.bind(this)}>Get Cloudinary</button>
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