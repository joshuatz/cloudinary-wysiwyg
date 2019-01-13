import React, {Component} from 'react';
let googleFonts = require( 'google-fonts-complete/google-fonts.json');

class FontSelector extends Component {
  constructor(props){
    super(props);
    let initialState = {
      googleFontsObj : googleFonts,
      googleFontsArr : Object.keys(googleFonts),
      currSelectedFont : this.getMasterState().editorData.currSelectedFont,
      currSelectedFontSyleObj : {}
    }
    this.state = initialState;
  }

  handleFontFamilyChange(evt){
    let selectedFontName = evt.target.options[evt.target.selectedIndex].value;
    let googleFontObj = this.state.googleFontsObj[selectedFontName];
    let fontFamilyString = "'" + selectedFontName + "', " + googleFontObj.category;
    //let fontFamilyString = googleFontObj.category;
    console.log(fontFamilyString);
    this.props.mainMethods.appMethods.mergeEditorData('currSelectedFont.fontFamily',fontFamilyString,()=>{
      console.log(this.props.mainMethods.appMethods.getMasterState());
    });
  }

  handleFontOptionToggle(optionPropName,button,evt){
    button = (button || {});
    let originalFontProps = this.getCurrSelectedFont();
    let newFontProps = originalFontProps;
    newFontProps[optionPropName] = !originalFontProps[optionPropName];
    this.props.mainMethods.appMethods.mergeEditorData('currSelectedFont',newFontProps,(res)=>{
      console.log(this.props.mainMethods.appMethods.getMasterState());
    });
    if (typeof(button.action)==='function'){
      button.action.bind(this)();
    }
  }

  getMasterState(){
    return this.props.masterState;
  }

  getCurrSelectedFont(){
    let currSelectedFont = this.props.masterState.editorData.currSelectedFont;
    // Update state if changed
    let state = this.state;
    if (state.currSelectedFont !== currSelectedFont){
      state.currSelectedFont = currSelectedFont;
      this.setState(state);
    }
    // return value
    return currSelectedFont;
  }

  getIsFontSelected(){
    let currSelectedFont = this.getCurrSelectedFont();
    return currSelectedFont.fontFamily!==false && currSelectedFont.fontFamily!=='';
  }

  fontButtons = [
    {
      icon : 'fa-bold',
      text : 'bold',
      currSelectedFontProp : 'bold'
    },
    {
      icon : 'fa-underline',
      text : 'Underline',
      currSelectedFontProp : 'underline',
      action : function(){
        if (this.state.currSelectedFont.strikethrough===true){
          this.handleFontOptionToggle('strikethrough');
        }
      }
    },
    {
      icon : 'fa-strikethrough',
      text : 'Strikethrough',
      currSelectedFontProp : 'strikethrough',
      action : function(){
        if (this.state.currSelectedFont.underline===true){
          this.handleFontOptionToggle('underline');
        }
      }
    }
  ]

  getPreviewTextStylingObj(){
    let previewTextStyling = {};
    let currSelectedFont = this.getCurrSelectedFont();
    previewTextStyling = {
      'fontFamily' : currSelectedFont.fontFamily ? currSelectedFont.fontFamily : 'Ubuntu',
      'fontSize' : currSelectedFont.size ? currSelectedFont.size : 16,
      'color' : currSelectedFont.color ? currSelectedFont.color : 'black',
      'fontStyle' : currSelectedFont.style ? currSelectedFont.style : 'normal',
      'fontWeight' : currSelectedFont.bold ? 'bold' : 'normal',
      'textDecorationLine' : currSelectedFont.underline ? 'underline' : (currSelectedFont.strikethrough ? 'line-through' : 'none')
    }
    console.log(previewTextStyling);
    // Update state if changed
    let newState = this.state;
    newState.currSelectedFontSyleObj = previewTextStyling;
    if (newState !== this.state){
      this.setState(newState);
    }
    return previewTextStyling;
  }

  render(){
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
      let propName = val.currSelectedFontProp;
      return (
          <button className={'btn fontButton ' + (this.getCurrSelectedFont()[propName]===true ? 'depressed' : '')} key={'fontb_' + index} onClick={this.handleFontOptionToggle.bind(this,propName,val)}>
            <i className={"fas " + val.icon}></i>{val.name}
          </button>
      )
    });
    return (
      <div>
        <div className="input-field col s8 fontFamilyPickerDropdown">
          <select onChange={this.handleFontFamilyChange.bind(this)}>
            {fontSelectOptions}
          </select>
        </div>
        <div className="input-field col s4 fontSizePickerDropdown">
          <select>
            <option defaultValue="16">16px</option>
          </select>
        </div>
        <div className="col s12 fontPickerPreview">
          <div className="previewText" style={this.getPreviewTextStylingObj()}>Preview Text</div>
        </div>
        <div className="col s12 fontButtonsWrapper">
          {buttonsHTML}
        </div>
      </div>
    )
  }
}

export default FontSelector;