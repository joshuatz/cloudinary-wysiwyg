import React, {Component} from 'react';
let googleFonts = require('google-fonts-complete/google-fonts.json');
const GOOGLE_FONTS_ARR = Object.keys(googleFonts);

class FontSelector extends Component  {
  constructor(props){
    super(props);
    let initialState = {
      googleFontsObj : googleFonts,
      currSelectedFont : {},
      currSelectedFontSyleObj : {}
    }
    Object.assign(initialState.currSelectedFont,this.getCurrSelectedFont(false));
    this.state = initialState;
    this.$ = window.$;
    this.fontSelectOptions = GOOGLE_FONTS_ARR.map((fontName,index)=>{
      return (
        <option value={fontName} key={fontName+'_'+index}>{fontName}</option>
      )
    });
  }

  /**
   * I'm overriding shouldComponentUpdate because I was finding this was chewing up resources re-rending way too often because of how I linked the master state to it. Easier to just check if the current font has changed, since that is what matters.
   * @param {object} nextProps 
   * @param {object} nextState 
   */
  shouldComponentUpdate(nextProps,nextState){
    if (JSON.stringify(this.props.currSelectedFont)!==JSON.stringify(nextProps.currSelectedFont)){
      return true;
    }
    return false;
  }

  componentDidUpdate(){
    this.updateFontSelectorFromState();
  }

  componentDidMount(){
    this.updateFontSelectorFromState();
  }

  /**
   * This will update all selected text objects on the canvas to match currently selected font settings
   * NOTE: The reverse of this function is updateFontSelectorFromCanvasObj
   */
  updateSelectedTextObjs(){
    // Iterate over all canvas objects
    let matches = 0;
    this.props.mainMethods.canvas.getSelectedObjs(false).forEach((canvasObj,index)=>{
      if(canvasObj.get('type')==='i-text'||canvasObj.get('type')==='text'){
        matches++;
        // Merge settings
        let updatedProps = this.props.mainMethods.canvas.getTextPropsFromFontPanel();
        for (var prop in updatedProps){
          if (prop in canvasObj){
            canvasObj.set(prop,updatedProps[prop]);
          }
        }
      }
    },this);
    // Re-render canvas if updates
    if (matches > 0){
      this.props.mainMethods.canvas.renderAll();
    }
  }

  /**
   * Triggers when the font family is changed.
   * @param {SyntheticEvent} evt - React's SyntheticEvent passed by listener
   */
  handleFontFamilyChange(evt){
    let selectedFontName = evt.target.options[evt.target.selectedIndex].value;
    let googleFontObj = this.state.googleFontsObj[selectedFontName];
    let fontFamilyString = "'" + selectedFontName + "', " + googleFontObj.category;
    this.props.mainMethods.app.mergeEditorData('currSelectedFont.fontFamilyFull',fontFamilyString);
    this.props.mainMethods.app.mergeEditorData('currSelectedFont.fontFamilySlim',selectedFontName);
    this.updateSelectedTextObjs();
  }

  /**
   * This will update the font selector <select></select> dropdown to show the matching font from state
   */
  updateFontSelectorFromState(){
    let $ = this.$;
    let fontSelect = $('.fontFamilyPickerDropdown select');
    fontSelect.find('option[value="' + this.state.currSelectedFont.fontFamilySlim + '"]').prop('selected',true);
    // Materialize needs to be re-inited
    fontSelect.formSelect();
  }

  /**
   * Triggers when any font option (such as bold, underline, etc.) is changed
   * Updates state, as well as triggers any custom callbacks that have been specified by button configs
   * @param {string} optionPropName - name of the option property - used as key to store value in settings
   * @param {object} button - config for the button
   * @param {SyntheticEvent} evt - React's SyntheticEvent passed by listener
   */
  handleFontOptionToggle(optionPropName,button,evt){
    button = (button || {});
    let originalFontProps = this.getCurrSelectedFont();
    let newFontProps = originalFontProps;
    newFontProps[optionPropName] = !originalFontProps[optionPropName];
    this.props.mainMethods.app.mergeEditorData('currSelectedFont',newFontProps,(res)=>{
      console.log(this.props.mainMethods.app.getMasterState());
    });
    if (typeof(button.action)==='function'){
      button.action.bind(this)();
    }
    this.updateSelectedTextObjs();
  }

  /**
   * Triggers when the font size is changed
   */
  handleFontSizeChange(){
    let $ = this.$;
    let fontSize = parseInt($('.fontSizePickerDropdown input.select-dropdown').val().replace('px',''));
    this.props.mainMethods.app.mergeEditorData('currSelectedFont.size',fontSize);
    this.updateSelectedTextObjs();
  }

  getMasterState(){
    return this.props.masterState;
  }

  /**
   * Gets the currently selected font details
   * @param {boolean} updateState - Should the state be updated if the current selected font has changed?
   * @returns {object} details about the currently selected font
   */
  getCurrSelectedFont(updateState){
    updateState = typeof(updateState)==='boolean' ? updateState : false;
    let currSelectedFont = this.props.currSelectedFont;
    // Update state if changed
    if (updateState){
      let state = this.state;
      if (JSON.stringify(state.currSelectedFont) !== JSON.stringify(currSelectedFont)){
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

  /**
   * Returns CSS to style text based on the current selected font settings - returns as object so it can be used as inline CSS with JSX
   * @returns {object} previewTextStyling CSS Object
   */
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
    // Update state if changed
    let newState = this.state;
    newState.currSelectedFontSyleObj = previewTextStyling;
    if (newState !== this.state){
      this.setState(newState);
    }
    return previewTextStyling;
  }

  render(){
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
        <option value={val} key={val}>{val + 'px'}</option>
      )
    })
    return (
      <div>
        <div className="input-field col s8 fontFamilyPickerDropdown">
          <select onChange={this.handleFontFamilyChange.bind(this)}>
            {this.fontSelectOptions}
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