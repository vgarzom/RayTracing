////////////////////////////////////////////////////////////////////////////////
// class Light
////////////////////////////////////////////////////////////////////////////////

function Light() {
    this.temporaryTranslation = Vector.create([0, 0, 0]);
  }
  
  Light.prototype.getGlobalCode = function() {
    return 'uniform vec3 light;';
  };
  
  Light.prototype.getIntersectCode = function() {
    return '';
  };
  
  Light.prototype.getShadowTestCode = function() {
    return '';
  };
  
  Light.prototype.getMinimumIntersectCode = function() {
    return '';
  };
  
  Light.prototype.getNormalCalculationCode = function() {
    return '';
  };
  
  Light.prototype.setUniforms = function(renderer) {
    renderer.uniforms.light = light.add(this.temporaryTranslation);
  };
  
  Light.clampPosition = function(position) {
    for(var i = 0; i < position.elements.length; i++) {
      position.elements[i] = Math.max(lightSize - 1, Math.min(1 - lightSize, position.elements[i]));
    }
  };
  
  Light.prototype.temporaryTranslate = function(translation) {
    var tempLight = light.add(translation);
    Light.clampPosition(tempLight);
    this.temporaryTranslation = tempLight.subtract(light);
  };
  
  Light.prototype.translate = function(translation) {
    light = light.add(translation);
    Light.clampPosition(light);
  };
  
  Light.prototype.getMinCorner = function() {
    return light.add(this.temporaryTranslation).subtract(Vector.create([lightSize, lightSize, lightSize]));
  };
  
  Light.prototype.getMaxCorner = function() {
    return light.add(this.temporaryTranslation).add(Vector.create([lightSize, lightSize, lightSize]));
  };
  
  Light.prototype.intersect = function(origin, ray) {
    return Number.MAX_VALUE;
  };