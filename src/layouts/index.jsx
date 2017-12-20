import React from "react";
import Helmet from "react-helmet";
import "font-awesome/scss/font-awesome.scss";
import Navigation from "../components/Navigation/Navigation";
import config from "../../data/SiteConfig";
import "./index.scss";
import "./global.scss";

export default class MainLayout extends React.Component {
  getLocalTitle() {
    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    const pathPrefix = config.pathPrefix ? config.pathPrefix : "/";
    const currentPath = this.props.location.pathname
      .replace(pathPrefix, "")
      .replace("/", "");
    let title = "";
    if (currentPath === "") {
      title = "Home";
    } else if (currentPath === "tags") {
      title = "Tags";
    } else if (currentPath === "categories") {
      title = "Categories";
    } else if (currentPath === "about") {
      title = "About";
    } else if (currentPath.includes("posts")) {
      title = "Article";
    } else if (currentPath.includes("tags")) {
      const tag = currentPath
        .replace("tags", "")
        .replace("/", "")
        .replace("-", " ");
      title = `Tagged in ${capitalize(tag)}`;
    } else if (currentPath.includes("categories")) {
      const category = currentPath
        .replace("categories", "")
        .replace("/", "")
        .replace("-", " ");
      title = `${capitalize(category)}`;
    }
    return title;
  }
  componentDidMount() {
    //console.log("didmount3");
    //console.log(window.jQuery);
    if (window.jQuery) {
      window.scripts = window.jQuery.find('[data-my-script]'); 
      //console.log(window.scripts);
  	
	    window.scripts.forEach(function forEachScript(element) {
	      //const script = $(this).text();
	      const script = window.jQuery(element).text();
	      //console.log("for each:"+script);	      
	      window.eval(script);
	    });
    }
  }

  render() {
    console.log("render");
    const { children } = this.props;
    return (
      <Navigation config={config} LocalTitle={this.getLocalTitle()}>
        <div ref={contentElement => (this.contentElement = contentElement)}>
          <Helmet>
            <meta name="description" content={config.siteDescription} />
	    // for plotly inside notebooks
            //	<script src="https://cdn.plot.ly/plotly-latest.min.js" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.5/require.min.js"/>
	    <script src="https://code.jquery.com/jquery-3.2.1.min.js"/>
	  </Helmet>
          {children()}
        </div>
      </Navigation>
    );
  }
}
