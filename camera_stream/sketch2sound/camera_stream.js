// From https://h3manth.com/new/blog/2018/switch-cameras-getusermedia/

// camera stream video element
// let videoElm = document.querySelector('#camera-stream');
// flip button element
let flipBtn = document.querySelector('#flip-btn');

// default user media options
let defaultsOpts = { audio: false, video: true }
let shouldFaceUser = true;

// check whether we can use facingMode
let supports = navigator.mediaDevices.getSupportedConstraints();
if( supports['facingMode'] === true ) {
  flipBtn.disabled = false;
}

let stream = null;

function capture() {
  defaultsOpts.video = { facingMode: shouldFaceUser ? 'environment' : 'user' }
  navigator.mediaDevices.getUserMedia(defaultsOpts)
    .then(function(_stream) {
      stream = _stream;
      let $viewport = document.querySelector("#interactive.viewport")
      // Remove any existing children (from previous camera flips).
      var fc = $viewport.firstChild;
      while (fc){
        $viewport.removeChild(fc);
        fc = $viewport.firstChild;
      }
      let video = document.createElement("video")
      $viewport.appendChild(video)
      video.setAttribute('id', 'camera-stream')
      video.setAttribute('playsinline', true)
      video.srcObject = stream
      video.play()

      // videoElm.srcObject = stream;
      // videoElm.play();
    })
    .catch(function(err) {
      console.log(err)
    });
}

flipBtn.addEventListener('click', function(){
  if( stream == null ) return
  // we need to flip, stop everything
  stream.getTracks().forEach(t => {
    t.stop();
  });
  // toggle / flip
  shouldFaceUser = !shouldFaceUser;
  capture();
})

capture();
