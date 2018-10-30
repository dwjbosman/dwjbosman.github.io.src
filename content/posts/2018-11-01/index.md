---
title: "Basic Microblaze with bootloader setup"
cover: "/logos/sine-article.jpg"
category: "FPGA"
tags: 
    - VHDL
      FPGA
      DSP
date: 2018-11-01 09:00
---

In my last [article](https://dwjbosman.github.io/...) a VHDL Sine oscillator was presented. Eventually the goal is to develop an additive synthesis engine. In this article a small step is taken by being able to run C/C++ code on a Microblaze processor.

There are quite a number of tutorials about setting up a Microblaze processor. Unfortunately most of these tutorials are either out of date or they are lacking some essential information. Especially most tutorials don't describe the 'why' question. This article shows how to get a Microblaze running on a Nexys4 DDR development kit including the following:

  * Use of the XX MB DDR2 ram chip
  * UART support for debugging
  * Ethernet support for lwIP stack
  * SPI flash support for bootloading from flash.
  * Use of AXI GPIO for simple LED control
 
I started following [this]() tutorial from Digilent. It misses some information in the block design to complete Ethernet and DDR2 configuration. I used this [MIG7]() tutorial to implement the DDR2 ram. Lastly I followed this tutorial on [Bootloading]() to implement the bootloader.


# Create the project

First set up the project. Add this [Vivado TCL script] to your start up scripts. The script will create a project TCL file everytime 'git commit' is invoked. The tcl project file will contain relative paths which allows your project to be stored in a version control system. After Vivado starts click the 'create project' button.

#Initializing version control (git)

After completing the wizard, open the tcl tab and type the following commands:

  1. goto your project dir: cd /home/dinne/Xilinx/projects/basic_microblaze/
  2. create a src and blockdesign dir. The src directory will contain all the files that are under version control: exec mkdir -p src/blockdesign
  3. create a directory of the vhdl files: exec mkdir -p src/design
  4. initialize the repository: git init
  5. apply first commit: git commit -am "first commit" 

#Create the block design

First step is to specify the architecture of the synthesized FPGA hardware blocks. Pay careful attention to configuration of the clock wizard, the MIG7 memory generator and polarity of reset signals. 

##Microblaze

Click on the '+' button and search for "Microblaze". After adding the Microblaze processor click on it to customize it:
  1. wizard page 1: enable the Debug Module (MDM) and enable caches.
  2. wizard page 2: next
  3. wizard page 3: select 16 kB intruction cache, and a 16 kB data cache.
  4. wizard page 4: next
  5. wizard page 5: Enable AXI data interface

A green box will appear containg a link to "Run block automation". Clicking this Vivado will create additional IP blocks to support the Microblaze. When clicking "Run block automation" a settings window will open:
  1. Choose local memory 16 KB
  2. Choose cache config: 16 KB
  3. Choose Debug module Debug Only
  4. Select enable Peripheral AXI Port
  5. Select enable interrupt controller
  6. Choose to create a new clocking wizard (100 MHz)

The block design will now contain a Microblaze, Local memory, Processor System Reset, Interrupt controller (and concat block), Clocking wizard, AXI interconnect.

##Clocking wizard

Double click the "clocking wizard" to customize it:
  1. Add two extra output clocks besides the existing 100 MHz clock: 200 MHz and 50 MHz. 
  2. Also on the XXX page choose the reset type: active low
  3. Finish the wizard and right click the XXX port. Select ake inputs external. A new external input will be created. Rename it to "CLK100MHZ"
  3. Right click the XXX port. Select ake inputs external. A new external input will be created. Rename it to "reset_n"

These clocks are generated using the FPGA's built in MMCM XXX which can be thought of as a kind of PLL. The 200 MHz will be used for the DDR2 controller, the 50 MHz for the Quad SPI Flash and external Ethernet LANXXX chip. The reset button in on the Nexys4 DDR will output a '0' when pressed. To use this button for resetting the various IP blocks every reset input port has to be configured as "active low". Renaming the ports is required to match the physical pin constraints later on in the XDC file.


##AXI SmartConnect

In a first attempt I added a DDR2 controller. The 'run block automation' reappeared. After running it an "Axi SmartConnect" appeared. I wondered why this was a different component comparing it to the "Axi interconnect" created by the Microblaze Block Automation. The documentation notes that both "Axi Smartconnect"  and "Axi interconnect" have similar functionality and that "Axi Smartconnect" supersedes "Axi interconnect". In all the exampples I saw using Microblaze and DDR RAM there were two "Axi interconnect/smartconnect" blocks. In this design I will use one to keep things simple. Have to check later how this impacts performance.

  1. Delete the existing "Axi interconnect"
  2. Add an "Axi Smartconnect"

Double click the "Axi Smartconnect" it to customize:
  1. Select the number of slaves: 3
  2. Select the number of masters: 7
  3. Select the number of clocks: 2
  4. Enable reset input: has resetn input: 1

Connect the block:
  1. Connect microblaze M_AXI_DP, M_AXI_DC, M_AXI_IC to the input AXI slave interfaces: S00_AXI, S01_AXI, S02_AXI
  2. Connect the "clockin wizard" 100Mhz clock (clk_out1) to the aclk pin.
  3. Connect the "processor system reset" output port "interconnect_aresetn" to the resetn input

The AXI Smartconnect is configures such that all the memory interfacing (including IO mapped peripherals) runs through it. Two clocks are required because the DDR2 controller is part of a different clock domain.

##AXI GPIO

The AXI GPIO IP block is used to control general purpose input/output pins. In our case only outputs are used to control an RGB LED on the Nexys4 DDR board. Add the AXI GPIO block, double click to configure:

  1. Select "All outputs"
  2. Select "GPIO width" as 3 pins.
  3. Select default value: "0x10".

Connect the block:
  1. Connect the M00_AXI of the "Axi Smartconnect" to the S_AXI input.
  2. Connect the "clockin wizard" 100Mhz clock (clk_out1) to the s_axi_aclk pin.
  3. Connect the "processor system reset" output port "peripheral_aresetn" to the s_axi_aresetn input
  4. Finish the wizard and right click the GPIO port. Select make external. A new external output will be created. Rename it to "GPIO"

The GPIO width is chosen to 3 to be able to control the Red, Green and Blue channel of the RGB LED. THe output is renamed to "GPIO" so that physical pin constraints can be configured (later on) in the XDC file.

##AXI UARTlite

The AXI UARTlite IP block allows the processor to communicate via serial port to the outside world. The C/C++ print routines will make use of this serial port. Add the IP and customize it by double clicking:
  1. Select 38400 as a Baudrate

Connect the block:
  1. Connect the M01_AXI of the "Axi Smartconnect" to the S_AXI input.
  2. Connect the "clockin wizard" 100Mhz clock (clk_out1) to the s_axi_aclk pin.
  3. Connect the "processor system reset" output port "peripheral_aresetn" to the s_axi_aresetn input
  4. Finish the wizard and right click the UART port. Select make external. A new external output will be created. Rename it to "UART"
  5. The interrupt pin is not connected.

The serial port is accessible via USB. It uses the same USB port which is also used for JTAG and FPGA/Microblaze programming.

##AXI Interrupt controller

The interrupt controller signals the Microblaze once an external event needs to be handled by the processor. Interrupts are generated by the Timer and Ethernet component.

##AXI Timer

The Timer component implements a programmable timer. 

##AXI Ethernetlite

The Ethernetlite component presents a memory mapped ethernet device to the Microblaze. In the C user application running on the Microblaze the LwIP stack will be used to connect to the Internet.  The Ethernetlite component presents a socalled MII interface. The Nexys4 DDR contains a LANXXX chip which already implements part of this interface. That chip presents a socalled reduced MII interface. Xilinx has a MII_to_RMII IP block available to convert.


In most tutorials the 50MHz clock is used to drive the LANxxx chip. According to some recomendations the  MII_to_RMII block introduces a clock delay. Ideally the clocking wizard should be used to create two 50 MHz clocks, one with a phase delay. The undelayed clock is connected to the MII_to_RMII block. The delayed clock is connected to the LANxxx chip. Furthermore there is a discussion if the LANxxx can be clocked using a generated 50MHz clock as there the clock jitter would be outside the LANxxx requirements.  

##AXI Quad SPI

The Quad SPI component is connected to the external Quad SPI Flash. It allowes the FPGA to retrieve its bit stream from the Flash chip. Furthermore the Microblaze will be able to boot the user application from flash.


##AXI DDR2 controller

The Memory Interface Generator (MIG7) is used to create a DDR2 controller for the Nexys4 DDR board. The Microblaze will use a bootloader to copy the user application from Flash to DDR2 Ram. The DDR2 controller requires very precise timing parameters. These are specified in the [DDR2 RAM tutorial](). Add a MIG7 component and double click to configure:

  1.
  2.

Now add a second Processor System Reset. This is required because the Processor System Reset will run in the DDR2 ui_clock domain. Connect the blocks.
  1.
  2.


Note that 
In some (not all) tutorials it is specified that one should not use a clocking wizard generated clock (would have too much jitter). In spite of this advice I have use the 200 MHz output of the clock wizard.




##Address map

The connected AXI devices are either memory type devices or memory mapped IO devices. We have to specify the Microblaze memory map so that the AXI devices can be accessed by the bootloader and user application.


#Commit the block design to version control

Store the current version of the  block design inside version control:
  1. git add src/blockdesign/mb_design/\*
  2. git commit -am "Half way through block design"

#XDC pin constraints

The XDC file specifies constraints on the physical FPGA pins. Digilent provides a XDC file for the Nexys4 DDR. This file is adapted to map the input and output ports of the block design to physical pins. 

#Generate bit file

#SDK, software development

## Create bootloader

## Create user application






 
## Microblaze Debug Module (MDM)

## Processor System Reset

There are two CPU reset blocks. One is controls the Microblaze and other 100 MHz clock domain components. The other controls the reset of the DDR2 Ram controller and is part of the user_clock (output of the DDR2 controller) domain.

## Connecting the IP blocks

## Constraints (XDC) file

The Digilent xdc file for the Nexys4 DDR does not contain the pinout of the DDR2 RAM. 

## Bootloader

The FPGA bit file contains the configuration of the FPGA including initial contents of the Microblaze local BRAM. I want to be able to update the software of the Microblaze without changing the FPGA bit file. The FPGA bit stream is loaded from the external SPI Flash. Turn on bit file compression to speed up the startup time of the FPGA and to save space on the SPI Flash. After compression a large part of the SPI Flash is left unused. In this part of the flash the application software for the Microblaze can be stored. The application is stored in SREC format in the Flash. A SPI Flash SREC bootloader is run on the Microblaze and integrated in the FPGA bit file which loads after FPGA configuration. The bootloader copies the user application from Flash to the DDR2 ram and then starts it.

  1. Launch the SDK
  2. Create a project with template "SPI SREC Bootloader"
    2.1. Set the XXX address
    2.2. Set the ....
  3. 



The sine [phase step](https://docs.google.com/spreadsheets/d/1zl4uNqo22D30khxiX1On5RydeTHjTQGgfvHI6CXL8H8/edit?usp=sharing)  calculations in this section can also be found on Google sheets.


The VHDL code can be found in the [i2s\_sender](https://github.com/dwjbosman/I2S_sender) repository.


