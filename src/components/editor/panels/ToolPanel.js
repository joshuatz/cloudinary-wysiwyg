import React, {Component} from 'react';
import Helpers from '../../../inc/Helpers';

class ToolPanel extends Component {
  constructor(props){
    super(props);
    this.state = {
      fabric : {}
    }
    this.helpers = new Helpers();
  }

  componentDidMount(){
    console.log(this.props);
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
      name : 'Squre',
      action : function(){
        this.props.mainMethods.canvas.addRect();
      }
    },
    {
      icon : 'fa-minus',
      name : 'Line',
      action : function(){
        this.props.mainMethods.canvas.addLine();
      }
    },
    {
      icon : 'fa-circle',
      name : 'Circle',
      action : function(){
        this.props.mainMethods.canvas.addCircle();
      },
      disabled : false
    },
    {
      icon : 'fa-caret-up',
      name : 'Triangle',
      action : function(){
        this.props.mainMethods.canvas.addTriangle();
      }
    },
    {
      icon : 'fa-file-image',
      name : 'Image',
      action : function(){
        this.helpers.mtz.modal('.imageHostingMethodSelector[data-destination="canvas"]').open();
      }
    },
    {
      icon : 'fa-font',
      name : 'Text',
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
      name : 'Set Background',
      action : function(){
        this.helpers.mtz.modal('.baseLayerEditor.modal').open();
      },
      disabled : false
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