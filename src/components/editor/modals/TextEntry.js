import React, {Component} from 'react';

class TextEntry extends Component {
  constructor(props){
    super(props);
    this.$ = window.jQuery;
    let initialState = {
      text : ''
    };
    this.state = initialState;
  }

  render(){
    return(
      <div className="textEntryModalWrapper">

        {/* Image Hosting Method Selector */}
        <div className="textEntryModal modal">
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
      </div>
    )
  }
}

export default TextEntry;