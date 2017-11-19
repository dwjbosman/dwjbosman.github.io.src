Title: A notebook

```python
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

num_epochs = 100
total_series_length = 50000
truncated_backprop_length = 15
state_size = 4
num_classes = 2
echo_step = 3
batch_size = 5
num_batches = total_series_length//batch_size//truncated_backprop_length
```


```python
def generateData():
    x = np.array(np.random.choice(2, total_series_length, p=[0.5, 0.5]))
    y = np.roll(x, echo_step)
    y[0:echo_step] = 0
    
    x = x.reshape((batch_size, -1))  # The first index changing slowest, subseries as rows
    #print(x.shape)
    y = y.reshape((batch_size, -1))

    return (x, y)
tmp=generateData()
```

    (5, 10000)



```python
batchX_placeholder = tf.placeholder(tf.float32, [batch_size, truncated_backprop_length])
batchY_placeholder = tf.placeholder(tf.int32, [batch_size, truncated_backprop_length])

init_state = tf.placeholder(tf.float32, [batch_size, state_size])

```


```python
W = tf.Variable(np.random.rand(state_size+1, state_size), dtype=tf.float32)
b = tf.Variable(np.zeros((1,state_size)), dtype=tf.float32)

W2 = tf.Variable(np.random.rand(state_size, num_classes),dtype=tf.float32)
b2 = tf.Variable(np.zeros((1,num_classes)), dtype=tf.float32)
```


```python
# Unpack columns
inputs_series = tf.unstack(batchX_placeholder, axis=1)
labels_series = tf.unstack(batchY_placeholder, axis=1)
```


```python
# Forward pass
current_state = init_state
states_series = []
for current_input in inputs_series:
    current_input = tf.reshape(current_input, [batch_size, 1])
    input_and_state_concatenated = tf.concat(1, [current_input, current_state])  # Increasing number of columns

    next_state = tf.tanh(tf.matmul(input_and_state_concatenated, W) + b)  # Broadcasted addition
    states_series.append(next_state)
current_state = next_state
```


    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)

    <ipython-input-52-4ac3079ec7b1> in <module>()
          4 for current_input in inputs_series:
          5     current_input = tf.reshape(current_input, [batch_size, 1])
    ----> 6     input_and_state_concatenated = tf.concat(1, [current_input, current_state])  # Increasing number of columns
          7 
          8     next_state = tf.tanh(tf.matmul(input_and_state_concatenated, W) + b)  # Broadcasted addition


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/ops/array_ops.py in concat(values, axis, name)
       1094       ops.convert_to_tensor(
       1095           axis, name="concat_dim",
    -> 1096           dtype=dtypes.int32).get_shape().assert_is_compatible_with(
       1097               tensor_shape.scalar())
       1098       return identity(values[0], name=scope)


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/framework/ops.py in convert_to_tensor(value, dtype, name, preferred_dtype)
        834       name=name,
        835       preferred_dtype=preferred_dtype,
    --> 836       as_ref=False)
        837 
        838 


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/framework/ops.py in internal_convert_to_tensor(value, dtype, name, as_ref, preferred_dtype, ctx)
        924 
        925     if ret is None:
    --> 926       ret = conversion_func(value, dtype=dtype, name=name, as_ref=as_ref)
        927 
        928     if ret is NotImplemented:


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/framework/constant_op.py in _constant_tensor_conversion_function(v, dtype, name, as_ref)
        227                                          as_ref=False):
        228   _ = as_ref
    --> 229   return constant(v, dtype=dtype, name=name)
        230 
        231 


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/framework/constant_op.py in constant(value, dtype, shape, name, verify_shape)
        206   tensor_value.tensor.CopyFrom(
        207       tensor_util.make_tensor_proto(
    --> 208           value, dtype=dtype, shape=shape, verify_shape=verify_shape))
        209   dtype_value = attr_value_pb2.AttrValue(type=tensor_value.tensor.dtype)
        210   const_tensor = g.create_op(


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/framework/tensor_util.py in make_tensor_proto(values, dtype, shape, verify_shape)
        381       nparray = np.empty(shape, dtype=np_dt)
        382     else:
    --> 383       _AssertCompatible(values, dtype)
        384       nparray = np.array(values, dtype=np_dt)
        385       # check to them.


    /usr/local/lib/python3.5/dist-packages/tensorflow/python/framework/tensor_util.py in _AssertCompatible(values, dtype)
        301     else:
        302       raise TypeError("Expected %s, got %s of type '%s' instead." %
    --> 303                       (dtype.name, repr(mismatch), type(mismatch).__name__))
        304 
        305 


    TypeError: Expected int32, got list containing Tensors of type '_Message' instead.



```python

from __future__ import print_function, division
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

num_epochs = 100
total_series_length = 50000
truncated_backprop_length = 15
state_size = 4
num_classes = 2
echo_step = 3
batch_size = 5
num_batches = total_series_length//batch_size//truncated_backprop_length

def generateData():
    x = np.array(np.random.choice(2, total_series_length, p=[0.5, 0.5]))
    y = np.roll(x, echo_step)
    y[0:echo_step] = 0

    x = x.reshape((batch_size, -1))  # The first index changing slowest, subseries as rows
    y = y.reshape((batch_size, -1))

    return (x, y)

batchX_placeholder = tf.placeholder(tf.float32, [batch_size, truncated_backprop_length])
batchY_placeholder = tf.placeholder(tf.int32, [batch_size, truncated_backprop_length])

init_state = tf.placeholder(tf.float32, [batch_size, state_size])

W = tf.Variable(np.random.rand(state_size+1, state_size), dtype=tf.float32)
b = tf.Variable(np.zeros((1,state_size)), dtype=tf.float32)

W2 = tf.Variable(np.random.rand(state_size, num_classes),dtype=tf.float32)
b2 = tf.Variable(np.zeros((1,num_classes)), dtype=tf.float32)

# Unpack columns
inputs_series = tf.unstack(batchX_placeholder, axis=1)
labels_series = tf.unstack(batchY_placeholder, axis=1)

# Forward pass
current_state = init_state
states_series = []
for current_input in inputs_series:
    current_input = tf.reshape(current_input, [batch_size, 1])
    input_and_state_concatenated = tf.concat([current_input, current_state],1)  # Increasing number of columns

    next_state = tf.tanh(tf.matmul(input_and_state_concatenated, W) + b)  # Broadcasted addition
    states_series.append(next_state)
    current_state = next_state

logits_series = [tf.matmul(state, W2) + b2 for state in states_series] #Broadcasted addition
predictions_series = [tf.nn.softmax(logits) for logits in logits_series]

losses = [tf.nn.sparse_softmax_cross_entropy_with_logits(logits=logits, labels=labels) for logits, labels in zip(logits_series,labels_series)]
total_loss = tf.reduce_mean(losses)

train_step = tf.train.AdagradOptimizer(0.3).minimize(total_loss)

def plot(loss_list, predictions_series, batchX, batchY):
    plt.subplot(2, 3, 1)
    plt.cla()
    plt.plot(loss_list)

    for batch_series_idx in range(5):
        one_hot_output_series = np.array(predictions_series)[:, batch_series_idx, :]
        single_output_series = np.array([(1 if out[0] < 0.5 else 0) for out in one_hot_output_series])

        plt.subplot(2, 3, batch_series_idx + 2)
        plt.cla()
        plt.axis([0, truncated_backprop_length, 0, 2])
        left_offset = range(truncated_backprop_length)
        plt.bar(left_offset, batchX[batch_series_idx, :], width=1, color="blue")
        plt.bar(left_offset, batchY[batch_series_idx, :] * 0.5, width=1, color="red")
        plt.bar(left_offset, single_output_series * 0.3, width=1, color="green")

    plt.draw()
    plt.pause(0.0001)


with tf.Session() as sess:
    sess.run(tf.initialize_all_variables())
    plt.ion()
    plt.figure()
    plt.show()
    loss_list = []

    for epoch_idx in range(num_epochs):
        x,y = generateData()
        _current_state = np.zeros((batch_size, state_size))

        print("New data, epoch", epoch_idx)

        for batch_idx in range(num_batches):
            start_idx = batch_idx * truncated_backprop_length
            end_idx = start_idx + truncated_backprop_length

            batchX = x[:,start_idx:end_idx]
            batchY = y[:,start_idx:end_idx]

            _total_loss, _train_step, _current_state, _predictions_series = sess.run(
                [total_loss, train_step, current_state, predictions_series],
                feed_dict={
                    batchX_placeholder:batchX,
                    batchY_placeholder:batchY,
                    init_state:_current_state
                })

            loss_list.append(_total_loss)

            if batch_idx%100 == 0:
                print("Step",batch_idx, "Loss", _total_loss)
                plot(loss_list, _predictions_series, batchX, batchY)

plt.ioff()
plt.show()

```

    WARNING:tensorflow:From /usr/local/lib/python3.5/dist-packages/tensorflow/python/util/tf_should_use.py:107: initialize_all_variables (from tensorflow.python.ops.variables) is deprecated and will be removed after 2017-03-02.
    Instructions for updating:
    Use `tf.global_variables_initializer` instead.



    <matplotlib.figure.Figure at 0x7fe9d9f3b668>


    New data, epoch 0
    Step 0 Loss 1.07125



![png](RNN_files/RNN_6_3.png)


    Step 100 Loss 0.693241



![png](RNN_files/RNN_6_5.png)


    Step 200 Loss 0.36993



![png](RNN_files/RNN_6_7.png)


    Step 300 Loss 0.0164067



![png](RNN_files/RNN_6_9.png)


    Step 400 Loss 0.00814864



![png](RNN_files/RNN_6_11.png)


    Step 500 Loss 0.0049567



![png](RNN_files/RNN_6_13.png)


    Step 600 Loss 0.00410617



![png](RNN_files/RNN_6_15.png)


    New data, epoch 1
    Step 0 Loss 0.12148



![png](RNN_files/RNN_6_17.png)


    Step 100 Loss 0.0059931



![png](RNN_files/RNN_6_19.png)


    Step 200 Loss 0.00348456



![png](RNN_files/RNN_6_21.png)


    Step 300 Loss 0.00271249



![png](RNN_files/RNN_6_23.png)


    Step 400 Loss 0.00223826



![png](RNN_files/RNN_6_25.png)


    Step 500 Loss 0.00226034



![png](RNN_files/RNN_6_27.png)


    Step 600 Loss 0.00186489



![png](RNN_files/RNN_6_29.png)


    New data, epoch 2
    Step 0 Loss 0.187685



![png](RNN_files/RNN_6_31.png)


    Step 100 Loss 0.00133134



![png](RNN_files/RNN_6_33.png)


    Step 200 Loss 0.00127057



![png](RNN_files/RNN_6_35.png)


    Step 300 Loss 0.00143714



![png](RNN_files/RNN_6_37.png)


    Step 400 Loss 0.00111574



![png](RNN_files/RNN_6_39.png)


    Step 500 Loss 0.00100028



![png](RNN_files/RNN_6_41.png)


    Step 600 Loss 0.0008697



![png](RNN_files/RNN_6_43.png)


    New data, epoch 3
    Step 0 Loss 0.166001



![png](RNN_files/RNN_6_45.png)


    Step 100 Loss 0.000912137



![png](RNN_files/RNN_6_47.png)


    Step 200 Loss 0.000867449



![png](RNN_files/RNN_6_49.png)


    Step 300 Loss 0.000833183



![png](RNN_files/RNN_6_51.png)


    Step 400 Loss 0.00069551



![png](RNN_files/RNN_6_53.png)


    Step 500 Loss 0.000741409



![png](RNN_files/RNN_6_55.png)


    Step 600 Loss 0.000546224



![png](RNN_files/RNN_6_57.png)


    New data, epoch 4
    Step 0 Loss 0.139698



![png](RNN_files/RNN_6_59.png)


    Step 100 Loss 0.000685644



![png](RNN_files/RNN_6_61.png)


    Step 200 Loss 0.000574397



![png](RNN_files/RNN_6_63.png)


    Step 300 Loss 0.000578429



![png](RNN_files/RNN_6_65.png)


    Step 400 Loss 0.000498919



![png](RNN_files/RNN_6_67.png)


    Step 500 Loss 0.000595561



![png](RNN_files/RNN_6_69.png)


    Step 600 Loss 0.000482958



![png](RNN_files/RNN_6_71.png)


    New data, epoch 5
    Step 0 Loss 0.203901



![png](RNN_files/RNN_6_73.png)


    Step 100 Loss 0.000481904



![png](RNN_files/RNN_6_75.png)


    Step 200 Loss 0.000448492



![png](RNN_files/RNN_6_77.png)


    Step 300 Loss 0.000412147



![png](RNN_files/RNN_6_79.png)


    Step 400 Loss 0.000524883



![png](RNN_files/RNN_6_81.png)


    Step 500 Loss 0.000414415



![png](RNN_files/RNN_6_83.png)


    Step 600 Loss 0.000438884



![png](RNN_files/RNN_6_85.png)


    New data, epoch 6
    Step 0 Loss 0.155198



![png](RNN_files/RNN_6_87.png)


    Step 100 Loss 0.000383026



![png](RNN_files/RNN_6_89.png)


    Step 200 Loss 0.000430898



![png](RNN_files/RNN_6_91.png)


    Step 300 Loss 0.000364003



![png](RNN_files/RNN_6_93.png)


    Step 400 Loss 0.000406275



![png](RNN_files/RNN_6_95.png)


    Step 500 Loss 0.000395748



![png](RNN_files/RNN_6_97.png)


    Step 600 Loss 0.000358205



![png](RNN_files/RNN_6_99.png)


    New data, epoch 7
    Step 0 Loss 0.18041



![png](RNN_files/RNN_6_101.png)


    Step 100 Loss 0.000331059



![png](RNN_files/RNN_6_103.png)


    Step 200 Loss 0.000314816



![png](RNN_files/RNN_6_105.png)


    Step 300 Loss 0.000339814



![png](RNN_files/RNN_6_107.png)


    Step 400 Loss 0.000353175



![png](RNN_files/RNN_6_109.png)


    Step 500 Loss 0.000318253



![png](RNN_files/RNN_6_111.png)


    Step 600 Loss 0.000365742



![png](RNN_files/RNN_6_113.png)


    New data, epoch 8
    Step 0 Loss 0.219404



![png](RNN_files/RNN_6_115.png)


    Step 100 Loss 0.00027422



![png](RNN_files/RNN_6_117.png)


    Step 200 Loss 0.00035519



![png](RNN_files/RNN_6_119.png)


    Step 300 Loss 0.000284643



![png](RNN_files/RNN_6_121.png)


    Step 400 Loss 0.000295539



![png](RNN_files/RNN_6_123.png)


    Step 500 Loss 0.000286519



![png](RNN_files/RNN_6_125.png)


    Step 600 Loss 0.000254551



![png](RNN_files/RNN_6_127.png)


    New data, epoch 9
    Step 0 Loss 0.221185



![png](RNN_files/RNN_6_129.png)


    Step 100 Loss 0.000338885



![png](RNN_files/RNN_6_131.png)


    Step 200 Loss 0.000270251



![png](RNN_files/RNN_6_133.png)


    Step 300 Loss 0.000280382



![png](RNN_files/RNN_6_135.png)


    Step 400 Loss 0.000230942



![png](RNN_files/RNN_6_137.png)


    Step 500 Loss 0.000272087



![png](RNN_files/RNN_6_139.png)


    Step 600 Loss 0.000290121



![png](RNN_files/RNN_6_141.png)


    New data, epoch 10
    Step 0 Loss 0.308103



![png](RNN_files/RNN_6_143.png)


    Step 100 Loss 0.000271362



![png](RNN_files/RNN_6_145.png)


    Step 200 Loss 0.000217331



![png](RNN_files/RNN_6_147.png)


    Step 300 Loss 0.000266937



![png](RNN_files/RNN_6_149.png)


    Step 400 Loss 0.000272792



![png](RNN_files/RNN_6_151.png)


    Step 500 Loss 0.000233873



![png](RNN_files/RNN_6_153.png)


    Step 600 Loss 0.00022395



![png](RNN_files/RNN_6_155.png)


    New data, epoch 11
    Step 0 Loss 0.331107



![png](RNN_files/RNN_6_157.png)


    Step 100 Loss 0.000300824



![png](RNN_files/RNN_6_159.png)


    Step 200 Loss 0.000287699



![png](RNN_files/RNN_6_161.png)


    Step 300 Loss 0.000277439



![png](RNN_files/RNN_6_163.png)


    Step 400 Loss 0.000260206



![png](RNN_files/RNN_6_165.png)


    Step 500 Loss 0.000192886



![png](RNN_files/RNN_6_167.png)


    Step 600 Loss 0.00023299



![png](RNN_files/RNN_6_169.png)


    New data, epoch 12
    Step 0 Loss 0.141896



![png](RNN_files/RNN_6_171.png)


    Step 100 Loss 0.000235209



![png](RNN_files/RNN_6_173.png)


    Step 200 Loss 0.000212689



![png](RNN_files/RNN_6_175.png)


    Step 300 Loss 0.000166708



![png](RNN_files/RNN_6_177.png)


    Step 400 Loss 0.000205341



![png](RNN_files/RNN_6_179.png)


    Step 500 Loss 0.000192494



![png](RNN_files/RNN_6_181.png)


    Step 600 Loss 0.000199206



![png](RNN_files/RNN_6_183.png)


    New data, epoch 13
    Step 0 Loss 0.291513



![png](RNN_files/RNN_6_185.png)


    Step 100 Loss 0.000212753



![png](RNN_files/RNN_6_187.png)


    Step 200 Loss 0.000174835



![png](RNN_files/RNN_6_189.png)


    Step 300 Loss 0.000182657



![png](RNN_files/RNN_6_191.png)


    Step 400 Loss 0.000210347



![png](RNN_files/RNN_6_193.png)


    Step 500 Loss 0.000182589



![png](RNN_files/RNN_6_195.png)


    Step 600 Loss 0.000200661



![png](RNN_files/RNN_6_197.png)


    New data, epoch 14
    Step 0 Loss 0.246003



![png](RNN_files/RNN_6_199.png)


    Step 100 Loss 0.000372684



![png](RNN_files/RNN_6_201.png)


    Step 200 Loss 0.000331586



![png](RNN_files/RNN_6_203.png)


    Step 300 Loss 0.000274042



![png](RNN_files/RNN_6_205.png)


    Step 400 Loss 0.000249324



![png](RNN_files/RNN_6_207.png)


    Step 500 Loss 0.000272519



![png](RNN_files/RNN_6_209.png)


    Step 600 Loss 0.000289381



![png](RNN_files/RNN_6_211.png)


    New data, epoch 15
    Step 0 Loss 0.225238



![png](RNN_files/RNN_6_213.png)


    Step 100 Loss 0.000262286



![png](RNN_files/RNN_6_215.png)


    Step 200 Loss 0.000200126



![png](RNN_files/RNN_6_217.png)


    Step 300 Loss 0.000247869



![png](RNN_files/RNN_6_219.png)


    Step 400 Loss 0.000272037



![png](RNN_files/RNN_6_221.png)


    Step 500 Loss 0.000260008



![png](RNN_files/RNN_6_223.png)


    Step 600 Loss 0.000219859



![png](RNN_files/RNN_6_225.png)


    New data, epoch 16
    Step 0 Loss 0.270356



![png](RNN_files/RNN_6_227.png)


    Step 100 Loss 0.000380753



![png](RNN_files/RNN_6_229.png)


    Step 200 Loss 0.000277417



![png](RNN_files/RNN_6_231.png)


    Step 300 Loss 0.000221937



![png](RNN_files/RNN_6_233.png)


    Step 400 Loss 0.00027703



![png](RNN_files/RNN_6_235.png)


    Step 500 Loss 0.000274809



![png](RNN_files/RNN_6_237.png)


    Step 600 Loss 0.000195551



![png](RNN_files/RNN_6_239.png)


    New data, epoch 17
    Step 0 Loss 0.440584



![png](RNN_files/RNN_6_241.png)


    Step 100 Loss 0.000229126



![png](RNN_files/RNN_6_243.png)


    Step 200 Loss 0.000226006



![png](RNN_files/RNN_6_245.png)


    Step 300 Loss 0.000171144



![png](RNN_files/RNN_6_247.png)


    Step 400 Loss 0.000224091



![png](RNN_files/RNN_6_249.png)


    Step 500 Loss 0.000192797



![png](RNN_files/RNN_6_251.png)


    Step 600 Loss 0.000188206



![png](RNN_files/RNN_6_253.png)


    New data, epoch 18
    Step 0 Loss 0.225576



![png](RNN_files/RNN_6_255.png)


    Step 100 Loss 0.00020749



![png](RNN_files/RNN_6_257.png)


    Step 200 Loss 0.000191182



![png](RNN_files/RNN_6_259.png)


    Step 300 Loss 0.000176672



![png](RNN_files/RNN_6_261.png)


    Step 400 Loss 0.000157556



![png](RNN_files/RNN_6_263.png)


    Step 500 Loss 0.000183912



![png](RNN_files/RNN_6_265.png)


    Step 600 Loss 0.000182434



![png](RNN_files/RNN_6_267.png)


    New data, epoch 19
    Step 0 Loss 0.162119



![png](RNN_files/RNN_6_269.png)


    Step 100 Loss 0.000169445



![png](RNN_files/RNN_6_271.png)


    Step 200 Loss 0.000200583



![png](RNN_files/RNN_6_273.png)


    Step 300 Loss 0.000135114



![png](RNN_files/RNN_6_275.png)


    Step 400 Loss 0.000161292



![png](RNN_files/RNN_6_277.png)


    Step 500 Loss 0.000176606



![png](RNN_files/RNN_6_279.png)


    Step 600 Loss 0.000163995



![png](RNN_files/RNN_6_281.png)


    New data, epoch 20
    Step 0 Loss 0.164526



![png](RNN_files/RNN_6_283.png)


    Step 100 Loss 0.000138933



![png](RNN_files/RNN_6_285.png)


    Step 200 Loss 0.000149985



![png](RNN_files/RNN_6_287.png)


    Step 300 Loss 0.000127172



![png](RNN_files/RNN_6_289.png)


    Step 400 Loss 0.000164089



![png](RNN_files/RNN_6_291.png)


    Step 500 Loss 0.000128529



![png](RNN_files/RNN_6_293.png)


    Step 600 Loss 0.0001648



![png](RNN_files/RNN_6_295.png)


    New data, epoch 21
    Step 0 Loss 0.164585



![png](RNN_files/RNN_6_297.png)


    Step 100 Loss 0.000158746



![png](RNN_files/RNN_6_299.png)


    Step 200 Loss 0.000171799



![png](RNN_files/RNN_6_301.png)


    Step 300 Loss 0.000166205



![png](RNN_files/RNN_6_303.png)


    Step 400 Loss 0.000152365



![png](RNN_files/RNN_6_305.png)


    Step 500 Loss 0.000147098



![png](RNN_files/RNN_6_307.png)


    Step 600 Loss 0.000134242



![png](RNN_files/RNN_6_309.png)


    New data, epoch 22
    Step 0 Loss 0.181048



![png](RNN_files/RNN_6_311.png)


    Step 100 Loss 0.000151645



![png](RNN_files/RNN_6_313.png)


    Step 200 Loss 0.000125166



![png](RNN_files/RNN_6_315.png)


    Step 300 Loss 0.00012803



![png](RNN_files/RNN_6_317.png)


    Step 400 Loss 0.000146927



![png](RNN_files/RNN_6_319.png)


    Step 500 Loss 0.000136423



![png](RNN_files/RNN_6_321.png)


    Step 600 Loss 0.000130542



![png](RNN_files/RNN_6_323.png)


    New data, epoch 23
    Step 0 Loss 0.30059



![png](RNN_files/RNN_6_325.png)


    Step 100 Loss 0.000216857



![png](RNN_files/RNN_6_327.png)


    Step 200 Loss 0.000167216



![png](RNN_files/RNN_6_329.png)


    Step 300 Loss 0.000160883



![png](RNN_files/RNN_6_331.png)


    Step 400 Loss 0.000160866



![png](RNN_files/RNN_6_333.png)


    Step 500 Loss 0.000155595



![png](RNN_files/RNN_6_335.png)


    Step 600 Loss 0.000156014



![png](RNN_files/RNN_6_337.png)


    New data, epoch 24
    Step 0 Loss 0.117854



![png](RNN_files/RNN_6_339.png)


    Step 100 Loss 0.000145224



![png](RNN_files/RNN_6_341.png)


    Step 200 Loss 0.000138245



![png](RNN_files/RNN_6_343.png)


    Step 300 Loss 0.000153729



![png](RNN_files/RNN_6_345.png)


    Step 400 Loss 0.000143988



![png](RNN_files/RNN_6_347.png)


    Step 500 Loss 0.000147034



![png](RNN_files/RNN_6_349.png)


    Step 600 Loss 0.000140519



![png](RNN_files/RNN_6_351.png)


    New data, epoch 25
    Step 0 Loss 0.102775



![png](RNN_files/RNN_6_353.png)


    Step 100 Loss 0.000118676



![png](RNN_files/RNN_6_355.png)


    Step 200 Loss 0.000128886



![png](RNN_files/RNN_6_357.png)


    Step 300 Loss 0.000117784



![png](RNN_files/RNN_6_359.png)


    Step 400 Loss 9.71227e-05



![png](RNN_files/RNN_6_361.png)


    Step 500 Loss 0.000123592



![png](RNN_files/RNN_6_363.png)


    Step 600 Loss 9.55327e-05



![png](RNN_files/RNN_6_365.png)


    New data, epoch 26
    Step 0 Loss 0.335973



![png](RNN_files/RNN_6_367.png)


    Step 100 Loss 0.000105191



![png](RNN_files/RNN_6_369.png)


    Step 200 Loss 8.83545e-05



![png](RNN_files/RNN_6_371.png)


    Step 300 Loss 0.000136374



![png](RNN_files/RNN_6_373.png)


    Step 400 Loss 0.000127442



![png](RNN_files/RNN_6_375.png)


    Step 500 Loss 0.00013204



![png](RNN_files/RNN_6_377.png)


    Step 600 Loss 0.000120849



![png](RNN_files/RNN_6_379.png)


    New data, epoch 27
    Step 0 Loss 0.136352



![png](RNN_files/RNN_6_381.png)


    Step 100 Loss 0.000108485



![png](RNN_files/RNN_6_383.png)


    Step 200 Loss 0.000117909



![png](RNN_files/RNN_6_385.png)


    Step 300 Loss 0.000103518



![png](RNN_files/RNN_6_387.png)


    Step 400 Loss 0.0001361



![png](RNN_files/RNN_6_389.png)


    Step 500 Loss 0.000109846



![png](RNN_files/RNN_6_391.png)


    Step 600 Loss 9.70598e-05



![png](RNN_files/RNN_6_393.png)


    New data, epoch 28
    Step 0 Loss 0.200221



![png](RNN_files/RNN_6_395.png)


    Step 100 Loss 0.000115796



![png](RNN_files/RNN_6_397.png)


    Step 200 Loss 0.00010158



![png](RNN_files/RNN_6_399.png)


    Step 300 Loss 0.000104796



![png](RNN_files/RNN_6_401.png)


    Step 400 Loss 0.000126111



![png](RNN_files/RNN_6_403.png)


    Step 500 Loss 0.000107671



![png](RNN_files/RNN_6_405.png)


    Step 600 Loss 9.82627e-05



![png](RNN_files/RNN_6_407.png)


    New data, epoch 29
    Step 0 Loss 0.188697



![png](RNN_files/RNN_6_409.png)


    Step 100 Loss 0.000111646



![png](RNN_files/RNN_6_411.png)


    Step 200 Loss 9.46393e-05



![png](RNN_files/RNN_6_413.png)


    Step 300 Loss 0.000128723



![png](RNN_files/RNN_6_415.png)


    Step 400 Loss 0.000110066



![png](RNN_files/RNN_6_417.png)


    Step 500 Loss 0.0001063



![png](RNN_files/RNN_6_419.png)


    Step 600 Loss 8.6198e-05



![png](RNN_files/RNN_6_421.png)


    New data, epoch 30
    Step 0 Loss 0.266215



![png](RNN_files/RNN_6_423.png)


    Step 100 Loss 0.00010094



![png](RNN_files/RNN_6_425.png)


    Step 200 Loss 0.000101605



![png](RNN_files/RNN_6_427.png)


    Step 300 Loss 0.000106907



![png](RNN_files/RNN_6_429.png)


    Step 400 Loss 0.000103863



![png](RNN_files/RNN_6_431.png)


    Step 500 Loss 0.00010917



![png](RNN_files/RNN_6_433.png)


    Step 600 Loss 0.000106408



![png](RNN_files/RNN_6_435.png)


    New data, epoch 31
    Step 0 Loss 0.221394



![png](RNN_files/RNN_6_437.png)


    Step 100 Loss 9.20422e-05



![png](RNN_files/RNN_6_439.png)


    Step 200 Loss 0.000118946



![png](RNN_files/RNN_6_441.png)


    Step 300 Loss 9.02325e-05



![png](RNN_files/RNN_6_443.png)


    Step 400 Loss 8.63526e-05



![png](RNN_files/RNN_6_445.png)


    Step 500 Loss 8.74328e-05



![png](RNN_files/RNN_6_447.png)


    Step 600 Loss 9.5865e-05



![png](RNN_files/RNN_6_449.png)


    New data, epoch 32
    Step 0 Loss 0.194487



![png](RNN_files/RNN_6_451.png)


    Step 100 Loss 0.000126888



![png](RNN_files/RNN_6_453.png)


    Step 200 Loss 0.000103802



![png](RNN_files/RNN_6_455.png)


    Step 300 Loss 0.000137502



![png](RNN_files/RNN_6_457.png)


    Step 400 Loss 9.48006e-05



![png](RNN_files/RNN_6_459.png)


    Step 500 Loss 7.96414e-05



![png](RNN_files/RNN_6_461.png)


    Step 600 Loss 9.77938e-05



![png](RNN_files/RNN_6_463.png)


    New data, epoch 33
    Step 0 Loss 0.104813



![png](RNN_files/RNN_6_465.png)


    Step 100 Loss 0.000127914



![png](RNN_files/RNN_6_467.png)


    Step 200 Loss 9.22038e-05



![png](RNN_files/RNN_6_469.png)


    Step 300 Loss 9.46989e-05



![png](RNN_files/RNN_6_471.png)


    Step 400 Loss 0.000103478



![png](RNN_files/RNN_6_473.png)


    Step 500 Loss 8.83379e-05



![png](RNN_files/RNN_6_475.png)


    Step 600 Loss 8.76237e-05



![png](RNN_files/RNN_6_477.png)


    New data, epoch 34
    Step 0 Loss 0.314226



![png](RNN_files/RNN_6_479.png)


    Step 100 Loss 9.21173e-05



![png](RNN_files/RNN_6_481.png)


    Step 200 Loss 0.000101261



![png](RNN_files/RNN_6_483.png)


    Step 300 Loss 9.08193e-05



![png](RNN_files/RNN_6_485.png)


    Step 400 Loss 9.37992e-05



![png](RNN_files/RNN_6_487.png)


    Step 500 Loss 8.74092e-05



![png](RNN_files/RNN_6_489.png)


    Step 600 Loss 9.08691e-05



![png](RNN_files/RNN_6_491.png)


    New data, epoch 35
    Step 0 Loss 0.333031



![png](RNN_files/RNN_6_493.png)


    Step 100 Loss 0.000123826



![png](RNN_files/RNN_6_495.png)


    Step 200 Loss 0.00010889



![png](RNN_files/RNN_6_497.png)


    Step 300 Loss 7.71169e-05



![png](RNN_files/RNN_6_499.png)


    Step 400 Loss 0.000103733



![png](RNN_files/RNN_6_501.png)


    Step 500 Loss 0.000103615



![png](RNN_files/RNN_6_503.png)


    Step 600 Loss 0.000129801



![png](RNN_files/RNN_6_505.png)


    New data, epoch 36
    Step 0 Loss 0.289156



![png](RNN_files/RNN_6_507.png)


    Step 100 Loss 8.70863e-05



![png](RNN_files/RNN_6_509.png)


    Step 200 Loss 9.31525e-05



![png](RNN_files/RNN_6_511.png)


    Step 300 Loss 9.1351e-05



![png](RNN_files/RNN_6_513.png)


    Step 400 Loss 8.61955e-05



![png](RNN_files/RNN_6_515.png)


    Step 500 Loss 0.000100541



![png](RNN_files/RNN_6_517.png)


    Step 600 Loss 7.85854e-05



![png](RNN_files/RNN_6_519.png)


    New data, epoch 37
    Step 0 Loss 0.14173



![png](RNN_files/RNN_6_521.png)


    Step 100 Loss 8.04861e-05



![png](RNN_files/RNN_6_523.png)


    Step 200 Loss 8.91256e-05



![png](RNN_files/RNN_6_525.png)


    Step 300 Loss 7.52521e-05



![png](RNN_files/RNN_6_527.png)


    Step 400 Loss 9.27843e-05



![png](RNN_files/RNN_6_529.png)


    Step 500 Loss 7.5409e-05



![png](RNN_files/RNN_6_531.png)


    Step 600 Loss 6.54573e-05



![png](RNN_files/RNN_6_533.png)


    New data, epoch 38
    Step 0 Loss 0.168025



![png](RNN_files/RNN_6_535.png)


    Step 100 Loss 7.82702e-05



![png](RNN_files/RNN_6_537.png)


    Step 200 Loss 7.31258e-05



![png](RNN_files/RNN_6_539.png)


    Step 300 Loss 8.6889e-05



![png](RNN_files/RNN_6_541.png)


    Step 400 Loss 7.48513e-05



![png](RNN_files/RNN_6_543.png)


    Step 500 Loss 8.71001e-05



![png](RNN_files/RNN_6_545.png)


    Step 600 Loss 7.46084e-05



![png](RNN_files/RNN_6_547.png)


    New data, epoch 39
    Step 0 Loss 0.140448



![png](RNN_files/RNN_6_549.png)


    Step 100 Loss 6.53294e-05



![png](RNN_files/RNN_6_551.png)


    Step 200 Loss 7.09421e-05



![png](RNN_files/RNN_6_553.png)


    Step 300 Loss 8.13163e-05



![png](RNN_files/RNN_6_555.png)


    Step 400 Loss 6.94206e-05



![png](RNN_files/RNN_6_557.png)


    Step 500 Loss 7.38536e-05



![png](RNN_files/RNN_6_559.png)


    Step 600 Loss 7.22758e-05



![png](RNN_files/RNN_6_561.png)


    New data, epoch 40
    Step 0 Loss 0.267783



![png](RNN_files/RNN_6_563.png)


    Step 100 Loss 9.2548e-05



![png](RNN_files/RNN_6_565.png)


    Step 200 Loss 7.92952e-05



![png](RNN_files/RNN_6_567.png)


    Step 300 Loss 0.000101118



![png](RNN_files/RNN_6_569.png)


    Step 400 Loss 8.89266e-05



![png](RNN_files/RNN_6_571.png)


    Step 500 Loss 0.000114515



![png](RNN_files/RNN_6_573.png)


    Step 600 Loss 8.119e-05



![png](RNN_files/RNN_6_575.png)


    New data, epoch 41
    Step 0 Loss 0.408305



![png](RNN_files/RNN_6_577.png)


    Step 100 Loss 7.30073e-05



![png](RNN_files/RNN_6_579.png)


    Step 200 Loss 8.06134e-05



![png](RNN_files/RNN_6_581.png)


    Step 300 Loss 7.57719e-05



![png](RNN_files/RNN_6_583.png)


    Step 400 Loss 8.56084e-05



![png](RNN_files/RNN_6_585.png)


    Step 500 Loss 7.63245e-05



![png](RNN_files/RNN_6_587.png)


    Step 600 Loss 9.10474e-05



![png](RNN_files/RNN_6_589.png)


    New data, epoch 42
    Step 0 Loss 0.149331



![png](RNN_files/RNN_6_591.png)


    Step 100 Loss 7.33135e-05



![png](RNN_files/RNN_6_593.png)


    Step 200 Loss 7.75084e-05



![png](RNN_files/RNN_6_595.png)


    Step 300 Loss 6.84132e-05



![png](RNN_files/RNN_6_597.png)


    Step 400 Loss 7.43597e-05



![png](RNN_files/RNN_6_599.png)


    Step 500 Loss 6.64966e-05



![png](RNN_files/RNN_6_601.png)


    Step 600 Loss 7.06794e-05



![png](RNN_files/RNN_6_603.png)


    New data, epoch 43
    Step 0 Loss 0.183595



![png](RNN_files/RNN_6_605.png)


    Step 100 Loss 9.51624e-05



![png](RNN_files/RNN_6_607.png)


    Step 200 Loss 7.80805e-05



![png](RNN_files/RNN_6_609.png)


    Step 300 Loss 5.6478e-05



![png](RNN_files/RNN_6_611.png)


    Step 400 Loss 7.54684e-05



![png](RNN_files/RNN_6_613.png)


    Step 500 Loss 8.81604e-05



![png](RNN_files/RNN_6_615.png)


    Step 600 Loss 7.36332e-05



![png](RNN_files/RNN_6_617.png)


    New data, epoch 44
    Step 0 Loss 0.170031



![png](RNN_files/RNN_6_619.png)


    Step 100 Loss 8.19336e-05



![png](RNN_files/RNN_6_621.png)


    Step 200 Loss 7.27388e-05



![png](RNN_files/RNN_6_623.png)


    Step 300 Loss 6.92274e-05



![png](RNN_files/RNN_6_625.png)


    Step 400 Loss 7.5376e-05



![png](RNN_files/RNN_6_627.png)


    Step 500 Loss 7.75806e-05



![png](RNN_files/RNN_6_629.png)


    Step 600 Loss 7.7711e-05



![png](RNN_files/RNN_6_631.png)


    New data, epoch 45
    Step 0 Loss 0.156922



![png](RNN_files/RNN_6_633.png)


    Step 100 Loss 7.10639e-05



![png](RNN_files/RNN_6_635.png)


    Step 200 Loss 6.82139e-05



![png](RNN_files/RNN_6_637.png)


    Step 300 Loss 6.03736e-05



![png](RNN_files/RNN_6_639.png)


    Step 400 Loss 7.2428e-05



![png](RNN_files/RNN_6_641.png)


    Step 500 Loss 6.73861e-05



![png](RNN_files/RNN_6_643.png)


    Step 600 Loss 8.98598e-05



![png](RNN_files/RNN_6_645.png)


    New data, epoch 46
    Step 0 Loss 0.185018



![png](RNN_files/RNN_6_647.png)


    Step 100 Loss 9.03489e-05



![png](RNN_files/RNN_6_649.png)


    Step 200 Loss 7.28189e-05



![png](RNN_files/RNN_6_651.png)


    Step 300 Loss 6.61082e-05



![png](RNN_files/RNN_6_653.png)


    Step 400 Loss 7.18989e-05



![png](RNN_files/RNN_6_655.png)


    Step 500 Loss 8.10503e-05



![png](RNN_files/RNN_6_657.png)


    Step 600 Loss 9.72063e-05



![png](RNN_files/RNN_6_659.png)


    New data, epoch 47
    Step 0 Loss 0.351795



![png](RNN_files/RNN_6_661.png)


    Step 100 Loss 6.42634e-05



![png](RNN_files/RNN_6_663.png)


    Step 200 Loss 7.24717e-05



![png](RNN_files/RNN_6_665.png)


    Step 300 Loss 8.65393e-05



![png](RNN_files/RNN_6_667.png)


    Step 400 Loss 8.17806e-05



![png](RNN_files/RNN_6_669.png)


    Step 500 Loss 6.02936e-05



![png](RNN_files/RNN_6_671.png)


    Step 600 Loss 6.36633e-05



![png](RNN_files/RNN_6_673.png)


    New data, epoch 48
    Step 0 Loss 0.177593



![png](RNN_files/RNN_6_675.png)


    Step 100 Loss 8.86898e-05



![png](RNN_files/RNN_6_677.png)


    Step 200 Loss 8.61674e-05



![png](RNN_files/RNN_6_679.png)


    Step 300 Loss 7.82841e-05



![png](RNN_files/RNN_6_681.png)


    Step 400 Loss 5.60583e-05



![png](RNN_files/RNN_6_683.png)


    Step 500 Loss 6.74334e-05



![png](RNN_files/RNN_6_685.png)


    Step 600 Loss 0.000221146



![png](RNN_files/RNN_6_687.png)


    New data, epoch 49
    Step 0 Loss 0.295538



![png](RNN_files/RNN_6_689.png)


    Step 100 Loss 9.06835e-05



![png](RNN_files/RNN_6_691.png)


    Step 200 Loss 9.61242e-05



![png](RNN_files/RNN_6_693.png)


    Step 300 Loss 7.75299e-05



![png](RNN_files/RNN_6_695.png)


    Step 400 Loss 6.6436e-05



![png](RNN_files/RNN_6_697.png)


    Step 500 Loss 6.97074e-05



![png](RNN_files/RNN_6_699.png)


    Step 600 Loss 7.54807e-05



![png](RNN_files/RNN_6_701.png)


    New data, epoch 50
    Step 0 Loss 0.192232



![png](RNN_files/RNN_6_703.png)


    Step 100 Loss 6.05517e-05



![png](RNN_files/RNN_6_705.png)


    Step 200 Loss 7.48095e-05



![png](RNN_files/RNN_6_707.png)


    Step 300 Loss 7.14935e-05



![png](RNN_files/RNN_6_709.png)


    Step 400 Loss 6.54257e-05



![png](RNN_files/RNN_6_711.png)


    Step 500 Loss 6.63361e-05



![png](RNN_files/RNN_6_713.png)


    Step 600 Loss 6.48028e-05



![png](RNN_files/RNN_6_715.png)


    New data, epoch 51
    Step 0 Loss 0.353748



![png](RNN_files/RNN_6_717.png)


    Step 100 Loss 6.11471e-05



![png](RNN_files/RNN_6_719.png)


    Step 200 Loss 5.17864e-05



![png](RNN_files/RNN_6_721.png)


    Step 300 Loss 8.39553e-05



![png](RNN_files/RNN_6_723.png)


    Step 400 Loss 6.36021e-05



![png](RNN_files/RNN_6_725.png)


    Step 500 Loss 8.304e-05



![png](RNN_files/RNN_6_727.png)


    Step 600 Loss 6.42258e-05



![png](RNN_files/RNN_6_729.png)


    New data, epoch 52
    Step 0 Loss 0.347465



![png](RNN_files/RNN_6_731.png)


    Step 100 Loss 6.83499e-05



![png](RNN_files/RNN_6_733.png)


    Step 200 Loss 5.91339e-05



![png](RNN_files/RNN_6_735.png)


    Step 300 Loss 6.30305e-05



![png](RNN_files/RNN_6_737.png)


    Step 400 Loss 6.71391e-05



![png](RNN_files/RNN_6_739.png)


    Step 500 Loss 7.89847e-05



![png](RNN_files/RNN_6_741.png)


    Step 600 Loss 6.2823e-05



![png](RNN_files/RNN_6_743.png)


    New data, epoch 53
    Step 0 Loss 0.182313



![png](RNN_files/RNN_6_745.png)


    Step 100 Loss 6.59972e-05



![png](RNN_files/RNN_6_747.png)


    Step 200 Loss 6.81621e-05



![png](RNN_files/RNN_6_749.png)


    Step 300 Loss 5.27459e-05



![png](RNN_files/RNN_6_751.png)


    Step 400 Loss 7.22281e-05



![png](RNN_files/RNN_6_753.png)


    Step 500 Loss 5.79802e-05



![png](RNN_files/RNN_6_755.png)


    Step 600 Loss 5.96119e-05



![png](RNN_files/RNN_6_757.png)


    New data, epoch 54
    Step 0 Loss 0.163043



![png](RNN_files/RNN_6_759.png)


    Step 100 Loss 5.07912e-05



![png](RNN_files/RNN_6_761.png)


    Step 200 Loss 4.4968e-05



![png](RNN_files/RNN_6_763.png)


    Step 300 Loss 6.54582e-05



![png](RNN_files/RNN_6_765.png)


    Step 400 Loss 5.5992e-05



![png](RNN_files/RNN_6_767.png)


    Step 500 Loss 5.57248e-05



![png](RNN_files/RNN_6_769.png)


    Step 600 Loss 6.04238e-05



![png](RNN_files/RNN_6_771.png)


    New data, epoch 55
    Step 0 Loss 0.287925



![png](RNN_files/RNN_6_773.png)


    Step 100 Loss 7.91842e-05



![png](RNN_files/RNN_6_775.png)


    Step 200 Loss 7.0622e-05



![png](RNN_files/RNN_6_777.png)


    Step 300 Loss 6.63831e-05



![png](RNN_files/RNN_6_779.png)


    Step 400 Loss 6.91541e-05



![png](RNN_files/RNN_6_781.png)


    Step 500 Loss 6.604e-05



![png](RNN_files/RNN_6_783.png)


    Step 600 Loss 7.13081e-05



![png](RNN_files/RNN_6_785.png)


    New data, epoch 56
    Step 0 Loss 0.280532



![png](RNN_files/RNN_6_787.png)


    Step 100 Loss 6.45747e-05



![png](RNN_files/RNN_6_789.png)


    Step 200 Loss 6.26892e-05



![png](RNN_files/RNN_6_791.png)


    Step 300 Loss 6.48387e-05



![png](RNN_files/RNN_6_793.png)


    Step 400 Loss 5.96899e-05



![png](RNN_files/RNN_6_795.png)


    Step 500 Loss 6.31845e-05



![png](RNN_files/RNN_6_797.png)


    Step 600 Loss 6.62666e-05



![png](RNN_files/RNN_6_799.png)


    New data, epoch 57
    Step 0 Loss 0.176732



![png](RNN_files/RNN_6_801.png)


    Step 100 Loss 7.71427e-05



![png](RNN_files/RNN_6_803.png)


    Step 200 Loss 5.79926e-05



![png](RNN_files/RNN_6_805.png)


    Step 300 Loss 6.61785e-05



![png](RNN_files/RNN_6_807.png)


    Step 400 Loss 6.30223e-05



![png](RNN_files/RNN_6_809.png)


    Step 500 Loss 7.10873e-05



![png](RNN_files/RNN_6_811.png)


    Step 600 Loss 5.27921e-05



![png](RNN_files/RNN_6_813.png)


    New data, epoch 58
    Step 0 Loss 0.163352



![png](RNN_files/RNN_6_815.png)


    Step 100 Loss 5.87028e-05



![png](RNN_files/RNN_6_817.png)


    Step 200 Loss 5.14355e-05



![png](RNN_files/RNN_6_819.png)


    Step 300 Loss 4.6281e-05



![png](RNN_files/RNN_6_821.png)


    Step 400 Loss 5.73048e-05



![png](RNN_files/RNN_6_823.png)


    Step 500 Loss 5.87458e-05



![png](RNN_files/RNN_6_825.png)


    Step 600 Loss 5.37082e-05



![png](RNN_files/RNN_6_827.png)


    New data, epoch 59
    Step 0 Loss 0.222389



![png](RNN_files/RNN_6_829.png)


    Step 100 Loss 6.1353e-05



![png](RNN_files/RNN_6_831.png)


    Step 200 Loss 5.933e-05



![png](RNN_files/RNN_6_833.png)


    Step 300 Loss 6.21867e-05



![png](RNN_files/RNN_6_835.png)


    Step 400 Loss 6.53094e-05



![png](RNN_files/RNN_6_837.png)


    Step 500 Loss 4.4676e-05



![png](RNN_files/RNN_6_839.png)


    Step 600 Loss 4.7036e-05



![png](RNN_files/RNN_6_841.png)


    New data, epoch 60
    Step 0 Loss 0.231439



![png](RNN_files/RNN_6_843.png)


    Step 100 Loss 7.60707e-05



![png](RNN_files/RNN_6_845.png)


    Step 200 Loss 7.43184e-05



![png](RNN_files/RNN_6_847.png)


    Step 300 Loss 7.02238e-05



![png](RNN_files/RNN_6_849.png)


    Step 400 Loss 7.85981e-05



![png](RNN_files/RNN_6_851.png)


    Step 500 Loss 7.9271e-05



![png](RNN_files/RNN_6_853.png)


    Step 600 Loss 6.82688e-05



![png](RNN_files/RNN_6_855.png)


    New data, epoch 61
    Step 0 Loss 0.282176



![png](RNN_files/RNN_6_857.png)


    Step 100 Loss 6.60766e-05



![png](RNN_files/RNN_6_859.png)


    Step 200 Loss 5.44501e-05



![png](RNN_files/RNN_6_861.png)


    Step 300 Loss 6.15786e-05



![png](RNN_files/RNN_6_863.png)


    Step 400 Loss 7.65935e-05



![png](RNN_files/RNN_6_865.png)


    Step 500 Loss 5.68691e-05



![png](RNN_files/RNN_6_867.png)


    Step 600 Loss 5.60155e-05



![png](RNN_files/RNN_6_869.png)


    New data, epoch 62
    Step 0 Loss 0.398481



![png](RNN_files/RNN_6_871.png)


    Step 100 Loss 8.43045e-05



![png](RNN_files/RNN_6_873.png)


    Step 200 Loss 6.83014e-05



![png](RNN_files/RNN_6_875.png)


    Step 300 Loss 7.33699e-05



![png](RNN_files/RNN_6_877.png)


    Step 400 Loss 6.80611e-05



![png](RNN_files/RNN_6_879.png)


    Step 500 Loss 5.18572e-05



![png](RNN_files/RNN_6_881.png)


    Step 600 Loss 6.01025e-05



![png](RNN_files/RNN_6_883.png)


    New data, epoch 63
    Step 0 Loss 0.135307



![png](RNN_files/RNN_6_885.png)


    Step 100 Loss 6.96166e-05



![png](RNN_files/RNN_6_887.png)


    Step 200 Loss 5.71261e-05



![png](RNN_files/RNN_6_889.png)


    Step 300 Loss 5.52865e-05



![png](RNN_files/RNN_6_891.png)


    Step 400 Loss 6.40624e-05



![png](RNN_files/RNN_6_893.png)


    Step 500 Loss 5.28845e-05



![png](RNN_files/RNN_6_895.png)


    Step 600 Loss 8.90308e-05



![png](RNN_files/RNN_6_897.png)


    New data, epoch 64
    Step 0 Loss 0.267879



![png](RNN_files/RNN_6_899.png)


    Step 100 Loss 5.45991e-05



![png](RNN_files/RNN_6_901.png)


    Step 200 Loss 7.16343e-05



![png](RNN_files/RNN_6_903.png)


    Step 300 Loss 7.91693e-05



![png](RNN_files/RNN_6_905.png)


    Step 400 Loss 6.0799e-05



![png](RNN_files/RNN_6_907.png)


    Step 500 Loss 6.19667e-05



![png](RNN_files/RNN_6_909.png)


    Step 600 Loss 5.87346e-05



![png](RNN_files/RNN_6_911.png)


    New data, epoch 65
    Step 0 Loss 0.288019



![png](RNN_files/RNN_6_913.png)


    Step 100 Loss 7.10767e-05



![png](RNN_files/RNN_6_915.png)


    Step 200 Loss 5.50305e-05



![png](RNN_files/RNN_6_917.png)


    Step 300 Loss 7.03516e-05



![png](RNN_files/RNN_6_919.png)


    Step 400 Loss 6.39615e-05



![png](RNN_files/RNN_6_921.png)


    Step 500 Loss 6.25939e-05



![png](RNN_files/RNN_6_923.png)


    Step 600 Loss 5.95012e-05



![png](RNN_files/RNN_6_925.png)


    New data, epoch 66
    Step 0 Loss 0.129842



![png](RNN_files/RNN_6_927.png)


    Step 100 Loss 5.35792e-05



![png](RNN_files/RNN_6_929.png)


    Step 200 Loss 5.30302e-05



![png](RNN_files/RNN_6_931.png)


    Step 300 Loss 5.56994e-05



![png](RNN_files/RNN_6_933.png)


    Step 400 Loss 6.21359e-05



![png](RNN_files/RNN_6_935.png)


    Step 500 Loss 6.02086e-05



![png](RNN_files/RNN_6_937.png)


    Step 600 Loss 5.52658e-05



![png](RNN_files/RNN_6_939.png)


    New data, epoch 67
    Step 0 Loss 0.346257



![png](RNN_files/RNN_6_941.png)


    Step 100 Loss 4.77591e-05



![png](RNN_files/RNN_6_943.png)


    Step 200 Loss 5.76953e-05



![png](RNN_files/RNN_6_945.png)


    Step 300 Loss 5.72119e-05



![png](RNN_files/RNN_6_947.png)


    Step 400 Loss 6.69119e-05



![png](RNN_files/RNN_6_949.png)


    Step 500 Loss 4.91397e-05



![png](RNN_files/RNN_6_951.png)


    Step 600 Loss 5.35536e-05



![png](RNN_files/RNN_6_953.png)


    New data, epoch 68
    Step 0 Loss 0.156423



![png](RNN_files/RNN_6_955.png)


    Step 100 Loss 5.99386e-05



![png](RNN_files/RNN_6_957.png)


    Step 200 Loss 8.14121e-05



![png](RNN_files/RNN_6_959.png)


    Step 300 Loss 5.68672e-05



![png](RNN_files/RNN_6_961.png)


    Step 400 Loss 7.11428e-05



![png](RNN_files/RNN_6_963.png)


    Step 500 Loss 6.84857e-05



![png](RNN_files/RNN_6_965.png)


    Step 600 Loss 5.08774e-05



![png](RNN_files/RNN_6_967.png)


    New data, epoch 69
    Step 0 Loss 0.367932



![png](RNN_files/RNN_6_969.png)


    Step 100 Loss 6.10646e-05



![png](RNN_files/RNN_6_971.png)


    Step 200 Loss 5.93182e-05



![png](RNN_files/RNN_6_973.png)


    Step 300 Loss 6.07737e-05



![png](RNN_files/RNN_6_975.png)


    Step 400 Loss 5.33941e-05



![png](RNN_files/RNN_6_977.png)


    Step 500 Loss 5.16998e-05



![png](RNN_files/RNN_6_979.png)


    Step 600 Loss 5.59027e-05



![png](RNN_files/RNN_6_981.png)


    New data, epoch 70
    Step 0 Loss 0.243568



![png](RNN_files/RNN_6_983.png)


    Step 100 Loss 5.08999e-05



![png](RNN_files/RNN_6_985.png)


    Step 200 Loss 5.23509e-05



![png](RNN_files/RNN_6_987.png)


    Step 300 Loss 5.52706e-05



![png](RNN_files/RNN_6_989.png)


    Step 400 Loss 5.01037e-05



![png](RNN_files/RNN_6_991.png)


    Step 500 Loss 3.97173e-05



![png](RNN_files/RNN_6_993.png)


    Step 600 Loss 5.36272e-05



![png](RNN_files/RNN_6_995.png)


    New data, epoch 71
    Step 0 Loss 0.132964



![png](RNN_files/RNN_6_997.png)


    Step 100 Loss 5.51381e-05



![png](RNN_files/RNN_6_999.png)


    Step 200 Loss 5.35425e-05



![png](RNN_files/RNN_6_1001.png)


    Step 300 Loss 3.73077e-05



![png](RNN_files/RNN_6_1003.png)


    Step 400 Loss 4.67258e-05



![png](RNN_files/RNN_6_1005.png)


    Step 500 Loss 4.99291e-05



![png](RNN_files/RNN_6_1007.png)


    Step 600 Loss 4.54055e-05



![png](RNN_files/RNN_6_1009.png)


    New data, epoch 72
    Step 0 Loss 0.179711



![png](RNN_files/RNN_6_1011.png)


    Step 100 Loss 5.0869e-05



![png](RNN_files/RNN_6_1013.png)


    Step 200 Loss 5.27213e-05



![png](RNN_files/RNN_6_1015.png)


    Step 300 Loss 5.64188e-05



![png](RNN_files/RNN_6_1017.png)


    Step 400 Loss 6.46114e-05



![png](RNN_files/RNN_6_1019.png)


    Step 500 Loss 5.82471e-05



![png](RNN_files/RNN_6_1021.png)


    Step 600 Loss 5.68988e-05



![png](RNN_files/RNN_6_1023.png)


    New data, epoch 73
    Step 0 Loss 0.148336



![png](RNN_files/RNN_6_1025.png)


    Step 100 Loss 5.0903e-05



![png](RNN_files/RNN_6_1027.png)


    Step 200 Loss 4.4994e-05



![png](RNN_files/RNN_6_1029.png)


    Step 300 Loss 4.56362e-05



![png](RNN_files/RNN_6_1031.png)


    Step 400 Loss 5.62014e-05



![png](RNN_files/RNN_6_1033.png)


    Step 500 Loss 4.96982e-05



![png](RNN_files/RNN_6_1035.png)


    Step 600 Loss 4.39657e-05



![png](RNN_files/RNN_6_1037.png)


    New data, epoch 74
    Step 0 Loss 0.237479



![png](RNN_files/RNN_6_1039.png)


    Step 100 Loss 9.41841e-05



![png](RNN_files/RNN_6_1041.png)


    Step 200 Loss 5.48427e-05



![png](RNN_files/RNN_6_1043.png)


    Step 300 Loss 5.11024e-05



![png](RNN_files/RNN_6_1045.png)


    Step 400 Loss 5.54929e-05



![png](RNN_files/RNN_6_1047.png)


    Step 500 Loss 4.9102e-05



![png](RNN_files/RNN_6_1049.png)


    Step 600 Loss 5.70366e-05



![png](RNN_files/RNN_6_1051.png)


    New data, epoch 75
    Step 0 Loss 0.318287



![png](RNN_files/RNN_6_1053.png)


    Step 100 Loss 4.82691e-05



![png](RNN_files/RNN_6_1055.png)


    Step 200 Loss 4.46378e-05



![png](RNN_files/RNN_6_1057.png)


    Step 300 Loss 5.5468e-05



![png](RNN_files/RNN_6_1059.png)


    Step 400 Loss 4.7599e-05



![png](RNN_files/RNN_6_1061.png)


    Step 500 Loss 4.953e-05



![png](RNN_files/RNN_6_1063.png)


    Step 600 Loss 5.77413e-05



![png](RNN_files/RNN_6_1065.png)


    New data, epoch 76
    Step 0 Loss 0.162051



![png](RNN_files/RNN_6_1067.png)


    Step 100 Loss 4.94537e-05



![png](RNN_files/RNN_6_1069.png)


    Step 200 Loss 5.07377e-05



![png](RNN_files/RNN_6_1071.png)


    Step 300 Loss 5.43643e-05



![png](RNN_files/RNN_6_1073.png)


    Step 400 Loss 4.43153e-05



![png](RNN_files/RNN_6_1075.png)


    Step 500 Loss 4.11764e-05



![png](RNN_files/RNN_6_1077.png)


    Step 600 Loss 4.86525e-05



![png](RNN_files/RNN_6_1079.png)


    New data, epoch 77
    Step 0 Loss 0.125889



![png](RNN_files/RNN_6_1081.png)


    Step 100 Loss 4.2227e-05



![png](RNN_files/RNN_6_1083.png)


    Step 200 Loss 4.06328e-05



![png](RNN_files/RNN_6_1085.png)


    Step 300 Loss 5.27675e-05



![png](RNN_files/RNN_6_1087.png)


    Step 400 Loss 4.82267e-05



![png](RNN_files/RNN_6_1089.png)


    Step 500 Loss 4.4139e-05



![png](RNN_files/RNN_6_1091.png)


    Step 600 Loss 4.80085e-05



![png](RNN_files/RNN_6_1093.png)


    New data, epoch 78
    Step 0 Loss 0.222535



![png](RNN_files/RNN_6_1095.png)


    Step 100 Loss 4.60768e-05



![png](RNN_files/RNN_6_1097.png)


    Step 200 Loss 4.66168e-05



![png](RNN_files/RNN_6_1099.png)


    Step 300 Loss 6.77957e-05



![png](RNN_files/RNN_6_1101.png)


    Step 400 Loss 5.28414e-05



![png](RNN_files/RNN_6_1103.png)


    Step 500 Loss 5.37304e-05



![png](RNN_files/RNN_6_1105.png)


    Step 600 Loss 5.03758e-05



![png](RNN_files/RNN_6_1107.png)


    New data, epoch 79
    Step 0 Loss 0.161458



![png](RNN_files/RNN_6_1109.png)


    Step 100 Loss 4.89242e-05



![png](RNN_files/RNN_6_1111.png)


    Step 200 Loss 4.16897e-05



![png](RNN_files/RNN_6_1113.png)


    Step 300 Loss 4.35859e-05



![png](RNN_files/RNN_6_1115.png)


    Step 400 Loss 4.58761e-05



![png](RNN_files/RNN_6_1117.png)


    Step 500 Loss 5.19406e-05



![png](RNN_files/RNN_6_1119.png)


    Step 600 Loss 4.18425e-05



![png](RNN_files/RNN_6_1121.png)


    New data, epoch 80
    Step 0 Loss 0.131393



![png](RNN_files/RNN_6_1123.png)


    Step 100 Loss 4.50749e-05



![png](RNN_files/RNN_6_1125.png)


    Step 200 Loss 4.04496e-05



![png](RNN_files/RNN_6_1127.png)


    Step 300 Loss 4.89257e-05



![png](RNN_files/RNN_6_1129.png)


    Step 400 Loss 4.59805e-05



![png](RNN_files/RNN_6_1131.png)


    Step 500 Loss 3.94362e-05



![png](RNN_files/RNN_6_1133.png)


    Step 600 Loss 5.18784e-05



![png](RNN_files/RNN_6_1135.png)


    New data, epoch 81
    Step 0 Loss 0.177967



![png](RNN_files/RNN_6_1137.png)


    Step 100 Loss 4.18721e-05



![png](RNN_files/RNN_6_1139.png)


    Step 200 Loss 4.64194e-05



![png](RNN_files/RNN_6_1141.png)


    Step 300 Loss 4.73046e-05



![png](RNN_files/RNN_6_1143.png)


    Step 400 Loss 4.6019e-05



![png](RNN_files/RNN_6_1145.png)


    Step 500 Loss 4.45344e-05



![png](RNN_files/RNN_6_1147.png)


    Step 600 Loss 4.38987e-05



![png](RNN_files/RNN_6_1149.png)


    New data, epoch 82
    Step 0 Loss 0.218162



![png](RNN_files/RNN_6_1151.png)


    Step 100 Loss 4.39097e-05



![png](RNN_files/RNN_6_1153.png)


    Step 200 Loss 5.53843e-05



![png](RNN_files/RNN_6_1155.png)


    Step 300 Loss 4.82518e-05



![png](RNN_files/RNN_6_1157.png)


    Step 400 Loss 4.77924e-05



![png](RNN_files/RNN_6_1159.png)


    Step 500 Loss 5.25612e-05



![png](RNN_files/RNN_6_1161.png)


    Step 600 Loss 5.15979e-05



![png](RNN_files/RNN_6_1163.png)


    New data, epoch 83
    Step 0 Loss 0.191057



![png](RNN_files/RNN_6_1165.png)


    Step 100 Loss 5.36522e-05



![png](RNN_files/RNN_6_1167.png)


    Step 200 Loss 3.69168e-05



![png](RNN_files/RNN_6_1169.png)


    Step 300 Loss 4.326e-05



![png](RNN_files/RNN_6_1171.png)


    Step 400 Loss 4.47109e-05



![png](RNN_files/RNN_6_1173.png)


    Step 500 Loss 4.01875e-05



![png](RNN_files/RNN_6_1175.png)


    Step 600 Loss 4.21268e-05



![png](RNN_files/RNN_6_1177.png)


    New data, epoch 84
    Step 0 Loss 0.231948



![png](RNN_files/RNN_6_1179.png)


    Step 100 Loss 4.17641e-05



![png](RNN_files/RNN_6_1181.png)


    Step 200 Loss 4.37445e-05



![png](RNN_files/RNN_6_1183.png)


    Step 300 Loss 3.64703e-05



![png](RNN_files/RNN_6_1185.png)


    Step 400 Loss 4.52496e-05



![png](RNN_files/RNN_6_1187.png)


    Step 500 Loss 4.90571e-05



![png](RNN_files/RNN_6_1189.png)


    Step 600 Loss 4.17575e-05



![png](RNN_files/RNN_6_1191.png)


    New data, epoch 85
    Step 0 Loss 0.203053



![png](RNN_files/RNN_6_1193.png)


    Step 100 Loss 3.86047e-05



![png](RNN_files/RNN_6_1195.png)


    Step 200 Loss 4.33107e-05



![png](RNN_files/RNN_6_1197.png)


    Step 300 Loss 4.29357e-05



![png](RNN_files/RNN_6_1199.png)


    Step 400 Loss 4.02338e-05



![png](RNN_files/RNN_6_1201.png)


    Step 500 Loss 4.66608e-05



![png](RNN_files/RNN_6_1203.png)


    Step 600 Loss 3.46377e-05



![png](RNN_files/RNN_6_1205.png)


    New data, epoch 86
    Step 0 Loss 0.204208



![png](RNN_files/RNN_6_1207.png)


    Step 100 Loss 3.90242e-05



![png](RNN_files/RNN_6_1209.png)


    Step 200 Loss 4.6869e-05



![png](RNN_files/RNN_6_1211.png)


    Step 300 Loss 4.25599e-05



![png](RNN_files/RNN_6_1213.png)


    Step 400 Loss 5.18326e-05



![png](RNN_files/RNN_6_1215.png)


    Step 500 Loss 5.00279e-05



![png](RNN_files/RNN_6_1217.png)


    Step 600 Loss 3.78623e-05



![png](RNN_files/RNN_6_1219.png)


    New data, epoch 87
    Step 0 Loss 0.296417



![png](RNN_files/RNN_6_1221.png)


    Step 100 Loss 6.40958e-05



![png](RNN_files/RNN_6_1223.png)


    Step 200 Loss 4.60711e-05



![png](RNN_files/RNN_6_1225.png)


    Step 300 Loss 5.49031e-05



![png](RNN_files/RNN_6_1227.png)


    Step 400 Loss 4.61172e-05



![png](RNN_files/RNN_6_1229.png)


    Step 500 Loss 4.18942e-05



![png](RNN_files/RNN_6_1231.png)


    Step 600 Loss 4.416e-05



![png](RNN_files/RNN_6_1233.png)


    New data, epoch 88
    Step 0 Loss 0.176012



![png](RNN_files/RNN_6_1235.png)


    Step 100 Loss 4.18626e-05



![png](RNN_files/RNN_6_1237.png)


    Step 200 Loss 4.64446e-05



![png](RNN_files/RNN_6_1239.png)


    Step 300 Loss 3.76653e-05



![png](RNN_files/RNN_6_1241.png)


    Step 400 Loss 4.46157e-05



![png](RNN_files/RNN_6_1243.png)


    Step 500 Loss 4.4965e-05



![png](RNN_files/RNN_6_1245.png)


    Step 600 Loss 4.29879e-05



![png](RNN_files/RNN_6_1247.png)


    New data, epoch 89
    Step 0 Loss 0.152412



![png](RNN_files/RNN_6_1249.png)


    Step 100 Loss 5.23644e-05



![png](RNN_files/RNN_6_1251.png)


    Step 200 Loss 3.31136e-05



![png](RNN_files/RNN_6_1253.png)


    Step 300 Loss 3.60886e-05



![png](RNN_files/RNN_6_1255.png)


    Step 400 Loss 4.57838e-05



![png](RNN_files/RNN_6_1257.png)


    Step 500 Loss 4.77223e-05



![png](RNN_files/RNN_6_1259.png)


    Step 600 Loss 4.40247e-05



![png](RNN_files/RNN_6_1261.png)


    New data, epoch 90
    Step 0 Loss 0.134392



![png](RNN_files/RNN_6_1263.png)


    Step 100 Loss 3.91176e-05



![png](RNN_files/RNN_6_1265.png)


    Step 200 Loss 4.44169e-05



![png](RNN_files/RNN_6_1267.png)


    Step 300 Loss 4.03256e-05



![png](RNN_files/RNN_6_1269.png)


    Step 400 Loss 4.8869e-05



![png](RNN_files/RNN_6_1271.png)


    Step 500 Loss 3.18723e-05



![png](RNN_files/RNN_6_1273.png)


    Step 600 Loss 5.30841e-05



![png](RNN_files/RNN_6_1275.png)


    New data, epoch 91
    Step 0 Loss 0.154506



![png](RNN_files/RNN_6_1277.png)


    Step 100 Loss 5.38514e-05



![png](RNN_files/RNN_6_1279.png)


    Step 200 Loss 6.56582e-05



![png](RNN_files/RNN_6_1281.png)


    Step 300 Loss 6.16445e-05



![png](RNN_files/RNN_6_1283.png)


    Step 400 Loss 4.8436e-05



![png](RNN_files/RNN_6_1285.png)


    Step 500 Loss 3.73268e-05



![png](RNN_files/RNN_6_1287.png)


    Step 600 Loss 5.77325e-05



![png](RNN_files/RNN_6_1289.png)


    New data, epoch 92
    Step 0 Loss 0.202538



![png](RNN_files/RNN_6_1291.png)


    Step 100 Loss 5.07804e-05



![png](RNN_files/RNN_6_1293.png)


    Step 200 Loss 4.95053e-05



![png](RNN_files/RNN_6_1295.png)


    Step 300 Loss 5.1166e-05



![png](RNN_files/RNN_6_1297.png)


    Step 400 Loss 4.58709e-05



![png](RNN_files/RNN_6_1299.png)


    Step 500 Loss 4.6013e-05



![png](RNN_files/RNN_6_1301.png)


    Step 600 Loss 5.00522e-05



![png](RNN_files/RNN_6_1303.png)


    New data, epoch 93
    Step 0 Loss 0.163677



![png](RNN_files/RNN_6_1305.png)


    Step 100 Loss 3.70645e-05



![png](RNN_files/RNN_6_1307.png)


    Step 200 Loss 3.75287e-05



![png](RNN_files/RNN_6_1309.png)


    Step 300 Loss 4.01385e-05



![png](RNN_files/RNN_6_1311.png)


    Step 400 Loss 5.70001e-05



![png](RNN_files/RNN_6_1313.png)


    Step 500 Loss 4.07759e-05



![png](RNN_files/RNN_6_1315.png)


    Step 600 Loss 4.41683e-05



![png](RNN_files/RNN_6_1317.png)


    New data, epoch 94
    Step 0 Loss 0.177907



![png](RNN_files/RNN_6_1319.png)


    Step 100 Loss 3.92898e-05



![png](RNN_files/RNN_6_1321.png)


    Step 200 Loss 3.53368e-05



![png](RNN_files/RNN_6_1323.png)


    Step 300 Loss 4.13751e-05



![png](RNN_files/RNN_6_1325.png)


    Step 400 Loss 3.63113e-05



![png](RNN_files/RNN_6_1327.png)


    Step 500 Loss 3.91052e-05



![png](RNN_files/RNN_6_1329.png)


    Step 600 Loss 3.46758e-05



![png](RNN_files/RNN_6_1331.png)


    New data, epoch 95
    Step 0 Loss 0.186947



![png](RNN_files/RNN_6_1333.png)


    Step 100 Loss 5.92298e-05



![png](RNN_files/RNN_6_1335.png)


    Step 200 Loss 4.22436e-05



![png](RNN_files/RNN_6_1337.png)


    Step 300 Loss 5.05384e-05



![png](RNN_files/RNN_6_1339.png)


    Step 400 Loss 5.01794e-05



![png](RNN_files/RNN_6_1341.png)


    Step 500 Loss 3.78704e-05



![png](RNN_files/RNN_6_1343.png)


    Step 600 Loss 5.28369e-05



![png](RNN_files/RNN_6_1345.png)


    New data, epoch 96
    Step 0 Loss 0.215081



![png](RNN_files/RNN_6_1347.png)


    Step 100 Loss 4.1023e-05



![png](RNN_files/RNN_6_1349.png)


    Step 200 Loss 4.59761e-05



![png](RNN_files/RNN_6_1351.png)


    Step 300 Loss 4.48741e-05



![png](RNN_files/RNN_6_1353.png)


    Step 400 Loss 4.47787e-05



![png](RNN_files/RNN_6_1355.png)


    Step 500 Loss 4.9067e-05



![png](RNN_files/RNN_6_1357.png)


    Step 600 Loss 4.1723e-05



![png](RNN_files/RNN_6_1359.png)


    New data, epoch 97
    Step 0 Loss 0.296952



![png](RNN_files/RNN_6_1361.png)


    Step 100 Loss 4.12972e-05



![png](RNN_files/RNN_6_1363.png)


    Step 200 Loss 3.91994e-05



![png](RNN_files/RNN_6_1365.png)


    Step 300 Loss 3.1483e-05



![png](RNN_files/RNN_6_1367.png)


    Step 400 Loss 3.69345e-05



![png](RNN_files/RNN_6_1369.png)


    Step 500 Loss 3.78896e-05



![png](RNN_files/RNN_6_1371.png)


    Step 600 Loss 4.1823e-05



![png](RNN_files/RNN_6_1373.png)


    New data, epoch 98
    Step 0 Loss 0.165632



![png](RNN_files/RNN_6_1375.png)


    Step 100 Loss 4.16688e-05



![png](RNN_files/RNN_6_1377.png)


    Step 200 Loss 3.55184e-05



![png](RNN_files/RNN_6_1379.png)


    Step 300 Loss 4.12624e-05



![png](RNN_files/RNN_6_1381.png)


    Step 400 Loss 3.65736e-05



![png](RNN_files/RNN_6_1383.png)


    Step 500 Loss 4.25291e-05



![png](RNN_files/RNN_6_1385.png)


    Step 600 Loss 3.83585e-05



![png](RNN_files/RNN_6_1387.png)


    New data, epoch 99
    Step 0 Loss 0.166703



![png](RNN_files/RNN_6_1389.png)


    Step 100 Loss 3.71602e-05



![png](RNN_files/RNN_6_1391.png)


    Step 200 Loss 4.16517e-05



![png](RNN_files/RNN_6_1393.png)


    Step 300 Loss 3.91581e-05



![png](RNN_files/RNN_6_1395.png)


    Step 400 Loss 4.73584e-05



![png](RNN_files/RNN_6_1397.png)


    Step 500 Loss 3.76653e-05



![png](RNN_files/RNN_6_1399.png)


    Step 600 Loss 5.16872e-05



![png](RNN_files/RNN_6_1401.png)



```python
if 'session' in locals() and session is not None:
    print('Close interactive session')
    session.close()
```
