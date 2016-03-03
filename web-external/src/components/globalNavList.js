
import { default as React } from "react";
import { partial } from "underscore";

export default class GlobalNavList extends React.Component {
    render() {
        var navItems = this.props.navItems.map((item, index) => {
            var className = (
                this.props.activeItem === item.target
              ? "g-global-nav-li g-active"
              : "g-global-nav-li");

            var clickHandler = partial(this.props.navigationCallback,
                                       item.target);

            console.log(item);
            return (
                <li className={ className } key={ index }>
                  <a className="g-nav-link"
                     g-target={ item.target }
                     g-name={ item.name }
                     onClick={ clickHandler } >
                    <i className={ item.icon }></i>
                    <span>{ item.name }</span>
                  </a>
                </li>
            );
        });

        return (
            <div className="g-global-nav-main">
              <ul className="g-global-nav">
                { navItems }
              </ul>
            </div>
        );
    }
}

