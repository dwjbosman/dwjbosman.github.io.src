Title: First Post
Date: 2017-11-20 20:00
Tags: pelican, github
Slug: fist-post
Authors: Dinne Bosman
Lang:en
Summary: My first post

## First blog post

I just installed Pelican for my professional blog. My intention is to blog once every 1-2 weeks. Let's see....

Why did I chose Pelican?

* I wanted something simple 
* A wanted to host it at Github
* The source of the blog is kept in a Github repository
* Some posts will consist of a Jupyter notebook
* A docker image should exist to build the static site

These were the resources I used to setup Pelican:

* http://pmbaumgartner.github.io/some-tips-for-using-jupyter-notebooks-with-pelican.html
* http://github.com/dwjbosman/docker-pelican.git

Before starting with Pelican, I also checked Jekkyl. Jekkyl is another static site generation tool. It's main advantage is that Github Pages natively supports this tool. So there's no need to push the output of the static site build tool to a repo. You can just update the blog source repo and Github will update your site. Unfortunately Github will only allow a very limited set of Jekkyl plugins.


