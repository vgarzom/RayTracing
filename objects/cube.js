////////////////////////////////////////////////////////////////////////////////
// class Cube
////////////////////////////////////////////////////////////////////////////////

function Cube(minCorner, maxCorner, id) {
    this.minCorner = minCorner;
    this.maxCorner = maxCorner;
    this.minStr = 'cubeMin' + id;
    this.maxStr = 'cubeMax' + id;
    this.intersectStr = 'tCube' + id;
    this.temporaryTranslation = Vector.create([0, 0, 0]);
  }
  
  Cube.prototype.getGlobalCode = function() {
    return '' +
  ' uniform vec3 ' + this.minStr + ';' +
  ' uniform vec3 ' + this.maxStr + ';';
  };
  
  Cube.prototype.getIntersectCode = function() {
    return '' +
  ' vec2 ' + this.intersectStr + ' = intersectCube(origin, ray, ' + this.minStr + ', ' + this.maxStr + ');';
  };
  
  Cube.prototype.getShadowTestCode = function() {
    return '' +
    this.getIntersectCode() + 
  ' if(' + this.intersectStr + '.x > 0.0 && ' + this.intersectStr + '.x < 1.0 && ' + this.intersectStr + '.x < ' + this.intersectStr + '.y) return 0.0;';
  };
  
  Cube.prototype.getMinimumIntersectCode = function() {
    return '' +
  ' if(' + this.intersectStr + '.x > 0.0 && ' + this.intersectStr + '.x < ' + this.intersectStr + '.y && ' + this.intersectStr + '.x < t) t = ' + this.intersectStr + '.x;';
  };
  
  Cube.prototype.getNormalCalculationCode = function() {
    return '' +
    // have to compare intersectStr.x < intersectStr.y otherwise two coplanar
    // cubes will look wrong (one cube will "steal" the hit from the other)
  ' else if(t == ' + this.intersectStr + '.x && ' + this.intersectStr + '.x < ' + this.intersectStr + '.y) normal = normalForCube(hit, ' + this.minStr + ', ' + this.maxStr + ');';
  };
  
  Cube.prototype.setUniforms = function(renderer) {
    renderer.uniforms[this.minStr] = this.getMinCorner();
    renderer.uniforms[this.maxStr] = this.getMaxCorner();
  };
  
  Cube.prototype.temporaryTranslate = function(translation) {
    this.temporaryTranslation = translation;
  };
  
  Cube.prototype.translate = function(translation) {
    this.minCorner = this.minCorner.add(translation);
    this.maxCorner = this.maxCorner.add(translation);
  };
  
  Cube.prototype.getMinCorner = function() {
    return this.minCorner.add(this.temporaryTranslation);
  };
  
  Cube.prototype.getMaxCorner = function() {
    return this.maxCorner.add(this.temporaryTranslation);
  };
  
  Cube.prototype.intersect = function(origin, ray) {
    return Cube.intersect(origin, ray, this.getMinCorner(), this.getMaxCorner());
  };
  
  Cube.intersect = function(origin, ray, cubeMin, cubeMax) {
    var tMin = cubeMin.subtract(origin).componentDivide(ray);
    var tMax = cubeMax.subtract(origin).componentDivide(ray);
    var t1 = Vector.min(tMin, tMax);
    var t2 = Vector.max(tMin, tMax);
    var tNear = t1.maxComponent();
    var tFar = t2.minComponent();
    if(tNear > 0 && tNear < tFar) {
      return tNear;
    }
    return Number.MAX_VALUE;
  };
  