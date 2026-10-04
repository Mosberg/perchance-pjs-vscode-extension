// Extracted verbatim from main.pjs lines 117-345 (dedented by 2 spaces; no other changes).
// Contents: the `$output(wheelOptions)` render function + `initWinwheel()` which defines
// window.drawImageToCanvasContained() and window.getArcClippedCanvas().
// In the real generator these live in main.pjs; this file exists so the logic can be read/diffed standalone.

$output(wheelOptions) =>
if(!window.Winwheel) initWinwheel();

let wheelId = "winwheel"+Math.random().toString().slice(2);

let wheelDiameter = wheelOptions.wheelDiameter || 400;

let pointerIconHtml = wheelOptions.pointer || `<div style="font-size:200%; transform: translateY(10px);">▼</div>`;

setTimeout(async () => {
  
  let audio;
  if(!wheelOptions.sound) audio = new Audio(wheelSegmentSoundsDataUrls.tock);
  else if(wheelOptions.sound === "none") audio = null;
  else if(wheelOptions.sound.startsWith("data:")) audio = new Audio(wheelOptions.sound);
  else audio = new Audio(wheelSegmentSoundsDataUrls[wheelOptions.sound]);
  
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  let segments = [];
  let imageUrls = [];
  for(let segmentName in wheelOptions.segments) {
    let segmentNode = wheelOptions.segments[segmentName];
    let segment = {};
    segment.text = segmentNode.getName;

    //if(wheelOptions.randomFillStyle == "pastel") segment.fillStyle = `hsl(${360 * Math.random()},${(25 + 70 * Math.random())}%,${(85 + 10 * Math.random())}%)`;
    if(wheelOptions.randomFillStyle == "pastel") segment.fillStyle = "hsla(" + ~~(360 * Math.random()) + "," +"70%,"+"80%,1)";
    else if(wheelOptions.randomFillStyle == "normal") segment.fillStyle = `hsl(${randomInt(0, 360)},${randomInt(42, 98)}%,${randomInt(40, 90)}%)`; // from https://gist.github.com/bendc/76c48ce53299e6078a76
    
    for(let prop of segmentNode.getPropertyNames) {
      segment[prop] = segmentNode[prop];
      if(prop === "image") imageUrls.push(segmentNode[prop]);
    }
    segments.push(segment);
  }
  
  // set animation defaults
  let animation = {
    type: 'spinToStop',
    duration: 5,
    spins: 8,
    callbackFinished: function(winningSegment) {},
    callbackSound: function() {
      if(audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play();
      }
    },
    callbackAfter: function() {
      // commented this out because for some reason it has red lines as default, so it's not getting the correct style data
      if(imageUrls.length > 0) window[wheelId].drawSegments(); // since the segments aren't drawn by default when images are used
    },
  };
  if(wheelOptions.animation) {
    for(let prop of wheelOptions.animation.getPropertyNames) {
      animation[prop] = wheelOptions.animation[prop];
    }
    if(wheelOptions.animation.callbackFinished) animation.callbackFinished = wheelOptions.animation.callbackFinished;
  }
  
  // preload images:
  if(imageUrls.length > 0) {
    function preloadImage(url) {
      return new Promise(resolve => {
        let image = new Image();
        image.onload = resolve;
        image.src = url;
      });
    }
    await Promise.all(imageUrls.map(url => preloadImage(url)));
    await new Promise(r => setTimeout(r, 10));
    
    // here we manually create the imgData property because we want to clip the
    // segments so that the images don't overlap.
    let segmentSizeSum = segments.reduce((a,v) => a + (v.size || 0), 0);
    let unsizedSegments = segments.reduce((a,v) => a + (v.size === undefined ? 1 : 0), 0);
    let segmentSizeRemainder = 360 - segmentSizeSum;
    for(let segment of segments) {
      let segmentSize = segment.size !== undefined ? segment.size : segmentSizeRemainder/unsizedSegments;
      segment.imgData = await window.getArcClippedCanvas(segment.image, wheelDiameter/2, segmentSize);
      delete segment.image;
    }
  }
  
  
  // set winwheel defaults
  let winwheelOptions = {
    drawMode: imageUrls.length > 0 ? "segmentImage" : undefined,
    drawText: wheelOptions.drawText == undefined ? true : wheelOptions.drawText, // because text isn't drawn by default when using images
    numSegments: wheelOptions.segments.getLength,
    canvasId: wheelId+"CanvasId",
    responsive: true,
    segments: segments,
    animation: animation,
    
    // pins: {
    //   outerRadius: 6,
    //   responsive : true, // This must be set to true if pin size is to be responsive.
    // },
  };
  
  // for some reason the strokeStyle default is changed to red for segmentImage mode, so I'm changing it back:
  if(winwheelOptions.drawMode == "segmentImage") {
    winwheelOptions.strokeStyle = "black";
  }
  
  for(let prop of wheelOptions.getPropertyNames) {
    winwheelOptions[prop] = wheelOptions[prop];
  }

  window[wheelId] = new Winwheel(winwheelOptions);
  if(winwheelOptions.drawMode == "segmentImage") {
    setTimeout(() => window[wheelId].draw(), 10);
  }
  // window[wheelId].draw();
  // window[wheelId].drawSegments();
  // window[wheelId].drawWheelImage();
}, 10);

return `
  <div style="display:inline-block; cursor:pointer;">
    <div style="text-align:center;">${pointerIconHtml}</div>
    <canvas onclick="window.${wheelId}.stopAnimation(false); window.${wheelId}.rotationAngle = window.${wheelId}.rotationAngle % 360; window.${wheelId}.startAnimation();" id="${wheelId}CanvasId" width='${wheelDiameter}' height='${wheelDiameter}'></canvas>
  </div>
`;



initWinwheel() => 

window.drawImageToCanvasContained = function(ctx, img, x, y, w, h, offsetX, offsetY) {
  // By Ken Fyrstenberg Nilsen: https://stackoverflow.com/a/21961894/11950764
  if(arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if(offsetX < 0) offsetX = 0;
  if(offsetY < 0) offsetY = 0;
  if(offsetX > 1) offsetX = 1;
  if(offsetY > 1) offsetY = 1;

  let iw = img.width;
  let ih = img.height;
  let r = Math.min(w / iw, h / ih);
  let nw = iw * r;   // new prop. width
  let nh = ih * r;   // new prop. height
  let cx, cy, cw, ch, ar = 1;

  // decide which gap to fill    
  if(nw < w) ar = w / nw;                             
  if(Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if(cx < 0) cx = 0;
  if(cy < 0) cy = 0;
  if(cw > iw) cw = iw;
  if(ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}



window.getArcClippedCanvas = async function(imageUrl, radius, arcSizeDeg) {   
  let arcSizeRad = (arcSizeDeg/360)*2*Math.PI;
  
  // derive require width and height of canvas from radius and arc size
  let width;
  if(arcSizeDeg >= 180) {
    width = radius*2;
  } else {
    width = radius*Math.sin(arcSizeRad/2)*2;
  }
  
  let height;
  if(arcSizeDeg <= 180) {
    height = radius;
  } else {
    height = radius + radius*Math.sin( (arcSizeRad-Math.PI)/2 );
  }
  
  let arcCenterX = width/2;
  let arcCenterY = radius; // remember, y axis starts from top of canvas
   
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  
  canvas.width = width;
  canvas.height = height;
  
  let img = new Image();
  await new Promise(resolve => {
    img.onload = resolve;
    img.src = imageUrl;
  });
  
  let centerAngle = -Math.PI/2;
  
  ctx.beginPath();
  ctx.moveTo(arcCenterX, arcCenterY); 
  ctx.arc(arcCenterX, arcCenterY, radius, centerAngle - (arcSizeDeg/2)*2*Math.PI/360, centerAngle + (arcSizeDeg/2)*2*Math.PI/360);
  ctx.clip();
  
  // we want to "cover" the canvas with the image without changing the image's aspect ratio
  window.drawImageToCanvasContained(ctx, img, 0, 0, canvas.width, canvas.height);
  
  return canvas;
}
