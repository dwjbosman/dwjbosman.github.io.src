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

Input to the audio engine are the slowly varying frequency, amplitude, pan and noise parameters. Some sort of "envelope generator" is needed for this purpose. The idea is to have socalled oscillator tracks in main memory. Each track consists of frequency, amplitude, pan and noise parameters stored at 200 Hz time resolution. This data needs to be streamed to the audio engine which will then use this data to updated the oscillators and  provide the audio samples.

It would be great if the envelope generator could be developed using a traditional programming language instead of resorting to a pure logic approach. A standard programming language would offer more ease while development and possibly greater flexibility. However an important drawback could be the performance of the software as the software needs to provide data at 20 Hz for 32768 oscillators. In this article and the following article I will focus on the feasibility to use a Microblaze softcore as a envelope generator. This article focuses on the basic architecure. In the next article I will be investigating the performance.

This article describes the following work:
  * Addition of a Microblaze softcore to the Zynq 7020 FPGA.
  * Control the Microblaze from Linux running on the PS.
  * Running bare metal firmware on the Microblaze.
  * Providing shared memory between Linux and the Microblaze.
  * Using Yocto to configure the Linxu platform.

# Block Design

We start with the block design. First a Microblaze softcore is added.  

## Microblaze

The Microblaze is configured with a cache.
Todo check CACHE

The cache is connected via the HP0 port of the Zynq. This allows the Microblaze to access the DDR memory of the Zed board. This memory is shared with the Linux platform. 

The Microblaze reset signal is connected to an AXI GPIO peripheral. This allows the Microblaze to be reset from Linux. To test using the Xilinx SDK examples a uart is required. The Microblaze is configured with an AXI uartlite. This uart is connected to uart0 of the PS. This allows the serial output to be read from Linux without using any external cabling.

The main DDR memory will only be used to retrieve data. The firmware itself will run in BRAM. The softcore gets 32 kB low latency local BRAM. We want to use Linux to setup the firmware of the Microblaze. Thus Linux needs to have access to the BRAM. Unfortunately BRAM is only dual port, and both ports are in use by the Microblaze. A mux has been implemented which allows Linux to take control of the BRAM while the Microblaze is in reset. This will make it possible to program the Microblaze from within Linux.

## PS

TODO check

One of the General Purpose AXI ports is used to connect an AXI interconnect. The interconnect is attached to GPIO and a BRAM controller. The GPIO is used to control LEDs,  the Microblaze reset signal and the BRAM mux. The reset and mux signal have also been connected to LEDs.

## BRAM mux

The BRAM mux allows one to connect two BRAM controllers to a single BRAM port. A control signal selects which BRAM controller is connected to the BRAM. In vivado the IP packager was used to wrap a small VHDL module. In the IP packager the individual in and outputs of the VHDL entity can be grouped into bus interfaces. BRAM uses "BRAM_CTRL" interfaces. Some remarks:

  * In a first try I tried to package a block design with an embedded RTL module as an IP. Although this seems to be supported since Vivado 2018.1 the referenced RTL module could not be found while using the IP.
  * Although the types of the input and output interfaces were set to BRAM_CTRL during packaging,  the type was showed as 'OTHER' while using the IP. This was solved by manually updating the block design in which the IP is used.

# SDK

The block design was synthesized and exported to the SDK. In the SDK several projects were created:


## ps\_bsp Board support package for Linux

## ps\_device\_tree Device tree

This project generates the device trees required for Yocto Linux.

## ps\_mem\_util Linux shared memory utility

Vivado is delivered including the arm toolchain required for compiling programs for the A9 processors. Yocto can also generate the cross compilation toolchain. In order to test Yocto, the toolchain generated by Yocto is used.


## mb\_bsp Board support package for the Microblaze processor

## mb\_hello Hello World application for Microblaze

## mb\_test Shared memory test application for Microblaze


# Yocto

# Testing

The Yocto files, vivado project and VHDL code can be found in the [yocto\_zedboard](https://github.com/dwjbosman/yocto_zedboard.git) repository in the AMP branch.

![Yocto GPIO ZED board](resources/linux_board.gif "Yocto on ZED board")


