---
title: "VHDL sine wave oscillator"
cover: "/logos/sine-article.jpg"
category: "FPGA"
tags: 
    - VHDL
      FPGA
      DSP
date: 2018-09-22 22:00
---

In my last [article](https://dwjbosman.github.io/vhdl-i-2-s-transmitter) a VHDL I2S transmitter was presented which allows one to playback arbitrary wave data. Eventually the goal is to develop an additive synthesis engine. In this article the goal is being able to generate a sine wave.

As a starting point I use this [VHDL sine generator](https://github.com/jorisvr/vhdl_sincos_gen) sub component. This generator is nicely parametrized. You can specify the number of bits in the output resolution as well as the phase input.

The additive synthesis engine which is to be developed needs to be able to control the frequency of the oscillator. I am not sure yet on the required frequency resolution. I will pick a reasonable number and keep the formulas general so that the value can be easily changed later. The challenge in the development of this oscillator is to implement the following features:

  * Configurable design parameter 'frequency resolution' which allows specifying how precisely the frequency can be controlled.
  * Real time configurable parameter 'frequency', value between 1 Hz and half the sample rate. 
  * No floating point
  * No general divisions
  * Where possible use bit shifts to do multiplication / division.

# Phase step

## Theory

The used sine wave generator sub component has two design parameters:
  1. Amplitude resolution: 24 bit
  2. Phase space size. This value has to be a power of two and determines the phase resolution as well as frequency resolution. Given a target frequency resolution the minimum required phase space bit width can be determined. 
  3. Each sample a small step will be made to advance the phase of the sine. This phase step is a rational number and can be represented by a numerator and divisor. The algorithm will calculate the divisor and numerator.

Step three has to be performed whenever the frequency is changed while the design is 'running'. Step two can be performed design-time. The next steps calculate the static design-time parameters. In the formulas below I use '->' to show its value given a sample rate and target frequency resolution.

### Design time constants

    Frequency resolution: 
    target_frequency_resolution = 0.01 Hz
    
    Sample Rate:          
    sample_rate       = 48000 Hz
    max_frequency     = sample_rate / 2    
    nax_frequency    -> 24000 Hz
    Phase space size:
    phase_space_size  = sample_rate / target_frequency_resolution 
    phase_space_size -> 4800000

The sine generator sub component requires the phase space to be a power of two. As phase\_space\_size is the minimum required phase space size it is required to round up to the nearest power of two.

    Power of 2 phase space size: 
    power2_phase_space_bits =  ceiling(log(phase_space_size) / log(2))      
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
    phase_step_bits = log2(phase_step)
    phase_step_bits = 7.449 bits
    assert: sample_rate * phase_step == power2_phase_space_size

The phase step needs to be rounded to a power of two so that it can be easily used in integer division and multiplication. It is possible to round down if the resulting frequency resolution is still above the target. If not round up:

    power2_phase_step_bits =  floor(log(phase_step)/log(2))      
    power2_phase_step_bits -> 7 bits
    power2_phase_step      -> 128
    frequency resolution would be: 1/128 -> 0.0078125

    power2_phase_step_bits =  ceil(log(phase_step)/log(2))      
    power2_phase_step_bits -> 8 bits
    power2_phase_step      -> 256
    frequency resolution would be: 1/256 -> 0.00390625

With 7 bits the frequency resolution is still above the target. At run-time the frequency of the oscillator can be set as an integer value by multiplying the target frequency with the scaling factor. For example to get 440 Hz, the frequency parameter of the oscillator will be set to 440 * 128 = 56320.

The combinations of the sample\_rate and power2\_phase\_space\_size vales imply a non-integer phase\_step value (174.76...). The phase\_step value needs to be scaled up to keep accuracy when using it in division. To determine the number of bits in the scaling factor first the determine the maximum error introduced by quantisation. 

    scaled_phase_step          = trunc(phase_step * phase_step_scaling_factor)
    quantised_phase_step_error = phase_step - scaled_phase_step / phase_step_scaling_factor 
    maximum_phase_error        = maximum_frequency * quantised_phase_step_error

This maximum\_error must be below 1. So the quantised\_phase\_step\_error must be lower than:

    max_quantised_phase_step_error       = 1 / maximum_frequency
    max_quantised_phase_step_error      -> 0.00004166...
    max_quantised_phase_step_error_bits -> 14.5507... bits

This implies the required number of bits in the scaled phase step:

    scaled_phase_step_bits          = ceiling( phase_step_bits + max_quantised_phase_step_error_bits)
    scaled_phase_step_bits         -> 22

For the phase step scaling factor there are two options. Choose the lowest number of bits that still results in an error lower than one.

    phase_step_scaling_factor_bits  = ceiling ( max_quantised_phase_step_error_bits ) 
    phase_step_scaling_factor_bits -> 15
    phase_step_scaling_factor      -> 2^15 -> 32768
    scaled_phase_step               = trunc(phase_step * phase_step_scaling_factor)
    scaled_phase_step              -> 5726623

    phase_step_error  = phase_step - scaled_phase_step / phase_step_scaling_factor 
    phase_step_error -> 0.000001871744786

    max_error         = maximum_frequency * phase_step_error 
    max_error        -> 0.04492187486 must be <1

Or

    phase_step_scaling_factor_bits  = floor ( max_quantised_phase_step_error_bits ) 
    phase_step_scaling_factor_bits -> 14
    phase_step_scaling_factor      -> 2^14 -> 16384
    scaled_phase_step               = trunc(phase_step * phase_step_scaling_factor)
    scaled_phase_step              -> 2863311

    phase_step_error  = phase_step - scaled_phase_step / phase_step_scaling_factor 
    phase_step_error -> 0.00003238932291

    max_error         = maximum_frequency * phase_step_error 
    max_error        -> 0.7773437499 must be <1

So 14 bits can be used for the phase step scaling factor.


### Run time parameters

Let's say the frequency to generate is 440.0078125 Hz. Then the input scaled frequency would be:

    frequency_scaled = frequency * power2_phase_step
    frequency_scaled -> 56321

If it would be possible to use floating point arithmetic then the phase step would be:

    phase_step_fp  = ( power2_phase_space_size / sample_rate ) * frequency

or rewritten:

    phase_step_fp -> ( power2_phase_space_size * frequency ) / sample_rate
    phase_step_fp -> 76896.93867

The integer version of phase\_step\_fp consists of phase\_step\_decimal and phase\_step\_numerator. Phase\_step\_decimal will give the decimal part (in the example 76895) while the fraction (0.57333...) will be specified as a numerator, divisor pair (a rational number). The decimal part is calculated as follows:

    scaled_phase  = frequency_scaled * scaled_phase_step
    scaled_phase -> 161264538831
    
    decimal_divider_bits  = power2_phase_step_bits + phase_step_scaling_bits
    decimal_divider_bits -> 21
    phase_step_decimal    = shift_right ( scaled_phase, decimal_deivider_bits)
    phase_step_decimal   -> 76896

Generally the phase\_step\_decimal will equal the decimal part of the phase\_step\_fp. In corner cases when the fractional part of phase\_step\_fp is near zero the decimal part will be off by one. For example with a scaled frequency of 440573 (3441.97 Hz) the actual phase step will be 601529.0027. However the quantised phase step will be floor(601528.8912) = 601528 which is off by one. 

Now the fractional part is calculated as a rational value. The value consists of a numerator and divisor.  Recall the calculation of phase\_step\_fp:

    phase_step_fp -> ( power2_phase_space_size * frequency ) / sample_rate

This value can be converted to a rational number:

    phase_step_divisor  = sample_rate
    phase_step_divisor -> 48000

    using frequency_scaled (an integer value) instead of the floating point frequency:

    phase_step_numerator_incl_decimal  = ( power2_phase_space_size * frequency_scaled ) / power2_phase_step
    phase_step_numerator_incl_decimal  = shift_right ( power2_phase_space_size * frequency_scaled, power2_phase_step_bits)
    phase_step_numerator_incl_decimal -> 3691053056

The fact that phase\_step\_fp is larger than one implies that the numerator is larger than the divisor. To get the fractional part without the decimal part the decimal value is subtracted:
    
    phase_step_numerator  = phase_step_numerator_incl_decimal - phase_step_decimal * sample_rate
    phase_step_numerator -> 45056

Assert that the rational number is indeed the fractional part of phase\_step\_fp:

    phase_step_fp -> 76896.93867
    phase_step_numerator / phase_step_divisor -> 0.93867

In the earlier described corner cases it could be that the numerator is still larger than the divider after subtraction of the decimal part. It will however always be smaller than 2 * divider. So when the numerator is larger than the divider it is possible to simply subtract the divider once to get the numerator corresponding to the fractional part. In that case the phase\_step\_decimal value is increased by one.

The sine [phase step](https://docs.google.com/spreadsheets/d/1zl4uNqo22D30khxiX1On5RydeTHjTQGgfvHI6CXL8H8/edit?usp=sharing)  calculations in this section can also be found on Google sheets.

# VHDL Design

In this article I focus on generating a single sine wave. The following will be tested:

  * Setting the sine generator to a certain frequency.
  * Updating the frequency : This should not introduce noticeable audio 'glitches'.

The top level design simply connects an oscillator (the sine\_wave component) to the I2S\_sender. Two buttons enable toggling sine wave frequency. The sine\_wave component takes a frequency as its input and presents the sine wave samples at its output.

## Interface

The sine wave generator has the following interface:

    entity sine_wave is
        Port ( resetn : std_logic;
               MCLK_in : in std_logic; -- Master clock of the I2S Sender
               
               freq_in_ce: in std_logic; -- if '1' freq_in will be sampled on rising edge
               freq_in: in frequency_t; -- the scaled frequency of the sine

               wave_out : out sample_t -- the generated output samples
               );
    end sine_wave;

## Architecture

The architecture consists of the sincos generator sub component and three processes:
  * Calculating the sample clock. Each tick the sine phase will need to be updated.
  * Accepting new frequency updates and update the phase step value. Calculating the phase step value is accomplished through a procedure

        procedure Calculate_Phase_Step(
            constant frequency_scaled: in frequency_t;
            variable phase_step: out phase_step_t) 

  * Generate sine samples by advancing the phase with the phase step. The phase value is presented to the sincos generator sub component. Updating the phase is again accomplished with a procedure. The implementation will use the decimal phase step and fractional phase step values. Each sample the phase will be increased with the decimal part: phase_step_decimal. Each sample the phase_step_numerator will be added to a counter. When the counter value is above the phase_step_divisor (the sample rate) value the phase will be advanced by one and the counter is decreased by the divisor.

        type phase_step_t is record 
            decimal : phase_step_decimal_t;
            fraction : phase_step_fraction_t; -- fractional / sample_rate
        end record;
        
        type phase_state_t is record
            step : phase_step_t;
            -- the decimal part, added each step
            current: phase_t; 
            -- the fractional part, if it overflows (above sample_rate)
            -- then the it is reset and current is increased by one
            current_fraction: phase_fraction_t; 
        end record;
                
        procedure Advance_Phase(
            variable phase: inout phase_state_t)

## Testing

Two testbenches have been setup.

### Testing phase step calculation.

The 'sine\_sim' tests the calculation of the design time constants and calculating the phase step decimal and fractional values. This is fairly simple: 
  1. calculate the real phase step using standard floating point arithmetic.
  2. calculate the same value using the phase step calculation algorithm.
  3. compare the values: if the difference is too large report an error.

The phase step will be added to the phase each time a sample is generated. A test is performed to check that the phase is updated correctly:
  1. Advance the phase a number of times.
  2. Update a version of the phase given the phase step as a floating point value.
  3. Update a version of the phase given the phase step as a decimal and fractional part.
  4. Each iteration compare if the difference between both both version of the phase is small.
  
### Testing the sine wave generator

The simulation sets up a sine wave generator and configures its frequency to 440 Hz. The output samples are shown in Vivado's wave view. You can configure the way a signal is presented in the wave view. By showing the wave output as an analog signal with radix 'signed decimal' a nice sine wave is readily visible. Two markers were added to check the frequency of the sine wave. The check indeed shows that the sine wave has a frequency of 440 Hz.

![440 Hz sine wave](doc_resources/sine_440.png "440 Hz sine wave")

# Final thoughts

  * It would be interesting to check if the fixed point value types in VHDL 2008 could simplify things. Getting the fixed point package working in Vivado seemed a hassle.
  * Using an embedded bit scope (Xilinx ila) helped in finding a bug in the i2s\_sender. It was simulating correctly, but synthesized with an bug. One of the steps setting up an ila is marking signals to be debugged with an attribute 'mark\_debug'. I was able to enable and disable debugging using a generic variable:

        attribute mark_debug of signal_name : signal is boolean'image(debug_generic_var)

  * In VHDL setting a constant to a value given a condition is not straight forward. You can use a function to return a value based on a condition and use that function to set the constant:

        function sel(Cond: BOOLEAN; If_True, If_False: real) return real is
        begin
           if (Cond = TRUE) then
               return(If_True);
           else
               return(If_False);
           end if;
        end function sel; 

        constant X : real := sel( TRUE, 1.0, 2.0); -- will set X to 1.0 

The VHDL code can be found in the [i2s\_sender](https://github.com/dwjbosman/I2S_sender) repository.


