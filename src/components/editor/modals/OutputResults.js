import React, {Component} from 'react';
import underscore from 'underscore';
import Helpers from '../../../inc/Helpers';

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
    this.helpers = new Helpers();
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
    let imgSrc = output.imgSrc!=='' ? this.helpers.forceHttps(output.imgSrc) : '/assets/loading.gif';
    setTimeout(()=>{
      window.Materialize.updateTextFields();
      document.querySelectorAll('.outputResultModal .materialize-textarea').forEach((el)=>{
        window.Materialize.textareaAutoResize(this.$(el));
      });
    },300);
    return (
      <div className="outputResultsModalWrapper">
        <div className="outputResultModal modal">
          <div className="modal-content">
            <h3 className="modalTitle">Cloudinary Results:</h3>
            <div className="row">
              <div className="col s10 offset-s1">
                <img className="responsive-img z-depth-2 resultsPanelPreviewImage" src={imgSrc} alt="Generated Cloudinary Preview"></img>
              </div>
            </div>
            <div className="row">
              <div className="col s7 input-field">
                <textarea id="imgSrcUrl" value={output.img.src} className="materialize-textarea active" readOnly></textarea>
                <label htmlFor="imgSrcUrl">Image URL:</label>
              </div>
              <div className="col s4 input-field">
                <button className="button btn darkPrimaryColor" data-clipboard-target="#imgSrcUrl">Copy to Clipboard</button>
              </div>
            </div>
            <div className="divider"></div>
            <div className="row">
              <div className="col s7 input-field">
                <textarea id="imgHtmlTag" className="materialize-textarea active" value={output.img.html} readOnly></textarea>
                <label htmlFor="imgHtmlTag">HTML IMG Tag</label>
              </div>
              <div className="col s4 input-field">
                <button className="button btn darkPrimaryColor" data-clipboard-target="#imgHtmlTag">Copy to Clipboard</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OutputResults;