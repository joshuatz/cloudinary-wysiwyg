import React, {Component} from 'react';

class Fabs extends Component {
  constructor(props){
    super(props);
    let initialState = {};
    this.state = initialState;
  }
  
  render(){
    return (
      <div className="fabsWrapper">
        <div className="fixed-action-btn">
          <button className="btn-floating btn-large darkPrimaryColor">
            <i className="large material-icons">menu</i>
          </button>
          <ul>
            <li><a className="btn-floating accentColor" data-tooltip="Project Page / More Info" data-position="left" href="https://joshuatz.com/projects/web-stuff/cloudinary-wysiwyg-visual-editor-for-transformations" target="_blank" rel="noopener noreferrer">
              <i className="material-icons">info</i>
            </a></li>
            <li><button className={"btn-floating accentColor" + (!this.props.generatorHasOutput ? " disabled" : "")} data-tooltip="Generate Output" data-position="left" onClick={window.showResultsModal}>
              <i className="material-icons">get_app</i>
            </button></li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Fabs;