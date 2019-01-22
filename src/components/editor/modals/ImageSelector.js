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
                {/* Tab Select */}
                <ul className="tabs">
                  <li className="tab col s3"><a href="#hostedImageSelect">Hosted Image</a></li>
                  <li className="tab col s3"><a href="#cloudinaryPublicIdSelect">Cloudinary Public ID</a></li>
                  <li className="tab col s3 disabled" data-tooltip="Sorry, this has not yet been implemented" data-position="bottom"><a href="#newImageUploadSelect">Upload</a></li>
                </ul>
              </div>

              {/* Tab Content */}
              <div id="hostedImageSelect">
                <div className="tabContent">
                  <div className="row">
                    <div className="input-field col s8 offset-s1">
                      <input type="url" className="validate" id="hostedImageUrl_1" defaultValue="https://picsum.photos/200/300" />
                      <label htmlFor="hostedImageUrl_1">Hosted Image URL:</label>
                    </div>
                  </div>
                  <div className="row">
                    <div className="button btn modal-trigger modal-close" onClick={this.hostedImageUrlAdd.bind(this)}>Add Image</div>
                  </div>
                </div>
              </div>
              <div id="newImageUploadSelect">Sorry, this has not yet been implemented...</div>
              <div id="cloudinaryPublicIdSelect"></div>

              {/* End Tab Content */}

            </div>
          </div>
        </div> {/* End Modal */}
      </div>
    )
  }
}

export default ImageSelector;