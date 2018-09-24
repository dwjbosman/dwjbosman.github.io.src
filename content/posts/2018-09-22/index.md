---
title: "VHDL sine wave oscillator"
cover: "/logos/wave.jpg"
category: "Hardware"
tags: 
    - VHDL
      FPGA
      DSP
date: 2018-09-22 22:00
---

In my last article an VHDL I2S transmitter was presented which allows one to playback arbitrary wave data. Eventually the goal is to develop an additive synthesis engine. The next step involves being able to generate a sine wave.

As a starting point I use this [VHDL sine generator]() sub component. This generator is nicely parametrized. You can specify the number of bits in the output resolution as well as the phase input.

The additive synthesis engine which is to be developed needs to be able to control the frequency of the oscillator. I am not sure yet on the required frequency resolution. I will pick a reasonable number and keep the formulas general so that the value can be easily changed later. The challenge in the development of this oscillator is to implement the following features:

  * Configurable design parameter 'frequency resolution', default value 0.01 Hz
  * Real time configurable parameter 'frequency', value between 1 and 20000 Hz
  * No floating point
  * No general divisions
  * Where possible use bit shifts to do multiplication / division.

# Theory

The sine wave generator subcomponent has two design parameters:
  1. Amplitude resolution: 24 bit
  2. Phase space size. This value has to be a power of two and determines the phase resolution as well as frequency resolution. Given a target frequency resolution the minimum required phase space bit width can be determined. 
  3. Each sample a small step will be made to advance the phase of the sine. This phase step is a rational number and can be represented by a numerator and divisor. The algorithm will calculate the divisor and numeator.

Step 3 has to be performed whenever the frequency is changed while the design is 'running'. Step 2 has to be performed design-time. The next steps calculate the static design-time parameters.

## Design time constants

    Frequency resolution: 
    target_frequency_resolution = 0.01 Hz
    
    Sample Rate:          
    sample_rate = 48000 Hz
    
    Phase space size:
    phase_space_size  = sample_rate/target_frequency_resolution 
    phase_space_size -> 4800000

The sine generator subcomponent requires the phase space to be a power of two. As 'P' is the minimum required phase space size it is required to round up.

    Power of 2 phase space size: 
    power2_phase_space_bits =  ceiling(log(phase_space_size)/log(2))      
    power2_phase_space_bits -> 23 bits
    power2_phase_space_size -> 2^23 -> 8388608

This results in a slightly better frequency resolution:

    Desired frequency resolution:
    target_frequency_resolution = 0.01 Hz
    
    Quantized frequency resolution:
    quantized_frequency_resolution =  sample_rate / power2_phase_space_size
    quantized_frequency_resolution -> 0.0057220459
    
The reciprocal of the frequency resolution is the phase step. At each played back sample at 48 kHz sample rate the phase is increased by the phase step.

    Phase step:
    phase_step  = 1 / quantized_frequency_resolution
    phase_step -> 174.7626666667
    assert: sample_rate * phase_step == power2_phase_space_size

The phase step needs to be rounded to a power of two. It is possible to round down if the resulting frequency resolution is still above the target. If not round up:

    power2_phase_step_bits =  floor(log(phase_step)/log(2))      
    power2_phase_step_bits -> 7 bits
    power2_phase_step      -> 128
    frequency resolution would be: 1/128 -> 0.0078125

    power2_phase_step_bits =  ceil(log(phase_step)/log(2))      
    power2_phase_step_bits -> 8 bits
    power2_phase_step      -> 256
    frequency resolution would be: 1/256 -> 0.00390625

With 7 bits the frequency resolution is still above the target. When specifying the frequency of the oscillator, the frequency in Hz is multiplied by 128. Eg. to get 440 Hz, the frequency parameter of the osccillator will be set to 440*128 = 56320.  
   
The combination of the sample_rate and power2_phase_space_size values imply a non-integer phase_step value. The phase_step value needs to be scaled up to keep accuracy. The scaling amount seems to be:

    power2_phase_space_bits   -> 23 bits
    power2_phase_step_bits    -> 7 bits
    phase_step_scaling_bits    = power2_phase_space_bits - power2_phase_step_bits
    phase_step_scaling_bits   -> 16 bits
    phase_step_scaling_factor  = 2 ^ phase_step_scaling_bits
    phase_step_scaling_factor -> 65536
    
    phase_step                -> 174.7626666667
  
    scaled_phase_step          = truncate( phase_step_scaling_factor * phase_step)
    scaled_phase_step         -> 11453246

## Run time parameters

Let's say the frequency to generate is 440.0078125 Hz. Then the input scaled frequency would be:

    frequency_scaled = frequency * power2_phase_step
    frequency_scaled -> 56321

If it would be possible to use floating point arithmatic the phase step would be:

    phase_step_fp  = ( power2_phase_space_size / sample_rate ) * frequency

or rewritten:

    phase_step_fp -> ( power2_phase_space_size * frequency ) / sample_rate
    phase_step_fp -> 76896.93867

The integer version of phase_step_fp consists of phase_step_decimal and phase_step_numerator. Phase_step_decimal will give the decimal part (in the example 76895) while the fraction (0.57333...) will be specified as a numerator, divisor pair (a rational number). The decimal part is calculated as follows:

    scaled_phase  = frequency_scaled * scaled_phase_step
    scaled_phase -> 645046814720
    
    decimal_divider_bits  = power2_phase_step_bits + phase_step_scaling_bits
    decimal_divider_bits -> 23
    phase_step_decimal    = shift_right ( scaled_phase, decimal_deivider_bits)
    phase_step_decimal   -> 76896

As a check the phase_step_decimal is indeed equal to the decimal part of phase_step_fp. 

Now the fractional part is calculated as a rational value. The value consists of a numerator and divisor.  Recall the calculation of phase_step_fp:

    phase_step_fp -> ( power2_phase_space_size * frequency ) / sample_rate

This value can be converted to a rational number:

    phase_step_divisor  = sample_rate
    phase_step_divisor -> 48000

    using the integer frequency_scaled in stead of the floating point frequency:

    phase_step_numerator_incl_decimal  = ( power2_phase_space_size * frequency_scaled ) / power2_phase_step
    phase_step_numerator_incl_decimal  = shift_right ( power2_phase_space_size * frequency_scaled, power2_phase_step_bits)
    phase_step_numerator_incl_decimal -> 3691053056

As phase_step_fp is larger then one the numerator is larger then the divisor. To get the fractional part without the decimal part the decimal value is subtracted:
    
    phase_step_numerator  = phase_step_numerator_incl_decimal - phase_step_decimal * sample_rate
    phase_step_numerator -> 45056

Lastly assert that the numerator is indeed equal to the fractional part of phase_step_fp:

    phase_step_fp -> 76896.93867
    phase_step_numerator / phase_step_divisor -> 0.93867

The sine [phase step](https://docs.google.com/spreadsheets/d/1zl4uNqo22D30khxiX1On5RydeTHjTQGgfvHI6CXL8H8/edit?usp=sharing)  calculations in this section can also be found on Google sheets

# Implementation


The implementation will use the calculated values as follows: 
  * Each sample the phase will be increased with the decimal part: phase_step_decimal
  * Each sample the phase_step_numerator will be added to a counter. When the counter value is above the phase_step_divisor value the phase will be advanced by one and the counter is decreased by the divisor.

