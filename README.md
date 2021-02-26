# collective-hacks
Repo for various MSTRC Coding Collective hacks

## p5.js examples on the p5.js site

* [Towards Snake!](https://editor.p5js.org/tomthecollins/sketches/DOBzEdnCr) A first attempt at a "sketch" in p5.js. From Coding collective on 9th October, 2020: "Coding session 1: Introduction to JavaScript and p5.js". Here is a [recording](https://drive.google.com/file/d/1oPF4C98j8-oMX6EH-nPd2xRLzY0D2fdq/view?usp=sharing) of the session (accessible to Univ York accounts only).
* [Getting closer to Snake!](https://editor.p5js.org/tomthecollins/sketches/M5fM2NGci) Not much further than the sketch above, but rearrangement of code into a "Snake class", which will help going forward, and is our first encounter with something called object-oriented programming. Also from Coding collective on 9th October, 2020: "Coding session 1: Introduction to JavaScript and p5.js"
* [Still a box, now chunked](https://editor.p5js.org/tomthecollins/sketches/9IXODrgER). We didn't do this in the session, but if you want to actually finish an implementation of the game Snake! and are stuck, check it out.
* [Snake can eat apple and get longer](https://editor.p5js.org/tomthecollins/sketches/RRCmVgPgl). We didn't do this in the session, but if you want to actually finish an implementation of the game Snake! and are stuck, check it out.

The above examples are all based on watching this [video of Daniel Shiffman coding Snake](https://www.youtube.com/watch?v=AaGK-fj-BAM).

## Tone.js examples on the p5.js site

* [Tone.js hello world](https://editor.p5js.org/tomthecollins/sketches/bjjA5a8Cn). Shows how Tone.js handles the use of various sound sources, and enables use of a "transport".
* [Tone.js Analyser](https://editor.p5js.org/tomthecollins/sketches/Gk7kFdV9o). Demonstrates use (visualisation) of microphone input. Here's a [slight variation](https://editor.p5js.org/tomthecollins/sketches/ghLYQ_mf7) that visualises a sound file instead.
* [Tone.js GrainPlayer](https://editor.p5js.org/tomthecollins/sketches/f7ChBUfFI). Handy for dynamic time-stretch and pitch-shift. [Tom Smith's cool variation](https://editor.p5js.org/tomthecollins/sketches/dPSP7vK3T) where the location of the meandering dot sets the time-stretch and pitch-shift parameter values.

Here are links to [Tone.js'](https://tonejs.github.io/) [examples](https://tonejs.github.io/examples/) and [documentation](https://tonejs.github.io/docs/) (terse).

## NexusUI example on the p5.js site

* [NexusUI hello world](https://editor.p5js.org/tomthecollins/sketches/ZTAW0wWWx). Shows how stick a NexusUI dial on a webpage and have it control the volume level of a Tone.js Player. In case it's helpful to see the evolution of this sketch, here's a [slightly earlier version](https://editor.p5js.org/tomthecollins/sketches/gBgu7SCpn) without any connection to Tone.js/sound.

## Examples on Glitch
[Glitch](https://glitch.com/) is wonderful because it's free and gets you set up immediately with a basic webpage, or an app with a Node.js server, or an app with a Node.js server and SQLite database. It's the server-side functionality, **enabling building of systems that can support usage/collaboration of multiple users and data storage**, which distinguishes it from the p5.js editor or JSFiddle.

The following examples from [Coding Collective are on Glitch](https://glitch.com/@tomthecollins/coding-collective):

* [collective-p5-template](https://glitch.com/~collective-p5-template), which shows some basic functionality possible with creative coding language [p5.js](https://p5js.org/reference/);
* [collective-p5-tone-template](https://glitch.com/~collective-p5-tone-template), which shows how to add in [Tone.js](https://tonejs.github.io/) for powerful browser-based audio manipulation. (p5.js has some of its own audio capabilities, but Tom and many others in the web audio community would recommend Tone.js.)
* [collective-drums](https://glitch.com/~collective-drums), which shows how to combine [NexusUI](https://nexus-js.github.io/ui/) sequencer and [Socket.IO](https://socket.io/);
* [collective-scrabble](https://glitch.com/~collective-scrabble), which isn't music-related, but combines [p5.js](https://p5js.org) and [Socket.IO](https://socket.io/) to interesting effect!

## Examples of web-based step sequencers

* [grid](https://tomcollinsresearch.net/mc/ex/grid/) is a step sequencer that I (Tom) made. If you do File -> Save Page As..., you should be able to obtain all the dependencies. The main action is in sequencer.js.
* [NexusUI](https://nexus-js.github.io/ui/) has a step sequencer class, which makes it easier than with my example above to get your own grid showing up in the browser.
* [Online Sequencer](https://onlinesequencer.net/) is both an online sequencer and active music-making community. Check it out!

## Examples in the source code of this repository...
are several. Further explanations to be added soon!

