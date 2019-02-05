import React, {Component} from 'react';
import Helpers from '../../../inc/Helpers';

class ImageSelector extends Component {
  constructor(props){
    super(props);
    // Note - this can be used to either update the baselayer (background) or add an image to the canvas, by changing props.destination
    // use props.inline to strip out modal
    this.$ = window.jQuery;
    let initialState = {
      psuedoImages : []
    }
    this.state = initialState;
    this.helpers = new Helpers();
    this.destinationString = this.props.destination==='baseLayer' ? 'baseLayer' : 'canvas'
    this.useModal = this.props.inline!==true;
    this.modalClassName = this.useModal ? "modal" : "inlineContent";
  }

  componentDidMount(){
    let currModalTabs = this.$('.imageHostingMethodSelector.' + this.modalClassName + ' .tabs');
    this.helpers.mtz.initTabs(currModalTabs);
  }

  addImageByUrl(url){
    if (this.props.destination==='baseLayer'){
      let originalBaseLayer = this.props.masterState.editorData.baseLayer;
      this.props.mainMethods.app.mergeMasterState('editorData.baseLayer',this.helpers.objectMerge(originalBaseLayer,{
        image : url,
        type : 'image',
        isId : false
      }),()=>{
        this.props.mainMethods.canvas.applyBaseLayer();
      });
    }
    else {
      this.props.mainMethods.canvas.addImage(url);
    }
  }

  hostedImageUrlAdd(){
    let hostedImageUrl = this.$('#hostedImageUrl_' + this.destinationString).val();
    this.addImageByUrl(hostedImageUrl);
  }

  addImageById(){
    let _this = this;
    let cloudinaryPublicId = this.$('#cloudinaryPublicIdInput_' + this.destinationString).val();
    if (cloudinaryPublicId.length > 0){
      if (this.props.destination==='baseLayer'){
        let originalBaseLayer = this.props.masterState.editorData.baseLayer;
        this.props.mainMethods.app.mergeMasterState('editorData.baseLayer',this.helpers.objectMerge(originalBaseLayer,{
          image : cloudinaryPublicId,
          type : 'image',
          isId : true
        }),()=>{
          _this.props.mainMethods.canvas.applyBaseLayer();
        });
      }
      else {
        // Add image to DOM
        let imgSrc = this.props.mainMethods.cloudinary.getImageSrcFromPublicId(cloudinaryPublicId);
        // Canvas is going to need the URL suffixed with a file type
        if (/\.[A-Za-z]{1,10}$/.test(imgSrc)===false){
          imgSrc = imgSrc + '.png';
        }
        let updatedState = this.state;
        updatedState.psuedoImages.push(imgSrc);
        this.setState(updatedState,()=>{
          let renderedImage = this.$('img[src="' + imgSrc + '"]')[0];
          setTimeout(()=>{
            if (renderedImage.width > 0){
              this.props.mainMethods.canvas.addImage(renderedImage,()=>{
                // Not sure what is going on here - I think canvas is having some issue with large image rendering
                // @TODO
                setTimeout(()=>{
                  this.props.mainMethods.canvas.renderAll(true);
                },1000);
                // Delete the psuedo image
                renderedImage.remove();
              },null,null,cloudinaryPublicId);
            }
            else {
              //@TODO
            }
          },400);
        });
      }
    }
    else {
      // @TODO
    }
  }

  render(){
    let destinationString = this.destinationString;
    let pseudoImageElements = this.state.psuedoImages.map((imgSrc,index)=>{
      return (
        <img src={imgSrc} alt=""></img>
      )
    });
    return(
      <div className="ImageSelectorWrapper">

        {/* Image Hosting Method Selector */}
        <div className={"imageHostingMethodSelector" + " " + this.modalClassName} data-destination={this.destinationString}>
          <div className="modal-content">
            {this.props.destination!=='baseLayer' &&
              <h3>Image Selector</h3>
            }
            <div className="row">
              <div className="col s12 center">What type of image do  you want to use?</div>
              <div className="row center">
                {/* Tab Select */}
                <ul className="tabs">
                  <li className="tab col s3"><a href={"#hostedImageSelect_" + destinationString}>Hosted Image</a></li>

                  <li className="tab col s3 disabled" data-tooltip="Sorry, this has not yet been implemented" data-position="bottom"><a href={"#macroImageSelect_" + destinationString}>Placeholder / Macro</a></li>

                  <li className="tab col s3"><a href={"#cloudinaryPublicIdSelect_" + destinationString}>Cloudinary Public ID</a></li>
                  
                  <li className="tab col s3 disabled" data-tooltip="Sorry, this has not yet been implemented" data-position="bottom"><a href={"#newImageUploadSelect_" + destinationString}>Upload</a></li>
                </ul>
              </div>

              {/* Tab Content */}
              <div id={"hostedImageSelect_" + destinationString}>
                <div className="tabContent">
                  <div className="row">
                    <div className="input-field col s6 offset-s1">
                      <input type="url" className="validate" id={"hostedImageUrl_" + destinationString} placeholder="https://picsum.photos/200/300" />
                      <label htmlFor={"hostedImageUrl_" + destinationString} >Hosted Image URL:</label>
                    </div>
                    <div className="col s4">
                      {this.props.destination==='baseLayer' ? (
                        <div className="button btn modal-close" onClick={this.hostedImageUrlAdd.bind(this)}>Set Image</div>
                      ) : (
                        <div className="button btn modal-close" onClick={this.hostedImageUrlAdd.bind(this)}>Add Image</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div id={"newImageUploadSelect_" + destinationString}>Sorry, this has not yet been implemented...</div>

              <div id={"cloudinaryPublicIdSelect_" + destinationString}>
                <div className="tabContent row">
                  <div className="col s6 offset-s1 input-field">
                    <input type="text" id={"cloudinaryPublicIdInput_" + destinationString} placeholder="flowers"></input>
                    <label htmlFor={"cloudinaryPublicIdInput_" + destinationString}>Cloudinary Public ID:</label>
                  </div>
                  <div className="col s4">
                    {this.props.destination==='baseLayer' ? (
                      <div className="button btn modal-close" onClick={this.addImageById.bind(this)}>Set Image</div>
                    ) : (
                      <div className="button btn modal-close" onClick={this.addImageById.bind(this)}>Add Image</div>
                    )}
                  </div>
                </div>
              </div>

              <div id={"macroImageSelect_" + destinationString}>
                <div className="tabContent row">
                  
                </div>
              </div>

              {/* End Tab Content */}

            </div>
          </div>
        </div> {/* End Modal */}

        {/* Pseudo images */}
        <div className="pseudoImageWrapper hidden">
          {pseudoImageElements}
        </div>

      </div>
    )
  }
}

export default ImageSelector;