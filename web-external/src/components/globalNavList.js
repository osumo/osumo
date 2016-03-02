
import { default as React } from "react";

export default class GlobalNavList extends React.Component {
    render() {
        var navItems = this.props.navItems.map((item) => (
            <li className="g-global-nav-li">
              <a className="g-nav-link"
                 g-target={item.target}
                 g-name={item.name}
                 href={"#" + item.target}>
                <i className={item.icon}></i>
                <span>{item.name}</span>
              </a>
            </li>
        ));

        return (
            <div className="g-global-nav-main">
              <ul className="g-global-nav">
                { navItems }
              </ul>
            </div>
        );
    }
}

