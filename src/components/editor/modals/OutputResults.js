import React, {Component} from 'react';
import underscore from 'underscore';

class OutputResults extends Component {
  constructor(props){
    super(props);
    this.$ = window.jQuery;
    let initialState = {
      output : {
        transformations : {
          transformationArr : []
        },
        img : {
          raw : {},
          html : '',
          src : ''
        },
        imgSrc : ''
      }
    };
    this.state = initialState;
  }

  refresh(){
    let output = this.props.mainMethods.cloudinary.generateFromCanvas.get();
    let updatedState = {
      output : underscore.clone(output)
    }
    this.setState(updatedState);
  }

  render(){
    let output = this.state.output;
    let imgSrc = output.imgSrc!=='' ? output.imgSrc : 'loading.gif';
    return (
      <div className="outputResultsModalWrapper">
        <div className="outputResultModal modal">
          <div className="modal-content">
            <h3>Cloudinary Results:</h3>
            <div className="row">
              <div className="col s10 offset-s1">
                <img className="responsive-img z-depth-2" src={output.imgSrc}></img>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OutputResults;