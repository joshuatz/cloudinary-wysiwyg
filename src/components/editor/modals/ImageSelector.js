import React, {Component} from 'react';

class ImageSelector extends Component {
  constructor(props){
    super(props);
    this.$ = window.jQuery;
  }

  addImageByUrl(url){
    console.log(url);
    this.props.mainMethods.canvas.addImage(url);
  }

  hostedImageUrlAdd(){
    let hostedImageUrl = this.$('#hostedImageUrl_1').val();
    this.addImageByUrl(hostedImageUrl);
  }

  render(){
    return(
      <div className="ImageSelectorWrapper">

        {/* Image Hosting Method Selector */}
        <div className="imageHostingMethodSelector modal">
          <div className="modal-content">
            <h3>Image Selector</h3>
            <div className="row">
              <div className="col s12 center">What type of image do  you want to use?</div>
              <div className="row center">
                <a className="button btn autoCenter modal-trigger modal-close" href="#hostedImageModal">Hosted Image</a>
                <a className="button btn autoCenter modal-trigger modal-close" href="#newImageUploadModal">Upload an Image</a>
              </div>
            </div>
          </div>
        </div>

        {/* Hosted Image Options */}
        <div className="hostedImageModal modal" id="hostedImageModal">
          <div className="modal-content">
            <h3>Hosted Image Options:</h3>
            <div className="modal-content">
              <div className="row">
                <div className="input-field col s8 offset-s1">
                  <input type="url" className="validate" id="hostedImageUrl_1" value="https://picsum.photos/200/300" />
                  <label htmlFor="hostedImageUrl_1">Hosted Image URL:</label>
                </div>
              </div>
              <div className="row">
                <div className="button btn modal-trigger modal-close" onClick={this.hostedImageUrlAdd.bind(this)}>Add Image</div>
              </div>
            </div>
          </div>
        </div>

        {/* New Image Upload Options */}
        <div className="newImageUploadModal modal" id="newImageUploadModal">
          <div className="modal-content">
          </div>
        </div>
      </div>
    )
  }
}

export default ImageSelector;