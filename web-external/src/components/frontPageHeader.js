
import { default as React } from "react";

export default class FrontPageHeader extends React.Component {
    render() {
        /*
         * TODO(opadron): Maybe we can import the image directly?
         *                It *is* the webpack way... :)
         */
        var logoUrl = [this.props.staticRoot, "img/Girder_Mark.png"].join("/");
        var logoWidth = 82;

        return (
            <div className="g-frontpage-header">
              <img className="g-frontpage-logo"
                   src={ logoUrl }
                   width={ logoWidth }/>
                <div className="g-frontpage-title-container">
                  <div className="g-frontpage-title">
                    Girder
                  </div>
                  <div className="g-frontpage-subtitle">
                      Data management platform
                  </div>
                </div>
            </div>
        );
    }
}

