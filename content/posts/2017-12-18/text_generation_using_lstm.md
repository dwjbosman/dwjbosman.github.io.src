---
title: "Generating text using an LSTM neural network"
cover: "/logos/book-3010727_1280.jpg"
category: "Artificial intelligence"
tags:

    - Artificial Intelligence
    - LSTM
date: 2017-12-18 20:00
---

Some time ago I read the article "". I was very inspired by the idea that AI could be able to generate a novel. So I spent some time trying to get a working prototype.

I used this https://github.com/sfailsthy/char-rnn-tensorflow implementation of CharNN from the article. It's a very clean and readible implementation. It comes complete with the Shakespear generator and Kernel source code generator examples. My goal was to generate a Dutch novel. As a source I downloaded a number of free Dutch ebooks in .epub format.  Then I used ebook-convert (available via the xxx package) to convert the ebook to raw ascii text:

   ebook-convert book.epub book.txt --txt-output-encoding=ascii --asciiize

In total I concatenated six different ebooks in one big text file. Next I started training the network:

python3 train.py --input_file data/bigtextfile.txt --name bigtextfile --num_steps 100 --num_seqs 1000  --learning_rate 0.001 --max_steps 40000 --num_layers 6 --lstm_size 150

* 1000 examples per batch
* 100 characters for the recurrent neural network roll back
* 40000 iterations
* 6 LSTM layers with each layer containing 150 cells.

My laptops GTX-1060 GPU is able to process about 0.6 batches per second. After 40000 iterations it produced the following results (in Dutch ....):

python3 sample.py --converter_path bigtextfile/converter.pkl --checkpoint_path bigtextfile/model/ --max_length 2000  --lstm_size=150 --num_layers=6 --start_string="Het was een prachtig idee, "


Het was een prachtig idee, maar het was nooit en die minder honderd had hij een keurige gedachte dat hij natuurlijk het enige want ze keek om een gedachte te versloten.'

	'Ik ben een schilderen. Het zou niet zo vinden.'

	'Natuurlijk.' In haar bed moet ik de gezicht van de schoon keerde.

	'We zijn een vruchten,' zei ik. 'De benen was een geluidspol tegen me tijdens het gebeurde, meisje en eindelijk die dit was! Waarom hij het hield voor het grote volgende bank. Iedere kast van een schor kan ik met ze ook ongelooflijk zijn!'

	'Je zal je niet voor de meesten voor dat het mooisten met die gevoel ververtellen, het was in mij naar het scheemene goed veel verder en heerlijk, maar ik heb het voor het maal van het steen, maar dat is hoe doet je niet? Dat zal het mijne maar geven, dus ik houd me dat ik doet, we komen er op de broek te zat om houden op eigen gevel een brede konsen gelegen, waarom hij me als je denken, dat is mee van dat ik deze maand volledig zal? Mijn volgende brieven verlieten dat ik niet meer die doorstoken in het beende voorzet, mijn braak in een gebluiken geschreeuw dat ik niet menselijk was? De bemanning werd geleden, met zelf voor het stem van het blandende boek.

	'Ja. Hij wordt die man de verhalen voor het schip weer angst. En hoe kan ze elke geval. Ik was niet meer,' zei ik open. 'Ik was niet maar op het school.'

	'Ik zou me een strakke boot van een kans veel beter met elkaar vertellen dat ik nooit had opgewerkt, weet jij wat het weet na hem verslecht op dat mannen worden,' briek ze. 'Wat weet je dat wij nog wel eens gevallen?' Hij boog over hem toen ik mijn hand gebaarde van mijn verhingen. 'Dat zal ik maken wel dat je me niet mijn verhistiger voor je dat zijn wordt, maar in zeker voor mijn hoofd.'

	'Die is dit met de bal van de schaal.' Ik sloot mijn hoofd.

	'Ik?' room ik terriel me naar boven.

	Dan geven ik niet meer daar van haar ontdikte. Dat is niet alleen dat de stadper op zijn gezond bloedend was. Ik bedoel het nooit. Ik was een vriendelijk tijd dat ik nog meer 

The results are already quite nice. Especially the fact that the network is able to correctly use symbols like quotes. Also interesting are the fictional Dutch sounding words it sometimes uses.

Using different priming sequences I hoped to provoke some more semantic understandable behaviour. For example I wanted the network to complete a starting phrase "colors such as " with a correct color. But I had no luck.  





