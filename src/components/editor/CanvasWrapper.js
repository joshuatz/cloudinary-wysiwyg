import React, {Component} from 'react';

class CanvasWrapper extends Component {
  constructor(props){
    super(props);
  }
  render(){
    return(
      <div className="canvasWrapper">
        <div className="row">
          <div className="col s12 m9">
            <span>Editor</span>
          </div>
          <div className="col s12 m3">
            <span>Toolbar</span>
          </div>
        </div>
      </div>
    );
  }
}

export default CanvasWrapper;