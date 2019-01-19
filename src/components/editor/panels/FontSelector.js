import React, {Component,PureComponent } from 'react';
let googleFonts = require( 'google-fonts-complete/google-fonts.json');

class FontSelector extends Component  {
  constructor(props){
    super(props);
    let initialState = {
      googleFontsObj : googleFonts,
      googleFontsArr : Object.keys(googleFonts),
      currSelectedFont : {},
      currSelectedFontSyleObj : {}
    }
    Object.assign(initialState.currSelectedFont,this.getCurrSelectedFont(false));
    this.state = initialState;
    this.$ = window.$;
    this.fontSelectOptions = this.state.googleFontsArr.map((fontName,index)=>{
      return (
        <option value={fontName} key={fontName}>{fontName}</option>
      )
    });
  }

  shouldComponentUpdate(nextProps,nextState){
    if (JSON.stringify(this.props.currSelectedFont)!==JSON.stringify(nextProps.currSelectedFont)){
      return true;
    }
    return false;
  }

  refreshCurrentFontInfo(){
    let $ = this.$;
    let fontName = $('.fontFamilyPickerDropdown input.select-dropdown').val();
    let refreshedData = {
      'size' : parseInt($('.fontSizePickerDropdown input.select-dropdown').val().replace('px','')),
      'fontFamily' : "'" + fontName + "'," + this.state.googleFontsObj[fontName].category,
      'color' : false,
      'style' : false,
      'bold' : false,
      'underline' : false,
      'strikethrough' : false
    }
  }

  /**
   * This will update all selected text objects on the canvas to match currently selected font settings
   * NOTE: The reverse of this function is updateFontSelectorFromCanvasObj
   */
  updateSelectedTextObjs(){
    // @TODO
  }

  handleFontFamilyChange(evt){
    let selectedFontName = evt.target.options[evt.target.selectedIndex].value;
    let googleFontObj = this.state.googleFontsObj[selectedFontName];
    let fontFamilyString = "'" + selectedFontName + "', " + googleFontObj.category;
    this.props.mainMethods.appMethods.mergeEditorData('currSelectedFont.fontFamilyFull',fontFamilyString);
    this.props.mainMethods.appMethods.mergeEditorData('currSelectedFont.fontFamilySlim',selectedFontName);
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

  handleFontSizeChange(){
    let $ = this.$;
    let fontSize = parseInt($('.fontSizePickerDropdown input.select-dropdown').val().replace('px',''));
    this.props.mainMethods.appMethods.mergeEditorData('currSelectedFont.size',fontSize);
  }

  getMasterState(){
    return this.props.masterState;
  }

  getCurrSelectedFont(updateState){
    updateState = typeof(updateState)==='boolean' ? updateState : false;
    let currSelectedFont = this.props.currSelectedFont;
    // Update state if changed
    if (updateState){
      let state = this.state;
      if (JSON.stringify(state.currSelectedFont) !== JSON.stringify(currSelectedFont)){
        //debugger;
        state.currSelectedFont = currSelectedFont;
        this.setState(state);
      }
    }
    // return value, but copy object instead of returning reference
    return JSON.parse(JSON.stringify(currSelectedFont));
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
      'fontFamily' : currSelectedFont.fontFamilyFull ? currSelectedFont.fontFamilyFull : 'Ubuntu',
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
        <option value={this.getCurrSelectedFont().fontFamilySlim}>{this.getCurrSelectedFont().fontFamilySlim}</option>
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
    // Build font size options
    let currFontSize = this.state.currSelectedFont.size;
    let fontSizeOptionsArr = [];
    for (var x=1; x<100; x++){
      if (x!==currFontSize){
        fontSizeOptionsArr.push(x);
      }
    }
    let fontSizeOptions = fontSizeOptionsArr.map((val,index)=>{
      return (
        <option value={val}>{val + 'px'}</option>
      )
    })
    return (
      <div>
        <div className="input-field col s8 fontFamilyPickerDropdown">
          <select onChange={this.handleFontFamilyChange.bind(this)}>
            {fontSelectOptions}
          </select>
        </div>
        <div className="input-field col s4 fontSizePickerDropdown">
          <select onChange={this.handleFontSizeChange.bind(this)}>
            <option defaultValue="16">16px</option>
            {fontSizeOptions}
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