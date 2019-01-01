import React, {Component} from 'react';
let googleFonts = require( 'google-fonts-complete/google-fonts.json');

class FontSelector extends Component {
  constructor(props){
    super(props);
    let initialState = {
      googleFontsObj : googleFonts,
      googleFontsArr : Object.keys(googleFonts)
    }
    this.state = initialState;
  }

  handleFontChange(evt){
    let selectedFontName = evt.target.options[evt.target.selectedIndex].value;
    let googleFontObj = this.state.googleFontsObj[selectedFontName];
    let fontFamilyString = "'" + selectedFontName + "', " + googleFontObj.category;
    //let fontFamilyString = googleFontObj.category;
    console.log(fontFamilyString);
    this.props.mainMethods.appMethods.mergeEditorData('currSelectedFont',{
      'fontFamily' : fontFamilyString
    });
  }

  getMasterState(){
    return this.props.mainMethods.appMethods.getMasterState;
  }

  render(){
    // Check if there is an actively selected font and apply to preview text
    let previewTextStyling = {};
    if (this.props.mainMethods.appMethods.getMasterState().editorData.currSelectedFont.fontFamily){
      let currSelectedFont = this.props.mainMethods.appMethods.getMasterState().editorData.currSelectedFont;
      previewTextStyling = {
        'fontFamily' : currSelectedFont.fontFamily,
        'fontSize' : currSelectedFont.size ? currSelectedFont.size : 16,
        'color' : currSelectedFont.color ? currSelectedFont.color : 'black',
        'fontStyle' : currSelectedFont.style ? currSelectedFont.style : 'normal'
      }
      console.log(previewTextStyling);
    }
    // Build font select <option></option>
    let fontSelectOptions = this.state.googleFontsArr.map((fontName,index)=>{
      return (
        <option value={fontName} key={fontName}>{fontName}</option>
      )
    })
    return (
      <div>
        <div className="input-field col s12 fontPickerDropdown">
          <select onChange={this.handleFontChange.bind(this)}>
            <option defaultValue="Arial">Arial</option>
            {fontSelectOptions}
          </select>
        </div>
        <div className="col s12 fontPickerPreview">
          <div className="previewText" style={previewTextStyling}>Preview Text</div>
        </div>
      </div>
    )
  }
}

export default FontSelector;