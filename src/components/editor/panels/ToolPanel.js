import React, {Component} from 'react';

class ToolPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      fabric : {}
    }
  }

  componentDidMount(){
    console.log(this.props);
    //debugger;
    this.setState({
      editorData : this.props.editorData,
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
        this.props.mainMethods.canvas.addRect();
      }
    },
    {
      icon : 'fa-file-image',
      name : 'Add Image',
      action : function(){
        this.props.mainMethods.modals.imageSelector.launch();
      }
    },
    {
      icon : 'fa-layer-group',
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