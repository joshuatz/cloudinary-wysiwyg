import React, {Component} from 'react';

class ToolPanel extends Component {
  constructor(props){
    super(props);
  }

  buttons = [
    {
      icon : 'fa-vector-square',
      name : 'Squre Shape',
      action : ''
    },
    {
      icon : 'fa-file-image',
      name : 'Add Image',
      action : ''
    },
    {
      icon : '',
      name : 'Add Layer',
      action : ''
    },
    {
      icon : 'fa-paint-roller',
      name : 'Add Background',
      action : ''
    }
  ]
  render(){
    let buttonsHTML = this.buttons.map((val,index)=>{
      return (
        <div className="col s3">
          <button className="toolbarButton">
            <i className={"fas " + val.icon}></i>{val.name}
          </button>
        </div>
      )
    });
    return(
      <div className="row">
        {buttonsHTML}
      </div>
    );
  }
}

export default ToolPanel;