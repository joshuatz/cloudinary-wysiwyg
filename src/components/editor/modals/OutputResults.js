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
    this.$ = window.jQuery;
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
    setTimeout(()=>{
      window.Materialize.updateTextFields();
      window.Materialize.textareaAutoResize(this.$('#imgHtmlTag'));
    },300);
    return (
      <div className="outputResultsModalWrapper">
        <div className="outputResultModal modal">
          <div className="modal-content">
            <h3>Cloudinary Results:</h3>
            <div className="row">
              <div className="col s10 offset-s1">
                <img className="responsive-img z-depth-2" src={imgSrc}></img>
              </div>
            </div>
            <div className="row">
              <div className="col s11 offset-s1 input-field">
                <input id="imgSrcUrl" value={output.img.src} type="text" className="active"></input>
                <label htmlFor="imgSrcUrl">Image URL:</label>
              </div>
              <div className="col s4 offset-s3 input-field">
                <button className="button btn darkPrimaryColor" data-clipboard-target="#imgSrcUrl">Copy to Clipboard</button>
              </div>
            </div>
            <div className="row">
              <div className="col s11 offset-s1 input-field">
                <textarea id="imgHtmlTag" className="materialize-textarea active" value={output.img.html}></textarea>
                <label htmlFor="imgHtmlTag">HTML IMG Tag</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OutputResults;