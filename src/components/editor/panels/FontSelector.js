import React, {Component} from 'react';
let googleFonts = require( 'google-fonts-complete/google-fonts.json');

class FontSelector extends Component {
  constructor(props){
    super(props);
    let initialState = {
      googleFontsObj : googleFonts,
      googleFontsArr : Object.keys(googleFonts),
      currSelectedFont : this.getMasterState().editorData.currSelectedFont
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
    return this.props.masterState;
  }

  getCurrSelectedFont(){
    return this.getMasterState().editorData.currSelectedFont;
  }

  getIsFontSelected(){
    let currSelectedFont = this.getCurrSelectedFont();
    return currSelectedFont.fontFamily!==false && currSelectedFont.fontFamily!=='';
  }

  fontButtons = [
    {
      icon : 'fa-bold',
      text : 'bold',
      action : function(){

      }
    },
    {
      icon : 'fa-underline',
      text : 'Underline',
      action : function(){

      }
    },
    {
      icon : 'fa-strikethrough',
      text : 'Strikethrough',
      action : function(){

      }
    }
  ]

  render(){
    // Check if there is an actively selected font and apply to preview text
    let previewTextStyling = {};
    if (this.getIsFontSelected()){
      let currSelectedFont = this.getCurrSelectedFont();
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
      if (!this.getIsFontSelected() || this.getCurrSelectedFont().fontFamily!==fontName){
        return (
          <option value={fontName} key={fontName}>{fontName}</option>
        )
      }
    });
    if (this.getIsFontSelected()){
      fontSelectOptions.unshift((
        <option value={this.getCurrSelectedFont().fontFamily}></option>
      ));
    }
    // Build font buttons
    let buttonsHTML = this.fontButtons.map((val,index)=>{
      return (
          <button className="fontButton" key={'fontb_' + index} onClick={val.action.bind(this)}>
            <i className={"fas " + val.icon}></i>{val.name}
          </button>
      )
    });
    return (
      <div>
        <div className="input-field col s8 fontFamilyPickerDropdown">
          <select onChange={this.handleFontChange.bind(this)}>
            {fontSelectOptions}
          </select>
        </div>
        <div className="input-field col s4 fontSizePickerDropdown">
          <select>
            <option defaultValue="16">16px</option>
          </select>
        </div>
        <div className="col s12 fontPickerPreview">
          <div className="previewText" style={previewTextStyling}>Preview Text</div>
        </div>
        <div className="col s12 fontButtonsWrapper">
          {buttonsHTML}
        </div>
      </div>
    )
  }
}

export default FontSelector;