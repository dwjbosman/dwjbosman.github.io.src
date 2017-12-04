module.exports = {
  blogPostDir: "posts", // The name of directory that contains your posts.
  siteTitle: "Dinne's professional blog", // Site title.
  siteTitleAlt: "Blog about software development", // Alternative site title for SEO.
  siteLogo: "/logos/logo-1024.png", // Logo used for SEO and manifest.
  siteUrl: "https://dwjbosman.github.io", // Domain of your website without pathPrefix.
  pathPrefix: "/", // Prefixes all links. For cases when deployed to example.github.io/gatsby-material-starter/.
  fixedFooter: false, // Whether the footer component is fixed, i.e. always visible
  siteDescription: "A Blog about interesting software algorithms.", // Website description used for RSS feeds/meta description tag.
  siteRss: "/rss.xml", // Path to the RSS file.
  siteFBAppID: "1825356251115265", // FB Application ID for using app insights
  siteGATrackingID: "UA-47311644-4", // Tracking code ID for google analytics.
  disqusShortname: "dwjbosman-github-io", // Disqus shortname.
  postDefaultCategoryID: "Tech", // Default category for posts.
  userName: "Dinne Bosman", // Username to display in the author segment.
  userTwitter: "", // Optionally renders "Follow Me" in the UserInfo segment.
  userLocation: "Utrecht Area, The Netherlands", // User location to display in the author segment.
  userAvatar: "/logos/dinne.jpg", // User avatar to display in the author segment.
  userDescription:
    "Some description. TODO", // User description to display in the author segment.
  // Links to social profiles/projects you want to display in the author segment/navigation bar.
  userLinks: [
    {
      label: "GitHub",
      url: "https://github.com/dwjbosman",
      iconClassName: "fa fa-github"
    }
	,
    {
      label: "Linkedin",
      url: "https://www.linkedin.com/in/dwjbosman",
      iconClassName: "fa fa-linkedin"
    }   
	,
    {
      label: "Twitter",
      url: "https://www.twitter.com/dwjbosman",
      iconClassName: "fa fa-twitter"
    }
	,
    {
      label: "Email",
      url: "mailto:dinne.bosman@the-future-group.com",
      iconClassName: "fa fa-envelope"
    } 
  ],
  copyright: "Copyright © 2017. Dinne Bosman" // Copyright string for the footer of the website and RSS feed.
};
