import React, {Component} from 'react';

class Warnings extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div className="warningsWrapper">
        {this.props.masterState.accountSettings.fetchInstantly &&
          <div className="warningBar">
            <div className="warningTitle">Instant Preview is ON - Consumes More Credits</div>
            <div className="warningMoreInfo"><i class="material-icons" data-tooltip="When instant preview is on, a new preview will be fetched from Cloudinary every time you make an edit. This can result in using hundreds of transformations within minutes, using up a lot of credits.">info</i></div>
          </div>
        }
      </div>
    )
  }
}

export default Warnings;