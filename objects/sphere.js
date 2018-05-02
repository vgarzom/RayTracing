////////////////////////////////////////////////////////////////////////////////
// class Sphere
////////////////////////////////////////////////////////////////////////////////

function Sphere(center, radius, id) {
    this.center = center;
    this.radius = radius;
    this.centerStr = 'sphereCenter' + id;
    this.radiusStr = 'sphereRadius' + id;
    this.intersectStr = 'tSphere' + id;
    this.temporaryTranslation = Vector.create([0, 0, 0]);
  }
  
  Sphere.prototype.getGlobalCode = function() {
    return '' +
  ' uniform vec3 ' + this.centerStr + ';' +
  ' uniform float ' + this.radiusStr + ';';
  };
  
  Sphere.prototype.getIntersectCode = function() {
    return '' +
  ' float ' + this.intersectStr + ' = intersectSphere(origin, ray, ' + this.centerStr + ', ' + this.radiusStr + ');';
  };
  
  Sphere.prototype.getShadowTestCode = function() {
    return '' +
    this.getIntersectCode() + 
  ' if(' + this.intersectStr + ' < 1.0) return 0.0;';
  };
  
  Sphere.prototype.getMinimumIntersectCode = function() {
    return '' +
  ' if(' + this.intersectStr + ' < t) t = ' + this.intersectStr + ';';
  };
  
  Sphere.prototype.getNormalCalculationCode = function() {
    return '' +
  ' else if(t == ' + this.intersectStr + ') normal = normalForSphere(hit, ' + this.centerStr + ', ' + this.radiusStr + ');';
  };
  
  Sphere.prototype.setUniforms = function(renderer) {
    renderer.uniforms[this.centerStr] = this.center.add(this.temporaryTranslation);
    renderer.uniforms[this.radiusStr] = this.radius;
  };
  
  Sphere.prototype.temporaryTranslate = function(translation) {
    this.temporaryTranslation = translation;
  };
  
  Sphere.prototype.translate = function(translation) {
    this.center = this.center.add(translation);
  };
  
  Sphere.prototype.getMinCorner = function() {
    return this.center.add(this.temporaryTranslation).subtract(Vector.create([this.radius, this.radius, this.radius]));
  };
  
  Sphere.prototype.getMaxCorner = function() {
    return this.center.add(this.temporaryTranslation).add(Vector.create([this.radius, this.radius, this.radius]));
  };
  
  Sphere.prototype.intersect = function(origin, ray) {
    return Sphere.intersect(origin, ray, this.center.add(this.temporaryTranslation), this.radius);
  };
  
  Sphere.intersect = function(origin, ray, center, radius) {
    var toSphere = origin.subtract(center);
    var a = ray.dot(ray);
    var b = 2*toSphere.dot(ray);
    var c = toSphere.dot(toSphere) - radius*radius;
    var discriminant = b*b - 4*a*c;
    if(discriminant > 0) {
      var t = (-b - Math.sqrt(discriminant)) / (2*a);
      if(t > 0) {
        return t;
      }
    }
    return Number.MAX_VALUE;
  };