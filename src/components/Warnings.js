import React, {Component} from 'react';

class Warnings extends Component {
  constructor(props){
    super(props);
    this.recommendedMaxUrlLength = 2000;
  }

  render(){
    return(
      <div className="warningsWrapper">
        {this.props.masterState.accountSettings.fetchInstantly &&
          <div className="warningBar">
            <div className="warningTitle">Instant Preview is ON - Consumes More Credits</div>
            <div className="warningMoreInfo"><i className="material-icons" data-tooltip="When instant preview is on, a new preview will be fetched from Cloudinary every time you make an edit. This can result in using hundreds of transformations within minutes, using up a lot of credits.">info</i></div>
          </div>
        }
        {this.props.masterState.output.img.src.length > this.recommendedMaxUrlLength && 
          <div className="warningBar">
            <div className="warningTitle">Generated URL Length > {this.recommendedMaxUrlLength}</div>
            <div className="warningMoreInfo"><i className="material-icons" data-tooltip="2083 is the max character count for URLs for IE, so 2K is good guideline if going to use URL for client-facing stuff">info</i></div>
          </div>
        }
      </div>
    )
  }
}

export default Warnings;