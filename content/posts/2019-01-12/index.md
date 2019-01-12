---
title: "Yocto linux on the Xilinx Zynq Zed board"
cover: "/logos/yocto-article.png"
category: "FPGA"
tags: 
    - Zynq
      Yocto
      FPGA
      SDK
date: 2019-01-12 09:00
---

In my previous article I discussed setting up a Microblaze processor for running user applications in a bare metal environment. The advantage of using a bare metal approach is that software runs without any operating system overhead. Disadvantage is that you need to take care of everything, even the most basic stuff, yourself. In the synthesizer the audio engine will run in real time. The engine could run partly on a Microblaze and will be implemented partly in FPGA logic. Also there is the need for a management engine. This engine needs to provide functionality for more complex tasks which don't need to meet hard real time requirements. The management engine will provide: MIDI functionality, TCP/IP network connectivity, an embedded website, firmware upgrades. This sort of functionality is ideally suited to implement on a Linux platform. In this article I will show how to get Linux up and running on a Xilinx Zynq Zed board. There are a number of tutorials around which describe Linux on the Zed board. This tutorial adds the following:

  * Use Yocto Linux
  * Use a device tree (dts/dtb) based upon the functionality implemented in the FPGA.

In this tutorial the programmable logic (PL) will be configured to contain a GPIO block connected via AXI to the ARM chips in the Zynq programmable system (PS). Linux will run on the PS and will be able to access the GPIO block in the PL.

# Design

In order to get Linux running on the Zed Board, I will be using the SD Card. On the SD card there are two partitions: boot and root. For the root filesystem I will be using Ubuntu. The boot partition needs the following files:
  1. boot.bin : FSBL bootloader (first stage)
  2. fpga.bin : FPGA logic fabric bitfile
  3. u-boot.img : u-boot Linux bootloader
  4. uEnv.txt : u-boot boot configuration
  5. system-top.dtb : Linux device tree
  6. uImage : Yocto Linux Kernel

Yocto can provide these files based on input coming from Xilinx Vivado. In Vivado the functions defined in the Zync PL are exported via a device tree. This device tree is then integrated when Yocto builds the Linux image. The Linux kernel can then provide an interface to the custom FPGA logic. In more details the steps are as follows:

 1. Define the block design in Vivado.
 1.1. Export the bit file to the Xilinx SDK
 2. Use the SDK to export a device tree source file (dts)  
 3. Convert the fpga bit file to a bin file (fpga.bin)
 4. Configure yocto to build a Linux kernel and boot files.
 4.1. Use Docker to run Yocto
 4.2. Add the meta-Xilinx layer to add support for the Zynq processor
 4.3. Add a custom layer which provides the custom device tree (dts) files
 5. Configure the root file system, using Ubuntu
 6. Formatting the SD card and store the required boot files

# Xilinx Zynq Block Design

The proof of concept consists of a GPIO block connected to the Zed board LEDs and switches. The GPIO block is connected to the PS via the AXI bus. One of the LEDs is connected to a counter which causes it to blink. This is so that you can see that the FPGA logic was programmed during booting. The Zynq PS needs the following features: DDR memory, UART (Linux terminal), SPI (SD card) and  Ethernet. The block design can be found in the github project.

# Yocto Linux image



 there will be software which I am working towards a sound synthesizer. 


![Create Block Design](resources/010_create_block_design.png "Create Block Design")



The VHDL code can be found in the [Basic\_microblaze](https://github.com/dwjbosman/basic_microblaze_nexys4_ddr) repository.

The next step will be to implement an AXI device that presents a memory mapped interface to the audio synthesis engine. Using the lwIP stack and some C code will then allow us to send commands to the synthesis engine via UDP.

