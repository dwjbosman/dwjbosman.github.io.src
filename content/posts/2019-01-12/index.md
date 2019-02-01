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

In my previous article I discussed setting up a Microblaze processor which can run user applications in a bare metal environment. The advantage of using a bare metal approach is that software runs without any (underterministic) operating system overhead. Disadvantage is that you need to take care of everything, even the most basic stuff, yourself. In the proposed synthesizer the audio engine will run in real time. The engine will run partly on a Microblaze and will be implemented partly in custom FPGA logic. Also there is the need for a management engine. This engine needs to provide functionality for more complex tasks which don't need to meet hard real time requirements. The management engine will provide: MIDI functionality, TCP/IP network connectivity, an embedded website, firmware upgrades. This sort of functionality is ideally suited to implement on a Linux platform. In this article I will show how to get Linux up and running on a Xilinx Zynq Zed board. There are a number of tutorials around which describe Linux on the Zed board. This tutorial adds the following:

  * Use Yocto Linux
  * Use a device tree (dts/dtb) based upon the custom functionality implemented in the FPGA.

In this tutorial the programmable logic (PL) will be configured to contain a GPIO block connected via AXI to the ARM chips in the Zynq programmable system (PS). Linux will run on the PS and will be able to access the GPIO block in the PL.

# Design

In order to get Linux running on the Zed Board, I will be using the SD Card. On the SD card there are two partitions: boot and root. For the root filesystem I will be using Ubuntu. The boot partition needs the following files:
  1. boot.bin : FSBL bootloader. This bootloader reads the FPGA bit file from the SD card boot partition (fpga.bin).
  2. fpga.bin : FPGA logic fabric bitfile converted to bin format.
  3. u-boot.img : u-boot Linux bootloader.
  4. uEnv.txt : u-boot boot configuration.
  5. uImage-system-top.dtb : Linux device tree,.
  6. uImage : Yocto Linux Kernel.

Yocto can provide these files based on input coming from Xilinx Vivado and the Xilinx SDK. In Vivado the functions defined in the Zynq PL are exported via a device tree (dts file). This device tree is then compiled into a device tree blob (dtb file) when Yocto builds the Linux image. The Linux kernel can then provide an interface to the custom FPGA logic. In more details the steps are as follows:

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

The proof of concept consists of a GPIO block connected to the Zed board LEDs and switches. The GPIO block is connected to the PS via the AXI bus. One of the LEDs is connected to a counter which causes it to blink. The blinking LED was added so that you can see that the FPGA logic was programmed during booting. The Zynq PS needs the following features: DDR memory, UART (Linux terminal), SPI (SD card) and  Ethernet. The block design can be found in the github project.

## Export .bit file

After completing the block design, it can be synthesized and a .bit file can be generated. Use the 'export hardware' function in Vivado to hand over the hardware description to the Xilinx SDK. 

# Generate dts files

In order to generate a device tree (dts) file from the hardware description a separate Xilinx tool (device-tree-xlnx) is needed. This tool can be installed as an addon into the Xilinx SDK.

  1. clone the [device-tree-xlnx](https://github.com/Xilinx/device-tree-xlnx) project.
  2. In the Xlinix SDK open the Xilinx menu and open 'Repositories'. 
  3. Click the 'new' button next to the 'global repositories' section and select the path to the checked out git repo.
  4. Create a new Board Support Package project. In the 'target hardware' section choose the Vivado exported wrapper. In the 'board support package OS' drop down choose 'device tree'.
  5. The 'board support settings' window will open. Here you can select various driver and device tree options. I'm using kernel version 2018.3
  6. After selecting 'ok' a number of 'dts' and 'dtsi' files will be generated. The system-top.dts will be compiled into a device tree blob by Yocto. Examine the system-top.dts and find that it contains a number of includes. The included dtsi files are also required. The other files can be ignored. 

# Generate fpga.bin from fpga.bit

Use the [bit to bin](https://github.com/topic-embedded-products/meta-topic/blob/master/recipes-bsp/fpga/fpga-bit-to-bin/fpga-bit-to-bin.py) conversion script to convert the bit file to a bin file suitable for flashing on the SD card.

# Yocto Linux image

Yocto is a framework of tools to create custom embedded Linux distributions. Yocto consists of the embedded Linux distribution Poky and the OpenEmbedded (OE) build system. Yocto consists of layers. Each layer can add new features or modifiy existing features. A custom layer will be added to inject the dts files from the previous step.

In order to build a Linux image with Yocto a number of prerequisite tools need to be installed. In order to keep my PC clean, Docker is used to be able to install all dependencies without affecting my normal day-to-day work. The Docker file can be found in the repository.

   1. Clone the .... repository
   2. Copy the required dts and dtsi to the <pre>meta-dts/recipes-kernel/linux/linux-xlnx/zedboard-zynq7/</pre> folder.
   3. If needed update the <pre>meta-dts/recipes-kernel/linux/linux-xlnx_%.bbappend</pre> file to include the copied dts/dtsi files.
   2. Create the Docker image by running "make image". After this step is completed (which will take quite a long time!) the Docker image will contain the Linux image files for the Zed Board
   3. Run the "run.sh" to create and log in to a Docker container.
   4. Copy the files inside /yocto/poky/build/tmp/deploy/images/zedboard-zynq7 to a folder in your home dir.

# Configure root file system

I followed this blog on setting up an [Ubuntu Xenial rootfs](https://embeddedgreg.com/2017/06/17/creating-a-xenial-rootfs-for-zy). Don't follow the complete article. Skip the part on u-boot. U-boot is already provided by Yocto.
        
# Format the SD card

Use fdisk to setup the partitions on the SD card. Setup the following partition table:

<pre>
Device         Boot Start      End  Sectors  Size Id Type
/dev/mmcblk0p1 *        8    42605    42598 20,8M  c W95 FAT32 (LBA)
/dev/mmcblk0p2      42608 13833091 13790484  6,6G 83 Linux
</pre>

After partioning the SD card exit fdisk and mount the partitions. Use rsync to copy the rootfs to the second partition.

<pre>
sudo rsync -aAXv <path_to\_your\_rootfs>/* /path_to_mount_point_second_partition/
</pre>

Copy the following files from the yocto deploy/images directory (Yocto Linux image step 4) to the SD card boot partition:

<pre>
boot.bin  
u-boot.img  
uImage  
uImage-system-top.dtb
</pre>

Copy the converted fpga bit stream (step Generate fpga.bin from fpga.bit) to the boot partition:

<pre>
fpga.bin  
</pre>

Finally modify the uEnv.txt file generated by Yocto, and copy it to the boot partition:

<pre>
machine_name=zedboard-zynq7
kernel_image=uImage
kernel_load_address=0x2080000
devicetree_image=uImage-system-top.dtb
devicetree_load_address=0x2000000
bootargs=console=ttyPS0,115200 root=/dev/mmcblk0p2 rw earlyprintk rootfstype=ext4 rootwait devtmpfs.mount=1
loadkernel=fatload mmc 0 ${kernel_load_address} ${kernel_image}
loaddtb=fatload mmc 0 ${devicetree_load_address} ${devicetree_image}
bootkernel=run loadkernel && run loaddtb && bootm ${kernel_load_address} - ${devicetree_load_address}
uenvcmd=run bootkernel
</pre>

# Conclusion

The Docker file and VHDL code can be found in the [Basic\_microblaze](https://github.com/dwjbosman/yocto_zedboard.git) repository.

