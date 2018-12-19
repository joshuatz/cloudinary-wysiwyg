import React, {Component} from 'react';
import {SketchPicker} from 'react-color';

class PaintSelector extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedColor : ''
    }
  }

  componentDidMount(){
    //
  }

  handleChangeComplete = (color, event) => {
    console.log(color);
    console.log(event);
  }

  render(){
    return (
      <div>
        <SketchPicker onChangeComplete={ this.handleChangeComplete }/>
      </div>
    )
  }
}
export default PaintSelector;