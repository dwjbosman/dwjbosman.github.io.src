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

In 1996, during my last year in High School, I borrowed a book of a friend about neural networks. It explained how a two layer perceptron network could learn the XOR function. I tried implementing the formulas and was able to do the feed-forward calculations. The training algorithm however still eluded me. Being able to perform forward calculations was already very exciting. I created a windows 95 screen save which whould fill the screen with the output of a randomized neural network. The output images we're very interesting. Especially when replacing the activation functions of the network by exotic ones such as sin(x), abs(x) etc. (Although I lost the source code, you can still download it [here](http://www.free-downloads-center.com/download/neural-screen-saver-v1-0-11252.html))

At the time it seemed that Neural networks were just another statistical method to interpolate data. Furthermore limited training data and the problem of vanishing gradients limited their usefullnes. Fast forward to 2017. Massive amounts of training data and computing power are available. A number of relatively small improvements in the basic neural network algorithms have made it possible to train networks consisting of many more layers. These so-called deep neural networks have fueled progress and interest in Artificial Intelligence.

One particular innovation that caught my attention is the LSTM neural network architecture. This architecture solves the issue of vanishing gradients. LSTM networks are especially suited to perform analysis of sequences and time series. Some interesting links:
  * article about text generation kernel code
  * fake news generator
  * LSTM architecture
  * Voice synthesis (non LSTM)
  * Audio generation

Especially the last topic was very inspiring. Think about the possibilites of voice synthesis and generating music!

In this article I will discuss my experience using Tensor Flow and LSTM networks. I used the following documentation sources:
  * Tensorflow (this is API reference documentation and will not help you understand how to apply LSTM networks)
  * Keras LSTM example
  * Tensorflow example
  * https://arxiv.org/pdf/1506.00019.pdf
  * http://colah.github.io/posts/2015-08-Understanding-LSTMs/
  * https://distill.pub/2016/augmented-rnns/
 
The first test I wanted to implement is too see if I could implement a sine wave predictor. It's a limited example:
  * The network is trained using mini-batches. Due to the periodic nature of the sine wave the train, dev, and test set overlap.
  * I train the network in batches, but want to generate per sample
  


```python
import plotly
from plotly.graph_objs import Scatter, Layout
import numpy as np
import tensorflow as tf
import sys
plotly.offline.init_notebook_mode(connected=True)
import IPython.display
```


<script>requirejs.config({paths: { 'plotly': ['https://cdn.plot.ly/plotly-latest.min']},});if(!window.Plotly) {{require(['plotly'],function(plotly) {window.Plotly=plotly;});}}</script>


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
s_i = 0
e_i = s_i + 100
x = plotly.offline.iplot({
    "data": [Scatter(x=signal_time[s_i:e_i],y=signal_amp[s_i:e_i])],
    "layout": Layout(title="")
    
})

```


<div id="f76498ea-23ad-4c4a-9c7e-d002759c534c" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("f76498ea-23ad-4c4a-9c7e-d002759c534c", [{"x": [0.0, 0.010000199999999999, 0.020000399999999998, 0.030000599999999995, 0.040000799999999996, 0.050001, 0.06000119999999999, 0.07000139999999999, 0.08000159999999999, 0.09000179999999999, 0.100002, 0.1100022, 0.12000239999999998, 0.1300026, 0.14000279999999998, 0.150003, 0.16000319999999998, 0.17000339999999997, 0.18000359999999999, 0.19000379999999997, 0.200004, 0.21000419999999997, 0.2200044, 0.23000459999999998, 0.24000479999999996, 0.250005, 0.2600052, 0.27000539999999995, 0.28000559999999997, 0.2900058, 0.300006, 0.31000619999999995, 0.32000639999999997, 0.3300066, 0.34000679999999994, 0.35000699999999996, 0.36000719999999997, 0.3700074, 0.38000759999999995, 0.39000779999999996, 0.400008, 0.41000819999999993, 0.42000839999999995, 0.43000859999999996, 0.4400088, 0.45000899999999994, 0.46000919999999995, 0.47000939999999997, 0.4800095999999999, 0.49000979999999994, 0.50001, 0.5100102, 0.5200104, 0.5300106, 0.5400107999999999, 0.5500109999999999, 0.5600111999999999, 0.5700114, 0.5800116, 0.5900118, 0.600012, 0.6100121999999999, 0.6200123999999999, 0.6300125999999999, 0.6400127999999999, 0.650013, 0.6600132, 0.6700134, 0.6800135999999999, 0.6900137999999999, 0.7000139999999999, 0.7100141999999999, 0.7200143999999999, 0.7300146, 0.7400148, 0.7500149999999999, 0.7600151999999999, 0.7700153999999999, 0.7800155999999999, 0.7900157999999999, 0.800016, 0.8100162, 0.8200163999999999, 0.8300165999999999, 0.8400167999999999, 0.8500169999999999, 0.8600171999999999, 0.8700173999999999, 0.8800176, 0.8900177999999999, 0.9000179999999999, 0.9100181999999999, 0.9200183999999999, 0.9300185999999999, 0.9400187999999999, 0.950019, 0.9600191999999999, 0.9700193999999999, 0.9800195999999999, 0.9900197999999999], "y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.8856011079506229, 0.9877094578691705, 1.0129170462739892, 0.9942598577639803, 0.9905057478062209, 1.0177731012244537, 0.9652256179699472, 1.0306862904951828, 0.9839300024870791, 0.981735914506295, 0.940935451944931, 0.9338061736387321, 0.8802121067631179, 0.8728126581366307, 0.81646219099502, 0.8318136449419711, 0.7782875105789477, 0.7628952939074337, 0.6796024602501738, 0.6505281372121169, 0.6187652957858714, 0.5550517703622857, 0.48396810119763867, 0.45074171060999324, 0.38795330506080833, 0.3000415486071753, 0.20110504582992494, 0.2183565233376752, 0.10106447608828455, 0.07163610155332029, -0.005946849416737397, -0.05406454777588599, -0.1439545816816208, -0.16795094352444048, -0.25207089169495434, -0.31604219315719184, -0.3732631399231063, -0.42661093902308267, -0.4503182687591493, -0.5423134541241326, -0.6074681065002767, -0.6453554537992905, -0.7022421087354621, -0.7265830912116225, -0.8051212855509368, -0.7891389411078524, -0.8459068195623303, -0.8571555151744837, -0.8927708740100738, -0.9008138396786053, -0.9553819366518993, -0.9551187896347122, -0.9425923023894559, -1.0046500477702127, -0.9934970743885143, -0.985344120247634, -0.9806359663106443, -0.9799110565174629, -0.9892056480326116, -0.9729764417608449, -0.9465539399666492, -0.9354783356538175, -0.9429610362177594, -0.8878017195313418, -0.8474333187103936, -0.8114840814959102, -0.7843159261164344, -0.7363232024333112, -0.6884985736655037, -0.6581750030539111, -0.5722599661337242, -0.5329252552556069, -0.45754496023502633, -0.41840752079543525, -0.39763880715128364, -0.3238343306094702, -0.23753055005053633, -0.17493428649881493, -0.14993735337348432, -0.0655287833173425], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>



```python
#Unroll the RNN to 50 timesteps
sequence_length = 50
#predict one step ahead (currently can only be set to 1)
prediction_length = 1
#each input sample consists of 1 value 
input_feature_count = 1
#each output sample consists of 1 value
output_feature_count = 1

#The network will be trained using 128 example sequences
batch_size = 128 #512
#Use a three layer LSTM network with each layer of size 16
hidden_count_per_layer = [16,16,16]

tf.reset_default_graph()

#Define the inputs of the network, None is given as the first argument, it is the batch_size, which should be dynamic
inputs = tf.placeholder(tf.float32, [None, sequence_length, input_feature_count], name = 'inputs')
#define the target value which we want to predict, again None points to batch_size
targets = tf.placeholder(tf.float32, [None, output_feature_count], name = 'targets')
#Apply drop out regularization with keep_prob probability
keep_prob = tf.placeholder(tf.float32, name = 'keep')
#Learning rate of the adamoptimizer
learning_rate = tf.placeholder(tf.float32, name = 'learning_rate')
```

## Defining the LSTM multi layer network


```python
layers = []

for hidden_count in hidden_count_per_layer:
    layer =  tf.nn.rnn_cell.LSTMCell(hidden_count, state_is_tuple=True)
    layer_with_dropout = tf.nn.rnn_cell.DropoutWrapper(layer,
                                          input_keep_prob=keep_prob,
                                          output_keep_prob=1.0)
    layers.append(layer)
hidden_network = tf.nn.rnn_cell.MultiRNNCell(layers, state_is_tuple=True)   


```

## Packing/Unpacking the LSTM network state
In order to use the LSTM network to generate a predicted sequence of arbitrary length you need to store the state of the network. The output state after predicting a sample should be fed back in to the network when predicting the next sample.

Unfortunately the LSTM implementation in Tensor flow uses a LSTMStateTuple(c,h) data structure which is not very convenient to work with. The idea is to pack this LSTMStateTuple(c,h) into a 1D vector.

I'm not happy with these functions as they use the batch_size. This complicates things when using the network to generate predictions.

There is a pointer on how to use dynamic batch_sizes and packing/unpacking states [here](https://stackoverflow.com/questions/40438107/tensorflow-changing-batch-size-for-rnn-during-text-generation) The implementation of pack/unpack however doesn't work with my organisation of hidden_network).


```python
def get_network_state_size(network,batch_size):
    """Returns the number of states variables in the network"""
    states = 0
    for layer_size in hidden_network.state_size:
        states += layer_size[0]
        states += layer_size[1]
    return states * batch_size
    
def pack_state_tuple(states_per_layer):
    """Returns a (x,1) vector containing all the states of the network. 
    Input is the states obtained via outputs, state = tf.nn.dynamic_rnn(...)"""
    return tf.concat(axis=0, values=[tf.reshape(layer_states, (-1,1)) for layer_states in states_per_layer])

def unpack_state_tuple(network, batch_size, packed_states):
    """The inverse of pack, given a packed_states vector of (x,1) return the LSTMStateTuple 
    datastructure that can be used as initial state for tf.nn.dynamic_rnn(...) """
    rnn_list_state = []
    start_index = 0

    # build the data structure for each layer of the network
    for layer_size in hidden_network.state_size:
            # in the layer there are state_cnt state (c and h) variables
            states_cnt = batch_size * layer_size[0]
            states_c = tf.slice(packed_states, begin=[start_index,0], size=[states_cnt,1])
            states_c = tf.reshape(states_c,[batch_size, layer_size[0]])
            start_index += states_cnt
            states_cnt = batch_size * layer_size[1]
            states_h = tf.slice(packed_states, begin=[start_index,0], size=[states_cnt,1])
            states_h = tf.reshape(states_h,[batch_size, layer_size[1]])
            start_index += states_cnt
            
            rnn_list_state.append(tf.nn.rnn_cell.LSTMStateTuple(states_c,states_h))
    tuple_state=tuple(rnn_list_state)            
    return tuple_state
```


```python
sz = get_network_state_size(hidden_network,batch_size)
print("states in network", sz)

#initial_state and zero_state are both packed versions ((x,1) vectors) of the network state
zero_state = pack_state_tuple(hidden_network.zero_state(batch_size, tf.float32))
initial_state = tf.placeholder_with_default(
    zero_state, 
    (sz,1), 
    name="initial_state")


```

    states in network 12288


### Testing the packing/unpacking functions
In the following cell I check if the pack and unpack functions are indeed eachothers inverse. The vectors should be packed/unpacked in the correct order


```python
# Test to check that the pack and unpack functions are eachothers inverse

#copy of the input (packed) shape (x,1)
initial_copy = tf.slice(initial_state,(0,0),(sz,1))

#unpack into (LSTMTuple(),LSTMTuple(),....)
unpacked = unpack_state_tuple(hidden_network,batch_size,initial_copy)
# (rename) rnn_tuple_state will be later used as input for the network
rnn_tuple_state = unpacked
#repack into vector (x,1)
packed_again = pack_state_tuple(unpacked)


init=tf.global_variables_initializer()
with tf.Session() as sess:
    sess.run(init)

    cp = sess.run(initial_copy,  feed_dict={}) #initial_state: initial_state_input})
    cp[:,0] = np.linspace(start=0,stop=cp.shape[0],num=cp.shape[0])
    
    cp,up,cp2 = sess.run([initial_copy,unpacked,packed_again],  feed_dict={initial_state: cp}) #initial_state: initial_state_input})
    diff = cp - cp2
    # the sum should be zero
    print("diff",np.sum(np.abs(diff)))
```

    diff 0.0


## Forward propagation


```python
print("inputs ",inputs.shape)
outputs, state = tf.nn.dynamic_rnn(hidden_network, inputs, dtype=tf.float32, initial_state=rnn_tuple_state, )

#pack the output state of the network so we can feed it into initial_state later on
state_packed = pack_state_tuple(state)
print("outputs before transpose", outputs.shape)
outputs = tf.transpose(outputs, [1, 0, 2])
print("outputs after transpose", outputs.shape)
last_output = tf.gather(outputs, int(outputs.get_shape()[0]) - 1)
print("last output", last_output.shape)
                                   
#don't use any activation function as we want to predict the output sample
#amplitude directly.
predictions = tf.contrib.layers.fully_connected(last_output, output_feature_count, activation_fn=None)
print("prediction", predictions.shape)
print("targets", targets.shape)
#prediction = tf.nn.softmax(logit)
#loss = tf.losses.softmax_cross_entropy(target, logit)

```

    inputs  (?, 50, 1)
    outputs before transpose (128, 50, 16)
    outputs after transpose (50, 128, 16)
    last output (128, 16)
    prediction (128, 1)
    targets (?, 1)


## Backward pass, training


```python
loss = tf.reduce_sum(tf.squared_difference(predictions, targets))

#optimization
opt=tf.train.AdamOptimizer(learning_rate=learning_rate).minimize(loss)
```

## Defining the train, dev and test set


```python
# a train, dev, test sequence can start at any point in the dataset.
start_indices = np.linspace(
    0,
    sample_length-sequence_length-prediction_length-1,
    sample_length-sequence_length-prediction_length-1, dtype= np.int32)

dev_size_perc = 0.20
test_size_perc = 0.20

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

    dataset size 49949
    29971 Examples (234 batches) in train set
    9989 Examples (78 batches) in dev set
    9989 Examples (78 batches) in test set



```python
np.random.shuffle (start_indices)
train_indices = start_indices[0:int(train_size)]
dev_indices= start_indices[int(train_size):int(train_size+dev_size)]
test_indices = start_indices[int(train_size+dev_size):int(train_size+dev_size+test_size)]

def get_batch(batch_index, indexes, size=batch_size):
    """Get a batch of examples. Indexes is a list of shuffled starting points. """
    batch_start_indexes = indexes[batch_index*size:batch_index*size+size]
    batch_inputs = np.zeros((size,sequence_length, input_feature_count))
    batch_targets = np.zeros((size,prediction_length))
    for i in range(size):
        se = batch_start_indexes[i]
        part = signal_amp[se:se+sequence_length]
        batch_inputs[i,0:sequence_length,0] = part
        batch_targets[i,0] = signal_amp[se+sequence_length+1]

    return batch_inputs,batch_targets

#test the function
batch_inputs,batch_targets = get_batch(train_batch_count-1,train_indices)
print(batch_inputs.shape,batch_targets.shape)

example_inputs = batch_inputs[0,:,:]
example_targets =  batch_targets[0,:]
print(example_inputs.shape)
b_i = 1
b_s = batch_inputs[b_i,0:sequence_length,0]
plotly.offline.iplot({
    "data": [Scatter(y=b_s)],
    "layout": Layout(title="")
})
```

    (128, 50, 1) (128, 1)
    (50, 1)



<div id="0279d136-492a-47f7-83ce-b187134953ea" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("0279d136-492a-47f7-83ce-b187134953ea", [{"y": [0.9703383893266343, 0.9753326693736594, 0.9814503035622949, 0.997222221131622, 1.0484234656677376, 0.9718089171295026, 0.9773057907807741, 0.9811909625978172, 0.9125894529787928, 0.9105080336697406, 0.8677738894935115, 0.8390959741317334, 0.8102372339778863, 0.7264403386295789, 0.6994996159445169, 0.6698020795640238, 0.5848843855924721, 0.5711819550908097, 0.5210378712278715, 0.45460875866749223, 0.4245229476489774, 0.33861445123257394, 0.286654855074602, 0.24879244228210698, 0.18868608375623253, 0.1297982995691141, 0.06257023452842857, -0.050050903293258606, -0.08423057538598279, -0.13875649988231767, -0.22619509302761628, -0.2754526282641053, -0.3034968719944088, -0.3463874155245933, -0.40750153188500693, -0.4908390934441726, -0.5350664313105192, -0.6372392500012873, -0.6642267072724809, -0.6686107784392508, -0.7367244785266882, -0.7841673868928017, -0.8669595949778963, -0.8182777273004977, -0.8526545576518327, -0.9114326352050868, -0.9703834341242841, -0.9679620105203809, -0.9672740434402544, -0.9834135384168059], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


## Test training using a single batch
In the next cell I check if I can train the network on one single batch. Just to check if the optimizer indeed trains the network. In the output you will see the loss decreasing (first column)


```python
np.random.shuffle (start_indices)
train_indices = start_indices[0:int(train_size)]
dev_indices= start_indices[int(train_size):int(train_size+dev_size)]
test_indices = start_indices[int(train_size+dev_size):int(train_size+dev_size+test_size)]


init=tf.global_variables_initializer()
with tf.Session() as sess:
    sess.run(init)

    np.random.shuffle (train_indices)
    
    batch_inputs,batch_targets = get_batch(0, train_indices)
    print("batch input shape", batch_inputs.shape)
    #v_outputs, v_state = sess.run([outputs,state], feed_dict={inputs: batch_inputs, targets: batch_targets})
    v_predictions, v_state, v_state_packed = sess.run([predictions,state, state_packed], 
                                      feed_dict={
                                          inputs: batch_inputs, 
                                          targets: batch_targets
                                      })
    print(v_predictions.shape)
    print(v_predictions[0],batch_targets[0])
    for i in range(0,120):
        v_predictions, v_outputs, v_state, v_state_packed, v_loss, v_opt = sess.run(
            [predictions, outputs, state, state_packed, loss, opt], 
            feed_dict={
                learning_rate: 0.02, 
                inputs: batch_inputs, 
                targets: batch_targets,
                initial_state: v_state_packed
            }) #})
        print(v_loss,v_predictions[0],batch_targets[0])
 

    
    
```

    batch input shape (128, 50, 1)
    (128, 1)
    [ 0.00825402] [-0.87938952]
    73.196 [ 0.0084268] [-0.87938952]
    44.5674 [ 0.01241862] [-0.87938952]
    25.2639 [-0.30127254] [-0.87938952]
    13.3534 [-0.62422746] [-0.87938952]
    10.1409 [-1.0056057] [-0.87938952]
    3.40547 [-1.06023467] [-0.87938952]
    4.62868 [-1.06374276] [-0.87938952]
    2.84418 [-1.05242419] [-0.87938952]
    1.65521 [-0.97255898] [-0.87938952]
    2.69843 [-0.88899928] [-0.87938952]
    2.50259 [-0.84559721] [-0.87938952]
    1.6239 [-0.82453358] [-0.87938952]
    0.892349 [-0.81085068] [-0.87938952]
    1.34796 [-0.80802804] [-0.87938952]
    1.27122 [-0.82006747] [-0.87938952]
    0.8469 [-0.83399373] [-0.87938952]
    0.621678 [-0.83163124] [-0.87938952]
    0.962114 [-0.82015812] [-0.87938952]
    0.836633 [-0.82103443] [-0.87938952]
    0.846576 [-0.83150297] [-0.87938952]
    0.673405 [-0.83644444] [-0.87938952]
    0.676 [-0.84073049] [-0.87938952]
    0.519327 [-0.85216492] [-0.87938952]
    0.43075 [-0.8621732] [-0.87938952]
    0.393542 [-0.85977948] [-0.87938952]
    0.382521 [-0.84818017] [-0.87938952]
    0.471067 [-0.8397792] [-0.87938952]
    0.333946 [-0.84136051] [-0.87938952]
    0.223268 [-0.84949148] [-0.87938952]
    0.179265 [-0.85581475] [-0.87938952]
    0.213097 [-0.85790664] [-0.87938952]
    0.293772 [-0.86155486] [-0.87938952]
    0.229774 [-0.87020451] [-0.87938952]
    0.179667 [-0.87646759] [-0.87938952]
    0.165438 [-0.87057829] [-0.87938952]
    0.171767 [-0.85317016] [-0.87938952]
    0.162003 [-0.83252192] [-0.87938952]
    0.114405 [-0.81445473] [-0.87938952]
    0.141976 [-0.80059785] [-0.87938952]
    0.146801 [-0.79247439] [-0.87938952]
    0.12142 [-0.79325742] [-0.87938952]
    0.10272 [-0.80447906] [-0.87938952]
    0.105989 [-0.82246131] [-0.87938952]
    0.124479 [-0.83906096] [-0.87938952]
    0.10799 [-0.84732723] [-0.87938952]
    0.107331 [-0.84665042] [-0.87938952]
    0.103458 [-0.84048235] [-0.87938952]
    0.0855916 [-0.83111101] [-0.87938952]
    0.0771806 [-0.81979221] [-0.87938952]
    0.0838379 [-0.81013864] [-0.87938952]
    0.0962141 [-0.80734527] [-0.87938952]
    0.0787496 [-0.81352001] [-0.87938952]
    0.0701283 [-0.82543522] [-0.87938952]
    0.0696937 [-0.83750111] [-0.87938952]
    0.0706248 [-0.84680057] [-0.87938952]
    0.0684779 [-0.85314363] [-0.87938952]
    0.0700601 [-0.85502166] [-0.87938952]
    0.0688449 [-0.85027713] [-0.87938952]
    0.0610807 [-0.8409692] [-0.87938952]
    0.0605882 [-0.83246547] [-0.87938952]
    0.0627391 [-0.82776624] [-0.87938952]
    0.0620988 [-0.82636386] [-0.87938952]
    0.0572258 [-0.82764465] [-0.87938952]
    0.0581079 [-0.83190578] [-0.87938952]
    0.0574517 [-0.83771002] [-0.87938952]
    0.0567728 [-0.84159636] [-0.87938952]
    0.0563689 [-0.84197003] [-0.87938952]
    0.0579345 [-0.84056383] [-0.87938952]
    0.0561314 [-0.83886558] [-0.87938952]
    0.0552212 [-0.83662015] [-0.87938952]
    0.0548415 [-0.83442593] [-0.87938952]
    0.0543326 [-0.83411664] [-0.87938952]
    0.0533403 [-0.83590561] [-0.87938952]
    0.0541892 [-0.83805037] [-0.87938952]
    0.0541127 [-0.83962339] [-0.87938952]
    0.0527404 [-0.84105778] [-0.87938952]
    0.0522632 [-0.84194905] [-0.87938952]
    0.0525784 [-0.84126282] [-0.87938952]
    0.0525456 [-0.83960712] [-0.87938952]
    0.0520952 [-0.83844286] [-0.87938952]
    0.0520103 [-0.83772272] [-0.87938952]
    0.0512383 [-0.83675194] [-0.87938952]
    0.0512494 [-0.83592111] [-0.87938952]
    0.0514613 [-0.83554697] [-0.87938952]
    0.0512956 [-0.83492482] [-0.87938952]
    0.0507016 [-0.8339389] [-0.87938952]
    0.050723 [-0.83354551] [-0.87938952]
    0.0508044 [-0.83398002] [-0.87938952]
    0.0507239 [-0.83455127] [-0.87938952]
    0.0507856 [-0.83510149] [-0.87938952]
    0.0505401 [-0.83573049] [-0.87938952]
    0.0503673 [-0.83583385] [-0.87938952]
    0.0503659 [-0.83508784] [-0.87938952]
    0.0503891 [-0.83420664] [-0.87938952]
    0.0502393 [-0.83371413] [-0.87938952]
    0.0502068 [-0.83350575] [-0.87938952]
    0.0501868 [-0.8337971] [-0.87938952]
    0.0500452 [-0.83482474] [-0.87938952]
    0.0500631 [-0.83599472] [-0.87938952]
    0.0500275 [-0.83666551] [-0.87938952]
    0.0499422 [-0.83684188] [-0.87938952]
    0.0499061 [-0.83645171] [-0.87938952]
    0.0498415 [-0.83540541] [-0.87938952]
    0.0498021 [-0.83432436] [-0.87938952]
    0.0497925 [-0.83386499] [-0.87938952]
    0.0497466 [-0.83400637] [-0.87938952]
    0.049666 [-0.83462924] [-0.87938952]
    0.0496429 [-0.8356111] [-0.87938952]
    0.0496471 [-0.83638352] [-0.87938952]
    0.0496091 [-0.83653933] [-0.87938952]
    0.0495729 [-0.83629483] [-0.87938952]
    0.0495309 [-0.83586031] [-0.87938952]
    0.0494988 [-0.83538228] [-0.87938952]
    0.0494985 [-0.8352586] [-0.87938952]
    0.0494657 [-0.8356154] [-0.87938952]
    0.0494252 [-0.8361572] [-0.87938952]
    0.0494131 [-0.83671945] [-0.87938952]
    0.0493906 [-0.83715075] [-0.87938952]
    0.0493671 [-0.83716542] [-0.87938952]
    0.049347 [-0.83682513] [-0.87938952]


## Training and Testing




```python
np.random.shuffle (start_indices)
train_indices = start_indices[0:int(train_size)]
dev_indices= start_indices[int(train_size):int(train_size+dev_size)]
test_indices = start_indices[int(train_size+dev_size):int(train_size+dev_size+test_size)]

epoch_count = 5

loss_results = np.zeros((epoch_count,2))

def get_dev_loss():
    epoch_dev_loss = 0.0
    for devi in range(dev_batch_count):
        batch_inputs,batch_targets = get_batch(devi, dev_indices)

        batch_dev_loss = sess.run(loss,feed_dict={inputs:batch_inputs,targets:batch_targets})
        if (devi % 20) == 0:
            print("  Dev results batch %d, loss %s" %(  devi, str(batch_dev_loss)))  

        epoch_dev_loss += batch_dev_loss
        #sys.stdout.write('.')
        #sys.stdout.flush()
    return epoch_dev_loss / dev_size

def generate_graph(graph_size=200):
    prime_size = 20
    
    prime_signal_start_i = 0
    
    tmp_signal = np.zeros((graph_size,1))
    tmp_signal[0:prime_size,0] = signal_amp[prime_signal_start_i:(prime_signal_start_i+prime_size)]
    #tmp_signal[0:prime_size,0] = np.random.normal(size=prime_size)*0.6+0.1
    tmp_batch = np.zeros((batch_size,sequence_length,1))
    
    _state_packed = None
    for end in range(prime_size, graph_size):
        #end = prime_size
        tmp_batch[0,:,0] = tmp_signal.take(range((end-sequence_length),end), mode='wrap')
        if _state_packed is None:
            _state_packed , _prediction = sess.run(
                [state_packed, predictions[0,0]], 
                feed_dict={learning_rate: 0.02, inputs: tmp_batch})
        else:
            _state_packed , _prediction = sess.run(
                [state_packed, predictions[0,0]], 
                feed_dict={learning_rate: 0.02, initial_state: _state_packed, inputs: tmp_batch})
            
        #print(_prediction)
        tmp_signal[end,0] = _prediction
        sys.stdout.write('.')
        sys.stdout.flush()
    print("")
    plotly.offline.iplot({
       "data": [Scatter(y=tmp_signal[:,0])],
       "layout": Layout(title="")})


init=tf.global_variables_initializer()
with tf.Session() as sess:
    sess.run(init)

    epoch_dev_loss = get_dev_loss()    

    #print("")            
    print("Dev results epoch start, loss %s" %(  str(epoch_dev_loss),))  

    for epoch in range(0,epoch_count):
        np.random.shuffle (train_indices)
        epoch_train_loss = 0.0
        for ti in range(train_batch_count):
            batch_inputs,batch_targets = get_batch(ti, train_indices)

            batch_train_loss, _ = sess.run([loss, opt], feed_dict={learning_rate: 0.002, inputs: batch_inputs, targets: batch_targets})
            if (ti % 20) == 0:
                print("  Train results batch %d, loss %s" %(  ti, str(batch_train_loss)))  
            epoch_train_loss += batch_train_loss
            #sys.stdout.write('.')
            #sys.stdout.flush()
        #print("")
        epoch_train_loss = epoch_train_loss / train_size
        print("Training results epoch %d, loss %s" %( epoch, str(epoch_train_loss)))
        epoch_dev_loss = get_dev_loss()    
        #print("")            
        print("Dev results epoch %d, loss %s" %( epoch, str(epoch_dev_loss)))  
        loss_results[epoch,0] = epoch_train_loss
        loss_results[epoch,1] = epoch_dev_loss
        ti += 1
        generate_graph()
    generate_graph(graph_size=1000)
        
```

      Dev results batch 0, loss 67.4317
      Dev results batch 20, loss 66.0425
      Dev results batch 40, loss 67.267
      Dev results batch 60, loss 65.8533
    Dev results epoch start, loss 0.514305417585
      Train results batch 0, loss 69.2573
      Train results batch 20, loss 12.4881
      Train results batch 40, loss 0.832896
      Train results batch 60, loss 0.235991
      Train results batch 80, loss 0.0941328
      Train results batch 100, loss 0.0653589
      Train results batch 120, loss 0.0731907
      Train results batch 140, loss 0.0635686
      Train results batch 160, loss 0.066241
      Train results batch 180, loss 0.0584618
      Train results batch 200, loss 0.0693147
      Train results batch 220, loss 0.057407
    Training results epoch 0, loss 0.0292599497691
      Dev results batch 0, loss 0.0634809
      Dev results batch 20, loss 0.065406
      Dev results batch 40, loss 0.0620489
      Dev results batch 60, loss 0.0629092
    Dev results epoch 0, loss 0.000508144291636
    ....................................................................................................................................................................................



<div id="4280ca27-daf5-4678-8271-40b3c39ffb74" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("4280ca27-daf5-4678-8271-40b3c39ffb74", [{"y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.7760918140411377, 0.8104708790779114, 0.8301080465316772, 0.84134441614151, 0.844970703125, 0.8418330550193787, 0.832704484462738, 0.818229615688324, 0.798914909362793, 0.7751427292823792, 0.7471937537193298, 0.7152748703956604, 0.6795434355735779, 0.6401302814483643, 0.5971588492393494, 0.5507609248161316, 0.5010877251625061, 0.4483187198638916, 0.3926667869091034, 0.3343815505504608, 0.27375033497810364, 0.21109655499458313, 0.1467767059803009, 0.081174336373806, 0.014689497649669647, -0.05227550119161606, -0.11933226138353348, -0.18612337112426758, -0.25233548879623413, -0.31770381331443787, -0.3820072114467621, -0.44506123661994934, -0.5067581534385681, -0.5668529868125916, -0.6251973509788513, -0.6814050078392029, -0.735178530216217, -0.7860493659973145, -0.8336294293403625, -0.8774926662445068, -0.917210578918457, -0.952534019947052, -0.9832038283348083, -1.0090622901916504, -1.0300918817520142, -1.0462857484817505, -1.0577853918075562, -1.0646933317184448, -1.0671371221542358, -1.0653061866760254, -1.0593501329421997, -1.0493801832199097, -1.0355441570281982, -1.017928957939148, -0.9965969920158386, -0.9715867638587952, -0.9429157376289368, -0.9105865955352783, -0.8745947480201721, -0.8349370956420898, -0.7916243076324463, -0.7446917295455933, -0.6942107081413269, -0.6402977108955383, -0.5831195712089539, -0.5228944420814514, -0.4598892033100128, -0.39441171288490295, -0.3268031179904938, -0.2574305534362793, -0.18668124079704285, -0.11495933681726456, -0.04268283396959305, 0.029720284044742584, 0.1018197312951088, 0.17319494485855103, 0.2434493899345398, 0.3122268617153168, 0.3792269229888916, 0.4442135691642761, 0.5070176720619202, 0.5675287842750549, 0.6256774067878723, 0.6814072728157043, 0.7346438765525818, 0.785263180732727, 0.8330675363540649, 0.8777760863304138, 0.9190331697463989, 0.9564333558082581, 0.9895631670951843, 1.0180480480194092, 1.0415974855422974, 1.0600391626358032, 1.0733333826065063, 1.0815677642822266, 1.08492910861969, 1.0836647748947144, 1.0780375003814697, 1.0682860612869263, 1.0545945167541504, 1.0370780229568481, 1.0157800912857056, 0.9906842112541199, 0.9617310166358948, 0.9288453459739685, 0.8919629454612732, 0.8510598540306091, 0.8061752319335938, 0.7574254274368286, 0.7050039768218994, 0.6491677165031433, 0.5902124047279358, 0.5284458994865417, 0.46416983008384705, 0.39767202734947205, 0.3292331397533417, 0.2591410279273987, 0.1877066195011139, 0.11527606099843979, 0.042231880128383636, -0.03101819008588791, -0.10406395047903061, -0.1765209436416626, -0.24805593490600586, -0.31840142607688904, -0.3873527944087982, -0.4547500014305115, -0.5204471945762634, -0.5842785239219666, -0.6460285186767578, -0.7054134607315063, -0.762077808380127, -0.8156078457832336, -0.8655593991279602, -0.911494255065918, -0.9530194401741028, -0.98981773853302, -1.021669864654541, -1.0484615564346313, -1.070177674293518, -1.086887001991272, -1.0987225770950317, -1.1058589220046997, -1.108491063117981, -1.1068178415298462, -1.1010273694992065, -1.091286540031433, -1.0777357816696167, -1.0604841709136963, -1.0396095514297485, -1.0151588916778564, -0.9871517419815063, -0.9555860757827759, -0.9204455018043518, -0.8817089200019836, -0.8393628001213074, -0.7934134602546692, -0.7439007759094238, -0.6909092664718628, -0.6345764398574829, -0.5750947594642639, -0.5127099752426147, -0.44771286845207214, -0.3804300129413605, -0.311214417219162, -0.24043816328048706, -0.16848963499069214, -0.09577123075723648, -0.022698260843753815, 0.05030456930398941, 0.12281226366758347, 0.19441241025924683, 0.26472097635269165, 0.3333999216556549, 0.40017077326774597, 0.4648224711418152, 0.5272108316421509, 0.5872474312782288, 0.6448781490325928], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


      Train results batch 0, loss 0.0637692
      Train results batch 20, loss 0.0541024
      Train results batch 40, loss 0.0695865
      Train results batch 60, loss 0.0548981
      Train results batch 80, loss 0.0616153
      Train results batch 100, loss 0.0525488
      Train results batch 120, loss 0.0666363
      Train results batch 140, loss 0.0715255
      Train results batch 160, loss 0.0610526
      Train results batch 180, loss 0.0603319
      Train results batch 200, loss 0.0708398
      Train results batch 220, loss 0.0887008
    Training results epoch 1, loss 0.000479385734936
      Dev results batch 0, loss 0.0665972
      Dev results batch 20, loss 0.0673353
      Dev results batch 40, loss 0.067419
      Dev results batch 60, loss 0.0644791
    Dev results epoch 1, loss 0.000525869703968
    ....................................................................................................................................................................................



<div id="47b27409-0802-4a78-b392-722a970f1a8a" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("47b27409-0802-4a78-b392-722a970f1a8a", [{"y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.7516124248504639, 0.7852950096130371, 0.803863525390625, 0.8136905431747437, 0.815618634223938, 0.8105448484420776, 0.7992827892303467, 0.7825082540512085, 0.7607545852661133, 0.7344319820404053, 0.7038553953170776, 0.669273853302002, 0.6308953762054443, 0.5889077186584473, 0.5434935092926025, 0.4948407709598541, 0.4431491494178772, 0.3886335790157318, 0.33152610063552856, 0.27207836508750916, 0.21056398749351501, 0.14728258550167084, 0.08256250619888306, 0.01676192879676819, -0.04973512887954712, -0.11653023958206177, -0.18322530388832092, -0.24944211542606354, -0.31483760476112366, -0.37911221385002136, -0.44200801849365234, -0.5033031702041626, -0.5628499984741211, -0.6203892230987549, -0.6757533550262451, -0.7285743951797485, -0.7785781621932983, -0.8253542184829712, -0.8685826063156128, -0.907923698425293, -0.9430423974990845, -0.9737691879272461, -0.9999182224273682, -1.0213836431503296, -1.0381731986999512, -1.050288200378418, -1.0578505992889404, -1.060934066772461, -1.059630036354065, -1.0540740489959717, -1.0443634986877441, -1.0305863618850708, -1.0128189325332642, -0.9911066293716431, -0.9654772281646729, -0.935945987701416, -0.9025211334228516, -0.8652122020721436, -0.824042797088623, -0.7790603637695312, -0.730349063873291, -0.6780399084091187, -0.6223164796829224, -0.5634154081344604, -0.5016199350357056, -0.4372505843639374, -0.37065014243125916, -0.30217260122299194, -0.23217551410198212, -0.161017507314682, -0.08906038105487823, -0.01667541265487671, 0.05575437843799591, 0.1278344988822937, 0.19916582107543945, 0.26935622096061707, 0.3380347192287445, 0.40486764907836914, 0.4695691764354706, 0.5319070816040039, 0.5917011499404907, 0.6488089561462402, 0.7031081914901733, 0.7544721364974976, 0.8027472496032715, 0.8477369546890259, 0.8891962766647339, 0.926841139793396, 0.9603689908981323, 0.9894882440567017, 1.0139518976211548, 1.0335853099822998, 1.0483063459396362, 1.058129072189331, 1.0631532669067383, 1.0635374784469604, 1.0594677925109863, 1.0511209964752197, 1.0386372804641724, 1.0221017599105835, 1.0015408992767334, 0.9769304990768433, 0.9482152462005615, 0.9153372049331665, 0.8782644271850586, 0.8370230197906494, 0.7917205095291138, 0.742556095123291, 0.6898136138916016, 0.6338374614715576, 0.5749944448471069, 0.5136369466781616, 0.4500742554664612, 0.3845631778240204, 0.31731653213500977, 0.24852606654167175, 0.17839181423187256, 0.10715033113956451, 0.0350949764251709, -0.03741982579231262, -0.1099911630153656, -0.18219345808029175, -0.2536139488220215, -0.3238820731639862, -0.3926873207092285, -0.4597780406475067, -0.5249450206756592, -0.5879939794540405, -0.648717999458313, -0.7068747282028198, -0.7621766328811646, -0.8142943382263184, -0.8628716468811035, -0.907551646232605, -0.9480037689208984, -0.9839509725570679, -1.01518714427948, -1.0415863990783691, -1.0631020069122314, -1.0797572135925293, -1.0916310548782349, -1.0988410711288452, -1.1015267372131348, -1.0998352766036987, -1.0939083099365234, -1.0838725566864014, -1.0698347091674805, -1.0518765449523926, -1.0300538539886475, -1.0043988227844238, -0.9749239683151245, -0.9416277408599854, -0.9045051336288452, -0.8635585308074951, -0.818811297416687, -0.7703231573104858, -0.7182005643844604, -0.6626074314117432, -0.6037675142288208, -0.5419576168060303, -0.4774971306324005, -0.41073155403137207, -0.3420166075229645, -0.271708220243454, -0.2001582384109497, -0.12771666049957275, -0.05473996698856354, 0.01840434968471527, 0.09133325517177582, 0.1636532098054886, 0.2349696159362793, 0.30490097403526306, 0.37309566140174866, 0.4392453134059906, 0.5030955076217651, 0.5644460916519165, 0.6231443881988525, 0.6790682077407837, 0.7321032285690308, 0.7821183204650879], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


      Train results batch 0, loss 0.0512211
      Train results batch 20, loss 0.0571462
      Train results batch 40, loss 0.0485674
      Train results batch 60, loss 0.0459265
      Train results batch 80, loss 0.057221
      Train results batch 100, loss 0.0648001
      Train results batch 120, loss 0.0816927
      Train results batch 140, loss 0.0603868
      Train results batch 160, loss 0.0590188
      Train results batch 180, loss 0.0579038
      Train results batch 200, loss 0.052959
      Train results batch 220, loss 0.0676021
    Training results epoch 2, loss 0.000463835547777
      Dev results batch 0, loss 0.0588876
      Dev results batch 20, loss 0.0617509
      Dev results batch 40, loss 0.0641777
      Dev results batch 60, loss 0.0607291
    Dev results epoch 2, loss 0.000498005627485
    ....................................................................................................................................................................................



<div id="3eecbe07-4e08-49e6-8cc0-c788d99245aa" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("3eecbe07-4e08-49e6-8cc0-c788d99245aa", [{"y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.7394694685935974, 0.7732225656509399, 0.7916431427001953, 0.8011756539344788, 0.8027026057243347, 0.7971570491790771, 0.7853776216506958, 0.7680561542510986, 0.7457371950149536, 0.7188413739204407, 0.6876965761184692, 0.6525680422782898, 0.6136838793754578, 0.5712542533874512, 0.5254822969436646, 0.47657328844070435, 0.42473548650741577, 0.3701813220977783, 0.31312787532806396, 0.25379884243011475, 0.19243018329143524, 0.12927906215190887, 0.06463521718978882, -0.0011698296293616295, -0.06775875389575958, -0.13471457362174988, -0.20159588754177094, -0.2679605484008789, -0.3333902060985565, -0.3975094258785248, -0.45999377965927124, -0.5205703973770142, -0.5790497660636902, -0.6351877450942993, -0.6888235211372375, -0.7396427989006042, -0.787416934967041, -0.8318014144897461, -0.872534990310669, -0.9093366861343384, -0.9419219493865967, -0.9701540470123291, -0.9938681125640869, -1.012963056564331, -1.0274362564086914, -1.0372689962387085, -1.0425513982772827, -1.0433229207992554, -1.0396400690078735, -1.0315985679626465, -1.0192605257034302, -1.0027068853378296, -0.9819743633270264, -0.9570938348770142, -0.9280902743339539, -0.8949877023696899, -0.8578203320503235, -0.8166413307189941, -0.7715362906455994, -0.7226346135139465, -0.6701173186302185, -0.614221453666687, -0.5552358627319336, -0.4934900999069214, -0.42933768033981323, -0.36313849687576294, -0.2952429950237274, -0.2259843349456787, -0.15568028390407562, -0.08464017510414124, -0.013177617453038692, 0.058378830552101135, 0.1296810805797577, 0.20036154985427856, 0.270042359828949, 0.3383479714393616, 0.4049210846424103, 0.4694385230541229, 0.5316205024719238, 0.5912339687347412, 0.6480875015258789, 0.7020178437232971, 0.7528714537620544, 0.8004862666130066, 0.8446764349937439, 0.8852270841598511, 0.921898603439331, 0.954441249370575, 0.9826189279556274, 1.0062326192855835, 1.025145411491394, 1.0392969846725464, 1.048707127571106, 1.053465485572815, 1.053709626197815, 1.0495942831039429, 1.0412606000900269, 1.0288101434707642, 1.0122904777526855, 0.9916937351226807, 0.966969907283783, 0.9380493760108948, 0.9048759341239929, 0.8674398064613342, 0.8258093595504761, 0.7801514267921448, 0.7307335734367371, 0.6779063940048218, 0.6220664978027344, 0.5636099576950073, 0.5028902292251587, 0.4401906132698059, 0.37571823596954346, 0.3096160292625427, 0.2419922947883606, 0.17295651137828827, 0.10265913605690002, 0.03132256865501404, -0.04073941707611084, -0.1131240725517273, -0.1853618025779724, -0.25695639848709106, -0.32742828130722046, -0.3963511884212494, -0.46336907148361206, -0.5281946063041687, -0.5905894041061401, -0.6503385305404663, -0.7072250843048096, -0.7610129117965698, -0.8114414215087891, -0.8582308292388916, -0.9010974168777466, -0.9397740960121155, -0.9740292429924011, -1.0036827325820923, -1.0286142826080322, -1.0487651824951172, -1.0641319751739502, -1.07475745677948, -1.0807169675827026, -1.0821064710617065, -1.0790292024612427, -1.0715867280960083, -1.0598706007003784, -1.0439567565917969, -1.0239038467407227, -0.9997527599334717, -0.9715299606323242, -0.9392532110214233, -0.9029404520988464, -0.8626217842102051, -0.8183526396751404, -0.7702289819717407, -0.7183993458747864, -0.6630725860595703, -0.6045194864273071, -0.5430629253387451, -0.47906166315078735, -0.4128880500793457, -0.3449070453643799, -0.2754630148410797, -0.20487508177757263, -0.13344497978687286, -0.06146898865699768, 0.01074709091335535, 0.08287714421749115, 0.15457144379615784, 0.2254604697227478, 0.2951667904853821, 0.3633207082748413, 0.4295770823955536, 0.4936295747756958, 0.5552189946174622, 0.6141331195831299, 0.6701986193656921, 0.7232639789581299, 0.7731803059577942, 0.8197829723358154, 0.8628780841827393], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


      Train results batch 0, loss 0.0580112
      Train results batch 20, loss 0.0504064
      Train results batch 40, loss 0.0635144
      Train results batch 60, loss 0.0602902
      Train results batch 80, loss 0.0705813
      Train results batch 100, loss 0.0602441
      Train results batch 120, loss 0.0550283
      Train results batch 140, loss 0.0529087
      Train results batch 160, loss 0.0573836
      Train results batch 180, loss 0.0430824
      Train results batch 200, loss 0.0559826
      Train results batch 220, loss 0.0800156
    Training results epoch 3, loss 0.00047796561527
      Dev results batch 0, loss 0.0572026
      Dev results batch 20, loss 0.0659019
      Dev results batch 40, loss 0.0621342
      Dev results batch 60, loss 0.0622063
    Dev results epoch 3, loss 0.000500707149532
    ....................................................................................................................................................................................



<div id="235d3013-7587-49f5-b213-e8f095b73c4c" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("235d3013-7587-49f5-b213-e8f095b73c4c", [{"y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.7407649755477905, 0.7747678160667419, 0.7945847511291504, 0.8056722283363342, 0.8089380860328674, 0.8053374886512756, 0.7957184314727783, 0.7807733416557312, 0.7610400319099426, 0.736927330493927, 0.7087478637695312, 0.6767495274543762, 0.6411409974098206, 0.6021116375923157, 0.559844434261322, 0.5145221948623657, 0.4663310647010803, 0.41545823216438293, 0.3620915710926056, 0.30641669034957886, 0.2486198991537094, 0.18889382481575012, 0.12744785845279694, 0.06452144682407379, 0.0003970703110098839, -0.06459242105484009, -0.13006529211997986, -0.19560225307941437, -0.26076894998550415, -0.3251403868198395, -0.3883243203163147, -0.44997480511665344, -0.5098194479942322, -0.5676270723342896, -0.623214840888977, -0.6763327121734619, -0.7267768979072571, -0.7742543816566467, -0.8185192346572876, -0.8592934012413025, -0.8962706923484802, -0.9292612671852112, -0.9580371975898743, -0.9824211597442627, -1.0023318529129028, -1.017676591873169, -1.0284825563430786, -1.0347366333007812, -1.0364558696746826, -1.0337121486663818, -1.0265547037124634, -1.0150610208511353, -0.9992779493331909, -0.9792463779449463, -0.95500248670578, -0.9265819191932678, -0.8940252661705017, -0.8573873043060303, -0.8167471289634705, -0.7722197771072388, -0.7239654064178467, -0.672195315361023, -0.6171718239784241, -0.5592004656791687, -0.49861517548561096, -0.4357595145702362, -0.3709675073623657, -0.30455002188682556, -0.23679181933403015, -0.1679551750421524, -0.09829412400722504, -0.0280696302652359, 0.04243505001068115, 0.11290650069713593, 0.18299883604049683, 0.252340704202652, 0.320549339056015, 0.38724735379219055, 0.45208218693733215, 0.5147410035133362, 0.5749591588973999, 0.6325210928916931, 0.6872504949569702, 0.7389955520629883, 0.7876091003417969, 0.83293217420578, 0.8747830986976624, 0.9129549860954285, 0.9472247362136841, 0.9773685932159424, 1.003185510635376, 1.0245198011398315, 1.0412802696228027, 1.053450345993042, 1.0610880851745605, 1.0643105506896973, 1.0632693767547607, 1.0581201314926147, 1.0489915609359741, 1.035964012145996, 1.0190579891204834, 0.9982405304908752, 0.9734435677528381, 0.944594144821167, 0.9116524457931519, 0.8746475577354431, 0.8337036967277527, 0.7890509963035583, 0.741009533405304, 0.6899556517601013, 0.6362761855125427, 0.5803261399269104, 0.5223983526229858, 0.46271011233329773, 0.401406466960907, 0.33857402205467224, 0.27426496148109436, 0.20852577686309814, 0.1414291113615036, 0.07310517132282257, 0.003765552304685116, -0.06628347933292389, -0.1366480439901352, -0.20687073469161987, -0.27646714448928833, -0.344966322183609, -0.4119439423084259, -0.4770391285419464, -0.5399544835090637, -0.6004418134689331, -0.6582815051078796, -0.713259756565094, -0.7651532292366028, -0.8137220740318298, -0.8587122559547424, -0.8998667597770691, -0.9369412064552307, -0.9697201251983643, -0.9980306625366211, -1.0217502117156982, -1.0408085584640503, -1.0551837682724, -1.064894676208496, -1.0699899196624756, -1.0705382823944092, -1.0666171312332153, -1.0583043098449707, -1.0456715822219849, -1.0287809371948242, -1.007681965827942, -0.982414186000824, -0.953010618686676, -0.919505774974823, -0.8819445967674255, -0.840395987033844, -0.7949654459953308, -0.7458077669143677, -0.6931330561637878, -0.6372098326683044, -0.5783543586730957, -0.5169149041175842, -0.4532487690448761, -0.38770028948783875, -0.320585161447525, -0.25218456983566284, -0.18275189399719238, -0.1125275045633316, -0.041757211089134216, 0.029291197657585144, 0.10031607747077942, 0.17098090052604675, 0.2409190982580185, 0.3097485601902008, 0.3770899772644043, 0.4425855576992035, 0.5059165358543396, 0.5668131709098816, 0.6250563263893127, 0.6804692149162292, 0.7329029440879822], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


      Train results batch 0, loss 0.071077
      Train results batch 20, loss 0.0660187
      Train results batch 40, loss 0.0553178
      Train results batch 60, loss 0.0540919
      Train results batch 80, loss 0.0737468
      Train results batch 100, loss 0.058318
      Train results batch 120, loss 0.0558164
      Train results batch 140, loss 0.108144
      Train results batch 160, loss 0.0770534
      Train results batch 180, loss 0.057335
      Train results batch 200, loss 0.056666
      Train results batch 220, loss 0.0731215
    Training results epoch 4, loss 0.000517237689982
      Dev results batch 0, loss 0.0526761
      Dev results batch 20, loss 0.0563564
      Dev results batch 40, loss 0.059949
      Dev results batch 60, loss 0.0573288
    Dev results epoch 4, loss 0.000479971210733
    ....................................................................................................................................................................................



<div id="73a1bff1-24db-4349-b3fc-fae4e41d3513" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("73a1bff1-24db-4349-b3fc-fae4e41d3513", [{"y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.7253214120864868, 0.7571551203727722, 0.775370180606842, 0.7845554351806641, 0.7856546640396118, 0.7796734571456909, 0.7675037384033203, 0.7498718500137329, 0.7273421883583069, 0.7003464102745056, 0.6692197322845459, 0.6342344284057617, 0.5956267714500427, 0.5536160469055176, 0.5084152221679688, 0.4602353870868683, 0.4092872142791748, 0.3557790219783783, 0.299916535615921, 0.24190424382686615, 0.18195243179798126, 0.12028680741786957, 0.0571630485355854, -0.0071211280301213264, -0.07221727073192596, -0.13772828876972198, -0.20321974158287048, -0.2682419717311859, -0.3323558568954468, -0.39515572786331177, -0.45628368854522705, -0.5154333114624023, -0.5723661184310913, -0.6268722414970398, -0.6787771582603455, -0.7278327941894531, -0.7738348841667175, -0.8165004253387451, -0.8556014895439148, -0.8908928632736206, -0.9221189022064209, -0.9491370320320129, -0.971777081489563, -0.9899159669876099, -1.0035089254379272, -1.0125000476837158, -1.0169180631637573, -1.016757845878601, -1.0120412111282349, -1.0028105974197388, -0.9890941381454468, -0.9710291028022766, -0.9485781192779541, -0.9217778444290161, -0.8906723260879517, -0.8553217053413391, -0.8158130049705505, -0.7722699642181396, -0.724862813949585, -0.6738149523735046, -0.6194031238555908, -0.5619484186172485, -0.5018011927604675, -0.43931931257247925, -0.3748484253883362, -0.30870506167411804, -0.2411728799343109, -0.17250864207744598, -0.10295732319355011, -0.032771747559309006, 0.03776915743947029, 0.10834799706935883, 0.1786055862903595, 0.24814768135547638, 0.3165605068206787, 0.38343119621276855, 0.448373019695282, 0.511043131351471, 0.571156919002533, 0.6284899115562439, 0.6828681230545044, 0.7341514229774475, 0.7822117805480957, 0.8269116878509521, 0.8680905103683472, 0.9055575728416443, 0.9390976428985596, 0.968485951423645, 0.9935089349746704, 1.0139905214309692, 1.0298136472702026, 1.0409375429153442, 1.047402024269104, 1.0493168830871582, 1.046839952468872, 1.040141224861145, 1.0293670892715454, 1.014609694480896, 0.9958900213241577, 0.9731618165969849, 0.9463344812393188, 0.9153110384941101, 0.8800382018089294, 0.8405519127845764, 0.797011137008667, 0.7497056722640991, 0.6990299820899963, 0.645433783531189, 0.589360773563385, 0.5311965942382812, 0.4712371230125427, 0.4096831679344177, 0.34665387868881226, 0.28221407532691956, 0.2164093554019928, 0.14930303394794464, 0.08101154863834381, 0.011732908897101879, -0.05823865160346031, -0.12851503491401672, -0.1986367553472519, -0.26810985803604126, -0.33644771575927734, -0.4032069742679596, -0.46800851821899414, -0.530540943145752, -0.5905482769012451, -0.647810697555542, -0.7021230459213257, -0.7532779574394226, -0.8010571599006653, -0.8452314138412476, -0.8855677247047424, -0.9218425154685974, -0.9538545608520508, -0.981437087059021, -1.004465103149414, -1.022857427597046, -1.0365747213363647, -1.0456129312515259, -1.04999577999115, -1.0497654676437378, -1.0449739694595337, -1.0356775522232056, -1.0219295024871826, -1.0037782192230225, -0.981265664100647, -0.9544306993484497, -0.9233132004737854, -0.8879622220993042, -0.8484477996826172, -0.8048741817474365, -0.7573918104171753, -0.706209123134613, -0.6515951752662659, -0.5938739776611328, -0.5334078669548035, -0.4705730676651001, -0.4057343304157257, -0.3392234444618225, -0.27133071422576904, -0.20230844616889954, -0.1323874443769455, -0.06179885193705559, 0.009203392080962658, 0.08032698929309845, 0.1512332409620285, 0.22154182195663452, 0.29084330797195435, 0.35872089862823486, 0.4247741103172302, 0.4886419177055359, 0.550018846988678, 0.6086617708206177, 0.6643843054771423, 0.7170420289039612, 0.766510546207428, 0.8126636147499084, 0.8553539514541626, 0.8944042921066284], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


    ....................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................



<div id="d1bc878f-d184-467c-abe7-b9bf3ca7229f" style="height: 525px; width: 100%;" class="plotly-graph-div"></div><script type="text/javascript">require(["plotly"], function(Plotly) { window.PLOTLYENV=window.PLOTLYENV || {};window.PLOTLYENV.BASE_URL="https://plot.ly";Plotly.newPlot("d1bc878f-d184-467c-abe7-b9bf3ca7229f", [{"y": [0.006849252726229103, 0.07597551874978475, 0.09967494457469789, 0.1982338967148018, 0.23383428928558758, 0.3196779790786714, 0.3608652499639993, 0.43391774113203746, 0.5046068623425323, 0.5278579907309652, 0.6101407385974817, 0.6622688223063481, 0.6822878855037228, 0.739489242686864, 0.7366465987288342, 0.8292956845296502, 0.8806853476002646, 0.8587503162121335, 0.9093086866748915, 0.9535849125340627, 0.7253214120864868, 0.7571551203727722, 0.775370180606842, 0.7845554351806641, 0.7856546640396118, 0.7796734571456909, 0.7675037384033203, 0.7498718500137329, 0.7273421883583069, 0.7003464102745056, 0.6692197322845459, 0.6342344284057617, 0.5956267714500427, 0.5536160469055176, 0.5084152221679688, 0.4602353870868683, 0.4092872142791748, 0.3557790219783783, 0.299916535615921, 0.24190424382686615, 0.18195243179798126, 0.12028680741786957, 0.0571630485355854, -0.0071211280301213264, -0.07221727073192596, -0.13772828876972198, -0.20321974158287048, -0.2682419717311859, -0.3323558568954468, -0.39515572786331177, -0.45628368854522705, -0.5154333114624023, -0.5723661184310913, -0.6268722414970398, -0.6787771582603455, -0.7278327941894531, -0.7738348841667175, -0.8165004253387451, -0.8556014895439148, -0.8908928632736206, -0.9221189022064209, -0.9491370320320129, -0.971777081489563, -0.9899159669876099, -1.0035089254379272, -1.0125000476837158, -1.0169180631637573, -1.016757845878601, -1.0120412111282349, -1.0028105974197388, -0.9890941381454468, -0.9710291028022766, -0.9485781192779541, -0.9217778444290161, -0.8906723260879517, -0.8553217053413391, -0.8158130049705505, -0.7722699642181396, -0.724862813949585, -0.6738149523735046, -0.6194031238555908, -0.5619484186172485, -0.5018011927604675, -0.43931931257247925, -0.3748484253883362, -0.30870506167411804, -0.2411728799343109, -0.17250864207744598, -0.10295732319355011, -0.032771747559309006, 0.03776915743947029, 0.10834799706935883, 0.1786055862903595, 0.24814768135547638, 0.3165605068206787, 0.38343119621276855, 0.448373019695282, 0.511043131351471, 0.571156919002533, 0.6284899115562439, 0.6828681230545044, 0.7341514229774475, 0.7822117805480957, 0.8269116878509521, 0.8680905103683472, 0.9055575728416443, 0.9390976428985596, 0.968485951423645, 0.9935089349746704, 1.0139905214309692, 1.0298136472702026, 1.0409375429153442, 1.047402024269104, 1.0493168830871582, 1.046839952468872, 1.040141224861145, 1.0293670892715454, 1.014609694480896, 0.9958900213241577, 0.9731618165969849, 0.9463344812393188, 0.9153110384941101, 0.8800382018089294, 0.8405519127845764, 0.797011137008667, 0.7497056722640991, 0.6990299820899963, 0.645433783531189, 0.589360773563385, 0.5311965942382812, 0.4712371230125427, 0.4096831679344177, 0.34665387868881226, 0.28221407532691956, 0.2164093554019928, 0.14930303394794464, 0.08101154863834381, 0.011732908897101879, -0.05823865160346031, -0.12851503491401672, -0.1986367553472519, -0.26810985803604126, -0.33644771575927734, -0.4032069742679596, -0.46800851821899414, -0.530540943145752, -0.5905482769012451, -0.647810697555542, -0.7021230459213257, -0.7532779574394226, -0.8010571599006653, -0.8452314138412476, -0.8855677247047424, -0.9218425154685974, -0.9538545608520508, -0.981437087059021, -1.004465103149414, -1.022857427597046, -1.0365747213363647, -1.0456129312515259, -1.04999577999115, -1.0497654676437378, -1.0449739694595337, -1.0356775522232056, -1.0219295024871826, -1.0037782192230225, -0.981265664100647, -0.9544306993484497, -0.9233132004737854, -0.8879622220993042, -0.8484477996826172, -0.8048741817474365, -0.7573918104171753, -0.706209123134613, -0.6515951752662659, -0.5938739776611328, -0.5334078669548035, -0.4705730676651001, -0.4057343304157257, -0.3392234444618225, -0.27133071422576904, -0.20230844616889954, -0.1323874443769455, -0.06179885193705559, 0.009203392080962658, 0.08032698929309845, 0.1512332409620285, 0.22154182195663452, 0.29084330797195435, 0.35872089862823486, 0.4247741103172302, 0.4886419177055359, 0.550018846988678, 0.6086617708206177, 0.6643843054771423, 0.7170420289039612, 0.766510546207428, 0.8126636147499084, 0.8553539514541626, 0.8944042921066284, 0.9296075105667114, 0.9607388973236084, 0.987575888633728, 1.0099221467971802, 1.027633786201477, 1.0406382083892822, 1.0489447116851807, 1.0526405572891235, 1.0518720149993896, 1.0468140840530396, 1.037631630897522, 1.0244455337524414, 1.0073076486587524, 0.9861968159675598, 0.9610321521759033, 0.9317077398300171, 0.8981380462646484, 0.8603101372718811, 0.8183256387710571, 0.7724212408065796, 0.7229583263397217, 0.6703805327415466, 0.6151514053344727, 0.5576945543289185, 0.49834996461868286, 0.43735814094543457, 0.37486791610717773, 0.3109588027000427, 0.24567560851573944, 0.1790650635957718, 0.11121325194835663, 0.04227772727608681, -0.027490880340337753, -0.09774406254291534, -0.16804924607276917, -0.23792149126529694, -0.30686521530151367, -0.3744131326675415, -0.4401564598083496, -0.5037540197372437, -0.5649277567863464, -0.6234448552131653, -0.6790961623191833, -0.7316774725914001, -0.7809759378433228, -0.8267670273780823, -0.8688182830810547, -0.9069007635116577, -0.9408019781112671, -0.970339298248291, -0.9953690767288208, -1.015791416168213, -1.0315496921539307, -1.0426256656646729, -1.0490323305130005, -1.050804853439331, -1.0479927062988281, -1.0406509637832642, -1.0288350582122803, -1.012595534324646, -0.9919778108596802, -0.9670213460922241, -0.9377648830413818, -0.9042516350746155, -0.8665412664413452, -0.8247207403182983, -0.7789190411567688, -0.7293180823326111, -0.6761603951454163, -0.6197476387023926, -0.5604279637336731, -0.4985750615596771, -0.4345623254776001, -0.36873775720596313, -0.3014102876186371, -0.23284713923931122, -0.1632860004901886, -0.0929548591375351, -0.022094707936048508, 0.04902011528611183, 0.12007191777229309, 0.19069768488407135, 0.2604985535144806, 0.32905781269073486, 0.39596492052078247, 0.46083900332450867, 0.5233487486839294, 0.5832233428955078, 0.6402531862258911, 0.6942774653434753, 0.7451661825180054, 0.7927965521812439, 0.8370321393013, 0.8777095675468445, 0.9146344661712646, 0.947587251663208, 0.9763418436050415, 1.000686764717102, 1.020452618598938, 1.0355333089828491, 1.0459015369415283, 1.0516117811203003, 1.0527878999710083, 1.0495961904525757, 1.0422111749649048, 1.0307766199111938, 1.0153765678405762, 0.99602210521698, 0.9726547002792358, 0.9451746940612793, 0.9134809970855713, 0.8775229454040527, 0.8373469710350037, 0.7931299209594727, 0.745181679725647, 0.6939167976379395, 0.6397980451583862, 0.5832735300064087, 0.5247234106063843, 0.4644327461719513, 0.40258851647377014, 0.33929693698883057, 0.2746138274669647, 0.2085799276828766, 0.14125986397266388, 0.07277621328830719, 0.003336879424750805, -0.06675226986408234, -0.13709281384944916, -0.20721788704395294, -0.27663135528564453, -0.3448491394519806, -0.4114343523979187, -0.47601550817489624, -0.5382886528968811, -0.5980033874511719, -0.6549428105354309, -0.7089027762413025, -0.759675145149231, -0.8070401549339294, -0.8507681488990784, -0.8906271457672119, -0.9263953566551208, -0.9578758478164673, -0.9849069118499756, -1.007369041442871, -1.0251868963241577, -1.0383260250091553, -1.0467870235443115, -1.0505961179733276, -1.0497974157333374, -1.0444446802139282, -1.0345934629440308, -1.0202974081039429, -1.0016038417816162, -0.9785544872283936, -0.951187789440155, -0.9195441007614136, -0.8836744427680969, -0.8436520099639893, -0.7995855212211609, -0.7516323328018188, -0.7000080347061157, -0.644989013671875, -0.5869050621986389, -0.5261217355728149, -0.4630158245563507, -0.3979489803314209, -0.33124858140945435, -0.2631990909576416, -0.19404961168766022, -0.12402921915054321, -0.0533706359565258, 0.01766832545399666, 0.08879025280475616, 0.15965114533901215, 0.2298663705587387, 0.299024373292923, 0.36670881509780884, 0.4325230121612549, 0.49611175060272217, 0.5571770668029785, 0.6154829263687134, 0.6708489656448364, 0.7231345772743225, 0.7722164392471313, 0.8179664015769958, 0.860234260559082, 0.8988385200500488, 0.9335697889328003, 0.9642019271850586, 0.9905142784118652, 1.0123153924942017, 1.0294687747955322, 1.0419118404388428, 1.0496633052825928, 1.0528188943862915, 1.0515300035476685, 1.0459725856781006, 1.0363081693649292, 1.022649884223938, 1.005041480064392, 0.9834533929824829, 0.9577991366386414, 0.9279727935791016, 0.8938949704170227, 0.8555642366409302, 0.8130972981452942, 0.7667475938796997, 0.7168886661529541, 0.6639701724052429, 0.6084538698196411, 0.5507552623748779, 0.49120306968688965, 0.430026113986969, 0.3673633337020874, 0.30328842997550964, 0.23784403502941132, 0.1710798591375351, 0.10308896005153656, 0.03403900936245918, -0.03580788895487785, -0.10609187185764313, -0.17637236416339874, -0.24616077542304993, -0.3149626553058624, -0.3823172152042389, -0.44782280921936035, -0.5111467242240906, -0.5720171928405762, -0.6302051544189453, -0.685503363609314, -0.7377066612243652, -0.7866010665893555, -0.8319607973098755, -0.8735530376434326, -0.9111500382423401, -0.944542407989502, -0.9735515713691711, -0.9980391263961792, -1.017910122871399, -1.0331132411956787, -1.0436338186264038, -1.0494883060455322, -1.0507140159606934, -1.0473613739013672, -1.0394858121871948, -1.0271424055099487, -1.0103813409805298, -0.9892464876174927, -0.9637778401374817, -0.9340135455131531, -0.8999989032745361, -0.8617954850196838, -0.8194950222969055, -0.7732317447662354, -0.7231947183609009, -0.6696339845657349, -0.6128572225570679, -0.5532171726226807, -0.49108874797821045, -0.42684340476989746, -0.36082524061203003, -0.29333776235580444, -0.2246442288160324, -0.15497957170009613, -0.08457253873348236, -0.013667029328644276, 0.05745791271328926, 0.1284792423248291, 0.19902850687503815, 0.2687039077281952, 0.3370884656906128, 0.4037734270095825, 0.4683833122253418, 0.5305935144424438, 0.5901406407356262, 0.6468214392662048, 0.7004803419113159, 0.7509890794754028, 0.7982243895530701, 0.8420471549034119, 0.8822901844978333, 0.9187556505203247, 0.95122230052948, 0.9794641137123108, 1.003273844718933, 1.022487998008728, 1.0370094776153564, 1.046820878982544, 1.0519858598709106, 1.052634596824646, 1.0489367246627808, 1.0410646200180054, 1.0291566848754883, 1.0132886171340942, 0.9934622049331665, 0.9696128368377686, 0.9416376352310181, 0.9094393849372864, 0.8729761242866516, 0.8323089480400085, 0.7876306772232056, 0.7392659187316895, 0.6876380443572998, 0.6332114934921265, 0.5764282941818237, 0.5176587700843811, 0.4571760892868042, 0.3951559066772461, 0.3316969871520996, 0.26685115694999695, 0.2006605714559555, 0.13319459557533264, 0.06458495557308197, -0.004949462600052357, -0.0750909149646759, -0.14543120563030243, -0.21549804508686066, -0.2847942113876343, -0.3528400957584381, -0.4192056357860565, -0.4835277497768402, -0.5455096364021301, -0.6049061417579651, -0.6615028381347656, -0.7150957584381104, -0.7654756903648376, -0.8124215602874756, -0.8557027578353882, -0.895087480545044, -0.9303569793701172, -0.9613173604011536, -0.9878119230270386, -1.0097261667251587, -1.0269904136657715, -1.0395739078521729, -1.0474811792373657, -1.050741195678711, -1.0493996143341064, -1.0435103178024292, -1.033129334449768, -1.018309235572815, -0.9990968108177185, -0.9755334854125977, -0.9476571679115295, -0.9155093431472778, -0.879142701625824, -0.8386338949203491, -0.7940973043441772, -0.7456961274147034, -0.6936535835266113, -0.6382530331611633, -0.579829216003418, -0.5187509059906006, -0.4553939700126648, -0.3901170492172241, -0.3232424259185791, -0.2550501823425293, -0.18578553199768066, -0.1156768947839737, -0.044959183782339096, 0.026106152683496475, 0.0972159206867218, 0.16802121698856354, 0.23813258111476898, 0.30713748931884766, 0.37462034821510315, 0.44018810987472534, 0.5034918785095215, 0.5642409324645996, 0.6222066283226013, 0.6772140860557556, 0.7291262149810791, 0.777819812297821, 0.8231650590896606, 0.865008533000946, 0.9031648635864258, 0.9374217987060547, 0.9675528407096863, 0.993338942527771, 1.0145946741104126, 1.031191349029541, 1.0430753231048584, 1.050275206565857, 1.0528948307037354, 1.0510904788970947, 1.0450382232666016, 1.0348953008651733, 1.0207679271697998, 1.0026901960372925, 0.9806249737739563, 0.9544814825057983, 0.9241539239883423, 0.8895697593688965, 0.8507397174835205, 0.8077964782714844, 0.7610088586807251, 0.7107626795768738, 0.6575121879577637, 0.6017168760299683, 0.5437832474708557, 0.48402824997901917, 0.4226694405078888, 0.3598361313343048, 0.29559677839279175, 0.2299928367137909, 0.1630769819021225, 0.09494999051094055, 0.025789830833673477, -0.04412944242358208, -0.11443735659122467, -0.18468551337718964, -0.2543823719024658, -0.3230358362197876, -0.39019063115119934, -0.45545363426208496, -0.5184996128082275, -0.5790632963180542, -0.6369192004203796, -0.6918609738349915, -0.7436833381652832, -0.7921704649925232, -0.8370954990386963, -0.8782255053520203, -0.9153344631195068, -0.9482153654098511, -0.976694643497467, -1.000638723373413, -1.0199581384658813, -1.0346057415008545, -1.0445715188980103, -1.0498746633529663, -1.050554633140564, -1.04666268825531, -1.0382542610168457, -1.0253843069076538, -1.0081021785736084, -0.9864514470100403, -0.9604712724685669, -0.9302002191543579, -0.895685076713562, -0.8569901585578918, -0.8142116069793701, -0.7674896717071533, -0.7170204520225525, -0.6630611419677734, -0.6059256792068481, -0.5459706783294678, -0.48357218503952026, -0.4190993905067444, -0.35289180278778076, -0.2852482199668884, -0.2164275050163269, -0.14666293561458588, -0.07618330419063568, -0.005236473865807056, 0.06589402258396149, 0.1368793100118637, 0.20734648406505585, 0.27689066529273987, 0.3450945317745209, 0.4115522801876068, 0.47589337825775146, 0.5378000736236572, 0.5970168113708496, 0.6533464789390564, 0.7066381573677063, 0.7567652463912964, 0.80360347032547, 0.8470109701156616, 0.8868170380592346, 0.9228200316429138, 0.9547971487045288, 0.9825235605239868, 1.0057955980300903, 1.0244568586349487, 1.0384188890457153, 1.047674298286438, 1.0522956848144531, 1.0524195432662964, 1.0482178926467896, 1.0398610830307007, 1.0274808406829834, 1.011144757270813, 0.9908454418182373, 0.9665124416351318, 0.9380408525466919, 0.9053372144699097, 0.8683697581291199, 0.8272141218185425, 0.7820792198181152, 0.7333040833473206, 0.6813197135925293, 0.6265914440155029, 0.5695551633834839, 0.510570228099823, 0.4498976171016693, 0.3877028226852417, 0.3240772485733032, 0.25906965136528015, 0.19272324442863464, 0.12511320412158966, 0.05638046935200691, -0.013244462199509144, -0.08343233168125153, -0.15376584231853485, -0.2237672358751297, -0.2929394841194153, -0.36080729961395264, -0.42694804072380066, -0.491007000207901, -0.5526942610740662, -0.611769437789917, -0.6680205464363098, -0.7212433815002441, -0.7712277173995972, -0.8177511692047119, -0.8605822920799255, -0.8994900584220886, -0.9342579245567322, -0.9646960496902466, -0.990652322769165, -1.012018084526062, -1.028727650642395, -1.0407558679580688, -1.048110008239746, -1.0508216619491577, -1.0489376783370972, -1.0425127744674683, -1.0316026210784912, -1.0162590742111206, -0.9965286254882812, -0.9724516272544861, -0.9440665245056152, -0.911415159702301, -0.8745526671409607, -0.8335593342781067, -0.7885545492172241, -0.739708662033081, -0.6872519254684448, -0.6314742565155029, -0.5727159976959229, -0.5113478899002075, -0.44774508476257324, -0.3822626769542694, -0.3152180314064026, -0.24688602983951569, -0.1775095909833908, -0.10731618106365204, -0.03654284402728081, 0.03454463556408882, 0.10563744604587555, 0.17638130486011505, 0.24638350307941437, 0.31522923707962036, 0.38250476121902466, 0.4478212296962738, 0.5108360052108765, 0.5712657570838928, 0.6288886666297913, 0.6835357546806335, 0.7350723743438721, 0.7833759188652039, 0.8283146619796753, 0.8697308301925659, 0.9074363708496094, 0.9412157535552979, 0.9708424806594849, 0.9961003065109253, 1.0168086290359497, 1.0328474044799805, 1.0441726446151733, 1.0508226156234741, 1.0529086589813232, 1.0505913496017456, 1.0440462827682495, 1.0334266424179077, 1.0188301801681519, 1.000282883644104, 0.9777393937110901, 0.951104998588562, 0.920275092124939, 0.8851847052574158, 0.8458571434020996, 0.8024413585662842, 0.7552214860916138, 0.7045944929122925, 0.6510187983512878, 0.5949499607086182, 0.5367856025695801, 0.4768308997154236, 0.41529208421707153, 0.35228922963142395, 0.2878859043121338, 0.22212298214435577, 0.15505705773830414, 0.08679647743701935, 0.017529968172311783, -0.05245659872889519, -0.12278209626674652, -0.19299092888832092, -0.26258930563926697, -0.33108776807785034, -0.39803749322891235, -0.4630531370639801, -0.5258176326751709, -0.5860713124275208, -0.6435921788215637, -0.6981749534606934, -0.7496131658554077, -0.7976899147033691, -0.8421769738197327, -0.8828415870666504, -0.9194591045379639, -0.9518263339996338, -0.9797738790512085, -1.0031733512878418, -1.0219401121139526, -1.0360323190689087, -1.0454436540603638, -1.0501960515975952, -1.0503308773040771, -1.0459002256393433, -1.0369600057601929, -1.0235642194747925, -1.005761742591858, -0.9835953712463379, -0.9571041464805603, -0.9263270497322083, -0.8913122415542603, -0.8521273732185364, -0.8088725805282593, -0.7616947889328003, -0.710797131061554, -0.6564435958862305, -0.598954439163208, -0.5386898517608643, -0.47602635622024536, -0.4113307595252991, -0.3449380397796631, -0.27714207768440247, -0.2081974893808365, -0.1383359134197235, -0.06778748333454132, 0.003196793608367443, 0.07432825863361359, 0.14527228474617004, 0.21565161645412445, 0.2850586771965027, 0.35307615995407104, 0.4193013608455658, 0.48336905241012573, 0.544968843460083, 0.6038523316383362, 0.6598290205001831, 0.7127516269683838, 0.7624953985214233, 0.8089345693588257, 0.851924479007721, 0.8912903666496277, 0.9268276691436768, 0.9583123326301575, 0.9855203628540039, 1.008252501487732, 1.0263594388961792, 1.039762020111084, 1.0484627485275269, 1.0525423288345337, 1.052143931388855, 1.0474408864974976, 1.0386009216308594, 1.0257494449615479, 1.0089448690414429, 0.9881720542907715, 0.9633537530899048, 0.9343844056129456, 0.9011750221252441, 0.8637043237686157, 0.8220629692077637, 0.7764763832092285, 0.7272967100143433, 0.6749626398086548, 0.6199390292167664, 0.5626547336578369, 0.50345778465271, 0.4425976574420929, 0.38022953271865845, 0.3164379596710205, 0.2512691617012024, 0.18476778268814087, 0.11701564490795135, 0.04816316440701485, -0.021547671407461166, -0.09177616238594055, -0.16209587454795837, -0.23202486336231232, -0.301066517829895, -0.36875027418136597, -0.43466129899024963, -0.49845290184020996, -0.5598421692848206, -0.618593156337738, -0.6744958162307739, -0.7273457050323486, -0.7769314646720886, -0.8230291604995728, -0.8654067516326904, -0.9038344621658325, -0.9380979537963867, -0.9680115580558777, -0.9934282898902893, -1.0142441987991333, -1.030399203300476, -1.0418721437454224, -1.0486735105514526, -1.0508373975753784, -1.0484119653701782, -1.041452169418335, -1.0300134420394897, -1.014147400856018, -0.9938993453979492, -0.9693093299865723, -0.9404157996177673, -0.9072616100311279, -0.8699042797088623, -0.8284280896186829, -0.7829577326774597, -0.7336704730987549, -0.6808033585548401, -0.624653697013855, -0.5655660629272461, -0.5039133429527283, -0.44006970524787903, -0.37438634037971497, -0.30717524886131287, -0.23870737850666046, -0.16922201216220856, -0.09894707798957825, -0.028121720999479294, 0.0429832823574543, 0.11405417323112488, 0.18473105132579803, 0.25461798906326294, 0.3232989013195038, 0.39036163687705994, 0.45542195439338684, 0.5181436538696289, 0.5782508850097656, 0.6355288028717041, 0.6898136138916016, 0.7409730553627014, 0.7888848781585693, 0.8334144949913025, 0.8744012117385864, 0.9116525053977966, 0.9449513554573059, 0.97407066822052, 0.9987971782684326, 1.0189566612243652, 1.0344371795654297, 1.0452041625976562, 1.051305890083313, 1.0528604984283447, 1.050032615661621, 1.042997121810913, 1.0319017171859741, 1.0168370008468628, 0.9978194236755371, 0.9747961163520813, 0.947669267654419, 0.9163361191749573, 0.8807395696640015, 0.8409167528152466, 0.797032356262207, 0.7493859529495239, 0.698384702205658, 0.6444900631904602, 0.588153600692749, 0.529762864112854, 0.46961140632629395, 0.4078938961029053, 0.3447226285934448, 0.28015583753585815, 0.21423466503620148, 0.14702008664608002, 0.07862842082977295, 0.009259629063308239, -0.060788702219724655, -0.1311253309249878, -0.2012878656387329, -0.27078089118003845, -0.33911794424057007, -0.40585705637931824, -0.4706209897994995, -0.5331003069877625, -0.593040943145752, -0.650223970413208, -0.7044446468353271, -0.7554957270622253], "type": "scatter"}], {"title": ""}, {"linkText": "Export to plot.ly", "showLink": true})});</script>


## Conclusion, next steps

  * Implement a dynamic batch size
  * Apply on raw audio
      * Sample microfone via WebAudo, send the samples to the notebook via WebSocket, analyze and feed the result back
  * Implement a phase vocodor, instead of raw audio, input the frequency features
  * Achieve something like [this](https://deepmind.com/blog/wavenet-generative-model-raw-audio/) :)
