import React, {Component} from 'react';
import Helpers from '../inc/Helpers';
import ClipboardJS from 'clipboard';

class Init extends Component {
  constructor(){
    super();
    this.jQuery = window.jQuery;
    this.$ = this.jQuery;
    this.Helpers = new Helpers();
    this.Helpers.mtz.init();
    this.clipboardJsInit();
  }

  clipboardJsInit(){
    let clipboard = new ClipboardJS('[data-clipboard-target]');
    clipboard.on('success',(evt)=>{
      this.Helpers.toast('Copied to clipboard!','success');
    });
    clipboard.on('error',(evt)=>{
      this.Helpers.toast('Copying to clipboard failed! Please manually use right click or CTRL+C','error');
    });
  }

  render(){
    return null;
  }
}

export default Init;