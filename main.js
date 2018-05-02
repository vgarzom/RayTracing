/*
 WebGL Path Tracing (http://madebyevan.com/webgl-path-tracing/)
 License: MIT License (see below)

 Copyright (c) 2010 Evan Wallace

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/




////////////////////////////////////////////////////////////////////////////////
// main program
////////////////////////////////////////////////////////////////////////////////



function tick(timeSinceStart) {
  eye.elements[0] = zoomZ * Math.sin(angleY) * Math.cos(angleX);
  eye.elements[1] = zoomZ * Math.sin(angleX);
  eye.elements[2] = zoomZ * Math.cos(angleY) * Math.cos(angleX);

  document.getElementById('glossiness-factor').style.display = (material == MATERIAL_GLOSSY) ? 'inline' : 'none';

  ui.updateMaterial();
  ui.updateGlossiness();
  ui.updateEnvironment();
  ui.update(timeSinceStart);
  ui.render();
}

function elementPos(element) {
  var x = 0, y = 0;
  while(element.offsetParent) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}

function eventPos(event) {
  return {
    x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
    y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
  };
}

window.onload = function() {
  gl = null;
  error = document.getElementById('error');
  canvas = document.getElementById('canvas');
  try { gl = canvas.getContext('experimental-webgl'); } catch(e) {}

  if(gl) {
    error.innerHTML = 'Loading...';

    // keep track of whether an <input> is focused or not (will be no only if inputFocusCount == 0)
    var inputs = document.getElementsByTagName('input');
    for(var i= 0; i < inputs.length; i++) {
      inputs[i].onfocus = function(){ inputFocusCount++; };
      inputs[i].onblur = function(){ inputFocusCount--; };
    }

    material = parseInt(document.getElementById('material').value, 10);
    environment = parseInt(document.getElementById('environment').value, 10);
    ui = new UI();
    ui.setObjects(makeSphereColumn());
    var start = new Date();
    error.style.zIndex = -1;
    setInterval(function(){ tick((new Date() - start) * 0.001); }, 1000 / 60);
  } else {
    error.innerHTML = 'Your browser does not support WebGL.<br>Please see <a href="http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">Getting a WebGL Implementation</a>.';
  }
};

