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
      icon : 'fa-circle',
      name : 'Circle Shape',
      action : function(){
        this.props.mainMethods.canvas.addCircle();
      },
      disabled : false
    },
    {
      icon : 'fa-file-image',
      name : 'Add Image',
      action : function(){
        this.props.mainMethods.modals.imageSelector.launch();
      }
    },
    {
      icon : 'fa-font',
      name : 'Add Text',
      action : function(){
        this.props.mainMethods.canvas.addText('Edit Me!');
      }
    },
    {
      icon : 'fa-layer-group',
      name : 'Add Layer',
      action : function(){

      },
      disabled : true
    },
    {
      icon : 'fa-paint-roller',
      name : 'Add Background',
      action : function(){
        
      },
      disabled : true
    }
  ]
  render(){
    let buttonsHTML = this.buttons.map((val,index)=>{
      return (
          <button className={"toolbarButton z-depth-2" + (val.disabled===true ? " disabled" : "")} key={'tlbb_' + index} onClick={val.action.bind(this)} data-tooltip={(val.disabled===true ? "Sorry, this has not yet been implemented." : null)}>
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