// Constants
const baseURL = "./../src/instrument/"
const loadCounterLimit = 3

// Variables
let lastDetectInSec, lastPosInSec, lastResult, currResult
// This one keeps track of what is or was playing on each sampler/synth.
let playLedger = {
  "drum": {
    "codeStr": null,
    "transportId": null,
    "when": null
  },
  "bass": {
    "codeStr": null,
    "transportId": null,
    "when": null
  },
  "arp": {
    "codeStr": null,
    "transportId": null,
    "when": null
  },
  "vocal": {
    "codeStr": null,
    "transportId": null,
    "when": null
  },
  "synth": {
    "transportId": null,
    "soundOff": true
  }
}

// Sample load checking
let loadCounter = 0

// Instrument definitions
let instrDef = {
  "drum": {
    "tonejsDef": function(){
      return new Tone.Players({
        "200000": baseURL + "edm_drum_samples/" + "048_full_on.mp3",
        "200001": baseURL + "edm_drum_samples/" + "049_kick_and_clap.mp3",
        "200002": baseURL + "edm_drum_samples/" + "050_laid_back.mp3",
        "200003": baseURL + "edm_drum_samples/" + "057_punchy.mp3",
        "200004": baseURL + "edm_drum_samples/" + "055_cymbal_detail.mp3"
      }, function(){
        console.log("drum loaded!")
        load_check()
      }).toMaster()
    }
  },
  "bass": {
    "tonejsDef": function(){
      return new Tone.Players({
        "300000": baseURL + "edm_bass_samples/" + "060_ebgag.mp3",
        "300001": baseURL + "edm_bass_samples/" + "061_egaed.mp3",
        "300002": baseURL + "edm_bass_samples/" + "063_gd_oct.mp3",
        "300003": baseURL + "edm_bass_samples/" + "067_egd.mp3",
        "300004": baseURL + "edm_bass_samples/" + "069_gfs_pulse.mp3"
      }, function(){
        console.log("bass loaded!")
        load_check()
      }).toMaster()
    }
  },
  "arp": {
    "tonejsDef": function(){
      return new Tone.Players({
        "400000": baseURL + "edm_arp_samples/" + "072_glassy_arpeg.mp3",
        "400001": baseURL + "edm_arp_samples/" + "074_e_bottles.mp3",
        "400002": baseURL + "edm_arp_samples/" + "077_eb_alarm.mp3",
        "400003": baseURL + "edm_arp_samples/" + "082_gfs_droplets.gm.mp3",
        "400004": baseURL + "edm_arp_samples/" + "073_electric_arpeg.mp3"
      }, function(){
        console.log("arp loaded!")
        load_check()
      }).toMaster()
    }
  },
  "vocal": {
    "tonejsDef": function(){
      return new Tone.Players({
        "500000": baseURL + "vocal_samples/" + "084_330910__ymaaela__over-processed-female-vocal.mp3",
        "500001": baseURL + "vocal_samples/" + "085_tacky_anno_moopha.mp3",
        "500002": baseURL + "vocal_samples/" + "086_hmm.mp3",
        "500003": baseURL + "vocal_samples/" + "087_ban_nigh_ka.mp3"
      }, function(){
        console.log("arp loaded!")
        load_check()
      }).toMaster()
    }
  },
  "synth": {
    "tonejsDef": function(){
      let synth = new Tone.FMSynth({
        "harmonicity": 3.01,
        "modulationIndex": 14,
        "oscillator": {
            "type": "triangle"
        },
        "envelope": {
            "attack": 0.2,
            "decay": 0.3,
            "sustain": 0.1,
            "release": 1.2
        },
        "modulation" : {
            "type": "square"
        },
        "modulationEnvelope" : {
            "attack": 0.01,
            "decay": 0.5,
            "sustain": 0.2,
            "release": 0.1
        }
      }).toMaster()
      synth.portamento = 0.25
      let ppd = new Tone.PingPongDelay({
      	"delayTime": "16n",
      	"feedback": 0.3,
        "wet": 0.1
      }).toMaster()
      synth.connect(ppd)
      return synth
    }
  }
}
let instrObj = {}
Object.keys(instrDef).map(function(k){
  instrObj[k] = instrDef[k].tonejsDef.call()
  return
})

function load_check(){
  loadCounter++
  if (loadCounter == loadCounterLimit){
    console.log("Everything is loaded. Attempting to start Transport.")
    Tone.Transport.bpm.value = 130
    Tone.Transport.loop = true
    Tone.Transport.loopEnd = "2m"
    Tone.Transport.start()
    repeat_scheduler()
  }
}

function repeat_scheduler(){
  playLedger["synth"].transportId = Tone.Transport.scheduleRepeat(function(interval){
    let codeStr
    if (
      currResult !== undefined &&
      (
        currResult.codeResult.code[0] == "0" ||
        currResult.codeResult.code[0] == "1"
      )
    ){
      codeStr = currResult.codeResult.code
    }
    synth_handler("synth", codeStr)
    lastPosInSec = Tone.now()
  }, "8n")
}

function code2sound_event(result){
  const codeStr = result.codeResult.code
  // console.log("codeStr:", codeStr)
  switch (codeStr[0]){
    case "0":
    if (playLedger["synth"].transportId == null){
      repeat_scheduler()
    }
    break
    case "1":
    if (playLedger["synth"].transportId == null){
      repeat_scheduler()
    }
    break
    case "2":
    sample_handler("drum", codeStr)
    break
    case "3":
    sample_handler("bass", codeStr)
    break
    case "4":
    sample_handler("arp", codeStr)
    break
    case "5":
    sample_handler("vocal", codeStr)
    break
    case "6":
    Tone.Transport.cancel()
    playLedger["synth"].transportId = null
    break
    default:
    break
  }
}

function synth_handler(instrStr, codeStr){
  if (lastDetectInSec >= lastPosInSec && codeStr !== undefined){
    // Sthg happened since last time schedRep fired.
    // console.log("Sthg happened since last time!")
    const freq = parseFloat(codeStr.slice(0, 4) + "." + codeStr.slice(4))
    // console.log("freq:", freq)
    if (lastResult == undefined || playLedger[instrStr].soundOff){
      // Trigger pitch.
      // console.log("Trigger pitch!")
      instrObj[instrStr].triggerAttack(freq, Tone.now(), 0.75)
      playLedger[instrStr].soundOff = false
    }
    else if (currResult.codeResult.code !== lastResult.codeResult.code){
      // Change pitch.
      // console.log("Change pitch!")
      instrObj[instrStr].setNote(freq, Tone.now())
    }
    else {
      // Maintain pitch.
      // console.log("Maintain pitch!")
    }
  }
  else {
    // Nothing happened. Turn off synth.
    // console.log("Turn off synth")
    instrObj[instrStr].triggerRelease()
    playLedger[instrStr].soundOff = true
  }


}

function sample_handler(instrStr, codeStr){
  // console.log("instrStr:", instrStr, "codeStr:", codeStr)
  if (playLedger[instrStr].when == null){
    // Nothing ever happened on this instrument. We should make it happen!
    // console.log("NOTHING EVER HAPPENED!")
    // console.log("Tone.Transport.state:", Tone.Transport.state)
    // console.log("codeStr:", codeStr)
    instrObj[instrStr].get(codeStr).fadeIn = 0.5
    instrObj[instrStr].get(codeStr).start(Tone.now(), Tone.Transport.seconds)
    instrObj[instrStr].get(codeStr).fadeIn = 0
    const tId = Tone.Transport.schedule(function(time){
      // console.log("Hi from regular!")
      instrObj[instrStr].get(codeStr).start(time, 0)
    }, 0)
    // Update playLedger.
    playLedger[instrStr].codeStr = codeStr
    playLedger[instrStr].transportId = tId
    playLedger[instrStr].when = Tone.now()
  }
  else {
    if (
      playLedger[instrStr].transportId !== null &&
      codeStr !== playLedger[instrStr].codeStr
    ){
      // The new code is different to what's playing.
      // console.log("CHANGE OVER!")
      const prevCodeStr = playLedger[instrStr].codeStr
      // console.log("prevCodeStr:", prevCodeStr)
      // instrObj[instrStr].get(prevCodeStr).fadeOut = 0.5
      instrObj[instrStr].get(prevCodeStr).stop(Tone.now() + 0.5)
      Tone.Transport.clear(playLedger[instrStr].transportId)
      instrObj[instrStr].get(codeStr).fadeIn = 0.5
      instrObj[instrStr].get(codeStr).start(Tone.now(), Tone.Transport.seconds)
      instrObj[instrStr].get(codeStr).fadeIn = 0
      const tId = Tone.Transport.schedule(function(time){
        // console.log("Hi from regular!")
        instrObj[instrStr].get(codeStr).start(time, 0)
      }, 0)
      // Update playLedger.
      playLedger[instrStr].prevCodeStr = playLedger[instrStr].codeStr
      playLedger[instrStr].codeStr = codeStr
      playLedger[instrStr].transportId = tId
      playLedger[instrStr].when = Tone.now()
    }
    else if (Tone.now() - playLedger[instrStr].when > 2){
      // console.log("IT'S BEEN A WHILE!")
      if (playLedger[instrStr].transportId == null){
        // Start something.
        // console.log("STARTING SOMETHING!")
        instrObj[instrStr].get(codeStr).fadeIn = 0.5
        instrObj[instrStr].get(codeStr).start(Tone.now(), Tone.Transport.seconds)
        instrObj[instrStr].get(codeStr).fadeIn = 0
        const tId = Tone.Transport.schedule(function(time){
          // console.log("Hi from regular!")
          instrObj[instrStr].get(codeStr).start(time, 0)
        }, 0)
        // Update playLedger.
        playLedger[instrStr].prevCodeStr = playLedger[instrStr].codeStr
        playLedger[instrStr].codeStr = codeStr
        playLedger[instrStr].transportId = tId
        playLedger[instrStr].when = Tone.now()
      }
      else {
        // Stop something.
        // console.log("STOPPING SOMETHING!")
        Tone.Transport.clear(playLedger[instrStr].transportId)
        // Update playLedger.
        playLedger[instrStr].transportId = null
        playLedger[instrStr].prevCodeStr = codeStr
        playLedger[instrStr].codeStr = null
        playLedger[instrStr].when = Tone.now()
      }
    }
  }
}

$(function() {
    var resultCollector = Quagga.ResultCollector.create({
        capture: true,
        capacity: 20,
        blacklist: [{
            code: "WIWV8ETQZ1", format: "code_93"
        }, {
            code: "EH3C-%GU23RK3", format: "code_93"
        }, {
            code: "O308SIHQOXN5SA/PJ", format: "code_93"
        }, {
            code: "DG7Q$TV8JQ/EN", format: "code_93"
        }, {
            code: "VOFD1DB5A.1F6QU", format: "code_93"
        }, {
            code: "4SO64P4X8 U4YUU1T-", format: "code_93"
        }],
        filter: function(codeResult) {
            // only store results which match this constraint
            // e.g.: codeResult
            return true;
        }
    });
    var App = {
        init: function() {
            var self = this;

            Quagga.init(this.state, function(err) {
                if (err) {
                    return self.handleError(err);
                }
                //Quagga.registerResultCollector(resultCollector);
                App.attachListeners();
                App.checkCapabilities();
                Quagga.start();
            });
        },
        handleError: function(err) {
            console.log(err);
        },
        checkCapabilities: function() {
            var track = Quagga.CameraAccess.getActiveTrack();
            var capabilities = {};
            if (typeof track.getCapabilities === 'function') {
                capabilities = track.getCapabilities();
            }
            this.applySettingsVisibility('zoom', capabilities.zoom);
            this.applySettingsVisibility('torch', capabilities.torch);
        },
        updateOptionsForMediaRange: function(node, range) {
            console.log('updateOptionsForMediaRange', node, range);
            var NUM_STEPS = 6;
            var stepSize = (range.max - range.min) / NUM_STEPS;
            var option;
            var value;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            for (var i = 0; i <= NUM_STEPS; i++) {
                value = range.min + (stepSize * i);
                option = document.createElement('option');
                option.value = value;
                option.innerHTML = value;
                node.appendChild(option);
            }
        },
        applySettingsVisibility: function(setting, capability) {
            // depending on type of capability
            if (typeof capability === 'boolean') {
                var node = document.querySelector('input[name="settings_' + setting + '"]');
                if (node) {
                    node.parentNode.style.display = capability ? 'block' : 'none';
                }
                return;
            }
            if (window.MediaSettingsRange && capability instanceof window.MediaSettingsRange) {
                var node = document.querySelector('select[name="settings_' + setting + '"]');
                if (node) {
                    this.updateOptionsForMediaRange(node, capability);
                    node.parentNode.style.display = 'block';
                }
                return;
            }
        },
        initCameraSelection: function(){
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

            return Quagga.CameraAccess.enumerateVideoDevices()
            // .then(function(devices) {
            //     function pruneText(text) {
            //         return text.length > 30 ? text.substr(0, 30) : text;
            //     }
            //     var $deviceSelection = document.getElementById("deviceSelection");
            //     while ($deviceSelection.firstChild) {
            //         $deviceSelection.removeChild($deviceSelection.firstChild);
            //     }
            //     devices.forEach(function(device) {
            //         var $option = document.createElement("option");
            //         $option.value = device.deviceId || device.id;
            //         $option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
            //         $option.selected = streamLabel === device.label;
            //         $deviceSelection.appendChild($option);
            //     });
            //     // Tone.Transport.start()
            // });
        },
        attachListeners: function() {
            var self = this;

            self.initCameraSelection();
            $(".controls").on("click", "button.stop", function(e) {
                e.preventDefault();
                Quagga.stop();
                console.log("Tone.Transport.state:", Tone.Transport.state)
                console.log("Tone.Transport.position:", Tone.Transport.position)
                if (Tone.Transport.state == "started"){
                  Tone.Transport.stop()
                  Tone.Transport.position = "0:0:0"
                }
                else {
                  // Quagga.start() // Tom couldn't get this working.
                  Tone.Transport.start()
                }
                self._printCollectedResults();
            });

            $(".controls .reader-config-group").on("change", "input, select", function(e) {
                e.preventDefault();
                var $target = $(e.target),
                    value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
                    name = $target.attr("name"),
                    state = self._convertNameToState(name);

                console.log("Value of "+ state + " changed to " + value);
                self.setState(state, value);
            });
        },
        _printCollectedResults: function() {
            var results = resultCollector.getResults(),
                $ul = $("#result_strip ul.collector");

            results.forEach(function(result) {
                var $li = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');

                $li.find("img").attr("src", result.frame);
                $li.find("h4.code").html(result.codeResult.code + " (" + result.codeResult.format + ")");
                $ul.prepend($li);
            });
        },
        _accessByPath: function(obj, path, val) {
            var parts = path.split('.'),
                depth = parts.length,
                setter = (typeof val !== "undefined") ? true : false;

            return parts.reduce(function(o, key, i) {
                if (setter && (i + 1) === depth) {
                    if (typeof o[key] === "object" && typeof val === "object") {
                        Object.assign(o[key], val);
                    } else {
                        o[key] = val;
                    }
                }
                return key in o ? o[key] : {};
            }, obj);
        },
        _convertNameToState: function(name) {
            return name.replace("_", ".").split("-").reduce(function(result, value) {
                return result + value.charAt(0).toUpperCase() + value.substring(1);
            });
        },
        detachListeners: function() {
            $(".controls").off("click", "button.stop");
            $(".controls .reader-config-group").off("change", "input, select");
        },
        applySetting: function(setting, value) {
            var track = Quagga.CameraAccess.getActiveTrack();
            if (track && typeof track.getCapabilities === 'function') {
                switch (setting) {
                case 'zoom':
                    return track.applyConstraints({advanced: [{zoom: parseFloat(value)}]});
                case 'torch':
                    return track.applyConstraints({advanced: [{torch: !!value}]});
                }
            }
        },
        setState: function(path, value) {
            var self = this;

            if (typeof self._accessByPath(self.inputMapper, path) === "function") {
                value = self._accessByPath(self.inputMapper, path)(value);
            }

            if (path.startsWith('settings.')) {
                var setting = path.substring(9);
                return self.applySetting(setting, value);
            }
            self._accessByPath(self.state, path, value);

            console.log(JSON.stringify(self.state));
            App.detachListeners();
            Quagga.stop();
            App.init();
        },
        inputMapper: {
            inputStream: {
                constraints: function(value){
                    if (/^(\d+)x(\d+)$/.test(value)) {
                        var values = value.split('x');
                        return {
                            width: {min: parseInt(values[0])},
                            height: {min: parseInt(values[1])}
                        };
                    }
                    return {
                        deviceId: value
                    };
                }
            },
            numOfWorkers: function(value) {
                return parseInt(value);
            },
            decoder: {
                readers: function(value) {
                    if (value === 'ean_extended') {
                        return [{
                            format: "ean_reader",
                            config: {
                                supplements: [
                                    'ean_5_reader', 'ean_2_reader'
                                ]
                            }
                        }];
                    }
                    return [{
                        format: value + "_reader",
                        config: {}
                    }];
                }
            }
        },
        state: {
            inputStream: {
                type : "LiveStream",
                constraints: {
                    width: {min: 640},
                    height: {min: 480},
                    facingMode: "environment",
                    aspectRatio: {min: 1, max: 2}
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers : [{
                    format: "code_128_reader",
                    config: {}
                }]
            },
            locate: true
        },
        lastResult : null
    };

    App.init();

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                // console.log("result processing:", result)
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {
        // console.log("result detected!", result)
        lastDetectInSec = Tone.now()
        code2sound_event(result)

        var code = result.codeResult.code;

        if (App.lastResult !== code) {
            App.lastResult = code;

            lastResult = currResult

            var $node = null, canvas = Quagga.canvas.dom.image;
            $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
            $node.find("img").attr("src", canvas.toDataURL());
            $node.find("h4.code").html(code);
            $("#result_strip ul.thumbnails").prepend($node);
        }

        currResult = result

    });

});


// Tone.Transport.scheduleRepeat(function(interval){
//   // console.log("lastDetectInSec:", lastDetectInSec)
//   // console.log("lastPosInSec:", lastPosInSec)
//   // console.log(lastDetectInSec >= lastPosInSec)
//   if (lastDetectInSec >= lastPosInSec){
//     // Sthg happened since last time schedRep fired.
//     // console.log("lastResult.codeResult:", lastResult.codeResult)
//     // console.log("currResult.codeResult:", currResult.codeResult)
//     if (lastResult == undefined || soundOff){
//       // Trigger pitch.
//       code2event(currResult, synth, "triggerAttack")
//     }
//     else if (currResult.codeResult.code !== lastResult.codeResult.code){
//       console.log("GOT HERE!")
//       // Change pitch.
//       code2event(currResult, synth, "setNote")
//     }
//     else {
//       // Maintain pitch.
//     }
//   }
//   else {
//     // Nothing happened. Turn off synth.
//     synth.triggerRelease()
//     soundOff = true
//   }
//
//   lastPosInSec = Tone.now()
//   // lastPosInSec = Tone.Transport.seconds
// }, "8n")

// function code2event(result, toneObj, optionStr){
//   // console.log("result:", result)
//   const codeStr = result.codeResult.code
//   const freq = parseFloat(codeStr.slice(0, 4) + "." + codeStr.slice(4))
//   console.log("freq:", freq)
//   switch (optionStr){
//     case "setNote":
//     console.log("GOT INSIDE SETNOTE")
//     toneObj.setNote(freq, Tone.now())
//     break
//     case "triggerAttack":
//     toneObj.triggerAttack(freq, Tone.now(), 0.5)
//     soundOff = false
//     break
//     default:
//     break
//   }
// }
