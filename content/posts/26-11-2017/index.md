---
title: "LSTM neural network for sequence learning"
cover: "/logos/logo-1024.png"
category: "blaat"
tags: 
    - LSTM, 
    - Artificial Intelligence
    - Jupyter
    - Tensorflow
date: 2017-11-19 22:00
---

<script>window.alert("hoi2");</script>
<script>requirejs.config({paths: { 'plotly': ['https://cdn.plot.ly/plotly-latest.min']},});if(!window.Plotly) {{require(['plotly'],function(plotly) {window.Plotly=plotly;});}}</script>

In 1996, during my last year in High School, I borrowed a book of a friend about neural networks. It explained how a two layer perceptron network could learn the XOR function. Back then I tried implementing the formulas and was able to do the feed-forward calculations. The training algorithm however still eluded me. Being able to perform forward calculations was already very exciting. I created a windows 95 screen save which would fill the screen with the output of a randomized neural network. The output images we're very interesting. Especially when replacing the activation functions of the network by exotic ones such as sin(x), abs(x) etc. (Although I lost the source code, you can still download it [here](http://www.free-downloads-center.com/download/neural-screen-saver-v1-0-11252.html))

At the time it seemed that Neural networks were just another statistical method to interpolate data. Furthermore limited training data and the problem of vanishing gradients limited their usefulness. Fast forward to 2017. Massive amounts of training data and computing power are available. A number of relatively small improvements in the basic neural network algorithms have made it possible to train networks consisting of many more layers. These so-called deep neural networks have fueled progress and interest in Artificial Intelligence development.

One particular innovation that caught my attention is the LSTM neural network architecture. This architecture solves the issue of vanishing gradients for Recurrent Neural Networks (RNN). LSTM networks are especially suited to perform analysis of sequences and time series. Some interesting links:

  * [article about text generation kernel code](http://karpathy.github.io/2015/05/21/rnn-effectiveness/)
  * [fake news generator](https://larseidnes.com/2015/10/13/auto-generating-clickbait-with-recurrent-neural-networks/)
  * [LSTM architecture](http://colah.github.io/posts/2015-08-Understanding-LSTMs/)
  * [LSTM explanation](https://arxiv.org/pdf/1506.00019.pdf)
  * [Modeling attention](https://distill.pub/2016/augmented-rnns/)
  * [Convolutional network for speech synthesis](https://deepmind.com/blog/wavenet-generative-model-raw-audio/)

In this first test I wanted to experience implementing a sine wave predictor. using Tensor Flow. It's a toy example. Due to the periodic nature of the sine wave the train, dev, and test set overlap. This limits the possibilities to check if the network can generailize.  

This notebook can be [downloaded](https://raw.githubusercontent.com/dwjbosman/tensorflow-experiments/master/Sine_LSTM_batch_size.ipynb) from my git repository.

```python
import plotly
from plotly.graph_objs import Scatter, Layout
import numpy as np
import tensorflow as tf
import sys
plotly.offline.init_notebook_mode(connected=True)
import IPython.display
```



## Training data
The following cell generates the training data. I decided to add some noise to the sine wave which forces some regularization.     


```python
sample_length = 50001
time_per_sample = 0.01
signal_time = np.linspace(num=sample_length,start = 0, stop = sample_length * time_per_sample )
signal_amp = np.sin(signal_time*2*np.pi) + np.random.normal(size=sample_length)*0.02
    #np.sin(2+signal_time*1.7*np.pi)*0.5 + \
    #np.sin(1+signal_time*2.2*np.pi) + \
    
```


```python
#plot part of the signal, just to see what's in there
s_i = 0
e_i = s_i + 100
x = plotly.offline.iplot({
    "data": [Scatter(x=signal_time[s_i:e_i],y=signal_amp[s_i:e_i])],
    "layout": Layout(title="")
    
})
```


<div id="66a0fd2d-53a6-4c13-840c-4ab505be77c0" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("66a0fd2d-53a6-4c13-840c-4ab505be77c0", [{"x": [0.0, 0.010000199999999999, 0.020000399999999998, 0.030000599999999995, 0.040000799999999996, 0.050001, 0.06000119999999999, 0.07000139999999999, 0.08000159999999999, 0.09000179999999999, 0.100002, 0.1100022, 0.12000239999999998, 0.1300026, 0.14000279999999998, 0.150003, 0.16000319999999998, 0.17000339999999997, 0.18000359999999999, 0.19000379999999997, 0.200004, 0.21000419999999997, 0.2200044, 0.23000459999999998, 0.24000479999999996, 0.250005, 0.2600052, 0.27000539999999995, 0.28000559999999997, 0.2900058, 0.300006, 0.31000619999999995, 0.32000639999999997, 0.3300066, 0.34000679999999994, 0.35000699999999996, 0.36000719999999997, 0.3700074, 0.38000759999999995, 0.39000779999999996, 0.400008, 0.41000819999999993, 0.42000839999999995, 0.43000859999999996, 0.4400088, 0.45000899999999994, 0.46000919999999995, 0.47000939999999997, 0.4800095999999999, 0.49000979999999994, 0.50001, 0.5100102, 0.5200104, 0.5300106, 0.5400107999999999, 0.5500109999999999, 0.5600111999999999, 0.5700114, 0.5800116, 0.5900118, 0.600012, 0.6100121999999999, 0.6200123999999999, 0.6300125999999999, 0.6400127999999999, 0.650013, 0.6600132, 0.6700134, 0.6800135999999999, 0.6900137999999999, 0.7000139999999999, 0.7100141999999999, 0.7200143999999999, 0.7300146, 0.7400148, 0.7500149999999999, 0.7600151999999999, 0.7700153999999999, 0.7800155999999999, 0.7900157999999999, 0.800016, 0.8100162, 0.8200163999999999, 0.8300165999999999, 0.8400167999999999, 0.8500169999999999, 0.8600171999999999, 0.8700173999999999, 0.8800176, 0.8900177999999999, 0.9000179999999999, 0.9100181999999999, 0.9200183999999999, 0.9300185999999999, 0.9400187999999999, 0.950019, 0.9600191999999999, 0.9700193999999999, 0.9800195999999999, 0.9900197999999999], "type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796]}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>



```python
#Setup general  hyper parameters

#Unroll the RNN to sequence_length timesteps
sequence_length = 100
#The number timesteps to predict
prediction_length = 1
#The number of features per input time step
input_feature_count = 1
#The number of featuers per prediction
output_feature_count = 1

#the number of LSTM nodes per layer of the network
hidden_count_per_layer = [16,16]

tf.reset_default_graph()

#inputs is a vector of (batch_size, sequence_length, feature_count)
inputs = tf.placeholder(tf.float32, 
                        [None, sequence_length, input_feature_count], 
                        name = 'inputs')
#targets will be an example to train. 
#It will be filled with the value of the next time step. 
#Size (batch_size, feature count)
targets = tf.placeholder(tf.float32, 
                         [None, output_feature_count], 
                         name = 'targets')
#Apply drop out regularization with a a probability of keep_prob 
#to keep a connection 
keep_prob = tf.placeholder(tf.float32, name = 'keep')
#Used a learning rate for AdamOptimzer
learning_rate = tf.placeholder(tf.float32, name = 'learning_rate')

```

## Defining the LSTM multi layer network

Define a network by creating a number of layers. In most examples I found all layers used equal node counts. In this example you can specify the number of neurons per layer through the 'hidden_count_per_layer' array.


```python
layers = []


for hidden_count in hidden_count_per_layer:
    layer =  tf.nn.rnn_cell.LSTMCell(hidden_count, state_is_tuple = True)
    layer_with_dropout = tf.nn.rnn_cell.DropoutWrapper(layer,
                                          input_keep_prob=keep_prob,
                                          output_keep_prob=1.0)
    layers.append(layer)
hidden_network = tf.nn.rnn_cell.MultiRNNCell(layers, state_is_tuple = True)   

```

## Packing/Unpacking the LSTM network state

'state_is_tuple = True' means that the LSTM State data structure will be a Tuple. Although inconvenient to work with this seems to be the future default. I will introduce some functions which help to work more easily with these state tuples. 

In order to use the LSTM network to generate a predicted sequence of arbitrary length you need to store the state of the network. The output state after predicting a sample should be fed back in to the network when predicting the next sample.

The LSTM implementation in Tensor flow uses a LSTMStateTuple(c,h) data structure. The idea is to pack this LSTMStateTuple(c,h) into a 2D vector of size (batch_size, states). 

There were some challenges implementing these packing/unpacking functions. Especially you want to avoid them beeing dependent on a specific batch_size. During building of the computation graph the batch_size should be None.

There is a pointer on how to use dynamic batch_sizes and packing/unpacking states [here](https://stackoverflow.com/questions/40438107/tensorflow-changing-batch-size-for-rnn-during-text-generation). I made some changes to clarify these functions. 


```python
def get_network_state_size(network):
    """Returns the number of states variables in the network"""
    states = 0
    for layer_size in hidden_network.state_size:
        states += layer_size[0] # LSTMState tuple element c
        states += layer_size[1] # LSTMState tuple element h
    return states

```


```python
def pack_state_tuple(state_tuple, indent=0):
    """Returns a (batch_size,network_state_size) matrix of the states in the network
        state_tupel = the states obtained from  _ , state = tf.nn.dynamic_rnn(...)
    """
    if isinstance(state_tuple, tf.Tensor) or not hasattr(state_tuple, '__iter__'):
        #The LSTMSTateTuple contains 2 Tensors
        return state_tuple
    else:
        l = []
        #an unpacked LSTM network is tuple of layer size, each element of the tuple is an LSTMStateTuple
        #state_tupel is either the tuple of LSTMStateTuples or it is a LSTMSTateTuple (via recursive call)
        for item in state_tuple:
            # item is either an LSTMStateTuple (top level call)
            # or it is an element of the LSTMStateTuple (first recursive call)
            i = pack_state_tuple(item, indent+2)
            l.append(i)
        
        #convert the list of [Tensor(bsz,a), Tensor(bsz,b), ...] Into one long Tensor (bsz, a-b-c-...)
        return tf.concat(l,1)
    
```


```python
def unpack_state_tuple(state_tensor, sizes):
    """The inverse of pack, given a packed_states vector of (batch_size,x) return the LSTMStateTuple 
    datastructure that can be used as initial state for tf.nn.dynamic_rnn(...) 
        sizes is the network state size list (cell.state_size)
    """

    def _unpack_state_tuple( sizes_, offset_, indent):
        if isinstance(sizes_, tf.Tensor) or not hasattr(sizes_, '__iter__'): 
            #get a small part (batch size, c or h size of LSTMStateTuple) of the packed state vector of shape (batch size, network states)
            return tf.reshape(state_tensor[:, offset_ : (offset_ + sizes_) ], (-1, sizes_)), offset_ + sizes_
        else:
            result = []
            #Top level: sizes is a tuple of size network layers, each element of the tuple is an LSTMStateTuple(c size, h size)
            #Recursive call: sizes_ is a LSTMStateTuple
            for size in sizes_:
                #size is an LSTMStateTuple (toplevel)
                #or size is c size or h size (recursive call)
                s, offset_ = _unpack_state_tuple( size, offset_, indent+2)
                result.append(s)
            if isinstance(sizes_, tf.nn.rnn_cell.LSTMStateTuple):
                #end of recursive call
                #Build a LSTMStateTuple using the c size and h size elements in the result list
                return tf.nn.rnn_cell.LSTMStateTuple(*result), offset_
            else:
                # end of toplevel call
                # create a tuple of size network layers. Result is a list of LSTMStateTuple
                return tuple(result), offset_
    return _unpack_state_tuple( sizes, 0,0)[0]
```

### Testing the packing/unpacking functions
Next I wrote a check to see if the pack and unpack functions are indeed each others inverse. The vectors should be packed/unpacked in the correct order. The idea is to create 'packed' vector containing the values 0..n. Then unpack and repack. The output value should be equal to the original vector. 


```python
#Test pack and unpack

#create a placeholder in which we can feeisd packed states (vector of (batch_size, states) as initial_state
state_packed_in = tf.placeholder(
    tf.float32, 
    (None,get_network_state_size(hidden_network)), 
    name="state_packed_1")


#Unpack the packed states
state_unpacked_out = unpack_state_tuple(state_packed_in,hidden_network.state_size)
#Repack the unpacked states
state_packed_out = pack_state_tuple(state_unpacked_out)


inputs_batch_size = 40
a_batch_of_inputs = np.zeros((inputs_batch_size, sequence_length, input_feature_count))

#create an initial state vector and fill it with test data
an_initial_state = np.zeros((inputs_batch_size*get_network_state_size(hidden_network),1))
an_initial_state[:,0] = np.linspace(start=0,stop=an_initial_state.shape[0]-1,num=an_initial_state.shape[0])
#reshape it as an packed state 
an_initial_state_packed = np.reshape(an_initial_state, (inputs_batch_size,get_network_state_size(hidden_network)))


init=tf.global_variables_initializer()
with tf.Session() as sess:
    sess.run(init)
    up,p = sess.run([state_unpacked_out, state_packed_out],  feed_dict={state_packed_in: an_initial_state_packed})
    # compare the original packed states with the ones the were unpacked and then repacked
    diff = an_initial_state_packed - p
    # should return 0
    print("diff",np.sum(np.abs(diff)))
```

    diff 0.0


## Initial state

Create a placeholder for initial packed states. This makes it possible to supply the initial states to the LSTM network as a simple vector. Then add a unpack operation to the computation graph. This outputs the initial state as a LSTMTuple vector which can be used by the dynamic RNN function later on.


```python
sz = get_network_state_size(hidden_network)
print("states in network", sz)


initial_state_packed = tf.placeholder(
    tf.float32, 
    (None,sz), 
    name="initial_state")

state_unpacked = unpack_state_tuple(initial_state_packed,hidden_network.state_size)

```

    states in network 64


## Forward propagation

Define the forward calculations by using the dynamic_rnn function. This function needs and outputs the network states in unpacked format. 


```python
#out_weights=tf.Variable(tf.random_normal([hidden_count_per_layer[-1],output_feature_count]))
#out_bias=tf.Variable(tf.random_normal([output_feature_count]))
print("inputs ",inputs.shape)
outputs, state_unpacked_network_out = tf.nn.dynamic_rnn(hidden_network, inputs, initial_state = state_unpacked, dtype=tf.float32) #, initial_state=rnn_tuple_state, )
state_packed_network_out = pack_state_tuple(state_unpacked_network_out)
print("packed state", state_packed_network_out.shape)
print("outputs before transpose", outputs.shape)
outputs = tf.transpose(outputs, [1, 0, 2])
print("outputs after transpose", outputs.shape)
#last_output = tf.gather(outputs, int(outputs.get_shape()[0]) - 1)
last_output =  outputs[outputs.shape[0]-1,:,:]
print("last output", last_output.shape)
                                   
#out_size = target.get_shape()[2].value
predictions = tf.contrib.layers.fully_connected(last_output, output_feature_count, activation_fn=None)
print("prediction", predictions.shape)
print("targets", targets.shape)
```

    inputs  (?, 100, 1)
    packed state (?, 64)
    outputs before transpose (?, 100, 16)
    outputs after transpose (100, ?, 16)
    last output (?, 16)
    prediction (?, 1)
    targets (?, 1)


## Backward pass, training

Define the loss as the total of the squared differences between the the last output (prediction) and the target. 


```python
loss = tf.reduce_sum(tf.squared_difference(predictions, targets))
```


```python
opt=tf.train.AdamOptimizer(learning_rate=learning_rate).minimize(loss)
```

## Defining the train, dev and test set

Generally you would define 3 sets:
* A set to train on: Train set
* A set to tune the hyper parameters on: Dev set
* A set to test the generalization performance of the network: Test set

In the case of sine wave this is a bit useless. The dev set and test set overlap because of the periodic nature of the sine wave. I added noise to the source signal to make the train, dev and test set at least partly independent.


```python

start_indices = np.linspace(
    0,
    sample_length-sequence_length-prediction_length-1,
    sample_length-sequence_length-prediction_length-1, dtype= np.int32)

#When you have many examples then you can get away with tiny sizes for the dev and test set.
dev_size_perc = 0.20
test_size_perc = 0.20
batch_size = 128 #512 

dev_size = int(np.floor(start_indices.shape[0] * dev_size_perc))
test_size  = int(np.floor(start_indices.shape[0] * test_size_perc))
train_size = start_indices.shape[0] - test_size - dev_size
train_batch_count = int(np.floor(train_size / batch_size))
dev_batch_count = int(np.floor(dev_size / batch_size))
test_batch_count = int(np.floor(test_size / batch_size))

print("dataset size %d" %(start_indices.shape[0]))
print("%d Examples (%d batches) in train set" %(train_size, train_batch_count))
print("%d Examples (%d batches) in dev set" %(dev_size,dev_batch_count))
print("%d Examples (%d batches) in test set" %(test_size,test_batch_count))


```

    dataset size 49899
    29941 Examples (233 batches) in train set
    9979 Examples (77 batches) in dev set
    9979 Examples (77 batches) in test set


## Creating batches

The network will be trained using mini batches. This speeds up training because a network training step is performed after each mini batch in contrast to updating after presenting the complete training set.


```python
#A batch of examples can start at an arbitrary index in the source signal. 
# Shuffle the indices to fill the train. dev and test set with different sequences

np.random.shuffle (start_indices)
train_indices = start_indices[0:int(train_size)]
dev_indices= start_indices[int(train_size):int(train_size+dev_size)]
test_indices = start_indices[int(train_size+dev_size):int(train_size+dev_size+test_size)]

def get_batch(batch_index, indexes, size=batch_size):
    batch_start_indexes = indexes[batch_index*size:batch_index*size+size]
    batch_inputs = np.zeros((size,sequence_length, input_feature_count))
    batch_targets = np.zeros((size,prediction_length))
    for i in range(size):
        se = batch_start_indexes[i]
        part = signal_amp[se:se+sequence_length]
        batch_inputs[i,0:sequence_length,0] = part
        batch_targets[i,0] = signal_amp[se+sequence_length+1]

    return batch_inputs,batch_targets

batch_inputs,batch_targets = get_batch(train_batch_count-1,train_indices)
print(batch_inputs.shape,batch_targets.shape)

example_inputs = batch_inputs[0,:,:]
example_targets =  batch_targets[0,:]
print(example_inputs.shape)

#plot a single example
b_i = 1
b_s = batch_inputs[b_i,0:sequence_length,0]
plotly.offline.iplot({
    "data": [Scatter(y=b_s)],
    "layout": Layout(title="")
})
```

    (128, 100, 1) (128, 1)
    (100, 1)



<div id="87475023-6910-45cc-bcb2-6c88962db2b2" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("87475023-6910-45cc-bcb2-6c88962db2b2", [{"type": "scatter", "y": [0.25586661578062775, 0.2113902778682897, 0.1275118204883805, 0.06328061795923293, 0.0025380759035408106, -0.042139754445326714, -0.10724852835645043, -0.14661883556485647, -0.2623907446643743, -0.292931513325702, -0.33224915498115193, -0.41104824477110735, -0.4346793915154579, -0.5333705254046659, -0.5821664718161046, -0.6093779725070855, -0.6481005852724403, -0.7295331653603472, -0.7287415260439547, -0.8040143490229175, -0.8556579784536297, -0.8521535015942178, -0.8682193632268257, -0.9201712034896309, -0.9522706423497216, -0.9356716037774885, -0.9954595265343607, -0.9509569237274775, -0.9852313501079415, -0.9964143379548179, -0.983716834683751, -0.9940044131736233, -0.9935934662936032, -0.9596059778107673, -1.0327593153162633, -0.9379936804318362, -0.9418303022300529, -0.864874000188041, -0.8296578849855012, -0.7827595897627194, -0.7603092238080611, -0.7329860959434612, -0.6795443712962281, -0.638720720811216, -0.6344464917480599, -0.5351437580278402, -0.5069750751946241, -0.43592801418367527, -0.42553010705565747, -0.3260004392940707, -0.2337441453861695, -0.1912857401151467, -0.14310463979031995, -0.08443700533995716, -0.022909731499399386, 0.08680612428794507, 0.1205938365989491, 0.16986562303647462, 0.2207759453286145, 0.33245444640441263, 0.3450980717833889, 0.41158331241583473, 0.5121225114498174, 0.5548016799408272, 0.5847807549267087, 0.6389404755722021, 0.6984125713050864, 0.705760382413495, 0.7732287045798187, 0.7989972621414547, 0.8330600711854514, 0.8750351317908898, 0.8828714219736365, 0.9104599887408784, 0.9090238136663011, 0.989626996181425, 0.9529198495236159, 1.009809262811336, 0.9941091556245714, 1.0003176110163716, 1.016612328322244, 1.0160242423888497, 1.0105604882364612, 0.9705401299558875, 0.949562062482992, 0.9505571284343388, 0.9219776749920697, 0.889598781529184, 0.8647821311630576, 0.795138421281014, 0.7751283722862748, 0.7249610450688796, 0.6806197233982677, 0.6422932807599323, 0.5989253068423827, 0.5409844046117515, 0.49720280800050387, 0.44628772874849854, 0.3779544914735879, 0.3375525617282487]}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


## Test training using a single batch
In the next cell I check if I can train the network on one single batch. Just to check if the optimizer is indeed able to train the network. Successful training should decrease the loss. In the output you will see the loss decreasing (first column)


```python
np.random.shuffle (start_indices)
train_indices = start_indices[0:int(train_size)]
dev_indices= start_indices[int(train_size):int(train_size+dev_size)]
test_indices = start_indices[int(train_size+dev_size):int(train_size+dev_size+test_size)]

zero_state_packed = np.zeros((batch_size, get_network_state_size(hidden_network)))


init=tf.global_variables_initializer()
with tf.Session() as sess:
    sess.run(init)

    np.random.shuffle (train_indices)
    
    batch_inputs,batch_targets = get_batch(0, train_indices)
    print("batch input shape", batch_inputs.shape)
    #v_outputs, v_state = sess.run([outputs,state], feed_dict={inputs: batch_inputs, targets: batch_targets})
    v_predictions, v_state_unpacked = sess.run([predictions, state_unpacked_network_out], 
                                      feed_dict={
                                          inputs: batch_inputs, 
                                          targets: batch_targets,
                                          initial_state_packed: zero_state_packed
                                      })
    print(v_predictions.shape)
    print(v_predictions[0],batch_targets[0])
    for i in range(0,120):
        v_predictions, v_outputs, v_state_unpacked, v_loss, v_opt = sess.run(
            [predictions, outputs, state_unpacked_network_out, loss, opt], 
            feed_dict={
                learning_rate: 0.02, 
                inputs: batch_inputs, 
                targets: batch_targets,
                state_unpacked: v_state_unpacked
            }) #})
        if i % 10 == 0:
            print(v_loss,v_predictions[0],batch_targets[0])
 

    
    
```

    batch input shape (128, 100, 1)
    (128, 1)
    [ 0.04703456] [-0.66767944]
    69.1535 [ 0.04703381] [-0.66767944]
    2.39038 [-0.71438432] [-0.66767944]
    0.769588 [-0.72163767] [-0.66767944]
    0.238517 [-0.71686089] [-0.66767944]
    0.133357 [-0.67176348] [-0.66767944]
    0.130659 [-0.67786527] [-0.66767944]
    0.102174 [-0.66787326] [-0.66767944]
    0.0939764 [-0.68473738] [-0.66767944]
    0.0897313 [-0.6789692] [-0.66767944]
    0.0882396 [-0.6785149] [-0.66767944]
    0.0865416 [-0.68145192] [-0.66767944]
    0.0851147 [-0.67975515] [-0.66767944]


## Training and Testing

Finally we can train and test the network. The training consists of 'epochs' during which all training batches are presented. After presenting a single training batch the network is immediately optimized. After an epoch the loss is calculated over the dev set and printed. 

Next a graph is plotted which shows an example of the network predicting a sine wave. The prediction is based on first 'priming' the network by presenting part of a sine. 

After completing training on a number of epochs. The last predictions is executed over a longer time period.


```python
np.random.shuffle (start_indices)

#create a randomized train, dev and test set
train_indices = start_indices[0:int(train_size)]
dev_indices= start_indices[int(train_size):int(train_size+dev_size)]
test_indices = start_indices[int(train_size+dev_size):int(train_size+dev_size+test_size)]


#initialization of the network states for a single mini batch, by setting them to zero
#You could also initialize by using random states.
batch_zero_state_packed = np.zeros((batch_size, get_network_state_size(hidden_network)))


epoch_count = 10

#Store the performance over the dev set in loss_results
loss_results = np.zeros((epoch_count,2))

def get_loss(set_name, bsz, example_set_indices):
    """Calculate a score over all batches in a set"""
    epoch_loss = 0.0
    for example_index in range(bsz):
        batch_inputs,batch_targets = get_batch(example_index, example_set_indices)

        batch_loss = sess.run(loss,feed_dict={
            inputs:batch_inputs,
            targets:batch_targets,
            initial_state_packed: batch_zero_state_packed
        })
        if example_index % 20 == 0:
            print("  %s results batch %d, loss %s" %(  set_name, example_index, str(batch_loss)))  

        epoch_loss += batch_loss
    return epoch_loss / len(example_set_indices)

def generate_graph(graph_size=200):
    """Use the network to generate a graph"""
    
    #The network will be primed using prime_size samples of the original signal
    prime_size = 50
    prime_signal_start_i = 0
    
    #put prime_size samples of the original signal in tmp_singal
    orig_signal = np.zeros((graph_size,1))
    tmp_signal = np.zeros((graph_size,1))
    tmp_signal[0:prime_size,0] = signal_amp[prime_signal_start_i:(prime_signal_start_i+prime_size)]
    orig_signal[0:graph_size,0] = signal_amp[prime_signal_start_i:(prime_signal_start_i+graph_size)]
    
    #create a sequence for a batch_size of 1
    seq = np.zeros((1,sequence_length,1))
    seq_state_packed = np.zeros((1, get_network_state_size(hidden_network)))
    
    _state_unpacked = None
    #generate the graph
    for end in range(prime_size, graph_size):
        #get a sequence to present to the network
        seq[0,:,0] = tmp_signal.take(range((end-sequence_length),end), mode='wrap')
        
        #get a prediction
        seq_state_packed , _prediction = sess.run(
            [state_packed_network_out, predictions[0,0]], 
            feed_dict={
                initial_state_packed: seq_state_packed,
                inputs: seq})
        #put the prediction in the graph
        tmp_signal[end,0] = _prediction
        sys.stdout.write('.')
        sys.stdout.flush()
    print("")
    plotly.offline.iplot({
       "data": [Scatter(name="predicted",y=tmp_signal[:,0]),Scatter(name="original",y=orig_signal[:,0])],
       "layout": Layout(title="")})


init=tf.global_variables_initializer()
with tf.Session() as sess:
    sess.run(init)



    for epoch in range(0,epoch_count):
        print("Epoch %d" %(epoch))
        #in every epoch go through the training set in a different order
        np.random.shuffle (train_indices)
        print("Train")
        for ti in range(train_batch_count):
            batch_inputs,batch_targets = get_batch(ti, train_indices)

            #train the network
            #I reset the state to zero for each batch. 
            batch_train_loss, _ = sess.run([loss, opt], 
                                           feed_dict={
                                               learning_rate: 0.00005, 
                                               inputs: batch_inputs, 
                                               targets: batch_targets,
                                               initial_state_packed: batch_zero_state_packed
                                           })
            sys.stdout.write('.')
            sys.stdout.flush()
        print("")
        epoch_train_loss = get_loss("Train", train_batch_count, train_indices)
        print("Training results epoch %d, loss %s" %( epoch, str(epoch_train_loss)))
        epoch_dev_loss = get_loss("Dev", dev_batch_count, dev_indices)    
        print("Dev results epoch %d, loss %s" %( epoch, str(epoch_dev_loss)))  
        loss_results[epoch,0] = epoch_train_loss
        loss_results[epoch,1] = epoch_dev_loss
        ti += 1
        generate_graph()
        
    #generate a last long graph
    generate_graph(graph_size=1000)
    
    plotly.offline.iplot({
       "data": [Scatter(name="loss train",y=loss_results[:,0]),Scatter(name="loss dev",y=loss_results[:,1])],
       "layout": Layout(title="")})

        
```

    Epoch 0
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 54.9094
      Train results batch 20, loss 52.7554
      Train results batch 40, loss 57.1101
      Train results batch 60, loss 56.6699
      Train results batch 80, loss 52.1481
      Train results batch 100, loss 55.9796
      Train results batch 120, loss 58.3971
      Train results batch 140, loss 44.4456
      Train results batch 160, loss 48.3201
      Train results batch 180, loss 48.1845
      Train results batch 200, loss 55.2113
      Train results batch 220, loss 54.7782
    Training results epoch 0, loss 0.420098819824
      Dev results batch 0, loss 51.6062
      Dev results batch 20, loss 53.5696
      Dev results batch 40, loss 50.2322
      Dev results batch 60, loss 51.0714
    Dev results epoch 0, loss 0.407184930349
    ......................................................................................................................................................



<div id="5d6021d7-c3eb-412e-be37-8fdf2afc908e" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("5d6021d7-c3eb-412e-be37-8fdf2afc908e", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.005601468496024609, -0.013249159790575504, -0.02064664661884308, -0.027528097853064537, -0.03366279602050781, -0.038902245461940765, -0.04317876696586609, -0.04648983106017113, -0.04887910932302475, -0.05041910707950592, -0.05119746923446655, -0.051307279616594315, -0.050840768963098526, -0.04988567531108856, -0.04852321371436119, -0.046827442944049835, -0.04486522451043129, -0.04269647225737572, -0.04037455841898918, -0.03794688731431961, -0.03545522317290306, -0.03293618932366371, -0.030421549454331398, -0.02793857455253601, -0.025510381907224655, -0.02315612882375717, -0.02089136652648449, -0.018728366121649742, -0.01667635701596737, -0.01474183239042759, -0.012928898446261883, -0.011239511892199516, -0.009673808701336384, -0.008230343461036682, -0.006906399969011545, -0.005698183085769415, -0.004601054824888706, -0.003609755542129278, -0.002718555275350809, -0.0019214242929592729, -0.0012121425243094563, -0.0005844623083248734, -3.213959280401468e-05, 0.00045093928929418325, 0.000870705465786159, 0.0012328739976510406, 0.0015429056948050857, 0.0018059489084407687, 0.002026879694312811, 0.0022102422080934048, 0.0023602615110576153, 0.002480857539921999, 0.0025756810791790485, 0.002647999208420515, 0.0027008880861103535, 0.002737038768827915, 0.002758917398750782, 0.002768722828477621, 0.0027684769593179226, 0.0027599320746958256, 0.002744607627391815, 0.0027239364571869373, 0.002699078992009163, 0.002671053633093834, 0.002640808466821909, 0.0026091490872204304, 0.0025766794569790363, 0.0025439318269491196, 0.0025113942101597786, 0.0024794721975922585, 0.002448439598083496, 0.0024185283109545708, 0.002389931585639715, 0.0023628119379281998, 0.002337210811674595, 0.002313238102942705, 0.0022908314131200314, 0.002270056400448084, 0.002250854391604662, 0.0022331909276545048, 0.002217064145952463, 0.0022023399360477924, 0.002188974991440773, 0.002176918089389801, 0.0021660965867340565, 0.00215635122731328, 0.0021476740948855877, 0.002139927353709936, 0.002133057452738285, 0.0021270220167934895, 0.0021216641180217266, 0.0021169697865843773, 0.002112885471433401, 0.002109306864440441, 0.002106253057718277, 0.002103582490235567, 0.0021013296209275723, 0.0020993798971176147, 0.002097737044095993, 0.002096350770443678, 0.0020951833575963974, 0.002094212919473648, 0.0020934613421559334, 0.0020929090678691864, 0.0020925188437104225, 0.0020922659896314144, 0.002092139795422554, 0.002092098817229271, 0.0020921421237289906, 0.002092250157147646, 0.002092416863888502, 0.002092626877129078, 0.002092869020998478, 0.0020931269973516464, 0.0020934082567691803, 0.0020937020890414715, 0.0020939954556524754, 0.002094293013215065, 0.002094594296067953, 0.002094878349453211, 0.002095166128128767, 0.0020954348146915436, 0.002095696981996298, 0.002095945179462433, 0.002096181269735098, 0.0020964015275239944, 0.002096611075103283, 0.0020968103781342506, 0.0020969933830201626, 0.0020971600897610188, 0.002097316086292267, 0.0020974604412913322, 0.002097591757774353, 0.002097709570080042, 0.0020978194661438465, 0.0020979149267077446, 0.00209799874573946, 0.002098080702126026, 0.0020981477573513985, 0.0020982148125767708, 0.002098263707011938, 0.0020983112044632435, 0.002098355907946825, 0.0020983899012207985, 0.002098425291478634, 0.002098450902849436, 0.002098474185913801, 0.002098493278026581, 0.002098511904478073, 0.002098522149026394], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 1
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 21.4379
      Train results batch 20, loss 20.0213
      Train results batch 40, loss 21.2412
      Train results batch 60, loss 19.3035
      Train results batch 80, loss 22.9997
      Train results batch 100, loss 22.1121
      Train results batch 120, loss 19.6073
      Train results batch 140, loss 20.3425
      Train results batch 160, loss 19.6809
      Train results batch 180, loss 25.0082
      Train results batch 200, loss 22.1662
      Train results batch 220, loss 24.211
    Training results epoch 1, loss 0.163680443564
      Dev results batch 0, loss 19.6441
      Dev results batch 20, loss 20.6591
      Dev results batch 40, loss 21.2059
      Dev results batch 60, loss 19.5042
    Dev results epoch 1, loss 0.15843713808
    ......................................................................................................................................................



<div id="d39a9b9f-b96b-4fed-9b9e-73591307bd4b" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("d39a9b9f-b96b-4fed-9b9e-73591307bd4b", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, 0.10860691219568253, 0.07526109367609024, 0.04220758378505707, 0.009749842807650566, -0.021887047216296196, -0.05253436788916588, -0.08205200731754303, -0.11031230539083481, -0.13719366490840912, -0.1625797003507614, -0.1863609403371811, -0.20843838155269623, -0.22872641682624817, -0.24715648591518402, -0.26367834210395813, -0.27826210856437683, -0.2908985912799835, -0.3015992343425751, -0.31039509177207947, -0.3173358142375946, -0.32248803973197937, -0.32593274116516113, -0.32776349782943726, -0.328083336353302, -0.3270025849342346, -0.32463595271110535, -0.321100115776062, -0.31651148200035095, -0.3109845817089081, -0.3046300411224365, -0.297553688287735, -0.2898555099964142, -0.28162938356399536, -0.27296268939971924, -0.26393604278564453, -0.25462377071380615, -0.24509431421756744, -0.23540981113910675, -0.2256273329257965, -0.2157987356185913, -0.20597131550312042, -0.1961877942085266, -0.1864871382713318, -0.1769045740365982, -0.16747188568115234, -0.15821772813796997, -0.14916770160198212, -0.14034463465213776, -0.13176894187927246, -0.1234583631157875, -0.11542849242687225, -0.10769294947385788, -0.10026068985462189, -0.09314226359128952, -0.08634332567453384, -0.07987060397863388, -0.0737282931804657, -0.06791924685239792, -0.062443748116493225, -0.05730133131146431, -0.052492812275886536, -0.04801313579082489, -0.04385992884635925, -0.04003000259399414, -0.03651626408100128, -0.03331027925014496, -0.03040785901248455, -0.027801401913166046, -0.025481538847088814, -0.023438064381480217, -0.02166237123310566, -0.020144645124673843, -0.018874751403927803, -0.017840074375271797, -0.017031937837600708, -0.01643669418990612, -0.016048206016421318, -0.015851028263568878, -0.015836212784051895, -0.01599275879561901, -0.01630650833249092, -0.016770007088780403, -0.017371442168951035, -0.018098585307598114, -0.018940001726150513, -0.019890349358320236, -0.0209345780313015, -0.022066449746489525, -0.023274660110473633, -0.02454676851630211, -0.025879450142383575, -0.02725916914641857, -0.028676766902208328, -0.030125895515084267, -0.03159399703145027, -0.03307799622416496, -0.03456580266356468, -0.036053307354450226, -0.03753243759274483, -0.03899689391255379, -0.04044153541326523, -0.041853904724121094, -0.04323451220989227, -0.04457885026931763, -0.04588273912668228, -0.04714261740446091, -0.048355259001255035, -0.04951776564121246, -0.050627805292606354, -0.05168336629867554, -0.052682846784591675, -0.05362498387694359, -0.05450894311070442, -0.05533408373594284, -0.05610024929046631, -0.05680747330188751, -0.05745607241988182, -0.05804668366909027, -0.05858013033866882, -0.059057481586933136, -0.059479985386133194, -0.0598490834236145, -0.06016644090414047, -0.060433804988861084, -0.060653023421764374, -0.06082611158490181, -0.06095515191555023, -0.061042286455631256, -0.06108982861042023, -0.061100006103515625, -0.061075106263160706, -0.061017464846372604, -0.060929425060749054, -0.060813311487436295, -0.06067142263054848, -0.06050606071949005, -0.0603194460272789, -0.0601138174533844, -0.05989132821559906, -0.05965401604771614, -0.059403952211141586, -0.059143126010894775, -0.05887334421277046, -0.058596476912498474, -0.05831420049071312, -0.0580282062292099, -0.05774001404643059, -0.05745106190443039, -0.057162754237651825, -0.056876372545957565], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 2
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 1.25657
      Train results batch 20, loss 1.24823
      Train results batch 40, loss 1.5213
      Train results batch 60, loss 1.51712
      Train results batch 80, loss 1.37371
      Train results batch 100, loss 1.52443
      Train results batch 120, loss 1.04627
      Train results batch 140, loss 1.12556
      Train results batch 160, loss 1.01674
      Train results batch 180, loss 1.34206
      Train results batch 200, loss 1.23301
      Train results batch 220, loss 1.15482
    Training results epoch 2, loss 0.00969723457763
      Dev results batch 0, loss 1.21576
      Dev results batch 20, loss 1.2668
      Dev results batch 40, loss 1.44446
      Dev results batch 60, loss 1.07501
    Dev results epoch 2, loss 0.00952362719155
    ......................................................................................................................................................



<div id="eca27cbe-039a-4ab8-b25c-c41205f932fb" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("eca27cbe-039a-4ab8-b25c-c41205f932fb", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.047337375581264496, -0.1323918104171753, -0.19982628524303436, -0.2696285843849182, -0.34121155738830566, -0.41370540857315063, -0.4860713481903076, -0.557161808013916, -0.6258109211921692, -0.6909371614456177, -0.7516312599182129, -0.8072094917297363, -0.857224702835083, -0.9014379978179932, -0.9397685527801514, -0.972231924533844, -0.9988845586776733, -1.0197808742523193, -1.0349481105804443, -1.0443816184997559, -1.0480594635009766, -1.0459719896316528, -1.038161277770996, -1.0247597694396973, -1.0060163736343384, -0.9823037981987, -0.9541059732437134, -0.9219832420349121, -0.8865299224853516, -0.848328709602356, -0.8079109191894531, -0.7657309174537659, -0.7221536636352539, -0.6774550080299377, -0.6318315267562866, -0.5854169726371765, -0.538301408290863, -0.4905511140823364, -0.4422259032726288, -0.3933943510055542, -0.34414297342300415, -0.29458296298980713, -0.24485032260417938, -0.19510376453399658, -0.14551779627799988, -0.09627611190080643, -0.04756295680999756, 0.0004443470388650894, 0.04758208990097046, 0.09370473027229309, 0.1386886090040207, 0.18243011832237244, 0.22487300634384155, 0.26594778895378113, 0.30563098192214966, 0.34388554096221924, 0.3806929886341095, 0.416035920381546, 0.44990262389183044, 0.48226937651634216, 0.5130873322486877, 0.5423169732093811, 0.5698810815811157, 0.5956839323043823, 0.619621753692627, 0.6415719985961914, 0.6613832712173462, 0.6789012551307678, 0.6939705610275269, 0.7064360976219177, 0.7161454558372498, 0.7229596972465515, 0.7267566323280334, 0.727437436580658, 0.7249177694320679, 0.7191431522369385, 0.7100691199302673, 0.6976836919784546, 0.6819847822189331, 0.6629875302314758, 0.6407270431518555, 0.6152404546737671, 0.5865824222564697, 0.5548193454742432, 0.5200251340866089, 0.4822683036327362, 0.4416416585445404, 0.39821964502334595, 0.3520863652229309, 0.30332517623901367, 0.2519821226596832, 0.19812420010566711, 0.1417974978685379, 0.08303331583738327, 0.021898994222283363, -0.04155176877975464, -0.1071663573384285, -0.1747402548789978, -0.24392299354076385, -0.3142152726650238, -0.38495078682899475, -0.45530372858047485, -0.5243237614631653, -0.5910114645957947, -0.6544057130813599, -0.7136567831039429, -0.7680808901786804, -0.8171834945678711, -0.8606489896774292, -0.8983054161071777, -0.9300812482833862, -0.9559575319290161, -0.9759361743927002, -0.9900179505348206, -0.9982038736343384, -1.0005098581314087, -0.996994137763977, -0.9877884387969971, -0.9731222987174988, -0.9533342719078064, -0.9288647174835205, -0.9002329111099243, -0.867998480796814, -0.8327232003211975, -0.7949333786964417, -0.7550920844078064, -0.7135846018791199, -0.6707144975662231, -0.6267099380493164, -0.5817360281944275, -0.5359128713607788, -0.4893321096897125, -0.44207435846328735, -0.39422333240509033, -0.34587621688842773, -0.2971504330635071, -0.2481852024793625, -0.19913983345031738, -0.1501885950565338, -0.10151495784521103, -0.053302519023418427, -0.005729049444198608, 0.04104034602642059, 0.08685848116874695, 0.13159865140914917, 0.17515665292739868, 0.2174503654241562, 0.2584182322025299, 0.2980162799358368, 0.3362142741680145], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 3
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.179961
      Train results batch 20, loss 0.153622
      Train results batch 40, loss 0.207009
      Train results batch 60, loss 0.189542
      Train results batch 80, loss 0.156345
      Train results batch 100, loss 0.205141
      Train results batch 120, loss 0.145814
      Train results batch 140, loss 0.153639
      Train results batch 160, loss 0.185179
      Train results batch 180, loss 0.170148
      Train results batch 200, loss 0.184466
      Train results batch 220, loss 0.198975
    Training results epoch 3, loss 0.00135172683512
      Dev results batch 0, loss 0.182201
      Dev results batch 20, loss 0.171388
      Dev results batch 40, loss 0.174947
      Dev results batch 60, loss 0.157753
    Dev results epoch 3, loss 0.00133814723993
    ......................................................................................................................................................



<div id="89ab0cc8-046e-4a5d-921d-b9914eb5d094" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("89ab0cc8-046e-4a5d-921d-b9914eb5d094", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.11836187541484833, -0.2104579508304596, -0.2705778181552887, -0.333130419254303, -0.39735138416290283, -0.4622114896774292, -0.5266283750534058, -0.5895310044288635, -0.6499321460723877, -0.706990659236908, -0.7600535750389099, -0.8086715340614319, -0.8525879383087158, -0.8917085528373718, -0.9260598421096802, -0.9557432532310486, -0.9808914661407471, -1.001632571220398, -1.018060564994812, -1.0302177667617798, -1.0380845069885254, -1.0415830612182617, -1.040590763092041, -1.0349674224853516, -1.0245907306671143, -1.0093952417373657, -0.9894078969955444, -0.9647701978683472, -0.9357398748397827, -0.9026743769645691, -0.8659965991973877, -0.8261523246765137, -0.7835692763328552, -0.7386239767074585, -0.6916237473487854, -0.6428011655807495, -0.592320442199707, -0.5402944684028625, -0.48680579662323, -0.4319290518760681, -0.37575164437294006, -0.31839150190353394, -0.26000645756721497, -0.2007972151041031, -0.14100392162799835, -0.0808962732553482, -0.020760612562298775, 0.0391153022646904, 0.09845532476902008, 0.1570061296224594, 0.21454650163650513, 0.2708895802497864, 0.3259124159812927, 0.3794928193092346, 0.43156856298446655, 0.48207181692123413, 0.5309557318687439, 0.5781697034835815, 0.6236541271209717, 0.6673156023025513, 0.7090094089508057, 0.7485655546188354, 0.7857480049133301, 0.820277988910675, 0.8518509864807129, 0.8801442384719849, 0.90482497215271, 0.9255900979042053, 0.9421795606613159, 0.9543901681900024, 0.9620793461799622, 0.9651733636856079, 0.9636602401733398, 0.9575831890106201, 0.9470210671424866, 0.9320859313011169, 0.9128970503807068, 0.8895937204360962, 0.8623107671737671, 0.8311886787414551, 0.7963790893554688, 0.7580352425575256, 0.7163334488868713, 0.671471893787384, 0.6236717700958252, 0.5731618404388428, 0.5202052593231201, 0.46505048871040344, 0.4079492688179016, 0.3491382598876953, 0.28879374265670776, 0.22708389163017273, 0.1641215831041336, 0.09996822476387024, 0.03468579053878784, -0.03171299397945404, -0.09914585947990417, -0.16750827431678772, -0.23657405376434326, -0.3059934377670288, -0.3752748370170593, -0.4438040852546692, -0.510825514793396, -0.5755542516708374, -0.6372364163398743, -0.6952060461044312, -0.7489322423934937, -0.798043966293335, -0.8423298001289368, -0.8817174434661865, -0.9162401556968689, -0.9459975361824036, -0.9711160659790039, -0.9917161464691162, -1.0078846216201782, -1.019657015800476, -1.0270103216171265, -1.0298677682876587, -1.028116226196289, -1.0216343402862549, -1.0103297233581543, -0.9941761493682861, -0.9732444882392883, -0.947719156742096, -0.9178926348686218, -0.8841454982757568, -0.8469074964523315, -0.8066178560256958, -0.7636862397193909, -0.7184664011001587, -0.6712406277656555, -0.6222196817398071, -0.5715527534484863, -0.5193451046943665, -0.46567851305007935, -0.41063499450683594, -0.3543144464492798, -0.29685017466545105, -0.2384156584739685, -0.17922580242156982, -0.1195310652256012, -0.059606172144412994, 0.00026324018836021423, 0.05979476869106293, 0.11872164160013199, 0.17680354416370392, 0.2338329255580902, 0.28963974118232727, 0.3440904915332794, 0.39708584547042847], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 4
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.0727791
      Train results batch 20, loss 0.0689376
      Train results batch 40, loss 0.0716537
      Train results batch 60, loss 0.0817372
      Train results batch 80, loss 0.0861643
      Train results batch 100, loss 0.0728834
      Train results batch 120, loss 0.0586975
      Train results batch 140, loss 0.065918
      Train results batch 160, loss 0.0647993
      Train results batch 180, loss 0.0598816
      Train results batch 200, loss 0.0765543
      Train results batch 220, loss 0.0749957
    Training results epoch 4, loss 0.000547558254865
      Dev results batch 0, loss 0.0717915
      Dev results batch 20, loss 0.0704993
      Dev results batch 40, loss 0.0613825
      Dev results batch 60, loss 0.0708818
    Dev results epoch 4, loss 0.00054083534219
    ......................................................................................................................................................



<div id="ffb3c348-1f58-4a38-bcd5-05ddb4298385" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("ffb3c348-1f58-4a38-bcd5-05ddb4298385", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.13251736760139465, -0.2207576483488083, -0.2766819894313812, -0.3349708616733551, -0.3948422074317932, -0.45530396699905396, -0.5153570771217346, -0.5740455389022827, -0.6305102109909058, -0.6840276122093201, -0.7340376973152161, -0.780148983001709, -0.8221283555030823, -0.8598795533180237, -0.89341139793396, -0.92280513048172, -0.948181688785553, -0.969670295715332, -0.9873833060264587, -1.0013952255249023, -1.0117281675338745, -1.0183438062667847, -1.0211433172225952, -1.0199764966964722, -1.0146610736846924, -1.0050135850906372, -0.9908846020698547, -0.9721959233283997, -0.9489693641662598, -0.9213409423828125, -0.8895531296730042, -0.8539313077926636, -0.8148465752601624, -0.772675096988678, -0.7277621030807495, -0.6803986430168152, -0.6308103203773499, -0.5791624188423157, -0.5255725383758545, -0.47013190388679504, -0.4129294753074646, -0.3540731370449066, -0.29370972514152527, -0.23203447461128235, -0.16929474472999573, -0.10578303039073944, -0.04182605445384979, 0.02223263494670391, 0.08604878187179565, 0.14929474890232086, 0.21167197823524475, 0.27291786670684814, 0.33284035325050354, 0.3912566602230072, 0.44805410504341125, 0.5031248927116394, 0.5563919544219971, 0.6077812314033508, 0.6572132110595703, 0.7045738697052002, 0.7496930360794067, 0.7923698425292969, 0.8323301672935486, 0.8692527413368225, 0.9027904868125916, 0.9325827360153198, 0.9582701325416565, 0.9795382022857666, 0.9961339235305786, 1.0078791379928589, 1.0146735906600952, 1.016495943069458, 1.0133945941925049, 1.0054733753204346, 0.9928678870201111, 0.975740373134613, 0.9542497992515564, 0.9285677671432495, 0.8988530039787292, 0.8652647733688354, 0.8279723525047302, 0.787147045135498, 0.7429881691932678, 0.6957244873046875, 0.6456137895584106, 0.5929291844367981, 0.537983238697052, 0.481075257062912, 0.42250731587409973, 0.3625624179840088, 0.30145615339279175, 0.23939071595668793, 0.1765051931142807, 0.11287912726402283, 0.048586685210466385, -0.01635868474841118, -0.08188475668430328, -0.14791589975357056, -0.21427765488624573, -0.28070035576820374, -0.3468030095100403, -0.4121137261390686, -0.47602468729019165, -0.5379052758216858, -0.5971406102180481, -0.6531714200973511, -0.7055335640907288, -0.7538817524909973, -0.7979981899261475, -0.8377822637557983, -0.8732317686080933, -0.9044167995452881, -0.9314497113227844, -0.9544580578804016, -0.9735584855079651, -0.9888359904289246, -1.0003273487091064, -1.0080125331878662, -1.0118110179901123, -1.0115907192230225, -1.007185459136963, -0.998423159122467, -0.9851621985435486, -0.9673260450363159, -0.9449333548545837, -0.9181125164031982, -0.8870972990989685, -0.8522050976753235, -0.8138007521629333, -0.7722581624984741, -0.7279235124588013, -0.681091845035553, -0.6319953203201294, -0.5808061957359314, -0.5276481509208679, -0.47261735796928406, -0.41580528020858765, -0.3573205769062042, -0.2973077595233917, -0.23595887422561646, -0.17351600527763367, -0.11026670038700104, -0.04653269425034523, 0.017346369102597237, 0.08102935552597046, 0.1441900134086609, 0.20652934908866882, 0.26778626441955566, 0.3277421295642853, 0.38622206449508667], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 5
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.0688844
      Train results batch 20, loss 0.0541076
      Train results batch 40, loss 0.065995
      Train results batch 60, loss 0.056871
      Train results batch 80, loss 0.0703863
      Train results batch 100, loss 0.0622354
      Train results batch 120, loss 0.0632361
      Train results batch 140, loss 0.0497587
      Train results batch 160, loss 0.0681106
      Train results batch 180, loss 0.0735378
      Train results batch 200, loss 0.0551927
      Train results batch 220, loss 0.0586691
    Training results epoch 5, loss 0.000470599653114
      Dev results batch 0, loss 0.0599357
      Dev results batch 20, loss 0.060271
      Dev results batch 40, loss 0.0517052
      Dev results batch 60, loss 0.0637929
    Dev results epoch 5, loss 0.000465033017603
    ......................................................................................................................................................



<div id="ddc11add-8893-4793-9b84-4af1e9e3cdc3" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("ddc11add-8893-4793-9b84-4af1e9e3cdc3", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.13690879940986633, -0.2249486744403839, -0.280184805393219, -0.33767834305763245, -0.39662474393844604, -0.456028550863266, -0.5149097442626953, -0.5723498463630676, -0.6275380849838257, -0.6798036694526672, -0.7286356091499329, -0.7736813426017761, -0.8147368431091309, -0.851721465587616, -0.8846520781517029, -0.9136110544204712, -0.9387174844741821, -0.9600995182991028, -0.977871298789978, -0.992112398147583, -1.002853512763977, -1.0100675821304321, -1.0136665105819702, -1.0135055780410767, -1.0093988180160522, -1.0011436939239502, -0.9885542392730713, -0.9714982509613037, -0.9499298930168152, -0.9239117503166199, -0.893617570400238, -0.8593158721923828, -0.8213387727737427, -0.7800423502922058, -0.7357676029205322, -0.6888121962547302, -0.6394157409667969, -0.5877569317817688, -0.5339655876159668, -0.478141188621521, -0.4203779697418213, -0.36078786849975586, -0.2995217442512512, -0.23678243160247803, -0.17282909154891968, -0.10797323286533356, -0.042565129697322845, 0.023022033274173737, 0.08841176331043243, 0.15324169397354126, 0.21717943251132965, 0.279929518699646, 0.3412727117538452, 0.4009994864463806, 0.45897817611694336, 0.5150837898254395, 0.5692270398139954, 0.6213245391845703, 0.671290397644043, 0.7190054059028625, 0.7642954587936401, 0.806958019733429, 0.8467202186584473, 0.8832655549049377, 0.9162584543228149, 0.9453554749488831, 0.9702204465866089, 0.9905673861503601, 1.0061755180358887, 1.0168989896774292, 1.0226686000823975, 1.0234898328781128, 1.019432544708252, 1.0106158256530762, 0.9971840977668762, 0.9793023467063904, 0.9571284055709839, 0.9308277368545532, 0.9005506038665771, 0.8664466738700867, 0.8286744356155396, 0.7873944044113159, 0.7427966594696045, 0.6951009035110474, 0.6445592045783997, 0.5914406180381775, 0.5360562801361084, 0.47870662808418274, 0.41969648003578186, 0.35931479930877686, 0.29778510332107544, 0.23532025516033173, 0.1720729023218155, 0.10813994705677032, 0.04361627995967865, -0.021460339426994324, -0.08699017763137817, -0.152870312333107, -0.2189013659954071, -0.2847960889339447, -0.3501684069633484, -0.41455692052841187, -0.4773792028427124, -0.5380463600158691, -0.5959967374801636, -0.6507282257080078, -0.701831042766571, -0.7490079402923584, -0.7920765280723572, -0.8309609889984131, -0.8656735420227051, -0.8962898254394531, -0.9229236841201782, -0.9457026720046997, -0.9647438526153564, -0.9801357388496399, -0.9919214248657227, -1.0000889301300049, -1.0045665502548218, -1.0052262544631958, -1.0018976926803589, -0.994391679763794, -0.982531726360321, -0.9661913514137268, -0.9453259706497192, -0.9199952483177185, -0.890366792678833, -0.8567030429840088, -0.8193297386169434, -0.7785990238189697, -0.7348507642745972, -0.6883845925331116, -0.6394432783126831, -0.5882108807563782, -0.5348219871520996, -0.47938108444213867, -0.4219846725463867, -0.3627459704875946, -0.30181464552879333, -0.23939061164855957, -0.1757289320230484, -0.11113609373569489, -0.0459575429558754, 0.019438080489635468, 0.08467791229486465, 0.14940212666988373, 0.21327902376651764, 0.276015967130661, 0.3373659551143646, 0.3971298038959503], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 6
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.053541
      Train results batch 20, loss 0.0699349
      Train results batch 40, loss 0.0553604
      Train results batch 60, loss 0.0620093
      Train results batch 80, loss 0.0647623
      Train results batch 100, loss 0.0518999
      Train results batch 120, loss 0.0632549
      Train results batch 140, loss 0.0673768
      Train results batch 160, loss 0.0645557
      Train results batch 180, loss 0.0533836
      Train results batch 200, loss 0.0603966
      Train results batch 220, loss 0.0555538
    Training results epoch 6, loss 0.000448670988889
      Dev results batch 0, loss 0.0567565
      Dev results batch 20, loss 0.0563003
      Dev results batch 40, loss 0.0496434
      Dev results batch 60, loss 0.0620466
    Dev results epoch 6, loss 0.000444287580372
    ......................................................................................................................................................



<div id="1e5c37bf-9dc7-45cd-852b-469b8c3c6a23" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("1e5c37bf-9dc7-45cd-852b-469b8c3c6a23", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.13954263925552368, -0.22841617465019226, -0.28380000591278076, -0.3413461148738861, -0.4002281427383423, -0.4594370722770691, -0.5179942846298218, -0.5749959945678711, -0.6296560168266296, -0.6813346147537231, -0.7295522093772888, -0.7739859223365784, -0.8144554495811462, -0.8508988618850708, -0.8833444714546204, -0.9118818640708923, -0.9366330504417419, -0.9577274322509766, -0.9752786755561829, -0.9893664717674255, -1.000022530555725, -1.0072214603424072, -1.0108773708343506, -1.010848045349121, -1.0069479942321777, -0.9989715218544006, -0.9867259860038757, -0.9700654745101929, -0.9489263892173767, -0.9233492016792297, -0.8934848308563232, -0.8595808148384094, -0.8219518065452576, -0.7809407711029053, -0.7368807196617126, -0.6900660991668701, -0.6407342553138733, -0.5890641808509827, -0.5351858139038086, -0.4791994094848633, -0.4211992919445038, -0.3612988293170929, -0.29965147376060486, -0.23646476864814758, -0.17200586199760437, -0.10659700632095337, -0.04060259461402893, 0.025588005781173706, 0.09158018231391907, 0.15699318051338196, 0.22147580981254578, 0.2847151756286621, 0.3464774191379547, 0.4065381586551666, 0.4647550582885742, 0.5209928750991821, 0.5751555562019348, 0.627154529094696, 0.6769015789031982, 0.7242773771286011, 0.7691099047660828, 0.8112041354179382, 0.8502973318099976, 0.886089026927948, 0.9182642102241516, 0.9465042948722839, 0.9705001711845398, 0.9899936318397522, 1.0047898292541504, 1.014765739440918, 1.0198692083358765, 1.0201174020767212, 1.0155853033065796, 1.0063931941986084, 0.9926804304122925, 0.9746050238609314, 0.9523148536682129, 0.925963819026947, 0.8956896662712097, 0.8616290092468262, 0.8239262104034424, 0.7827277183532715, 0.7382087707519531, 0.6905748844146729, 0.6400637030601501, 0.5869308710098267, 0.5314765572547913, 0.4739922881126404, 0.4147782325744629, 0.35412198305130005, 0.2922497093677521, 0.2293817698955536, 0.16568315029144287, 0.10126727819442749, 0.03625207766890526, -0.029298800975084305, -0.09525386989116669, -0.16147683560848236, -0.22773481905460358, -0.29371020197868347, -0.3589932918548584, -0.4231119751930237, -0.4854845404624939, -0.5455374121665955, -0.6027365326881409, -0.6566154956817627, -0.706804096698761, -0.7530432343482971, -0.795184314250946, -0.8331782817840576, -0.8670563697814941, -0.8969069123268127, -0.9228499531745911, -0.9450138807296753, -0.9635152816772461, -0.9784384369850159, -0.9898235201835632, -0.9976547360420227, -1.0018575191497803, -1.002301573753357, -0.9988139271736145, -0.9912027716636658, -0.9792872667312622, -0.9629341959953308, -0.9420902729034424, -0.9168031811714172, -0.8872284293174744, -0.8536142706871033, -0.816273033618927, -0.7755444645881653, -0.7317582964897156, -0.6852051019668579, -0.6361205577850342, -0.584683358669281, -0.5310249924659729, -0.47524866461753845, -0.41745150089263916, -0.3577510118484497, -0.29630330204963684, -0.23331840336322784, -0.169064000248909, -0.10386128723621368, -0.0380723811686039, 0.0279169250279665, 0.09371663630008698, 0.15895061194896698, 0.22327232360839844, 0.2863755226135254, 0.3480019271373749, 0.4079422950744629], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 7
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.0564441
      Train results batch 20, loss 0.0662476
      Train results batch 40, loss 0.0497547
      Train results batch 60, loss 0.0620312
      Train results batch 80, loss 0.0595999
      Train results batch 100, loss 0.0605202
      Train results batch 120, loss 0.0603222
      Train results batch 140, loss 0.0491505
      Train results batch 160, loss 0.0579644
      Train results batch 180, loss 0.0600865
      Train results batch 200, loss 0.0482739
      Train results batch 220, loss 0.0515458
    Training results epoch 7, loss 0.000437071640663
      Dev results batch 0, loss 0.0552906
      Dev results batch 20, loss 0.0541909
      Dev results batch 40, loss 0.0487828
      Dev results batch 60, loss 0.061333
    Dev results epoch 7, loss 0.000433660682277
    ......................................................................................................................................................



<div id="28c46c08-2797-4af1-997e-801ba2ff8ec9" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("28c46c08-2797-4af1-997e-801ba2ff8ec9", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.1418675184249878, -0.23148909211158752, -0.2870100736618042, -0.3446209132671356, -0.40347811579704285, -0.4625629186630249, -0.5208979249000549, -0.57759028673172, -0.6318722367286682, -0.6831268668174744, -0.7308977246284485, -0.7748836874961853, -0.8149221539497375, -0.8509641885757446, -0.8830471634864807, -0.9112652540206909, -0.9357427954673767, -0.9566090703010559, -0.973976731300354, -0.9879239201545715, -0.9984814524650574, -1.0056240558624268, -1.0092658996582031, -1.0092662572860718, -1.0054408311843872, -0.9975844025611877, -0.9855020642280579, -0.9690448045730591, -0.9481423497200012, -0.9228261709213257, -0.8932366967201233, -0.8596102595329285, -0.8222509026527405, -0.7814930081367493, -0.7376627326011658, -0.6910491585731506, -0.6418852210044861, -0.5903468728065491, -0.536561131477356, -0.48062455654144287, -0.4226277470588684, -0.3626805245876312, -0.3009333908557892, -0.2375921905040741, -0.17292475700378418, -0.10725639760494232, -0.040957972407341, 0.025572624057531357, 0.0919288769364357, 0.15771698951721191, 0.2225712239742279, 0.28616398572921753, 0.3482479453086853, 0.4085848927497864, 0.46702131628990173, 0.5234115719795227, 0.5776517987251282, 0.6296480298042297, 0.6793095469474792, 0.7265174388885498, 0.771102249622345, 0.8128753900527954, 0.8515843749046326, 0.8869420289993286, 0.9186500906944275, 0.9464083909988403, 0.9699276685714722, 0.9889686703681946, 1.003353238105774, 1.0129727125167847, 1.0177843570709229, 1.0178120136260986, 1.0131317377090454, 1.0038622617721558, 0.9901387691497803, 0.9721127152442932, 0.9499238729476929, 0.9237172603607178, 0.8936205506324768, 0.8597593307495117, 0.8222662210464478, 0.7812752723693848, 0.7369483709335327, 0.6894774436950684, 0.639087438583374, 0.5860223770141602, 0.5305732488632202, 0.47302520275115967, 0.4136759638786316, 0.3528147041797638, 0.29067230224609375, 0.22747889161109924, 0.16341222822666168, 0.09860178828239441, 0.03318477049469948, -0.03275362774729729, -0.09905906021595001, -0.16557207703590393, -0.2320374995470047, -0.29811984300613403, -0.3633973002433777, -0.4273937940597534, -0.4895305037498474, -0.5492467284202576, -0.6060274243354797, -0.6594296097755432, -0.7091079354286194, -0.7548267245292664, -0.7964575886726379, -0.8339666128158569, -0.8673965334892273, -0.8968417048454285, -0.9224254488945007, -0.9442769885063171, -0.9625108242034912, -0.9772103428840637, -0.9884130358695984, -0.9961017966270447, -1.0002009868621826, -1.0005801916122437, -0.9970675110816956, -0.9894703030586243, -0.9776079058647156, -0.9613448977470398, -0.9406235814094543, -0.9154861569404602, -0.8860802054405212, -0.8526447415351868, -0.8154836893081665, -0.77492755651474, -0.7312988638877869, -0.6848810911178589, -0.635904848575592, -0.5845439434051514, -0.5309256911277771, -0.47514858841896057, -0.4173077344894409, -0.35751670598983765, -0.29593056440353394, -0.23275907337665558, -0.16827234625816345, -0.10279570519924164, -0.036698561161756516, 0.02962421625852585, 0.09577159583568573, 0.16135495901107788, 0.22601434588432312, 0.28943032026290894, 0.3513314127922058, 0.41149669885635376], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 8
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.058103
      Train results batch 20, loss 0.0501114
      Train results batch 40, loss 0.0478091
      Train results batch 60, loss 0.0674866
      Train results batch 80, loss 0.0530147
      Train results batch 100, loss 0.0548249
      Train results batch 120, loss 0.0628589
      Train results batch 140, loss 0.0645167
      Train results batch 160, loss 0.0632368
      Train results batch 180, loss 0.0476007
      Train results batch 200, loss 0.0471682
      Train results batch 220, loss 0.0493235
    Training results epoch 8, loss 0.00043170396977
      Dev results batch 0, loss 0.055131
      Dev results batch 20, loss 0.0531145
      Dev results batch 40, loss 0.0483831
      Dev results batch 60, loss 0.0610029
    Dev results epoch 8, loss 0.000428519506533
    ......................................................................................................................................................



<div id="132605b0-1eb5-44b2-a362-c59fd4013051" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("132605b0-1eb5-44b2-a362-c59fd4013051", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.14460188150405884, -0.2348237931728363, -0.2904691696166992, -0.34815433621406555, -0.4070209562778473, -0.4660416841506958, -0.5242389440536499, -0.580727219581604, -0.6347522139549255, -0.6857133507728577, -0.733171820640564, -0.7768416404724121, -0.8165733814239502, -0.8523277640342712, -0.8841477036476135, -0.9121310114860535, -0.9364017844200134, -0.9570876955986023, -0.9742980599403381, -0.988107442855835, -0.9985419511795044, -1.0055714845657349, -1.0091063976287842, -1.009002447128296, -1.0050735473632812, -0.9971141815185547, -0.9849315881729126, -0.9683793187141418, -0.9473904371261597, -0.9220006465911865, -0.8923532962799072, -0.858686089515686, -0.8213027119636536, -0.7805348038673401, -0.7367041110992432, -0.6900940537452698, -0.6409322619438171, -0.589387834072113, -0.5355817675590515, -0.47960543632507324, -0.4215444028377533, -0.36150476336479187, -0.29963451623916626, -0.23613864183425903, -0.17128583788871765, -0.10540395975112915, -0.03886867314577103, 0.027914904057979584, 0.09453298896551132, 0.16058212518692017, 0.22568680346012115, 0.2895086705684662, 0.35179194808006287, 0.4122879207134247, 0.47083547711372375, 0.5272812843322754, 0.5815150737762451, 0.6334387063980103, 0.6829580068588257, 0.7299526929855347, 0.7742542624473572, 0.8156775236129761, 0.8539761304855347, 0.8888726830482483, 0.9200813174247742, 0.9473171830177307, 0.9703071713447571, 0.9888283610343933, 1.002718448638916, 1.0118811130523682, 1.0162841081619263, 1.0159560441970825, 1.010977029800415, 1.0014642477035522, 0.9875497221946716, 0.9693797826766968, 0.9470869302749634, 0.9208081960678101, 0.890663206577301, 0.8567680716514587, 0.8192464113235474, 0.7782226204872131, 0.7338488698005676, 0.686308741569519, 0.635818600654602, 0.5826152563095093, 0.526984691619873, 0.46920886635780334, 0.4095846712589264, 0.3484037518501282, 0.28590139746665955, 0.22231537103652954, 0.1578327864408493, 0.09259644895792007, 0.026758676394820213, -0.03957769274711609, -0.10623762011528015, -0.17304091155529022, -0.23971176147460938, -0.30589625239372253, -0.37115952372550964, -0.43502023816108704, -0.49690189957618713, -0.5562549829483032, -0.6125824451446533, -0.6654640436172485, -0.7145791053771973, -0.7597143650054932, -0.8007617592811584, -0.8377038836479187, -0.8705934286117554, -0.8995311260223389, -0.9246422052383423, -0.9460542798042297, -0.9638770818710327, -0.9781872034072876, -0.9890143871307373, -0.9963327646255493, -1.000058889389038, -1.0000561475753784, -0.996147871017456, -0.9881422519683838, -0.9758623838424683, -0.9591803550720215, -0.9380496144294739, -0.9125233292579651, -0.8827593326568604, -0.849003791809082, -0.8115629553794861, -0.770764946937561, -0.726925790309906, -0.6803197860717773, -0.6311673521995544, -0.5796319246292114, -0.52583247423172, -0.4698610305786133, -0.4118082821369171, -0.3517872989177704, -0.2899540364742279, -0.22652219235897064, -0.1617671698331833, -0.09602117538452148, -0.029660912230610847, 0.03691112995147705, 0.10328590869903564, 0.16906750202178955, 0.23388877511024475, 0.2974235713481903, 0.35939425230026245, 0.41957417130470276], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    Epoch 9
    Train
    .........................................................................................................................................................................................................................................
      Train results batch 0, loss 0.0510024
      Train results batch 20, loss 0.0479287
      Train results batch 40, loss 0.0584473
      Train results batch 60, loss 0.0485359
      Train results batch 80, loss 0.0615271
      Train results batch 100, loss 0.0570304
      Train results batch 120, loss 0.0464874
      Train results batch 140, loss 0.0617962
      Train results batch 160, loss 0.0486729
      Train results batch 180, loss 0.0585998
      Train results batch 200, loss 0.045459
      Train results batch 220, loss 0.0659634
    Training results epoch 9, loss 0.000429875803059
      Dev results batch 0, loss 0.0545206
      Dev results batch 20, loss 0.0513194
      Dev results batch 40, loss 0.0483249
      Dev results batch 60, loss 0.0622594
    Dev results epoch 9, loss 0.000427906684893
    ......................................................................................................................................................



<div id="cf40cf3b-cdc4-4ed4-852b-86ea123bb95f" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("cf40cf3b-cdc4-4ed4-852b-86ea123bb95f", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.14270515739917755, -0.23368464410305023, -0.28937485814094543, -0.347047358751297, -0.40585362911224365, -0.4647759199142456, -0.5228486657142639, -0.5792010426521301, -0.6330925822257996, -0.6839351058006287, -0.731298565864563, -0.7749040126800537, -0.814604640007019, -0.850361704826355, -0.8822172284126282, -0.9102660417556763, -0.9346293210983276, -0.9554308652877808, -0.972777247428894, -0.9867396354675293, -0.9973416328430176, -1.0045515298843384, -1.0082783699035645, -1.0083777904510498, -1.0046641826629639, -0.9969332218170166, -0.9849926233291626, -0.9686970710754395, -0.9479800462722778, -0.9228765964508057, -0.8935279846191406, -0.8601699471473694, -0.8231033086776733, -0.7826565504074097, -0.7391493320465088, -0.6928628087043762, -0.6440213322639465, -0.5927913784980774, -0.5392893552780151, -0.483600914478302, -0.4258041977882385, -0.36599621176719666, -0.3043150305747986, -0.24095582962036133, -0.1761784553527832, -0.11030478775501251, -0.04370749741792679, 0.023207683116197586, 0.09002181887626648, 0.15632343292236328, 0.22172552347183228, 0.2858771085739136, 0.34850841760635376, 0.40935659408569336, 0.4682479202747345, 0.5250170230865479, 0.5795451998710632, 0.6317276954650879, 0.6814691424369812, 0.7286495566368103, 0.7731044292449951, 0.8146557807922363, 0.8530665636062622, 0.8880693316459656, 0.9193906784057617, 0.9467569589614868, 0.9699054956436157, 0.9886229038238525, 1.002753734588623, 1.0122066736221313, 1.0169519186019897, 1.017020344734192, 1.0124903917312622, 1.0034782886505127, 0.9901138544082642, 0.9725404977798462, 0.9508875012397766, 0.9252869486808777, 0.8958529829978943, 0.862694263458252, 0.825924277305603, 0.7856553196907043, 0.7420254349708557, 0.6952019929885864, 0.6453854441642761, 0.5927984118461609, 0.5377137064933777, 0.4804058074951172, 0.42116862535476685, 0.3602955937385559, 0.2980290949344635, 0.23461684584617615, 0.1702595204114914, 0.1051132082939148, 0.03934219479560852, -0.02694217674434185, -0.09356150776147842, -0.16033872961997986, -0.22700729966163635, -0.2932279109954834, -0.35858288407325745, -0.4226074516773224, -0.48473840951919556, -0.5444324612617493, -0.601193368434906, -0.6545946598052979, -0.7043044567108154, -0.7500960826873779, -0.7918457388877869, -0.8295215368270874, -0.8631640076637268, -0.8928650617599487, -0.9187436699867249, -0.9409255385398865, -0.9595215320587158, -0.9746127128601074, -0.9862350225448608, -0.9943720102310181, -0.9989491701126099, -0.9998384714126587, -0.996869683265686, -0.9898524284362793, -0.9786049723625183, -0.9629892110824585, -0.9429416060447693, -0.9184954166412354, -0.8897883892059326, -0.857049822807312, -0.8205747604370117, -0.780687689781189, -0.737706184387207, -0.6919118165969849, -0.6435324549674988, -0.5927385091781616, -0.5396512150764465, -0.48436063528060913, -0.4269481599330902, -0.3675117492675781, -0.3061887323856354, -0.2431715428829193, -0.17871515452861786, -0.1131359338760376, -0.04680001735687256, 0.01989240013062954, 0.08652772754430771, 0.15269841253757477, 0.21802030503749847, 0.28214573860168457, 0.3447739779949188, 0.4056546688079834], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


    ......................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................



<div id="fd13cde7-4cfe-44dd-a3ab-d9109014d589" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("fd13cde7-4cfe-44dd-a3ab-d9109014d589", [{"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.14270515739917755, -0.23368464410305023, -0.28937485814094543, -0.347047358751297, -0.40585362911224365, -0.4647759199142456, -0.5228486657142639, -0.5792010426521301, -0.6330925822257996, -0.6839351058006287, -0.731298565864563, -0.7749040126800537, -0.814604640007019, -0.850361704826355, -0.8822172284126282, -0.9102660417556763, -0.9346293210983276, -0.9554308652877808, -0.972777247428894, -0.9867396354675293, -0.9973416328430176, -1.0045515298843384, -1.0082783699035645, -1.0083777904510498, -1.0046641826629639, -0.9969332218170166, -0.9849926233291626, -0.9686970710754395, -0.9479800462722778, -0.9228765964508057, -0.8935279846191406, -0.8601699471473694, -0.8231033086776733, -0.7826565504074097, -0.7391493320465088, -0.6928628087043762, -0.6440213322639465, -0.5927913784980774, -0.5392893552780151, -0.483600914478302, -0.4258041977882385, -0.36599621176719666, -0.3043150305747986, -0.24095582962036133, -0.1761784553527832, -0.11030478775501251, -0.04370749741792679, 0.023207683116197586, 0.09002181887626648, 0.15632343292236328, 0.22172552347183228, 0.2858771085739136, 0.34850841760635376, 0.40935659408569336, 0.4682479202747345, 0.5250170230865479, 0.5795451998710632, 0.6317276954650879, 0.6814691424369812, 0.7286495566368103, 0.7731044292449951, 0.8146557807922363, 0.8530665636062622, 0.8880693316459656, 0.9193906784057617, 0.9467569589614868, 0.9699054956436157, 0.9886229038238525, 1.002753734588623, 1.0122066736221313, 1.0169519186019897, 1.017020344734192, 1.0124903917312622, 1.0034782886505127, 0.9901138544082642, 0.9725404977798462, 0.9508875012397766, 0.9252869486808777, 0.8958529829978943, 0.862694263458252, 0.825924277305603, 0.7856553196907043, 0.7420254349708557, 0.6952019929885864, 0.6453854441642761, 0.5927984118461609, 0.5377137064933777, 0.4804058074951172, 0.42116862535476685, 0.3602955937385559, 0.2980290949344635, 0.23461684584617615, 0.1702595204114914, 0.1051132082939148, 0.03934219479560852, -0.02694217674434185, -0.09356150776147842, -0.16033872961997986, -0.22700729966163635, -0.2932279109954834, -0.35858288407325745, -0.4226074516773224, -0.48473840951919556, -0.5444324612617493, -0.601193368434906, -0.6545946598052979, -0.7043044567108154, -0.7500960826873779, -0.7918457388877869, -0.8295215368270874, -0.8631640076637268, -0.8928650617599487, -0.9187436699867249, -0.9409255385398865, -0.9595215320587158, -0.9746127128601074, -0.9862350225448608, -0.9943720102310181, -0.9989491701126099, -0.9998384714126587, -0.996869683265686, -0.9898524284362793, -0.9786049723625183, -0.9629892110824585, -0.9429416060447693, -0.9184954166412354, -0.8897883892059326, -0.857049822807312, -0.8205747604370117, -0.780687689781189, -0.737706184387207, -0.6919118165969849, -0.6435324549674988, -0.5927385091781616, -0.5396512150764465, -0.48436063528060913, -0.4269481599330902, -0.3675117492675781, -0.3061887323856354, -0.2431715428829193, -0.17871515452861786, -0.1131359338760376, -0.04680001735687256, 0.01989240013062954, 0.08652772754430771, 0.15269841253757477, 0.21802030503749847, 0.28214573860168457, 0.3447739779949188, 0.4056546688079834, 0.4645880162715912, 0.5214183330535889, 0.5760230422019958, 0.6282978653907776, 0.6781388521194458, 0.7254251837730408, 0.7700062990188599, 0.8116924166679382, 0.8502544164657593, 0.8854308128356934, 0.9169420003890991, 0.9445096254348755, 0.9678766131401062, 0.9868267774581909, 1.0011996030807495, 1.0108973979949951, 1.0158885717391968, 1.0161999464035034, 1.011907935142517, 1.0031235218048096, 0.9899787306785583, 0.9726122617721558, 0.9511603116989136, 0.9257498979568481, 0.896498441696167, 0.8635154366493225, 0.8269096612930298, 0.7867992520332336, 0.7433199286460876, 0.6966357231140137, 0.6469429135322571, 0.5944730639457703, 0.5394879579544067, 0.4822695255279541, 0.4231087267398834, 0.36228930950164795, 0.3000754117965698, 0.2367023378610611, 0.1723698526620865, 0.10724639892578125, 0.04147717356681824, -0.024799777194857597, -0.09143102169036865, -0.15822188556194305, -0.2249140739440918, -0.29117000102996826, -0.3565692603588104, -0.42062294483184814, -0.4827996492385864, -0.542563796043396, -0.5994152426719666, -0.652923047542572, -0.7027510404586792, -0.74866783618927, -0.7905463576316833, -0.8283513784408569, -0.8621212244033813, -0.8919461965560913, -0.9179449677467346, -0.9402426481246948, -0.9589513540267944, -0.974152684211731, -0.9858847856521606, -0.9941326379776001, -0.9988231658935547, -0.9998304843902588, -0.9969851970672607, -0.9900968074798584, -0.9789837598800659, -0.9635053873062134, -0.9435955286026001, -0.9192847013473511, -0.8907070755958557, -0.858089804649353, -0.8217261433601379, -0.7819403409957886, -0.7390508651733398, -0.6933402419090271, -0.6450384855270386, -0.5943174362182617, -0.5413001179695129, -0.4860765337944031, -0.4287283718585968, -0.3693530559539795, -0.3080860674381256, -0.24511778354644775, -0.18070173263549805, -0.11515229940414429, -0.04883449524641037, 0.017852438613772392, 0.08449485152959824, 0.15068493783473969, 0.2160370945930481, 0.2802031636238098, 0.3428801894187927, 0.40381669998168945, 0.4628112316131592, 0.5197070240974426, 0.5743807554244995, 0.626727819442749, 0.6766442060470581, 0.7240104675292969, 0.7686765193939209, 0.8104543685913086, 0.8491154313087463, 0.8843994140625, 0.9160268306732178, 0.9437190294265747, 0.9672178626060486, 0.9863060712814331, 1.0008203983306885, 1.0106621980667114, 1.0157971382141113, 1.0162506103515625, 1.012097954750061, 1.0034493207931519, 0.9904356598854065, 0.9731963276863098, 0.9518671631813049, 0.9265761375427246, 0.8974401950836182, 0.8645694851875305, 0.8280726671218872, 0.7880674600601196, 0.7446886897087097, 0.6980994343757629, 0.6484952569007874, 0.5961064100265503, 0.5411936044692993, 0.484039306640625, 0.4249335527420044, 0.3641607165336609, 0.3019859194755554, 0.23864485323429108, 0.17433902621269226, 0.10923774540424347, 0.043486177921295166, -0.02277749590575695, -0.08940033614635468, -0.15618973970413208, -0.2228895127773285, -0.28916433453559875, -0.3545966148376465, -0.41869884729385376, -0.48094066977500916, -0.5407859086990356, -0.5977325439453125, -0.6513475775718689, -0.7012916207313538, -0.7473297119140625, -0.7893321514129639, -0.8272606134414673, -0.8611522912979126, -0.8910955190658569, -0.9172089695930481, -0.9396172761917114, -0.9584338665008545, -0.9737412333488464, -0.9855787754058838, -0.9939330816268921, -0.998733639717102, -0.9998552799224854, -0.9971297979354858, -0.9903675317764282, -0.9793850183486938, -0.9640409350395203, -0.9442659020423889, -0.9200875759124756, -0.891636848449707, -0.8591381311416626, -0.8228839039802551, -0.7831974625587463, -0.7403978109359741, -0.6947693824768066, -0.6465436220169067, -0.5958942174911499, -0.5429453253746033, -0.48778748512268066, -0.43050283193588257, -0.37118738889694214, -0.30997520685195923, -0.2470552623271942, -0.18267904222011566, -0.11715883016586304, -0.05085867643356323, 0.015823161229491234, 0.08247300982475281, 0.14868265390396118, 0.21406565606594086, 0.27827247977256775, 0.3409986197948456, 0.4019913077354431, 0.46104735136032104, 0.5180090665817261, 0.5727518796920776, 0.6251711249351501, 0.6751630902290344, 0.7226090431213379, 0.7673599720001221, 0.8092284798622131, 0.8479881882667542, 0.8833787441253662, 0.9151216149330139, 0.9429373741149902, 0.9665672779083252, 0.9857921600341797, 1.0004475116729736, 1.0104321241378784, 1.0157101154327393, 1.0163052082061768, 1.0122911930084229, 1.0037773847579956, 0.9908944368362427, 0.9737813472747803, 0.9525747299194336, 0.9274023175239563, 0.898381769657135, 0.8656230568885803, 0.8292349576950073, 0.7893343567848206, 0.746056079864502, 0.6995616555213928, 0.6500459909439087, 0.5977380871772766, 0.5428979992866516, 0.48580747842788696, 0.4267567992210388, 0.3660305142402649, 0.3038947582244873, 0.24058613181114197, 0.1763070523738861, 0.11122758686542511, 0.04549376666545868, -0.02075628750026226, -0.08737082034349442, -0.15415874123573303, -0.22086554765701294, -0.28715917468070984, -0.3526240587234497, -0.41677427291870117, -0.4790806174278259, -0.5390064716339111, -0.59604811668396, -0.6497699022293091, -0.6998293399810791, -0.7459887266159058, -0.7881148457527161, -0.826167106628418, -0.8601804971694946, -0.8902420997619629, -0.9164699912071228, -0.938989520072937, -0.9579138159751892, -0.9733270406723022, -0.9852699041366577, -0.993730902671814, -0.9986412525177002, -0.9998769760131836, -0.9972714185714722, -0.9906344413757324, -0.9797828197479248, -0.9645726680755615, -0.9449326992034912, -0.9208866357803345, -0.8925629258155823, -0.8601835370063782, -0.824038565158844, -0.7844516634941101, -0.7417423725128174, -0.6961963176727295, -0.648046612739563, -0.5974688529968262, -0.5445882678031921, -0.4894965887069702, -0.43227511644363403, -0.3730199337005615, -0.3118628263473511, -0.24899154901504517, -0.18465526401996613, -0.11916472017765045, -0.052882492542266846, 0.013793708756566048, 0.08045070618391037, 0.14667952060699463, 0.21209323406219482, 0.2763403654098511, 0.33911561965942383, 0.40016424655914307, 0.45928168296813965, 0.5163090229034424, 0.5711209774017334, 0.6236122846603394, 0.6736798286437988, 0.7212051153182983, 0.7660403251647949, 0.8079999685287476, 0.8468577861785889, 0.8823549747467041, 0.9142128229141235, 0.9421520829200745, 0.9659126996994019, 0.9852742552757263, 1.0000702142715454, 1.0101978778839111, 1.015618920326233, 1.0163555145263672, 1.0124801397323608, 1.0041011571884155, 0.9913492798805237, 0.9743627905845642, 0.953278660774231, 0.9282251596450806, 0.8993199467658997, 0.8666731119155884, 0.8303937911987305, 0.7905980944633484, 0.7474203109741211, 0.7010209560394287, 0.6515939235687256, 0.5993673205375671, 0.544600248336792, 0.4875738024711609, 0.42857837677001953, 0.36789917945861816, 0.305802583694458, 0.2425263375043869, 0.17827415466308594, 0.11321690678596497, 0.04750099778175354, -0.01873566024005413, -0.0853416696190834, -0.15212756395339966, -0.21884150803089142, -0.28515326976776123, -0.35065019130706787, -0.41484811902046204, -0.4772184193134308, -0.5372243523597717, -0.5943605303764343, -0.6481888294219971, -0.6983638405799866, -0.7446444034576416, -0.7868940234184265, -0.8250699639320374, -0.8592049479484558, -0.8893852233886719, -0.9157277941703796, -0.9383583068847656, -0.9573904275894165, -0.9729095101356506, -0.9849579334259033, -0.9935256242752075, -0.9985454082489014, -0.9998950958251953, -0.9974091053009033, -0.990897536277771, -0.9801764488220215, -0.9651004076004028, -0.9455952644348145, -0.921681821346283, -0.8934853076934814, -0.8612251281738281, -0.8251901268959045, -0.7857028245925903, -0.7430841326713562, -0.6976206302642822, -0.6495471000671387, -0.599041223526001, -0.5462291240692139, -0.4912036061286926, -0.4340457618236542, -0.3748502731323242, -0.313748836517334, -0.25092631578445435, -0.18663017451763153, -0.12116959691047668, -0.054905690252780914, 0.01176450215280056, 0.07842810451984406, 0.1446758508682251, 0.21011963486671448, 0.2744070589542389, 0.3372311294078827, 0.39833545684814453, 0.4575142562389374, 0.5146070122718811, 0.569487988948822, 0.6220515370368958, 0.672194242477417, 0.7197988033294678, 0.7647185921669006, 0.8067685961723328, 0.8457244038581848, 0.8813278079032898, 0.9133005738258362, 0.9413628578186035, 0.9652541279792786, 0.9847521781921387, 0.9996888637542725, 1.00995934009552, 1.0155234336853027, 1.016401767730713, 1.012665033340454, 1.0044211149215698, 0.9918000102043152, 0.9749403595924377, 0.9539788961410522, 0.9290441870689392, 0.900254487991333, 0.8677198886871338, 0.8315494060516357, 0.7918587923049927, 0.7487816214561462, 0.7024775743484497, 0.6531392335891724, 0.6009941101074219, 0.5463002324104309, 0.489338219165802, 0.43039846420288086, 0.369766503572464, 0.30770933628082275, 0.24446570873260498, 0.18024061620235443, 0.11520546674728394, 0.04950757324695587, -0.016715286299586296, -0.08331280946731567, -0.15009644627571106, -0.21681691706180573, -0.28314661979675293, -0.34867510199546814, -0.41292017698287964, -0.4753541350364685, -0.5354395508766174, -0.5926698446273804, -0.6466044783592224, -0.6968945860862732, -0.7432959675788879, -0.7856692671775818, -0.8239688873291016, -0.8582257628440857, -0.8885246515274048, -0.914982259273529, -0.9377236366271973, -0.9568638801574707, -0.9724888801574707, -0.9846426248550415, -0.9933168888092041, -0.9984461069107056, -0.9999096393585205, -0.9975428581237793, -0.9911566972732544, -0.9805660247802734, -0.9656239151954651, -0.9462535977363586, -0.9224730134010315, -0.894403874874115, -0.8622632026672363, -0.8263382911682129, -0.78695148229599, -0.7444233894348145, -0.6990423798561096, -0.6510456204414368, -0.6006115078926086, -0.5478682518005371, -0.4929085969924927, -0.43581438064575195, -0.3766792118549347, -0.31563329696655273, -0.2528597414493561, -0.18860413134098053, -0.12317383289337158, -0.05692870169878006, 0.00973520241677761, 0.07640516757965088, 0.14267148077487946, 0.20814508199691772, 0.27247247099876404, 0.3353450298309326, 0.3965049088001251, 0.45574483275413513, 0.5129030346870422, 0.5678529143333435, 0.6204881072044373, 0.6707062125205994, 0.7183900475502014, 0.7633939981460571, 0.805534303188324, 0.8445879220962524, 0.8802972435951233, 0.9123845100402832, 0.9405698180198669, 0.9645912051200867, 0.9842257499694824, 0.9993031024932861, 1.0097163915634155, 1.0154235363006592, 1.0164433717727661, 1.0128456354141235, 1.0047370195388794, 0.9922469854354858, 0.9755141139030457, 0.9546754360198975, 0.9298598170280457, 0.9011855125427246, 0.868763267993927, 0.8327017426490784, 0.7931162118911743, 0.7501398921012878, 0.7039313912391663, 0.6546821594238281, 0.6026186943054199, 0.547998309135437, 0.49110108613967896, 0.43221694231033325, 0.3716323971748352, 0.3096148371696472, 0.24640412628650665, 0.18220636248588562, 0.11719343066215515, 0.051513537764549255, -0.01469532959163189, -0.08128366619348526, -0.14806509017944336, -0.21479201316833496, -0.2811392545700073, -0.3466988503932953, -0.41099071502685547, -0.4734876751899719, -0.5336521863937378, -0.5909762978553772, -0.6450166702270508, -0.6954218149185181, -0.7419440746307373, -0.7844408750534058, -0.822864294052124, -0.857243001461029, -0.8876606822013855, -0.9142330288887024, -0.937085747718811, -0.9563339948654175, -0.9720650315284729, -0.9843242168426514, -0.9931049346923828, -0.9983434677124023, -0.9999208450317383, -0.9976731538772583, -0.9914119243621826, -0.9809516072273254, -0.9661434888839722, -0.9469079375267029, -0.9232602715492249, -0.8953188061714172, -0.8632979393005371, -0.8274834156036377, -0.788196861743927, -0.7457599639892578, -0.7004621028900146, -0.6525416374206543, -0.6021795868873596, -0.5495049953460693, -0.49461162090301514, -0.43758106231689453, -0.37850630283355713, -0.3175159990787506, -0.25479182600975037, -0.19057686626911163, -0.12517735362052917, -0.05895125865936279, 0.007706062868237495, 0.07438188791275024, 0.14066627621650696, 0.20616944134235382, 0.2705363929271698, 0.33345723152160645, 0.39467257261276245, 0.4539735019207001, 0.511197030544281, 0.5662155747413635, 0.6189228296279907, 0.6692160367965698, 0.7169787883758545, 0.7620666027069092, 0.8042972683906555, 0.843448281288147, 0.8792634606361389, 0.9114649891853333, 0.9397728443145752, 0.9639245271682739, 0.9836953282356262, 0.998913049697876, 1.0094690322875977, 1.0153193473815918, 1.0164809226989746, 1.0130221843719482, 1.0050487518310547, 0.9926900863647461, 0.9760841131210327, 0.9553683996200562, 0.930671751499176, 0.9021131992340088, 0.869803249835968, 0.8338509798049927, 0.7943707704544067, 0.7514953017234802, 0.7053822875022888, 0.6562223434448242, 0.604240894317627, 0.5496939420700073, 0.4928618371486664, 0.4340340793132782, 0.37349703907966614, 0.31151944398880005, 0.24834184348583221, 0.18417100608348846, 0.11918090283870697, 0.05351932346820831, -0.01267567090690136, -0.07925499975681305, -0.14603394269943237, -0.2127668410539627, -0.27913111448287964, -0.3447214365005493, -0.4090595245361328, -0.47161900997161865, -0.5318621397018433, -0.5892795324325562, -0.6434256434440613, -0.6939454078674316, -0.7405882477760315, -0.7832086086273193, -0.8217560052871704, -0.8562566041946411, -0.8867930173873901, -0.9134805202484131, -0.9364446401596069, -0.9558008909225464, -0.9716379046440125, -0.9840025901794434, -0.9928897619247437, -0.9982373714447021, -0.99992835521698, -0.9977996349334717, -0.9916634559631348, -0.9813330769538879, -0.9666587710380554, -0.9475582838058472, -0.924043595790863, -0.8962298631668091, -0.8643291592597961, -0.8286252021789551, -0.7894396781921387, -0.747093915939331, -0.7018791437149048, -0.654035747051239, -0.603745698928833, -0.5511399507522583, -0.49631279706954956, -0.4393458068370819, -0.3803315758705139, -0.31939730048179626, -0.25672227144241333, -0.19254878163337708, -0.1271800696849823, -0.06097356975078583, 0.005676692351698875, 0.07235803455114365, 0.1386602520942688, 0.20419254899024963, 0.2685990631580353, 0.3315681219100952, 0.3928385376930237, 0.45220014452934265, 0.5094889402389526, 0.5645762085914612, 0.617355227470398, 0.6677234172821045, 0.7155650854110718, 0.7607367038726807, 0.8030572533607483, 0.8423057794570923, 0.8782262206077576, 0.9105418920516968, 0.9389720559120178, 0.9632537961006165, 0.9831604957580566, 0.9985186457633972, 1.009217381477356, 1.0152108669281006, 1.0165141820907593, 1.0131945610046387, 1.0053566694259644, 0.9931290745735168, 0.9766503572463989, 0.9560577273368835, 0.9314804673194885, 0.9030376076698303, 0.8708402514457703, 0.8349968194961548, 0.7956221103668213, 0.7528476715087891, 0.7068305611610413, 0.6577602028846741, 0.6058605909347534, 0.5513879656791687, 0.49462080001831055, 0.435849666595459, 0.37536048889160156, 0.3134228587150574, 0.2502785623073578, 0.18613535165786743, 0.12116782367229462, 0.055524617433547974, -0.010656280443072319, -0.07722651213407516, -0.1440024971961975, -0.21074116230010986, -0.27712225914001465, -0.3427428603172302, -0.40712642669677734, -0.46974804997444153, -0.5300695300102234, -0.5875797867774963, -0.6418310403823853, -0.6924652457237244, -0.7392287254333496, -0.7819726467132568, -0.8206436038017273, -0.8552663326263428, -0.8859219551086426, -0.912724494934082, -0.9357998967170715, -0.9552644491195679, -0.9712077379226685, -0.9836776256561279, -0.9926711320877075, -0.9981279373168945, -0.9999322891235352, -0.9979225397109985, -0.9919109344482422, -0.98171067237854, -0.967170000076294, -0.948204517364502, -0.9248227477073669, -0.8971371650695801, -0.8653568625450134, -0.8297639489173889, -0.7906792759895325, -0.7484251856803894, -0.7032939195632935, -0.6555273532867432, -0.6053096652030945, -0.5527726411819458, -0.49801206588745117, -0.44110891222953796, -0.3821551203727722, -0.3212769031524658, -0.2586517035961151, -0.194519504904747, -0.12918223440647125, -0.06299541145563126, 0.0036474037915468216, 0.07033399492502213, 0.1366536021232605, 0.20221483707427979, 0.26666024327278137, 0.3296770453453064, 0.3910025954246521, 0.4504249691963196, 0.5077787041664124, 0.5629345774650574, 0.6157853007316589, 0.6662284135818481, 0.7141488790512085, 0.7594040632247925, 0.8018144965171814, 0.8411598801612854, 0.877185583114624, 0.9096149802207947, 0.9381676316261292, 0.9625787138938904, 0.982621431350708, 0.9981199502944946, 1.0089614391326904, 1.0150978565216064, 1.0165431499481201, 1.0133627653121948, 1.0056604146957397, 0.9935644865036011, 0.9772127866744995, 0.9567432403564453, 0.9322852492332458, 0.9039584398269653, 0.8718734979629517, 0.8361392617225647, 0.796870231628418, 0.7541971206665039, 0.7082757949829102, 0.6592952013015747, 0.6074782609939575], "name": "predicted"}, {"type": "scatter", "y": [-0.009999358952767035, 0.0636596725936513, 0.09396539891340987, 0.18736083188739677, 0.24554522107360244, 0.30474662791998464, 0.3540644715650535, 0.427310695217905, 0.5082610045992348, 0.528743319714693, 0.610873715328187, 0.6595808302414805, 0.6714801770744819, 0.7161724630504367, 0.8017361218478947, 0.8227584059757931, 0.8339431865355841, 0.8589156197859245, 0.9032790012741199, 0.9277440963860971, 0.944348827684898, 0.9550259159741353, 0.9939331935171848, 0.9953889438631083, 1.031895777398816, 0.991926769744457, 1.008018984611331, 0.9898874568317324, 0.9660036288267146, 0.9778216806047674, 0.9427574719479263, 0.9160079988143766, 0.903887727996592, 0.9011663035689388, 0.8367907573153219, 0.8260939809053769, 0.7683508266691262, 0.7234202492635545, 0.7121569782970198, 0.6213383920442218, 0.5786361839359868, 0.5380777310192311, 0.46138829067940923, 0.4441318595463302, 0.34964272800620694, 0.3233662082126278, 0.24534658923290942, 0.18524150173515894, 0.12375363227000283, 0.04747565849617937, -0.0037387080934477928, -0.051743377712968094, -0.15214920425224088, -0.19449442529116476, -0.26660097990763254, -0.32123644885610925, -0.38842565077399277, -0.441144767589916, -0.48607544550013165, -0.524011507610602, -0.5891608717435157, -0.6453265897593556, -0.6902171009691433, -0.7271350896313418, -0.7695574187711549, -0.8019483627796674, -0.8705328832225805, -0.8882826334487386, -0.941180390156566, -0.9078491448280709, -0.9832570314642423, -0.942594348092753, -0.9894904989827801, -1.033150433359927, -0.9886850624679566, -1.0280845624475607, -1.0089557387836479, -0.9901244244917171, -0.9947835829309849, -0.9469085583633676, -0.928849321496094, -0.9595811107489216, -0.899135580368624, -0.904911369504552, -0.8489143109698182, -0.7904224335162588, -0.7793467872833741, -0.7288845420182568, -0.6813326718442346, -0.6342428891149459, -0.5838042233620713, -0.5394518302446045, -0.49395160308410146, -0.43786637091879443, -0.3736342591485493, -0.3050754102189696, -0.23006119896148175, -0.15796119062894998, -0.13899400784200322, -0.07349763188343796, -0.022813306341768008, 0.05154018987183014, 0.15715760494770037, 0.20520889719981203, 0.22701288049240798, 0.34376915047710155, 0.39380520967089705, 0.42170607945255223, 0.5051473215112843, 0.517959834594867, 0.5842618115193163, 0.639205485969443, 0.6517609770466205, 0.7524165476525965, 0.7733899011038774, 0.7671879127780509, 0.8378791949103853, 0.8869084817924341, 0.9253955427829345, 0.9474620605814121, 0.9492888026500431, 0.9409248393793384, 0.9925682334015613, 1.0212177683122823, 0.988258219789467, 0.9974993657507019, 0.985505248508194, 0.9691975335965581, 0.9816182076967912, 1.0069189782770906, 0.9517295755478234, 0.9151599032622754, 0.9230691448701079, 0.8647948616525551, 0.8391556216439793, 0.7743724386112338, 0.7572152028785227, 0.7235964806336481, 0.6679369953520177, 0.6561309728447834, 0.5698838129697144, 0.535494580645897, 0.47822109618725667, 0.43056754840990097, 0.3796522505801375, 0.30640282243540146, 0.24888140240620638, 0.16101972528613337, 0.11274049727664075, 0.05557651776347804, 0.007767086457276048, -0.07755460024331498, -0.12614497129964494, -0.19339795292170062, -0.2711600718126285, -0.2776459941637687, -0.3736172256217579, -0.43593804695342714, -0.4830804859023277, -0.5178520557861744, -0.6103658903884167, -0.6575171641143672, -0.7155881313104441, -0.7393348420107445, -0.799837168515808, -0.8146339753743045, -0.8413778152003573, -0.8677364988263171, -0.9256726232512349, -0.9606969095668922, -0.960883549581452, -0.9695173165732712, -0.9964459659204626, -1.0068786370846308, -1.027668291543145, -0.9971305351809371, -1.0037618140427316, -0.9890243909537776, -0.9804558226660108, -0.9673632031655514, -0.9379023272572421, -0.934088180148397, -0.9166649874015851, -0.9189964142899317, -0.8429842068469926, -0.7965800116683697, -0.768901463615821, -0.7248123293996247, -0.7065009887084645, -0.6627206902044985, -0.5784566232989523, -0.5478967746908785, -0.4615929887606986, -0.44421982569590407, -0.37499013908010215, -0.3251221604381255, -0.2665142392093253, -0.20527701245193583, -0.10344417870438943, -0.04104891977859873, -0.014295787230804618, 0.07877813404198541, 0.12008119145186724, 0.20195151310001322, 0.19943805575744072, 0.31579098044307435, 0.3389383558319193, 0.44483148949855866, 0.46094071467345643, 0.5461219070449542, 0.5583702565689818, 0.6517574020294392, 0.6835725761606786, 0.7033919641357133, 0.7616116033850876, 0.793269209820952, 0.850526377683836, 0.8702191216418065, 0.8963142665036119, 0.9480087183757869, 0.9658322242311266, 0.965728855484959, 0.9552886420582565, 1.009911048390976, 0.9599555612070212, 0.9384181853734762, 0.9620204370552552, 0.9762121807341281, 0.9674990184490031, 0.9797922292045916, 0.9583407670017142, 0.9177376412944372, 0.884204502152081, 0.8953922997454626, 0.8250341349854714, 0.7873391639955621, 0.7723361615948774, 0.753941461053737, 0.6490043815478378, 0.6222555270017242, 0.5691437909799054, 0.527293267766338, 0.5061132107407212, 0.43249230520228266, 0.36843862143995454, 0.30074457642376334, 0.2623233229560387, 0.1735769588094051, 0.16794388802654395, 0.06136239114921771, 0.011243251807838145, -0.08687318312280887, -0.12425551724082626, -0.18359764845740184, -0.286965740898845, -0.2839093680741585, -0.3974235159102908, -0.45313656983755385, -0.44221550263184733, -0.5483555614175254, -0.6042364962169491, -0.6537402312365962, -0.6948145963665731, -0.73814867706013, -0.7554088180907429, -0.821513440217209, -0.8453331802872212, -0.8750222628831029, -0.9193616234472021, -0.9445253607359784, -0.9319109432950128, -0.9576428186600859, -0.9816592341265201, -1.0057569781449658, -1.0421661677066543, -1.0068744019415232, -1.013827296186875, -0.9904197297401905, -1.0046795052178161, -0.9849450270816512, -0.9134858184428556, -0.9336092162122831, -0.8929240555635648, -0.8557762829118988, -0.8531160327787302, -0.8107033361941218, -0.7765981449725297, -0.731827648930893, -0.6878313605574721, -0.6344444301385131, -0.6001364910249991, -0.5472556903574349, -0.46918050490022734, -0.4179067586838576, -0.3987534794523012, -0.31857854612745895, -0.24569119381989607, -0.2376462115584244, -0.13750124990389284, -0.052369024904391576, -0.005525716108625668, 0.06330380293596981, 0.11974063095600848, 0.18396885179840944, 0.2634552114273171, 0.31032822320266307, 0.3775383363722705, 0.4042288631122052, 0.4722947309396425, 0.5326339834107028, 0.5835908353480422, 0.6317673447953871, 0.6644018971815173, 0.6961837760559256, 0.7671359759397369, 0.807406074502865, 0.8236896085778004, 0.8654400769186593, 0.889763358681592, 0.9513633302821403, 0.9850265171554226, 0.9902874016775833, 1.0378581198218206, 0.9692268992670788, 0.9647883388725478, 0.999067990719999, 0.9800729365659656, 1.0215353107967833, 0.9515970688568111, 0.975639874041288, 0.916518665881306, 0.9334271899017014, 0.9171435827914521, 0.8923946133610402, 0.8590150263287917, 0.8015012721935336, 0.757232433056858, 0.7398423535345267, 0.6814521707770927, 0.6686452847194243, 0.5708947042150191, 0.5242191358267104, 0.48012452306329334, 0.44331485192199505, 0.3776870875161292, 0.2942556857219252, 0.2548129475261059, 0.19203588185896936, 0.1197027359930042, 0.04073018644379744, 0.00325021821709221, -0.098058236879079, -0.11183060581106014, -0.21499956756195407, -0.29384652642301007, -0.3020414250773188, -0.3429511588246692, -0.43911359211608947, -0.5077273869983197, -0.5497348670961157, -0.6109880263696533, -0.6315490386211278, -0.6877881709370871, -0.7920389936203348, -0.7490659733218974, -0.8095407534838209, -0.8572087697562507, -0.9025681042991982, -0.9104167394714002, -0.9365170789449601, -0.9865964121571721, -0.9172802389060665, -0.9874689153956787, -1.0270464617938093, -1.010425846728927, -1.0025382418101674, -1.0061801180156158, -0.9866730854180761, -0.9667298990268961, -0.959228051824227, -0.9205680927440738, -0.9024026864162575, -0.9092124126949721, -0.8914674037968324, -0.8217552168004579, -0.8147859464654839, -0.7631129122032865, -0.716005280629734, -0.6766147502298929, -0.6622042252786768, -0.59416678868582, -0.49541517954658637, -0.499022505107533, -0.4038537899888186, -0.3835040860659026, -0.30430694850519513, -0.2752508172661917, -0.19012775569186252, -0.14777502883590604, -0.046693548323724625, 0.006834141101711506, 0.07535538805377073, 0.11982125394735588, 0.22148862547467593, 0.24296049344557094, 0.28159070125695546, 0.38512198095151284, 0.4193915909047361, 0.47182349885902775, 0.5532183537926714, 0.5815745996682162, 0.6178132523805759, 0.6809586102443982, 0.7248426151244712, 0.7503434673720812, 0.7906032499182177, 0.7923897557043593, 0.8701311730227432, 0.9028115726099403, 0.9560870773013926, 0.9395108152053077, 0.9723531347731215, 0.9625802633850115, 0.994497953216637, 1.0066056750637637, 0.9886029325640016, 1.0153535175235424, 0.976764480262158, 0.9727332671157737, 0.9849133686341576, 0.9579802653001507, 0.9333183643641018, 0.8819520206234546, 0.892825973299433, 0.8167209185435051, 0.7928508788718144, 0.7890923732759523, 0.7194942472075255, 0.7080437935877234, 0.6619190409927057, 0.6147084411932086, 0.5372897744493671, 0.45583020885949926, 0.45029517481211223, 0.3694576835240727, 0.29313664344126056, 0.22496272337952203, 0.19149106352206322, 0.1310856808525609, 0.08643336693007223, 0.024729948137679317, -0.09078056840089134, -0.1180799233347238, -0.1908619163687677, -0.26327659562868533, -0.33091341938468516, -0.3799712866641005, -0.4299277694311706, -0.47217891864456457, -0.5477058856410649, -0.6070946387908837, -0.6384471191358374, -0.6697151624821788, -0.7326587124761927, -0.780876408165527, -0.7948999650985803, -0.8673078141359395, -0.8763932403511998, -0.9610747486561285, -0.8903644635014971, -0.98312419232589, -0.9578976450987237, -0.981717024302326, -0.9672197872824188, -1.007221389312445, -0.9868139214743681, -0.9858072649244711, -0.9989724235356287, -1.0190298289726751, -0.969367713963924, -0.9409093069758682, -0.9265070476824591, -0.8869904294496557, -0.8855360053495561, -0.8519348810889587, -0.8160893565214707, -0.7605920932315919, -0.7549311252485174, -0.6728749752233568, -0.6276845533639275, -0.5791069329022396, -0.5455958910291019, -0.48052221090429614, -0.41481916319376055, -0.3648337956656226, -0.30911142065256825, -0.21278909703481982, -0.1961932689437774, -0.14401100032994224, -0.054114760523670494, 0.007498893910480035, 0.031131399309096933, 0.14058380890019204, 0.20222903763928723, 0.26217729823523267, 0.3455160305470806, 0.3721054502317444, 0.4521937173179805, 0.4838253248582296, 0.5408361182657758, 0.5981361602986408, 0.6250080365178263, 0.6590953244289783, 0.7258507772734651, 0.8110594660344395, 0.7914789784578066, 0.8053112346888595, 0.8957296956485096, 0.9054756545147988, 0.9274733138263411, 0.9463655610323978, 0.9678799230976853, 0.9897513312542021, 0.9843798802636148, 0.9796699157235454, 0.9782437128755087, 1.0049768586559904, 1.025621051329909, 0.974662514513343, 0.9393278983643367, 0.9679148266325017, 0.9221639754574951, 0.9080251344921789, 0.8400469076466311, 0.8653369273348335, 0.8213599205980713, 0.7553581980170392, 0.6963001707421883, 0.6779362533675288, 0.6388305939666635, 0.5866515402513922, 0.5355627384742497, 0.4830539137258818, 0.4439745513774055, 0.3837167654286333, 0.27374502665863254, 0.22375911172753324, 0.17713612594245712, 0.13560559044568654, 0.055897563611364845, -0.025039566307157732, -0.05287284885821174, -0.08530780205858286, -0.2039174493599344, -0.22705773864761114, -0.34820810390322837, -0.3846387315503561, -0.4533976366596316, -0.48684770457874355, -0.5565000638313461, -0.6020829715604039, -0.6278586455922663, -0.6933436589115893, -0.7400331654105672, -0.7288004992554871, -0.8136355618422089, -0.8237754598515847, -0.900849118778551, -0.9050728941810126, -0.91542134014629, -0.9609535015809532, -0.9789757277089052, -0.9950733479850521, -0.9608239403825576, -1.0018954205258015, -0.9978176639843784, -0.9905764796994785, -1.013365846393599, -0.990538235059092, -0.9655207828027641, -0.9467451509538439, -0.88808542729832, -0.8618325904235582, -0.875893192814291, -0.8170282589814193, -0.8443694588101366, -0.7717785540274928, -0.6986754651153696, -0.7088530147710765, -0.6627067191874392, -0.5741450029230915, -0.5210915239540634, -0.4821098177446098, -0.41181536085470977, -0.3644590206667578, -0.2975746465958, -0.25488950964150936, -0.1759242460353199, -0.15537699732792526, -0.07311295414779961, 0.010300749820318948, 0.07331941024313679, 0.13700397843315465, 0.20627493440425376, 0.20736220599682373, 0.3105888139052605, 0.38250727349148705, 0.41223643747115696, 0.5091238137554251, 0.5425408532482557, 0.6189408060583667, 0.6505101292526647, 0.6807921220069558, 0.7453835007326365, 0.7729695302792963, 0.7861254808808821, 0.8520643972808829, 0.8942028051127654, 0.9188400233090682, 0.9277215346880768, 0.9634145390749397, 0.9805792398658955, 0.9694064631999972, 0.9712566259295984, 1.0234368536750982, 0.9958299980871314, 0.9978910621585924, 0.9736662529493643, 1.0009746460363191, 0.9707858841433672, 0.965336597612631, 0.8779477299720793, 0.9098082932611138, 0.8743548456436759, 0.8208019901248673, 0.8089084076451738, 0.783504206621479, 0.7082801803365147, 0.6820167327780572, 0.6434828962376223, 0.5991426175802962, 0.5736778715146434, 0.4969496677497485, 0.42896592842424924, 0.39684557806107984, 0.33064071587834726, 0.2425829233886185, 0.1720667288134628, 0.10630759832763279, 0.09559744076800568, 0.001411615080550252, -0.11215658787396954, -0.17449220468833698, -0.21431950953028636, -0.22194860643223213, -0.32007586565531326, -0.4133809302381406, -0.42411664054600257, -0.4684091937827552, -0.5414545856051733, -0.6239156130251304, -0.6417115677356892, -0.6924821896875668, -0.7421389462440876, -0.7975006575955248, -0.8262212280612641, -0.8247382442081787, -0.8889962847022227, -0.8949948753877144, -0.9082583955272568, -0.9285303722602126, -0.9364673112717812, -0.9948122114998945, -1.0021917210548514, -0.9833730255105879, -1.0101535733562355, -0.9889184811765052, -0.981529068340277, -0.9802393011108819, -0.9669115977238153, -0.9680026754550288, -0.9452842855975844, -0.9103998763145765, -0.8663390021634219, -0.8409490627209675, -0.8002790068177634, -0.8066519089403844, -0.7237223672251031, -0.6840448020268344, -0.6324887621337407, -0.595923339322427, -0.5235092656562993, -0.4968259901472895, -0.4329193112954973, -0.3642436462972879, -0.3051335160389075, -0.23928241284446972, -0.16535419018769593, -0.1089563535989511, -0.053360823623563425, 0.018213941366724398, 0.10533888313303211, 0.09687658600528484, 0.17164850524127195, 0.22074392706563925, 0.3270693067309027, 0.37929449311740904, 0.46730723937480156, 0.45987023438052893, 0.5315769813086229, 0.5893268810287627, 0.6321511159959233, 0.697774734375711, 0.7121682087687913, 0.7857616024164175, 0.7937304413764017, 0.8721829211736689, 0.8912175049708719, 0.9041578127352193, 0.9644716150722575, 0.9616201635100835, 0.9663235845038947, 0.990001455602749, 1.004464320534742, 0.9839161449248397, 1.0188898169379705, 1.029098057809125, 0.9731044430124492, 1.000021429902005, 0.966682618152726, 0.9361215757504099, 0.9242043173432136, 0.8909917120992444, 0.8599171067947626, 0.8883148510037145, 0.8145216786284908, 0.7627436681080456, 0.7228564347021664, 0.6829336153822555, 0.6374773823304233, 0.5818429748131887, 0.5280184093636692, 0.47280684862476496, 0.43011754499973387, 0.3691591501718484, 0.2876229269618483, 0.23850858824424448, 0.17998992148517606, 0.12022687882614858, 0.07740643941921226, -0.02304668862720141, -0.07267074123453449, -0.1357871446940126, -0.18658091450614817, -0.2529380731796695, -0.33311502051771014, -0.3496361654920795, -0.448543679490954, -0.46037397198092794, -0.5504386114453172, -0.5727423184893257, -0.6339376992364432, -0.7124221623402254, -0.7230490779313611, -0.7965783363358825, -0.8336373192622851, -0.8833702121686393, -0.8714637144087038, -0.9389056830166841, -0.9398947306614576, -0.9479251543477358, -1.0002417007168813, -0.9247468653340163, -0.9869799479172269, -0.9950546932331401, -0.9798193839208197, -0.9881696858255663, -0.9745514347102743, -0.9754441926366718, -0.9893145578190212, -0.9639254870899846, -0.9513056902969883, -0.9413271318282612, -0.8521033581532144, -0.8556233731431813, -0.7875031973765985, -0.7877951009998359, -0.7099569536372239, -0.6511550813494216, -0.6636892174198264, -0.5873962124051676, -0.5414160289405718, -0.47433287537735064, -0.445738371238944, -0.3528634098341932, -0.2992402424190568, -0.21599976354989553, -0.19031753928557107, -0.1539050346919415, -0.09378422669678968, -0.011662813613119879, 0.08389753920928215, 0.11738294181425585, 0.15826842792937879, 0.2219137162101131, 0.31313757029341627, 0.3999402865915137, 0.41412764396658047, 0.4844610518714936, 0.536778992233629, 0.6019035478007638, 0.6351872661033521, 0.667399911503969, 0.7809084871980175, 0.7722416655579626, 0.8182998721471769, 0.8336554049150394, 0.8897452878522185, 0.908785464724211, 0.9128155601715818, 0.949090623283675, 0.9562192664804702, 0.9914157958012333, 1.0112116371967843, 0.9935123610769732, 0.9929045614140145, 1.038867354310762, 0.9954828313599787, 0.9679509032630352, 0.9845153353409729, 0.923263968282899, 0.9551141018041001, 0.9666793685893023, 0.8635875235494844, 0.8504295390915665, 0.7558158671370429, 0.7951465602544171, 0.7133621322455096, 0.6659744394433895, 0.5934337764683928, 0.5752665387102879, 0.5109653564164036, 0.49421886712684804, 0.4339203946551435, 0.3741394052983156, 0.28011513288089374, 0.23814213563315578, 0.15904947578741407, 0.11369607879148133, 0.04827414918545453, 0.013239543237273962, -0.03689777488503653, -0.12392649573572183, -0.18293093413094516, -0.24892972040478584, -0.3023112321488935, -0.40519875310856807, -0.4562058742822817, -0.4678656989759555, -0.5586099290494094, -0.5763338791982973, -0.6351200114068335, -0.6821480499343263, -0.6948065653685401, -0.7903737651203333, -0.8130985699106767, -0.817659625867472, -0.8523996638821593, -0.8939073034481548, -0.9232671160355393, -0.954190582456538, -0.9510953802740941, -1.0135444435783867, -0.975985930278572, -1.0378784887414805, -0.9914435588081003, -0.9825889504941969, -1.002766924401087, -0.9973043451719161, -0.9528916551500519, -0.9216724517921702, -0.9171639652071998, -0.8831139425905358, -0.9066205097805673, -0.8516601570825475, -0.8168726587024154, -0.7868253499777452, -0.6900943152877789, -0.6846209884382639, -0.6243797786013198, -0.6177964564982266, -0.5093952271320391, -0.4648227749984756, -0.41795070175519594, -0.38427659617965887, -0.3065450849023503, -0.27867054410634856, -0.19677204729979236, -0.15062772385436363, -0.05856755280833635, 0.014552774791359364, 0.06923972427802011, 0.11905257701380974, 0.21476977539817543, 0.23365673284608687, 0.30089313799436396, 0.37509822922798847, 0.407433840921814, 0.49229696644513926, 0.5473659709719215, 0.5827829350515666, 0.6195335476202688, 0.6831062241690943, 0.7342289360366866, 0.755105394619009, 0.8117086197717525, 0.8404723098261578, 0.8765951700748704, 0.9054696446615053, 0.9170490401023947, 0.9569427557155721, 0.96452743866303, 0.9905931479484404, 1.0035288394031092, 1.0109085701495821, 0.9742105071640592, 1.0101723206314295, 1.0333987925359858, 0.9909304335245791, 1.0074449511940526, 0.9457615085061316, 0.9445562113000437, 0.9168628851179021, 0.8827629490123261, 0.8259176845524461, 0.789155144825064, 0.7752474520652558, 0.7365949102001058, 0.7017970017605182, 0.6365845252928035, 0.6163869681026471, 0.559128288289626, 0.47045833909574614, 0.42582372035748844, 0.3714659382343797, 0.31879483765396455, 0.23238091191116722, 0.1888095881079829, 0.08949397122341124, 0.10845438345222447, -0.029453605549609855, -0.04091961037964169, -0.14012825021790146, -0.2156974551622148, -0.2619382764339229, -0.32064926730966464, -0.3723518856276549, -0.44335507052521755, -0.4841421033290865, -0.49953965645573173, -0.5718750054449947, -0.637526851796195, -0.656985893188981, -0.747432397595722, -0.7504646746358287, -0.8189634486847895, -0.8506603053313627, -0.879978436642826, -0.8746053338153057, -0.9274057581227241, -0.9351219704311968, -0.9389625787844237, -0.9940045200281284, -0.9862695472859095, -1.0201060895035645, -0.9992596239423911, -0.9898291342936199, -1.0095470030889173, -1.0134226439396095, -0.9560671286768571, -0.9355104202124493, -0.9231279909810497, -0.9246488981846931, -0.8581357861506494, -0.8271943542848372, -0.7996100931151767, -0.7781257281662797, -0.707604008904239, -0.6542503347848228, -0.6059767677046944, -0.5869141638178202, -0.5108480058795409, -0.4626809492263522, -0.4142364056057339, -0.35996602761879704, -0.34534131809469476, -0.2706436425641511, -0.1790558404511132, -0.14998124355721829, -0.05343827186497813], "name": "original"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>



<div id="cd2f3e78-2bb6-44a4-8ec1-afdf27d7a15c" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("cd2f3e78-2bb6-44a4-8ec1-afdf27d7a15c", [{"type": "scatter", "y": [0.4200988198237621, 0.16368044356354444, 0.009697234577631123, 0.0013517268351158666, 0.0005475582548653147, 0.0004705996531143977, 0.0004486709888885767, 0.00043707164066344545, 0.00043170396977004305, 0.00042987580305907055], "name": "loss train"}, {"type": "scatter", "y": [0.4071849303489721, 0.15843713807968904, 0.009523627191546064, 0.0013381472399292352, 0.0005408353421895701, 0.0004650330176028762, 0.00044428758037234846, 0.00043366068227697986, 0.00042851950653343096, 0.00042790668489328784], "name": "loss dev"}], {"title": ""}, {"showLink": true, "linkText": "Export to plot.ly"})});</script>


## Conclusion, next steps

When playing around with the parameters I found out that often the network performed better on the dev set than the train set! Clearly overlapping dev and train sets are nonsensical. Also the network seems to optimize on predicting the amplitude but not frequency. Probably the frequency can be better predicted by training on more then only one value (last_output).

This example gave me a good overview of some TensorFlow features. More generally there are so many hyper parameters to choose when building a network architecture:
  * basic parameters: network size, learning rate, drop-out, optimization method
  * how to choose initial state
  * predict one sample, or multiple samples
  * loss function
  
It would be interesting to automatically tune the hyper-parameters as well. Maybe using genetic networks?

I am planning to use the approach in this article to process sampled sound waves. Things that cross my mind:

  * Apply on raw audio
      * Sample microphone via WebAudo, send the samples to the notebook via WebSocket, analyze and feed the result back
  * Implement a phase vocodor, instead of raw audio, input the frequency features
  * Achieve something like [this](https://deepmind.com/blog/wavenet-generative-model-raw-audio/)
  * Process a MIDI file
  * Generate text
  * Train on multi-feature sequence (eg. audio and corresponding text)

Stay tuned....
