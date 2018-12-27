import React, {Component} from 'react';
import Helpers from '../inc/Helpers';

class Init extends Component {
  constructor(){
    super();
    this.jQuery = window.jQuery;
    this.Helpers = new Helpers();
    this.Helpers.mtz.init();
  }

  render(){
    return null;
  }
}

export default Init;