// Adapted from https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// In this example we iterate over all pixels to change their values, then we
// put the modified pixel array back to the canvas using putImageData(). The
// invert function simply subtracts each color from the max value 255. The
// grayscale function simply uses the average of red, green and blue.

Tone.Transport.loop = true
Tone.Transport.loopEnd = "2m"
Tone.Transport.bpm.value = 130

const audioPath = "https://tomcollinsresearch.net/mc/ex/src/instrument/"
let kick = new Tone.MembraneSynth().toMaster()
let cymb = new Tone.MetalSynth().toMaster()
const clickTimes = ["0:0:0", "0:1:0", "0:2:0", "0:3:0", "1:0:0", "1:1:0", "1:2:0", "1:3:0"]
const p = new Tone.Players({
	"arp": audioPath + "edm_samples/synth.wav",
  "drum": audioPath + "edm_samples/drum.mp3",
  "bass": audioPath + "edm_samples/bass.wav"
}, function(){
	console.log("Players are loaded!")
}).toMaster()
let transportIds = {
  "arp": null,
  "drum": null,
  "bass": null
}

clickTimes.map(function(ct){
  Tone.Transport.schedule(function(time){
    console.log("ct:", ct)
    let vel
    if (ct == "0:0:0" || ct == "1:0:0"){
      if (ct == "0:0:0"){
        vel = 0.8
      }
      else {
        vel = 0.3
      }
      kick.triggerAttackRelease("C2", "8n", "+0", vel);
    }
    else {
      cymb.triggerAttackRelease("32n", "+0", 0.01)
    }
  }, ct)
})

Tone.Transport.schedule(function(time){
  Tone.Draw.schedule(function(aTime){
    let canvas = document.getElementById('a-canvas');
    let ratio = canvas.width/canvas.height
    let height = videoElm.videoWidth/ratio
    let yOffset = (videoElm.videoHeight - height)/2


    let ctx = canvas.getContext('2d');
    ctx.drawImage(
      videoElm,
      0, yOffset, videoElm.videoWidth, height,
      0, 0, canvas.width, canvas.height
    )
    // ctx.drawImage(videoElm, 0, 0)
    // img.style.display = 'none'
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    console.log("imageData:", imageData)
    let data = imageData.data

    let redWin = 0, greenWin = 0, blueWin = 0
    for (let i = 0; i < data.length; i += 4){
      if (data[i] > Math.max(data[i + 1], data[i + 2]) + 20){
        data[i + 1] = 0
        data[i + 2] = 0
        redWin++
      }
      else if (data[i + 1] > Math.max(data[i], data[i + 2]) + 20){
        data[i] = 0
        data[i + 2] = 0
        greenWin++
      }
      else if (data[i + 2] > Math.max(data[i], data[i + 1]) + 20){
        data[i] = 0
        data[i + 1] = 0
        blueWin++
      }
    }
    console.log("pixelWins:", [redWin, greenWin, blueWin])
    if (redWin >= 20000){
      transportIds.arp = toggle_sample("arp")
    }
    else if (greenWin >= 20000){
      transportIds.drum = toggle_sample("drum")
    }
    else if (blueWin >= 20000){
      transportIds.bass = toggle_sample("bass")
    }

    // for (let i = 0; i < data.length; i += 4){
    //   var avg = (data[i] + data[i + 1] + data[i + 2])/3;
    //   data[i] = avg // red
    //   data[i + 1] = avg // green
    //   data[i + 2] = avg // blue
    // }

    ctx.putImageData(imageData, 0, 0);
  }, time)
}, "1:2:0")

function my_start(){
  Tone.Transport.start();
}

function toggle_sample(str){
	if (transportIds[str] == null){
		return Tone.Transport.schedule(function(time){
    	p.get(str).start("+0.001", 0, 3.69230)
    }, 0)
  }
  else {
  	Tone.Transport.clear(transportIds[str])
  }
}
