import React, {Component} from 'react';
import {ChromePicker} from 'react-color';

class PaintSelector extends Component {
  constructor(props){
    super(props);
  }

  handleChangeComplete = (color, event) => {
    this.props.mainMethods.colors.handleColorSelect(color,event);
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