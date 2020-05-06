import React, {Component} from 'react';
import {ChromePicker} from 'react-color';

class PaintSelector extends Component {
  constructor(props){
    super(props);
  }

  handleChangeComplete = (color, event) => {
    this.props.handleColorSelect(color,event);
  }

  shouldComponentUpdate(nextProps,nextState){
    if (JSON.stringify(this.props.color)!==JSON.stringify(nextProps.color)){
      return true;
    }
    return false;
  }

  render(){
    return (
      <div className="colorPickerWrapper">
        <ChromePicker onChangeComplete={this.handleChangeComplete} color={this.props.color.hex}/>
      </div>
    )
  }
}
export default PaintSelector;