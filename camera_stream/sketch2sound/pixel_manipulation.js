let imgDat
const nosRow = 300
const nosCol = 400
const nosPart = 10
// sine, square, triangle, or sawtooth
let synth = new Tone.PolySynth(nosPart, Tone.Synth, {
	oscillator: {
		type: "triangle"
	},
	envelope: {
		attack: 0.005,
		decay: 0.1,
		sustain: 0.3,
		release: 1
	}
}).toMaster()

function take_picture(){
	let canvas = document.getElementById('a-canvas')
	let ratio = canvas.width/canvas.height
	let video = document.querySelector('#camera-stream')
	let height = video.videoWidth/ratio
	let yOffset = (video.videoHeight - height)/2
	let ctx = canvas.getContext('2d')
	ctx.drawImage(
		video,
		0, yOffset, video.videoWidth, height,
		0, 0, canvas.width, canvas.height
	)
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
	// console.log("imageData:", imageData)
	let data = imageData.data

	// Arrange greyscale by rows and columns for sonification.
	let aoa = []
	let rowIncr = 0
	let currCol = new Array(nosRow)
	for (let jdx = 0; jdx < nosCol; jdx++){
		for (let idx = 0; idx < nosRow; idx++){
			currCol[idx] = (
				data[4*(jdx + nosCol*idx)] +
				data[4*(jdx + nosCol*idx) + 1] +
				data[4*(jdx + nosCol*idx) + 2]
			)/3
		}
		aoa.push(currCol)
		currCol = []
	}
	// console.log("aoa:", aoa)

	// Put greyscale back into an array.
	let data2 = new Array(4*nosRow*nosCol)
	let kdx = 0
	for (let idx = 0; idx < nosRow; idx++){
		for (let jdx = 0; jdx < nosCol; jdx++){
			data2[kdx] = aoa[jdx][idx]
			data2[kdx + 1] = aoa[jdx][idx]
			data2[kdx + 2] = aoa[jdx][idx]
			data2[kdx + 3] = 255
			kdx+=4
		}
	}
	let data3 = Uint8ClampedArray.from(data2)
	// console.log("data3:", data3)

	// Put the altered image back on the canvas.
	ctx.putImageData(new ImageData(data3, nosCol, nosRow), 0, 0)
	return aoa
}

function sonify_picture(aoa){
	if (aoa == undefined){
		return alert("Take a photo first!")
	}
	if (Tone.Transport.state == "started"){
		return alert("Already playing!")
	}
	Tone.Transport.start()
	let freqIdx = new Array(nosCol)
	let amp = new Array(nosCol)
	aoa.map(function(col, jdx){
		const colMin10 = mu.sort_rows(
			col.map(function(v){ return [v] })
		)
		freqIdx[jdx] = colMin10[1].slice(0, 10)
		amp[jdx] = colMin10[0].slice(0, 10).map(function(v){ return v[0] })
	})
	console.log("freqIdx:", freqIdx)
	console.log("amp:", amp)

	// Reset the image in case they've already hit play once!
	let canvas = document.getElementById('a-canvas')
	let ctx = canvas.getContext('2d');
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
	let kdx = 0
	for (let idx = 0; idx < nosRow; idx++){
		for (let jdx = 0; jdx < nosCol; jdx++){
			imageData.data[kdx] = imgDat[jdx][idx]
			imageData.data[kdx + 1] = imgDat[jdx][idx]
			imageData.data[kdx + 2] = imgDat[jdx][idx]
			imageData.data[kdx + 3] = 255
			kdx+=4
		}
	}
	console.log("imageData:", imageData)
	ctx.putImageData(imageData, 0, 0)

	let jdx = 0
	Tone.Transport.scheduleRepeat(function(time){
		if (jdx < nosCol){
			// synth.voices.map(function(vc){
			// 	vc.volume.value = 1 - amp[jdx][idx]/255
			// })
			synth.voices.map(function(vc, idx){
				if (jdx == 0){
					vc.triggerAttack(
						nosCol - freqIdx[jdx][idx], time,
					)

				}
				else if (jdx == nosCol){
					vc.triggerRelease(
						nosCol - freqIdx[jdx - 1][idx], time
					)
				}
				else {
					vc.setNote(
						nosCol - freqIdx[jdx][idx]
					)
				}
			})

			Tone.Draw.schedule(function(aTime){
				// console.log("Happening! jdx = " + jdx + ".")
				freqIdx[jdx].map(function(idx){
					imageData.data[4*(jdx + nosCol*idx) + 2] = 255
				})
				ctx.putImageData(imageData, 0, 0)
			}, time)
			jdx++
		}
	}, 0.05)
}

Tone.Transport.loop = true
Tone.Transport.loopEnd = "2m"
Tone.Transport.bpm.value = 130

function snap(){
	imgDat = take_picture()
	console.log("imgDat:", imgDat)
}

function my_stop(){
	synth.voices.map(function(vc){
		vc.triggerRelease()
	})
	Tone.Transport.cancel()
	Tone.Transport.scheduleOnce(function(time){
		console.log("THIS IS HAPPENING!")
		// let canvas = document.getElementById('a-canvas')
		// let ctx = canvas.getContext('2d');
		// let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		// let kdx = 0
		// for (let idx = 0; idx < nosRow; idx++){
		// 	for (let jdx = 0; jdx < nosCol; jdx++){
		// 		imageData.data[kdx] = imgDat[jdx][idx]
		// 		imageData.data[kdx + 1] = imgDat[jdx][idx]
		// 		imageData.data[kdx + 2] = imgDat[jdx][idx]
		// 		imageData.data[kdx + 3] = 255
		// 		kdx+=4
		// 	}
		// }
		// console.log("imageData:", imageData)
		// // Reset the image in case they've already hit play once!
		// ctx.putImageData(imageData, 0, 0)
		Tone.Transport.stop()
	}, "+0.25")

}


// const audioPath = "https://tomcollinsresearch.net/mc/ex/src/instrument/"
// let kick = new Tone.MembraneSynth().toMaster()
// let cymb = new Tone.MetalSynth().toMaster()
// const clickTimes = ["0:0:0", "0:1:0", "0:2:0", "0:3:0", "1:0:0", "1:1:0", "1:2:0", "1:3:0"]
// const p = new Tone.Players({
// 	"arp": audioPath + "edm_samples/synth.wav",
//   "drum": audioPath + "edm_samples/drum.mp3",
//   "bass": audioPath + "edm_samples/bass.wav"
// }, function(){
// 	console.log("Players are loaded!")
// }).toMaster()
// let transportIds = {
//   "arp": null,
//   "drum": null,
//   "bass": null
// }

// clickTimes.map(function(ct){
//   Tone.Transport.schedule(function(time){
//     console.log("ct:", ct)
//     let vel
//     if (ct == "0:0:0" || ct == "1:0:0"){
//       if (ct == "0:0:0"){
//         vel = 0.8
//       }
//       else {
//         vel = 0.3
//       }
//       kick.triggerAttackRelease("C2", "8n", "+0", vel);
//     }
//     else {
//       cymb.triggerAttackRelease("32n", "+0", 0.01)
//     }
//   }, ct)
// })

// Tone.Transport.schedule(function(time){
//   Tone.Draw.schedule(function(aTime){
//     let canvas = document.getElementById('a-canvas');
//     let ratio = canvas.width/canvas.height
//     let height = videoElm.videoWidth/ratio
//     let yOffset = (videoElm.videoHeight - height)/2
//
//
//     let ctx = canvas.getContext('2d');
//     ctx.drawImage(
//       videoElm,
//       0, yOffset, videoElm.videoWidth, height,
//       0, 0, canvas.width, canvas.height
//     )
//     // ctx.drawImage(videoElm, 0, 0)
//     // img.style.display = 'none'
//     let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
//     console.log("imageData:", imageData)
//     let data = imageData.data
//
//     let redWin = 0, greenWin = 0, blueWin = 0
//     for (let i = 0; i < data.length; i += 4){
//       if (data[i] > Math.max(data[i + 1], data[i + 2]) + 20){
//         data[i + 1] = 0
//         data[i + 2] = 0
//         redWin++
//       }
//       else if (data[i + 1] > Math.max(data[i], data[i + 2]) + 20){
//         data[i] = 0
//         data[i + 2] = 0
//         greenWin++
//       }
//       else if (data[i + 2] > Math.max(data[i], data[i + 1]) + 20){
//         data[i] = 0
//         data[i + 1] = 0
//         blueWin++
//       }
//     }
//     console.log("pixelWins:", [redWin, greenWin, blueWin])
//     if (redWin >= 20000){
//       transportIds.arp = toggle_sample("arp")
//     }
//     else if (greenWin >= 20000){
//       transportIds.drum = toggle_sample("drum")
//     }
//     else if (blueWin >= 20000){
//       transportIds.bass = toggle_sample("bass")
//     }
//
//     // for (let i = 0; i < data.length; i += 4){
//     //   var avg = (data[i] + data[i + 1] + data[i + 2])/3;
//     //   data[i] = avg // red
//     //   data[i + 1] = avg // green
//     //   data[i + 2] = avg // blue
//     // }
//
//     ctx.putImageData(imageData, 0, 0);
//   }, time)
// }, "1:2:0")

// function toggle_sample(str){
// 	if (transportIds[str] == null){
// 		return Tone.Transport.schedule(function(time){
//     	p.get(str).start("+0.001", 0, 3.69230)
//     }, 0)
//   }
//   else {
//   	Tone.Transport.clear(transportIds[str])
//   }
// }
