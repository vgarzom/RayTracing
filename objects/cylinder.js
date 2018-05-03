////////////////////////////////////////////////////////////////////////////////
// class Cylinder
////////////////////////////////////////////////////////////////////////////////

function Cylinder(center, radius, height, id) {
  this.height = height;
  this.center = center;
  this.radius = radius;
  this.centerStr = 'cylCenter' + id;
  this.radiusStr = 'cylRadius' + id;
  this.heightStr = 'cylHeight' + id;
  this.intersectStr = 'tCyl' + id;
  this.temporaryTranslation = Vector.create([0, 0, 0]);
}

Cylinder.prototype.getGlobalCode = function () {
  return '' +
    ' uniform vec3 ' + this.centerStr + ';' +
    ' uniform float ' + this.radiusStr + ';' +
    ' uniform float ' + this.heightStr + ';';
};

Cylinder.prototype.getIntersectCode = function () {
  return '' +
    ' float ' + this.intersectStr + ' = intersectCylinder(origin, ray, ' + this.centerStr + ', ' + this.radiusStr + ', ' + this.heightStr + ');';
};

Cylinder.prototype.getShadowTestCode = function () {
  return '' +
    this.getIntersectCode() +
    ' if(' + this.intersectStr + ' < 1.0) return 0.0;';
};

Cylinder.prototype.getMinimumIntersectCode = function () {
  return '' +
    ' if(' + this.intersectStr + ' < t) t = ' + this.intersectStr + ';';
};

Cylinder.prototype.getNormalCalculationCode = function () {
  return '' +
    ' else if(t == ' + this.intersectStr + ') normal = normalForCylinder(hit, ' + this.centerStr + ', ' + this.radiusStr + ', ' + this.heightStr + ');';
};

Cylinder.prototype.setUniforms = function (renderer) {
  renderer.uniforms[this.centerStr] = this.center.add(this.temporaryTranslation);
  renderer.uniforms[this.radiusStr] = this.radius;
  renderer.uniforms[this.heightStr] = this.height;
};

Cylinder.prototype.temporaryTranslate = function (translation) {
  this.temporaryTranslation = translation;
};

Cylinder.prototype.translate = function (translation) {
  this.center = this.center.add(translation);
};

Cylinder.prototype.getMinCorner = function () {
  return this.center.add(this.temporaryTranslation).subtract(Vector.create([this.radius, this.radius, this.radius]));
};

Cylinder.prototype.getMaxCorner = function () {
  return this.center.add(this.temporaryTranslation).add(Vector.create([this.radius, this.radius, this.radius]));
};

Cylinder.prototype.intersect = function (origin, ray) {
  return Cylinder.intersect(origin, ray, this.center.add(this.temporaryTranslation), this.radius);
};

Cylinder.intersect = function (origin, ray, center, radius) {
  var toCylinder = origin.subtract(center);
  var a = ray.dot(ray);
  var b = 2 * toCylinder.dot(ray);
  var c = toCylinder.dot(toCylinder) - radius * radius;
  var discriminant = b * b - 4 * a * c;
  if (discriminant > 0) {
    var t = (-b - Math.sqrt(discriminant)) / (2 * a);
    if (t > 0) {
      return t;
    }
  }
  return Number.MAX_VALUE;
};