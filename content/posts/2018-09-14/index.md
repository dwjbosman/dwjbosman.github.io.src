---
title: "VHDL i2s transmitter"
cover: "/logos/network.jpg"
category: "Hardware"
tags: 
    - VHDL
      FPGA
      DSP
date: 2018-09-14 22:00
---

<script data-my-script="" type="text/javascript">requirejs.config({paths: { 'plotly': ['https://cdn.plot.ly/plotly-latest.min']},});if(!window.Plotly) {{require(['plotly'],function(plotly) {window.Plotly=plotly;});}}</script>

This summer I have been reading a book on VHDL 2008: "TODO". In my opinion a very well written book which I can recommend to anyone with programming knowledge.  To get some practical experience I obtained two dev kits:  

An advanced dev kit containing a Xilinx Zync.
A Nexys4-DDR with Xylinx Artix7 from Digilent. Digilent also sells PMOD modules which are extension modules containing specialized IO chips. I took the DA/AD board with I2S interface. It can sample as well as playback audio wave data via a simple I2S protocol.

Using the I2S board is relatively simple when compared with for example the audio chip embedded on the Zync board. The audio chip embedded on the Zync board implements a complex signal path with many registers. Setting one of the registers to a wrong value can result in no audio output. So didn't want to start my first VHDL project using this one. An audio such as the ... with an I2S interface and no registers to set is simple to test. I can simulate the VHDL on fore hand an check the I2S waveform. If that is correct the audio chip will produce sound.

The roadmap of my project is as follows:
1. First produce a square wave with a specific frequency.
2. Produce a single sine wave with a specific frequency.
3. Implement I2S AD reception and loopback to the DA output.
4. Implement an additive synthesis engine based on a bandwidth enhanced sine model []
5. Control the synthesis parameters from a soft core.
6. Run Linux on a soft core and control the synthesis engine with a Linux device driver.

So I have a long way to go. In this article I will focus on step 1.

The first thing2 I noticed while experimenting with VHDL 2008 and Xilinx Vivado:
*Lack of support of some VHDL 2008 features in Vivado.
*Eventhough simulation is running fine the synthesized result can still be wrong.


