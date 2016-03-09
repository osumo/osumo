import React from 'react';

class Header extends React.Component {
  render () {
    let {
      staticRoot
    } = this.props;

    /*
     * TODO(opadron): Maybe we can import the image directly?
     *                It *is* the webpack way... :)
     */
    var logoUrl = [staticRoot, 'img/Girder_Mark.png'].join('/');
    var logoWidth = 82;

    return (
      <div className='g-frontpage-header'>
        <img className='g-frontpage-logo'
             src={ logoUrl }
             width={ logoWidth }/>
          <div className='g-frontpage-title-container'>
            <div className='g-frontpage-title'>
              Girder
            </div>
            <div className='g-frontpage-subtitle'>
              Data management platform
            </div>
          </div>
      </div>
    );
  }
}

Header.propTypes = {
  staticRoot: React.PropTypes.string.isRequired
};

export default Header;
