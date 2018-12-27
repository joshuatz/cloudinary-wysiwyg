import React, {Component} from 'react';

class ImageSelector extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <div className="ImageSelectorModal modal">
        <div className="modal-content">
          <h3>Image Selector</h3>
        </div>
        <div className="modal-footer"></div>
      </div>
    )
  }
}

export default ImageSelector;