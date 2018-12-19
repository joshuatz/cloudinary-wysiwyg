import React, {Component} from 'react';
import {SketchPicker} from 'react-color';
import {ChromePicker} from 'react-color';

class PaintSelector extends Component {
  constructor(props){
    super(props);
  }

  state = {
    background: '#fff',
  };

  componentDidMount(){
    //
  }

  handleChangeComplete = (color, event) => {
    this.setState({ background: color.hex });
    this.props.mainMethods.colors.handleColorSelect(color,event);
  }

  render(){
    return (
      <div className="colorPickerWrapper">
        <ChromePicker onChangeComplete={this.handleChangeComplete} color={this.state.background}/>
      </div>
    )
  }
}
export default PaintSelector;