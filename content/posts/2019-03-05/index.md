---
title: "Basic Asymetric Multi Processor (AMP) setup on the Zedboard"
cover: "/logos/linux.png"
category: "FPGA"
tags: 
    - Zynq
      Microblaze
      Yocto
      Linux
      Xilinx
date: 2019-03-05 09:00
---

# Introduction

This article continues building upon the Linux platform which was set up in the previous article. Targetting the development of a music synthesizer several building blocks have been explored: 

  * Hardware plaform: Zynq 7020, Zedboard
  * Linux running on PS (dual core): systems management (MIDI, firmware management, embedded website)
  * I2S transmitter (implemented in logic), audio out
  * Possible use of a Microblaze softcore processor as co-processor.

The synthesis engine will be implemented in logic (PL). The synthesis engine uses additive synthesis. It will support 32 voices, each voice will consist of 1024 oscillators. Each oscillator consists of a sine wave with frequency, amplitude and pan parameters. Furthermore there will be a noise generator for each oscillator that can add band limited noise. In total this means that 32768 oscillators have to be realzed. These oscillators need to output 24 bit stereo samples at 44 kHz. 

Input to the audio engine are the slowly varying frequency, amplitude, pan and noise parameters. Some sort of "envelope generator" is needed for this purpose. The idea is to have socalled oscillator tracks in main memory. Each track consists of frequency, amplitude, pan and noise parameters stored at 200 Hz time resolution. This data needs to be streamed to the audio engine which will then use this data to update the oscillators and provide the audio samples.

It would be great if the envelope generator could be developed using a traditional programming language instead of resorting to a pure logic approach. A standard programming language would offer more ease while development and possibly greater flexibility. However an important drawback could be the performance of the software as the software needs to provide data at 200 Hz for 32768 oscillators. In this article and the following article I will focus on the feasibility to use a Microblaze softcore as a envelope generator. This article focuses on the basic architecure. In the next article I will be investigating the performance.

This article describes the following work:
  * Addition of a Microblaze softcore to the Zynq 7020 FPGA.
  * Program the Microblaze from Linux running on the PS.
  * Running bare metal firmware on the Microblaze.
  * Providing shared memory between Linux and the Microblaze (Asymmetric Multi Processing).
  * Using Yocto to configure the Linux platform.

# Block Design

We start with the block design. First a Microblaze softcore is added.  

## Microblaze

The Microblaze is configured with a cache.
Todo check CACHE

The cache is connected via the HP0 port of the Zynq. This allows the Microblaze to access the DDR memory of the Zed board. This memory is shared with the Linux platform. 

The Microblaze reset signal is connected to an AXI GPIO peripheral. This allows the Microblaze to be reset from Linux. To test using the Xilinx SDK examples a uart is required. The Microblaze is configured with an AXI uartlite. This uart is connected to uart0 of the PS. This allows the serial output to be read from Linux without using any external cabling.

The main DDR memory will only be used to retrieve data. The firmware itself will run in BRAM. The softcore gets 32 kB low latency local BRAM. We want to use Linux to setup the firmware of the Microblaze. Thus Linux needs to have access to the BRAM. Unfortunately BRAM is only dual port, and both ports are in use by the Microblaze. A mux has been implemented which allows Linux to take control of the BRAM while the Microblaze is in reset. This will make it possible to program the Microblaze from within Linux.

## PS

* The following PS peripherals are required in this project:
** Uart0 (command line terminal)
** Uart1 (auxilary serial communication between Microblaze and Linux)
** DDR Ram
** SD card (TODO, boot and root partition Linux)

TODO check

One of the General Purpose AXI ports is used to connect an AXI interconnect. The interconnect is attached to GPIO and a BRAM controller. The GPIO is used to control LEDs,  the Microblaze reset signal and the BRAM mux. The reset and mux signal have also been connected to LEDs.

## BRAM mux

The BRAM mux allows one to connect two BRAM controllers to a single BRAM port. A control signal selects which BRAM controller is connected to the BRAM. In vivado the IP packager was used to wrap a small VHDL module. In the IP packager the individual in and outputs of the VHDL entity can be grouped into bus interfaces. BRAM uses "BRAM_CTRL" interfaces. Some remarks:

  * In a first try I tried to package a block design with an embedded RTL module as an IP. Although this seems to be supported since Vivado 2018.1 the referenced RTL module could not be found while using the IP.
  * Although the types of the input and output interfaces were set to BRAM_CTRL during packaging,  the type was showed as 'OTHER' while using the IP. This was solved by manually updating the block design in which the IP is used.

## Address map

# SDK

The block design was synthesized and exported to the SDK. In the SDK several projects were created. 

## Cross compilation

Vivado is delivered including the arm toolchain required for compiling programs for the A9 processors. Yocto can also generate the cross compilation toolchain. In order to test Yocto, the toolchain generated by Yocto is used. See the toolchain paragraph in the Yocto section for more info. 

TODO toolchain config
TODO elf to bin, remove libmetal

## ps\_bsp Board support package for Linux

## ps\_device\_tree Device tree

This project generates the device trees required for Yocto Linux.

## ps\_mem\_util Linux shared memory utility




## mb\_bsp Board support package for the Microblaze processor

## mb\_hello Hello World application for Microblaze

## mb\_test Shared memory test application for Microblaze


# Yocto

The Linux kernel is built using Yocto. The yocto tools are available using Docker. First build the docker image:

<pre>
cd yocto
make image
</pre>

Then start a container in which to perform work:
</pre>./run.sh</pre>

Inside the container, first perform su <username> to get to the right user. Then cd to your home dir (which is mounted inside the container) and then to the yocto dir. Next run the build.sh script to build the image. This will take a while!
</pre>./build.sh</pre>

If you want to make changes to the configuration refer the sections below. Reconfiguring the kernel must be done from inside the container environment. After saving the changes rebuild the image:
</pre>
cd yocto_zedboard/yocto_build_env/poky
source oe-init-build-env
bitbake bitbake core-image-minimal
</pre>

Note: Bitbake currently uses Python2. I use conda to switch to Python2 before using the bitbake utility.

## Device tree

The device tree generated by Vivado is a good starting point for further customization. Some changes were made:
*  The memory range 0x1000_0000 to 0x1e00_0000 is setup as "reserved memory". The Linux kernel will not use this memory. The memory will be available for use as shared memory between the Microblaze processor and Linux user space applications. 
*  Vivado automatically added an AXI uartlite device. However this device will be only used by the Microblaze. The other end is PS Uart0. Thus the AXI UartLite is removed and the Uart indexes have been shifted accordingly.

The AXI GPIO and AXI Bram controller have been integrated unchanged from the Vivado device tree files. The modified device tree files can be found in the Yocto 'meta-dts' layer (yocto/ meta-dts/ recipes-kernel/ linux/ linux-xlnx/ zedboard-zynq7)

## Kernel

During development it's nice to have more debugging facilities on the Linux platform. Therefore the debugfs tools have been enabled in the kernel. In yocto it is possible to override the kernel configuration file completely. It is also possible to specify only changed configuration options in a socalled 'fragment'. The changed options are merged by Yocto into the kernel configuration. The pre configured fragment can be found in yocto/ meta-dts/ recipes-kernel/ linux/ linux-xlnx/ zedboard-zynq7/ fragment.cfg. 

Creating a fragment can be done as follows (this has already been done in the repo):

* First build a minimal image 
<pre>bitbake core-image-minimal</pre>
* TODO run menuconfig 
<pre>TODO bitbake core-image-minimal</pre>
* Then create a diff fragment
<pre>TODO bitbake core-image-minimal</pre>
* Copy the fragment to the meta-dts layer and add it to the kernel recipes-kernel/linux/linux-xlnx_%.bbappend file.  
* Rebuild the image
<pre>bitbake core-image-minimal</pre>


## Toolchain

Yocto can generate an installer with the cross compilers required for build software for the Zynq Linux platform. The SDK can be generated by using bitbake

<pre>bitbake core-image-minimal -c populate_sdk</pre>

Initially this command gave a number of errors. There were missing dependencies, these have been added to the yocto/ meta-dts/ recipes-kernel/ linux/ kernel-devsrc.bbappend file.

TODO install SDK
TODO add to Eclipse




# Testing

After building the Linux kernel copy the files to an SD card. Formatting the SD card is described in the previous TODO article. 

Copy the files to the boot partition:

* poky/build/tmp/deploy/boot.bin -> boot/boot.bin        TODO check
* poky/build/tmp/deploy/uImage.bin -> boot/uImage.bin        TODO check
* uBoot, etc.

* Convert the fpga bit file (in the design_wrapper TODO) to a fpga.bin file using the yocto/fpga-bit-to-bin.py script. Copy it to the boot parition -> fpga.bin

* Copy the compiled executable ps_mem_util.elf (from the SDK) to the root partition /root/ubuntu/
* Copy the mb_test.bin and mb_hello.bin firmware images (from the SDK) to the root partition /root/ubuntu/
* Copy the microblaze scripts (yocto_zedboard/yocto/linux_utils/) to the root parition /root/ubuntu

Unmount the SD card and plug it in the Zedboard. Connect a USB cable to TODO connector and power on the Zed board. Wait a +/- 20 second and then use a terminal program to open a serial terminal (eg. /dev/ttyACM0). Press the TODO button to reboot linux. You should see the boot messages on the terminal.

Login and become root. 

TODO add lib link due to toolchain diff.


Perform the following commands
./program_mb mb_hello.bin
./unlock_bram.sh
./release_mb.sh
You should see the LEDs beeing turned on and off by the Microblaze.

Test the shared memory:

./program_mb mb_test.bin
./unlock_bram.sh
./release_mb.sh
Wait a second and then use the ps_mem_utility to read 512 bytes from the shared memory:
ps_mem_util r 0x10000000 512 test.bin
This file should contain increasing numbers which were written in the memory by the microblaze.







# Conclusion

The Yocto files, vivado project and VHDL code can be found in the [yocto\_zedboard](https://github.com/dwjbosman/yocto_zedboard.git) repository in the AMP branch.


![Yocto GPIO ZED board](resources/linux_board.gif "Yocto on ZED board")


