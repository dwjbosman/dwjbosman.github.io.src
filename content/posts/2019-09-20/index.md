---
title: "Docker image with Theia IDE supporting embedded Rust development"
cover: "/logos/theia_rust_docker.png"
category: "Docker"
tags: 
    - Theia
      Rust
      Docker
date: 2019-20-09 09:00
---


I love trying new software... With little spare time it's always frustrating when installation takes too long. You start out by installing package A which has a dependency, so you first install package B, but that package has another dependency, etc. In the end you spend hours on getting a certain Font working :) Also installing many "beta" packages can make your system unstable. 

<center>
<img src="resources/bosch_follower.jpg"/>
</center>
<a href="https://wellcomecollection.org/works/c3c7b5pa#licenseInformation" rel="nofollow">Published</a> by the <a href="https://wellcomelibrary.org/" rel="nofollow">Wellcome Library</a> under <a href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow">CC-BY 4.0</a>
<br>
<br>

Dependency and version management becomes even more a problem in a professional setting. For example I attended an AI workshop in which a specific version of Tensor Flow and Python were required. At least an hour was wasted getting the software running on everyone's computer. Welcome to "configuration management"!

I have been using Docker to solve some of the problems. Docker can be compared to a virtual machine but is more lightweight. All required software versions and special tweaks are installed inside the Docker image. You can instantiate the image as an isolated container. Removing a container or restoring to a clean state is easy. Docker has been around for years and many open source projects benefit by providing a ready to use Docker Image. So users wanting to evaluate can get started within minutes.


<center>
<a href="https://www.rust-lang.org/policies/media-guide"><img src="resources/rust-logo-blk.svg"/></a>
</center>
<br>
<br>
As a practical use case I wanted to play with the programming language Rust, and especially Rust for embedded systems. Rust is interesting because it can produce high performance efficient software, it has constructs for 'safe' memory management and could be a competitor to C. Getting Rust running is not that hard. Getting Rust running with bare metal ARM support for embedded development is a little bit more work. What about an IDE? 

Certainly when starting out with a new programming language you want to have modern editor support. I expect from an editor to support:

 * syntax high lighting
 * code completion
 * definition lookup
 * debugging using breakpoints. 

In most cases I have been using Vim with some plugins. I have always had a love-hate relationship with Vim. In general I spend too much time configuring it and looking up keyboard commands. Its killer feature for me is that I'm able to work through a remote terminal without installing any tooling locally. Now and then I have been looking for editors that could replace it. Essential for a replacement is that it would have a great editor as a front end running locally but would also have a back end supporting specific tools/programming languages running remotely. 

Some editors have support for remote editing (for example via sshfs) but they still require all dependent libraries to be installed locally in order to do semantic checking or code completion. A few exciting open source applications have started to address this. Especially Eclipse Che and Theia caught my attention. Theia is a VS Code clone that runs in the browser. Therefore its back end naturally runs remotely. It uses the [Remote Language Server (LSP)](https://langserver.org/) API designed by Microsoft. The editor front end can support multiple programming languages as long as an LSP implementation is available. Even more Theia can also run VS Code plugins. 

<br>
<center>
<a href="https://www.theia-ide.org/docs/">
<img src="resources/theia-logo.svg" width="300px"/></a>
</center>
<br>
<br>

By installing Theia and its back end in a Docker image the ideal situation is realized. By providing a Docker Image one can easily run the whole back end in an isolated container. This container could run in the cloud or locally. One of the more challenging tasks while designing the Docker image was to create a few scripts to instantiate the Docker image in such a way that you can actually access your files outside the isolated container. I'm currently busy finalizing the embedded docker Theia image. You can find it [here](https://github.com/theia-ide/theia-apps/tree/theia-rust-embedded-docker)

This Docker image is not yet available in the main branch of theia-apps, but you can try it from the theia-rust-embedded-docker branch until I finish it. It already can compile Rust programs for ARM, run them in Qemu and even debug them using GDB. A Rust IDE for non embedded development is already available in master. Have a look at the other apps as well. On my wish list is is still an ADA IDE based on Theia. 

Note: For those using VS Code, recently an interesting [extension](https://code.visualstudio.com/docs/remote/containers) was released which allows VS Code to manage a Docker container running the LSP server! 

