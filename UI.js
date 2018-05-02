////////////////////////////////////////////////////////////////////////////////
// class UI
////////////////////////////////////////////////////////////////////////////////

function UI() {
    this.renderer = new Renderer();
    this.moving = false;
  }
  
  UI.prototype.setObjects = function(objects) {
    this.objects = objects;
    this.objects.splice(0, 0, new Light());
    this.renderer.setObjects(this.objects);
  };
  
  UI.prototype.update = function(timeSinceStart) {
    this.modelview = makeLookAt(eye.elements[0], eye.elements[1], eye.elements[2], 0, 0, 0, 0, 1, 0);
    this.projection = makePerspective(55, 1, 0.1, 100);
    this.modelviewProjection = this.projection.multiply(this.modelview);
    this.renderer.update(this.modelviewProjection, timeSinceStart);
  };
  
  UI.prototype.mouseDown = function(x, y) {
    var t;
    var origin = eye;
    var ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);
  
    // test the selection box first
    if(this.renderer.selectedObject != null) {
      var minBounds = this.renderer.selectedObject.getMinCorner();
      var maxBounds = this.renderer.selectedObject.getMaxCorner();
      t = Cube.intersect(origin, ray, minBounds, maxBounds);
  
      if(t < Number.MAX_VALUE) {
        var hit = origin.add(ray.multiply(t));
  
        if(Math.abs(hit.elements[0] - minBounds.elements[0]) < 0.001) this.movementNormal = Vector.create([-1, 0, 0]);
        else if(Math.abs(hit.elements[0] - maxBounds.elements[0]) < 0.001) this.movementNormal = Vector.create([+1, 0, 0]);
        else if(Math.abs(hit.elements[1] - minBounds.elements[1]) < 0.001) this.movementNormal = Vector.create([0, -1, 0]);
        else if(Math.abs(hit.elements[1] - maxBounds.elements[1]) < 0.001) this.movementNormal = Vector.create([0, +1, 0]);
        else if(Math.abs(hit.elements[2] - minBounds.elements[2]) < 0.001) this.movementNormal = Vector.create([0, 0, -1]);
        else this.movementNormal = Vector.create([0, 0, +1]);
  
        this.movementDistance = this.movementNormal.dot(hit);
        this.originalHit = hit;
        this.moving = true;
  
        return true;
      }
    }
  
    t = Number.MAX_VALUE;
    this.renderer.selectedObject = null;
  
    for(var i = 0; i < this.objects.length; i++) {
      var objectT = this.objects[i].intersect(origin, ray);
      if(objectT < t) {
        t = objectT;
        this.renderer.selectedObject = this.objects[i];
      }
    }
  
    return (t < Number.MAX_VALUE);
  };
  
  UI.prototype.mouseMove = function(x, y) {
    if(this.moving) {
      var origin = eye;
      var ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);
  
      var t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
      var hit = origin.add(ray.multiply(t));
      this.renderer.selectedObject.temporaryTranslate(hit.subtract(this.originalHit));
  
      // clear the sample buffer
      this.renderer.pathTracer.sampleCount = 0;
    }
  };
  
  UI.prototype.mouseUp = function(x, y) {
    if(this.moving) {
      var origin = eye;
      var ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2);
  
      var t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
      var hit = origin.add(ray.multiply(t));
      this.renderer.selectedObject.temporaryTranslate(Vector.create([0, 0, 0]));
      this.renderer.selectedObject.translate(hit.subtract(this.originalHit));
      this.moving = false;
    }
  };
  
  UI.prototype.render = function() {
    this.renderer.render();
  };
  
  UI.prototype.selectLight = function() {
    this.renderer.selectedObject = this.objects[0];
  };
  
  UI.prototype.addSphere = function() {
    this.objects.push(new Sphere(Vector.create([0, 0, 0]), 0.25, nextObjectId++));
    this.renderer.setObjects(this.objects);
  };
  
  UI.prototype.addCube = function() {
    this.objects.push(new Cube(Vector.create([-0.25, -0.25, -0.25]), Vector.create([0.25, 0.25, 0.25]), nextObjectId++));
    this.renderer.setObjects(this.objects);
  };
  
  UI.prototype.deleteSelection = function() {
    for(var i = 0; i < this.objects.length; i++) {
      if(this.renderer.selectedObject == this.objects[i]) {
        this.objects.splice(i, 1);
        this.renderer.selectedObject = null;
        this.renderer.setObjects(this.objects);
        break;
      }
    }
  };
  
  UI.prototype.updateMaterial = function() {
    var newMaterial = parseInt(document.getElementById('material').value, 10);
    if(material != newMaterial) {
      material = newMaterial;
      this.renderer.setObjects(this.objects);
    }
  };
  
  UI.prototype.updateEnvironment = function() {
    //var newEnvironment = parseInt(document.getElementById('environment').value, 10);
    if(wall1color != wall1colorTemp || wall2color != wall2colorTemp) {
        wall1color = wall1colorTemp;
        wall2color = wall2colorTemp;
        updateColorCornellBox();
      this.renderer.setObjects(this.objects);
    }
  };
  
  UI.prototype.updateGlossiness = function() {
    var newGlossiness = parseFloat(document.getElementById('glossiness').value);
    if(isNaN(newGlossiness)) newGlossiness = 0;
    newGlossiness = Math.max(0, Math.min(1, newGlossiness));
    if(material == MATERIAL_GLOSSY && glossiness != newGlossiness) {
      this.renderer.pathTracer.sampleCount = 0;
    }
    glossiness = newGlossiness;
  };