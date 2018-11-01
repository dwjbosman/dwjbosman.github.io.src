---
title: "Basic Microblaze with bootloader setup"
cover: "/logos/sine-article.jpg"
category: "FPGA"
tags: 
    - VHDL
      FPGA
      SDK
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

##Initializing version control (git)

After completing the wizard, open the tcl tab and type the following commands:

  1. goto your project dir: cd /home/<username>/Xilinx/projects/basic\_microblaze/
  2. create a src and blockdesign dir. The src directory will contain all the files that are under version control: exec mkdir -p src/blockdesign
  3. create a directory of the vhdl files: exec mkdir -p src/design
  4. initialize the repository: git init
  5. apply first commit: git commit -am "first commit" 


## Create constraints file (XDC)

Add the empty XDC in the  project folder: /home/<username>/Xilinx/projects/basic\_microblaze/src/design/design.xdc. In the tcl window run
git add src/design/design.xdc

#Create the block design

First step is to specify the architecture of the synthesized FPGA hardware blocks. Pay careful attention to configuration of the clock wizard, the MIG7 memory generator and polarity of reset signals. 

Add the blockdesign in the  project folder: /home/<username>/Xilinx/projects/basic\_microblaze/src/blockdesign


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

  7. Later another Processor System Reset block will be added. Rename the existing one to "cpu\_sys\_reset".

##Clocking wizard

Double click the "clocking wizard" to customize it:
  1. Add two extra output clocks besides the existing 100 MHz clock: 200 MHz and 50 MHz. 
  2. Also on the XXX page choose the reset type: active low
  3. Finish the wizard and right click the XXX port. Select ake inputs external. A new external input will be created. Rename it to "CLK100MHZ"
  3. Right click the "resetn" port. Select make inputs external. A new external input will be created. Rename it to "reset\_n"
  4. Connect the "reset\_n" port to the  "ext\_reset\_n" port of the Processir Stsrem Reset block.
These clocks are generated using the FPGA's built in MMCM XXX which can be thought of as a kind of PLL. The 200 MHz will be used for the DDR2 controller, the 50 MHz for the Quad SPI Flash and external Ethernet LANXXX chip. The reset button in on the Nexys4 DDR will output a '0' when pressed. To use this button for resetting the various IP blocks every reset input port has to be configured as "active low". Renaming the ports is required to match the physical pin constraints in the XDC file. Add the following rows to the XDC file:

  set\_property -dict {PACKAGE\_PIN E3 IOSTANDARD LVCMOS33} [get\_ports CLK100MHZ]
  create\_clock -period 10.000 -name sys\_clk\_pin -waveform {0.000 5.000} -add [get\_ports CLK100MHZ]
  set\_property -dict {PACKAGE\_PIN C12 IOSTANDARD LVCMOS33} [get\_ports reset\_n]

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
  1. Connect microblaze M\_AXI\_DP, M\_AXI\_DC, M\_AXI\_IC to the input AXI slave interfaces: S00\_AXI, S01\_AXI, S02\_AXI
  2. Connect the "clockin wizard" 100Mhz clock (clk\_out1) to the aclk pin.
  3. Connect the "processor system reset" output port "interconnect\_aresetn" to the resetn input

The AXI Smartconnect is configures such that all the memory interfacing (including IO mapped peripherals) runs through it. Two clocks are required because the DDR2 controller is part of a different clock domain.

##AXI GPIO

The AXI GPIO IP block is used to control general purpose input/output pins. In our case only outputs are used to control an RGB LED on the Nexys4 DDR board. Add the AXI GPIO block, double click to configure:

  1. Select "All outputs"
  2. Select "GPIO width" as 3 pins.
  3. Select default value: "0x10".
  4. Finish the wizard and right click the GPIO port. Select make external. A new external output will be created. Rename it to "GPIO"

Connect the block:
  1. Connect the M00\_AXI of the "Axi Smartconnect" to the S\_AXI input.
  2. Connect the "clockin wizard" 100Mhz clock (clk\_out1) to the s\_axi\_aclk pin.
  3. Connect the "processor system reset" output port "peripheral\_aresetn" to the s\_axi\_aresetn input
  4. Add the following rows to the XDC file:

  set\_property -dict {PACKAGE\_PIN G14 IOSTANDARD LVCMOS33} [get\_ports {GPIO\_tri\_o[0]}]
  set\_property -dict {PACKAGE\_PIN R11 IOSTANDARD LVCMOS33} [get\_ports {GPIO\_tri\_o[1]}]
  set\_property -dict {PACKAGE\_PIN N16 IOSTANDARD LVCMOS33} [get\_ports {GPIO\_tri\_o[2]}]

The GPIO width is chosen to 3 to be able to control the Red, Green and Blue channel of the RGB LED. THe output is renamed to "GPIO" so that physical pin constraints can be configured (later on) in the XDC file.

##AXI UARTlite

The AXI UARTlite IP block allows the processor to communicate via serial port to the outside world. The C/C++ print routines will make use of this serial port. Add the IP and customize it by double clicking:
  1. Select 38400 as a Baudrate
  2. Finish the wizard and right click the UART port. Select make external. A new external output will be created. Rename it to "UART"

Connect the block:
  1. Connect the M01\_AXI of the "Axi Smartconnect" to the S\_AXI input.
  2. Connect the "clockin wizard" 100Mhz clock (clk\_out1) to the s\_axi\_aclk pin.
  3. Connect the "processor system reset" output port "peripheral\_aresetn" to the s\_axi\_aresetn input
  4. The interrupt pin is not connected.
  5. Add the follwing pin constraints to the XDC file:

  set\_property -dict {PACKAGE\_PIN D4 IOSTANDARD LVCMOS33} [get\_ports UART\_txd]
  set\_property -dict {PACKAGE\_PIN C4 IOSTANDARD LVCMOS33} [get\_ports UART\_rxd]

The serial port is accessible via USB. It uses the same USB port which is also used for JTAG and FPGA/Microblaze programming.

##AXI Interrupt controller

The interrupt controller signals the Microblaze once an external event needs to be handled by the processor. Interrupts are generated by the Timer and Ethernet component. 
  1. Add a Concat block if it is not already connected to the interrupt controller.
  2. Connect "dout" of the Concat block to intr of the interrupt controller
  3. Connect "interrupt" output of the Interrupt Controller to the Microblaze "interrupt" input.
  4. Connect the "clockin wizard" 100Mhz clock (clk\_out1) to the "s\_axi\_aclk" pin.
  5. Connect the "processor system reset" output port "peripheral\_aresetn" to the s\_axi\_aresetn input
  6. Connect the "processor\_clk" input to "s\_axi\_aclk".
  7. Connect the "processor system reset" output port "mb\_reset" to the processor\_rst input.
  8. Connect the axi bus "s\_axi" input to the "M02\_axi" output of the AXI SmartConnect.

Note that the intr input is initially displayed as intr[0:0]. This will update automatically to intr[0:1] once the design is validated.

##AXI Timer

The Timer component implements a programmable timer. Add an AXI Time IP block. Configure by double clicking:
  1. The Default settings should be ok.

Connect the block:
  1. Connect the "M03\_AXI" of the Axi Smartconnect to the "S\_AXI" input.
  2. Connect the Clockin Wizard "clk\_out1" (100Mhz clock) to the "s\_axi\_aclk" pin.
  3. Connect the Processor System Reset output port "peripheral\_aresetn" to the "s\_axi\_aresetn" input.
  4. Connect the interrupt XXX pin to "in0" of the Concat block (which is connected to the interrupt controller).

##AXI Ethernetlite

The Ethernetlite component presents a memory mapped ethernet device to the Microblaze. In the C user application running on the Microblaze the LwIP stack will be used to connect to the Internet.  The Ethernetlite component presents a MII interface. The Nexys4 DDR contains a LANXXX chip which already implements part of this interface. That chip presents a socalled reduced MII interface. Xilinx has a MII\_to\_RMII IP block available to convert. Add both the "AXI Ethernetlite" and "Ethernet PHY MII to Reduced MII" to the block design.

Configure the AXI Ethernetlite block:
  1. Enable Internal Loopback

Create two external output ports:
  1. Create an output port "ETH\_RST\_N" of type 'other'.
  2. Create an output port "ETH\_CLK" of type 'clock'.

Connect the blocks:
  1. Connect the "M04\_AXI" of the Axi Smartconnect to the "S\_AXI" input.
  2. Connect the Clockin Wizard "clk\_out1" (100Mhz clock) to the "s\_axi\_aclk" pin.
  3. Connect the Processor System Reset output port "peripheral\_aresetn" to the "s\_axi\_aresetn" input.
  4. Connect the interrupt XXX pin to "in1" of the Concat block (which is connected to the interrupt controller).
  5. Connect the Clockin Wizard "clk\_out3" (50Mhz clock) to the "ref\_clk" pin.
  6. Connect the Clockin Wizard "clk\_out3" (50Mhz clock) to the "ETH\_CLK" external pin.
  7. Connect the Ethernetlite port "MII" to the "MII" port of the MII\_to\_RMII block.
  8. Right click the "MDIO" port, make it external. Rename it to "MDIO"
  9. Right click the "RMII\_PHY\_M" port, make it external. Rename to "RMII\_PHY\_M".
  9. Expand the "MII" port of the Ethernetlite device.
     9.1 Connect the "phy_rst_n" pin of the MII bus to the "rst_n_rmii" of the MII\_to\_RMII block.
     9.2 Connect the "phy_rst_n" pin of the MII bus to the "ETH_RST_N" external pin.
     9.3 Collapse the "MII" port.
  10. Add the following contraints to the XDC file:
`
        set\_property -dict {PACKAGE\_PIN C9 IOSTANDARD LVCMOS33} [get\_ports mdio\_mdc]
        set\_property -dict {PACKAGE\_PIN A9 IOSTANDARD LVCMOS33} [get\_ports mdio\_mdio\_io]
        set\_property -dict {PACKAGE\_PIN B3 IOSTANDARD LVCMOS33} [get\_ports eth\_rst_n]
        set\_property -dict {PACKAGE\_PIN D9 IOSTANDARD LVCMOS33} [get\_ports rmii_phy_m\_crs\_dv]
        set\_property -dict {PACKAGE\_PIN C10 IOSTANDARD LVCMOS33} [get\_ports rmii_phy_m\_rx\_er]
        set\_property -dict {PACKAGE\_PIN C11 IOSTANDARD LVCMOS33} [get\_ports {rmii_phy_m\_rxd[0]}]
        set\_property -dict {PACKAGE\_PIN D10 IOSTANDARD LVCMOS33} [get\_ports {rmii_phy_m\_rxd[1]}]
        set\_property -dict {PACKAGE\_PIN B9 IOSTANDARD LVCMOS33} [get\_ports rmii_phy_m\_tx\_en]
        set\_property -dict {PACKAGE\_PIN A10 IOSTANDARD LVCMOS33} [get\_ports {rmii_phy_m\_txd[0]}]
        set\_property -dict {PACKAGE\_PIN A8 IOSTANDARD LVCMOS33} [get\_ports {rmii_phy_m\_txd[1]}]
        set\_property -dict {PACKAGE\_PIN D5 IOSTANDARD LVCMOS33} [get\_ports eth\_clk]
        #set\_property -dict { PACKAGE\_PIN B8    IOSTANDARD LVCMOS33 } [get\_ports { ETH\_INTN }]; #IO\_L12P\_T1\_MRCC\_16 Sch=eth\_intn

In most tutorials the 50MHz clock is used to drive the LANxxx chip and the MII\_to\_RMII block. According to some recomendations the  MII\_to\_RMII block introduces a clock delay. Ideally the clocking wizard should be used to create two 50 MHz clocks, one with a phase delay. The undelayed clock is connected to the MII\_to\_RMII block. The delayed clock is connected to the LANxxx chip. Furthermore there is a discussion if the LANxxx can be clocked used a synthesized 50MHz clock as there the clock jitter would be outside the LANxxx requirements.  

##AXI Quad SPI

The Quad SPI component is connected to the external Quad SPI Flash (A Spansion XXX). It allowes the FPGA to retrieve its bit stream from the Flash chip. Furthermore the Microblaze will be able to boot the user application from flash. Add a Quad SPI IP block and configure it:

  1. Select mode: quad
  2. Select the Spansion slave device.

Connec the Quad SPI block as follows:
  1. Connect the "M05\_AXI" of the Axi Smartconnect to the "S\_AXI" input.
  2. Connect the Clockin Wizard "clk\_out1" (100Mhz clock) to the "s\_axi\_aclk" pin.
  3. Connect the Processor System Reset output port "peripheral\_aresetn" to the "s\_axi\_aresetn" input.
  5. Connect the Clockin Wizard "clk\_out3" (50Mhz clock) to the "ext\_spi\_clk" pin.
  6. Right click the "SPI\_0" port, make it external and rename to "QSPI\_FLASH".
  7. Add the following pin constraints to the XDC file:

        set\_property -dict {PACKAGE\_PIN K17 IOSTANDARD LVCMOS33} [get\_ports QSPI\_FLASH\_io0\_io]
        set\_property -dict {PACKAGE\_PIN K18 IOSTANDARD LVCMOS33} [get\_ports QSPI\_FLASH\_io1\_io]
        set\_property -dict {PACKAGE\_PIN L14 IOSTANDARD LVCMOS33} [get\_ports QSPI\_FLASH\_io2\_io]
        set\_property -dict {PACKAGE\_PIN M14 IOSTANDARD LVCMOS33} [get\_ports QSPI\_FLASH\_io3\_io]
        set\_property -dict {PACKAGE\_PIN L13 IOSTANDARD LVCMOS33} [get\_ports {QSPI\_FLASH\_ss\_io[0]}]



##AXI DDR2 controller

The Memory Interface Generator (MIG7) is used to create a DDR2 controller for XXX RAM chip on the Nexys4 DDR board. The Microblaze will use a bootloader to copy the user application from Flash to DDR2 Ram. The DDR2 controller requires very precise timing parameters. These are specified in the [DDR2 RAM tutorial](). Add a MIG7 component and double click to configure:

1. Next
2. Next
3. Select Pin compat FPGA xc7a100ti-csg324
4. Controller type: DDR2
5. Controller options:
  5.1. Clock period 3077
  5.2. Memory part MT47H64M16HR-25E
  5.3. Datawidth 16
  5.4. Ordering Normal
6. AXI Parameter
  1. Data width: 128, narrow burst support 1
7. Memory Options - Clock 0 will be set 100Mhz later on, RTT-ODT: 50 ohms
8. FPGA options  
System clock: no buffer
Reference clock: no buffer
System reset pol: act low
Internal vref
9. Extended FPGA options: Internal termination impedance 50 omhs
10. IO Planning: Fixed pinout
11. Pin selections, type pin numbers, click validate. do not scroll!, als refer to xdc below
12. System signals: no connect
13. summary
14. simulation options, accept, pcb information, next, design notes, generate

Add another "Processor System Reset", rename FPGA_sys_reset

Connect
M06_AXI -> S_AXI
reset_n -> sys_rst
clk_out1 -> sys_clk_i (100mhz)
clk_out2 -> clk_ref_i (200mhz)
DDR2 make external, rename DDR2
ui_clk_sync_rst -> ext_reset_in
ui_clk -> slowest_sync_clk
ui_clk -> aclk1 (smartconnect)
mmcm_locked -> dcm_locked
int_calib_complete -> not con
peripheral_aresetn -> aresetn



Now add a second Processor System Reset. This is required because the Processor System Reset will run in the DDR2 ui\_clock domain. Connect the blocks.
  1.
  2.


Note that 
In some articles it is specified that one should not use a clocking wizard generated clock (would have too much jitter). In spite of this advice I have use the 200 MHz output of the clock wizard. The following constraints were obtained from an old UCF file for the Nexys4 DDR.

        set\_property -dict {PACKAGE\_PIN R7 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[0]}]
        set\_property -dict {PACKAGE\_PIN V6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[1]}]
        set\_property -dict {PACKAGE\_PIN R8 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[2]}]
        set\_property -dict {PACKAGE\_PIN U7 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[3]}]
        set\_property -dict {PACKAGE\_PIN V7 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[4]}]
        set\_property -dict {PACKAGE\_PIN R6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[5]}]
        set\_property -dict {PACKAGE\_PIN U6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[6]}]
        set\_property -dict {PACKAGE\_PIN R5 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[7]}]
        set\_property -dict {PACKAGE\_PIN T5 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[8]}]
        set\_property -dict {PACKAGE\_PIN U3 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[9]}]
        set\_property -dict {PACKAGE\_PIN V5 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[10]}]
        set\_property -dict {PACKAGE\_PIN U4 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[11]}]
        set\_property -dict {PACKAGE\_PIN V4 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[12]}]
        set\_property -dict {PACKAGE\_PIN T4 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[13]}]
        set\_property -dict {PACKAGE\_PIN V1 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[14]}]
        set\_property -dict {PACKAGE\_PIN T3 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dq[15]}]

        set\_property -dict {PACKAGE\_PIN T6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dm[0]}]
        set\_property -dict {PACKAGE\_PIN U1 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_dm[1]}]

        set\_property -dict {PACKAGE\_PIN U9 IOSTANDARD DIFF\_SSTL18\_II} [get\_ports {DDR2\_dqs\_p[0]}]
        set\_property -dict {PACKAGE\_PIN V9 IOSTANDARD DIFF\_SSTL18\_II} [get\_ports {DDR2\_dqs\_n[0]}]
        set\_property -dict {PACKAGE\_PIN U2 IOSTANDARD DIFF\_SSTL18\_II} [get\_ports {DDR2\_dqs\_p[1]}]
        set\_property -dict {PACKAGE\_PIN V2 IOSTANDARD DIFF\_SSTL18\_II} [get\_ports {DDR2\_dqs\_n[1]}]

        set\_property -dict {PACKAGE\_PIN N6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[12]}]
        set\_property -dict {PACKAGE\_PIN K5 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[11]}]
        set\_property -dict {PACKAGE\_PIN R2 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[10]}]
        set\_property -dict {PACKAGE\_PIN N5 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[9]}]
        set\_property -dict {PACKAGE\_PIN L4 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[8]}]
        set\_property -dict {PACKAGE\_PIN N1 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[7]}]
        set\_property -dict {PACKAGE\_PIN M2 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[6]}]
        set\_property -dict {PACKAGE\_PIN P5 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[5]}]
        set\_property -dict {PACKAGE\_PIN L3 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[4]}]
        set\_property -dict {PACKAGE\_PIN T1 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[3]}]
        set\_property -dict {PACKAGE\_PIN M6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[2]}]
        set\_property -dict {PACKAGE\_PIN P4 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[1]}]
        set\_property -dict {PACKAGE\_PIN M4 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_addr[0]}]

        set\_property -dict {PACKAGE\_PIN R1 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_ba[2]}]
        set\_property -dict {PACKAGE\_PIN P3 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_ba[1]}]
        set\_property -dict {PACKAGE\_PIN P2 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_ba[0]}]

        set\_property -dict {PACKAGE\_PIN L6 IOSTANDARD DIFF\_SSTL18\_II} [get\_ports {DDR2\_ck\_p[0]}]
        set\_property -dict {PACKAGE\_PIN L5 IOSTANDARD DIFF\_SSTL18\_II} [get\_ports {DDR2\_ck\_n[0]}]


        set\_property -dict {PACKAGE\_PIN N4 IOSTANDARD SSTL18\_II} [get\_ports DDR2\_ras\_n]
        set\_property -dict {PACKAGE\_PIN L1 IOSTANDARD SSTL18\_II} [get\_ports DDR2\_cas\_n]
        set\_property -dict {PACKAGE\_PIN N2 IOSTANDARD SSTL18\_II} [get\_ports DDR2\_we\_n]
        set\_property -dict {PACKAGE\_PIN M1 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_cke[0]}]
        set\_property -dict {PACKAGE\_PIN M3 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_odt[0]}]
        set\_property -dict {PACKAGE\_PIN K6 IOSTANDARD SSTL18\_II} [get\_ports {DDR2\_cs\_n[0]}]



##Address map

The connected AXI devices are either memory type devices or memory mapped IO devices. We have to specify the Microblaze memory map so that the AXI devices can be accessed by the bootloader and user application.

Click the address editor tab.

Right click Data area, unmapped slaves,  ethernetlite,gpio, uartlite, timer, quad spi, mig7 -> assign address
for instructions keep only local memory and mig7



#Commit the block design to version control

Store the current version of the  block design inside version control:
  1. git add src/blockdesign/mb\_design/\*
  2. git commit -am "Half way through block design"

#Synthesize

#XDC pin constraints

The XDC file specifies constraints on the physical FPGA pins. Digilent provides a XDC file for the Nexys4 DDR. This file is adapted to map the input and output ports of the block design to physical pins. The [XDC constraints file] is based upon a reference of Digilent. When the block design is completed and synthesized you can run the "get\_ports" command in the tcl window. The names of all the different block design input and output pins will then be displayed. These names have to be added to the XDC file. So if you run get\_ports and "OUTPUT\_X" is displayed then the XDC should contain a row (change the IOStandard and PACKAGE\_PIN to suit your needs):

set\_property -dict {PACKAGE\_PIN K17 IOSTANDARD LVCMOS33} [get\_ports OUTPUT\_X]

Some additional constraints are required to get rid of a warning:
set\_property CFGBVS VCCO [current\_design]
set\_property CONFIG\_VOLTAGE 3.3 [current\_design]


#Generate bit file

Later on the FPGA bit stream will be flashed on the Quad SPI Flash device. In order to reduce the size of the bit stream and speed up booting the bit stream can be compressed. Turn compression on by adding this to the XDC file.

set\_property BITSTREAM.GENERAL.COMPRESS TRUE [current\_design]

set other bit stream config XXX

Run the bit stream generator.

#SDK, software development

Click launch "SDK" from the project menu. Vivado will start the SDK which is the Eclipse C/C++ development IDE.

## Create bootloader

Create a new project. Select the "SREC SPI bootloader" template. Select create BSP.

Set VERBOSE enabled, this will cause the bootloader to print messages while the bootloading is in progress. The print commands unfortunately slow down the bootloading. Change this:

.....

to

    print(".")

This will speedup things while still giving some insight in the bootloading progress. The bootloader needs to know the address in SPI flash where the user application resides. Set

XXX to XXX


## Programming the FPGA

Select the SPI jumper on the Nexys4 DDR. This allows the FPGA to lood its bit file from the SPI flash. The FPGA bit file contains the configuration of the FPGA including initial contents of the Microblaze local BRAM. To be able to update the software of the Microblaze without changing the FPGA bit file. 

The FPGA bit stream is loaded from the external SPI Flash. Turn on bit file compression to speed up the startup time of the FPGA and to save space on the SPI Flash. After compression a large part of the SPI Flash is left unused. In this part of the flash the application software for the Microblaze can be stored. The application is stored in SREC format in the Flash. A SPI Flash SREC bootloader is run on the Microblaze and integrated in the FPGA bit file which loads after FPGA configuration. The bootloader copies the user application from Flash to the DDR2 ram and then starts it.

Next connect the Nexys4 DDR board via the JTAG usb. Start a serial ternminal (eg. gtkterm) and select the port (eg. /dev/ttyUSB1) and set the baudrate to 38400 (as configured in the UARTlite blockdesign).


Run the program FPGA command from the Xilinx menu. In the serial terminal you should see the bootloader starting (and failing).

##Flashimg the FPGA bitstream.

Run the "program FPGA" command from the Xilinx menu. Next run Program Flash from the Xilinx menu. Select the flash memory part: XXX and address 0x0. Select download.bit from XXX. After flashing you can restart the Nexys4 DDR by pressing the "prog" button. Again the bootloader should start and fail. Note that even though the FPGA load its bit file from flash it can still be programmed as usual using JTAG.


## Create user application

Create a new project. Select the "Peripheral test template". 

## Flashing the user application

Run the "Flash XXX" command. Select generate SREC, select the user application elf file.  Select the flash memory part XXX and address XXX (should be the same as the address set in the bootloader).

Reset the Nexys4 DDR by pressing the "prog" button. The bootloader should start loading and eventually run the user application. The user application will print various test messages. The RGB LED connected to the GPIO should react to one of the tests.

## Microblaze Debug Module (MDM)

## Processor System Reset

There are two CPU reset blocks. One is controls the Microblaze and other 100 MHz clock domain components. The other controls the reset of the DDR2 Ram controller and is part of the user\_clock (output of the DDR2 controller) domain.

## Connecting the IP blocks

## Constraints (XDC) file

The Digilent xdc file for the Nexys4 DDR does not contain the pinout of the DDR2 RAM. 

## Bootloader


  1. Launch the SDK
  2. Create a project with template "SPI SREC Bootloader"
    2.1. Set the XXX address
    2.2. Set the ....
  3. 



The sine [phase step](https://docs.google.com/spreadsheets/d/1zl4uNqo22D30khxiX1On5RydeTHjTQGgfvHI6CXL8H8/edit?usp=sharing)  calculations in this section can also be found on Google sheets.


The VHDL code can be found in the [i2s\_sender](https://github.com/dwjbosman/I2S\_sender) repository.


