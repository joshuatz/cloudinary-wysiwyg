import React, {Component} from 'react';

class ToolPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      canvasObj : {},
      fabric : {}
    }
  }

  componentDidMount(){
    console.log(this.props);
    //debugger;
    this.setState({
      canvasObj : this.props.editorData.canvasObj,
      fabric : window.fabric
    },function(){
      console.log(this.state);
    });
  }

  getCanvas(){
    return this.props.editorData.canvasObj;
  }

  buttons = [
    {
      icon : 'fa-vector-square',
      name : 'Squre Shape',
      action : function(){
        //let canvas = this.getCanvas();
        let canvas = this.state.canvasObj;
        let fabric = this.state.fabric;
        let rect = new fabric.Rect({
          top : 50,
          left : 50,
          width: 100,
          height : 100,
          fill : 'blue'
        });
        canvas.add(rect);
      }
    },
    {
      icon : 'fa-file-image',
      name : 'Add Image',
      action : function(){

      }
    },
    {
      icon : '',
      name : 'Add Layer',
      action : function(){

      }
    },
    {
      icon : 'fa-paint-roller',
      name : 'Add Background',
      action : function(){

      }
    }
  ]
  render(){
    let buttonsHTML = this.buttons.map((val,index)=>{
      return (
          <button className="toolbarButton" onClick={val.action.bind(this)}>
            <i className={"fas " + val.icon}></i>{val.name}
          </button>
      )
    });
    return(
      <div className={this.props.counter}>
        {buttonsHTML}
      </div>
    );
  }
}

export default ToolPanel;