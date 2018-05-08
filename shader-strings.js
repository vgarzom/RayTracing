////////////////////////////////////////////////////////////////////////////////
// shader strings
////////////////////////////////////////////////////////////////////////////////

// vertex shader for drawing a textured quad
var renderVertexSource =
    ' attribute vec3 vertex;' +
    ' varying vec2 texCoord;' +
    ' void main() {' +
    '   texCoord = vertex.xy * 0.5 + 0.5;' +
    '   gl_Position = vec4(vertex, 1.0);' +
    ' }';

// fragment shader for drawing a textured quad
var renderFragmentSource =
    ' precision highp float;' +
    ' varying vec2 texCoord;' +
    ' uniform sampler2D texture;' +
    ' void main() {' +
    '   gl_FragColor = texture2D(texture, texCoord);' +
    ' }';

// vertex shader for drawing a line
var lineVertexSource =
    ' attribute vec3 vertex;' +
    ' uniform vec3 cubeMin;' +
    ' uniform vec3 cubeMax;' +
    ' uniform mat4 modelviewProjection;' +
    ' void main() {' +
    '   gl_Position = modelviewProjection * vec4(mix(cubeMin, cubeMax, vertex), 1.0);' +
    ' }';

// fragment shader for drawing a line
var lineFragmentSource =
    ' precision highp float;' +
    ' void main() {' +
    '   gl_FragColor = vec4(1.0);' +
    ' }';

// constants for the shaders
var bounces = '5';
var epsilon = '0.0001';
var infinity = '10000.0';
var lightSize = 0.1;
var lightVal = 0.5;

// vertex shader, interpolate ray per-pixel
var tracerVertexSource =
    ' attribute vec3 vertex;' +
    ' uniform vec3 eye, ray00, ray01, ray10, ray11;' +
    ' varying vec3 initialRay;' +
    ' void main() {' +
    '   vec2 percent = vertex.xy * 0.5 + 0.5;' +
    '   initialRay = mix(mix(ray00, ray01, percent.y), mix(ray10, ray11, percent.y), percent.x);' +
    '   gl_Position = vec4(vertex, 1.0);' +
    ' }';

// start of fragment shader
var tracerFragmentSourceHeader =
    ' precision highp float;' +
    ' uniform vec3 eye;' +
    ' varying vec3 initialRay;' +
    ' uniform float textureWeight;' +
    ' uniform float timeSinceStart;' +
    ' uniform sampler2D texture;' +
    ' uniform float glossiness;' +
    ' vec3 roomCubeMin = vec3(-1.0, -1.0, -1.0);' +
    ' vec3 roomCubeMax = vec3(1.0, 1.0, 1.0);';

// compute the near and far intersections of the cube (stored in the x and y components) using the slab method
// no intersection means vec.x > vec.y (really tNear > tFar)
var intersectCubeSource =
    ' vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {' +
    '   vec3 tMin = (cubeMin - origin) / ray;' +
    '   vec3 tMax = (cubeMax - origin) / ray;' +
    '   vec3 t1 = min(tMin, tMax);' +
    '   vec3 t2 = max(tMin, tMax);' +
    '   float tNear = max(max(t1.x, t1.y), t1.z);' +
    '   float tFar = min(min(t2.x, t2.y), t2.z);' + 
    '   return vec2(tNear, tFar);' +
    ' }';

// given that hit is a point on the cube, what is the surface normal?
// TODO: do this with fewer branches
var normalForCubeSource =
    ' vec3 normalForCube(vec3 hit, vec3 cubeMin, vec3 cubeMax)' +
    ' {' +
    '   if(hit.x < cubeMin.x + ' + epsilon + ') return vec3(-1.0, 0.0, 0.0);' +
    '   else if(hit.x > cubeMax.x - ' + epsilon + ') return vec3(1.0, 0.0, 0.0);' +
    '   else if(hit.y < cubeMin.y + ' + epsilon + ') return vec3(0.0, -1.0, 0.0);' +
    '   else if(hit.y > cubeMax.y - ' + epsilon + ') return vec3(0.0, 1.0, 0.0);' +
    '   else if(hit.z < cubeMin.z + ' + epsilon + ') return vec3(0.0, 0.0, -1.0);' +
    '   else return vec3(0.0, 0.0, 1.0);' +
    ' }';

// compute the near intersection of a sphere
// no intersection returns a value of +infinity
var intersectSphereSource =
    ' float intersectSphere(vec3 origin, vec3 ray, vec3 sphereCenter, float sphereRadius) {' +
    '   vec3 toSphere = origin - sphereCenter;' +
    '   float a = dot(ray, ray);' +
    '   float b = 2.0 * dot(toSphere, ray);' +
    '   float c = dot(toSphere, toSphere) - sphereRadius*sphereRadius;' +
    '   float discriminant = b*b - 4.0*a*c;' +
    '   if(discriminant > 0.0) {' +
    '     float t = (-b - sqrt(discriminant)) / (2.0 * a);' +
    '     if(t > 0.0) return t;' +
    '   }' +
    '   return ' + infinity + ';' +
    ' }';

    var intersectCylinderSource =
    ' float intersectCylinder(vec3 origin, vec3 ray, vec3 cylCenter, float cylRadius, float cylHeight) {' +
    '   vec3 toCyl = origin - cylCenter;' +
    '   float a = ray.x*ray.x + ray.z*ray.z;' +
    '   float b = 2.0 * (ray.x*toCyl.x + ray.z*toCyl.z);' +
    '   float c = toCyl.x*toCyl.x + toCyl.z*toCyl.z - cylRadius*cylRadius;' +
    '   float discriminant = b*b - 4.0*a*c;' +
    '   float ymin = (- cylHeight/2.0);' +
    '   float ymax = ( cylHeight/2.0);' +
    '   if(discriminant > 0.0) {' +
    '     float t = (-b - sqrt(discriminant)) / (2.0 * a);' +
    '     if (t > 0.0) { '+
    '        if((toCyl.y + t*ray.y) > ymin && (toCyl.y + t*ray.y) < ymax) return t;' +
    '        else if ((toCyl.y + t*ray.y) >= ymax) {'+
    '           float dist = (ymax - toCyl.y)/ray.y;'+
    '           float px = toCyl.x + dist*ray.x;'+
    '           float py = toCyl.y + dist*ray.y;'+
    '           float pz = toCyl.z + dist*ray.z;'+
    '           if (px*px + pz*pz - cylRadius*cylRadius <= 0.0000001) return dist;'+
    '        } '+
    '        else if ((toCyl.y + t*ray.y) < ymin) {'+
    '           float dist = (ymin - toCyl.y)/ray.y;'+
    '           float px = toCyl.x + dist*ray.x;'+
    '           float py = toCyl.y + dist*ray.y;'+
    '           float pz = toCyl.z + dist*ray.z;'+
    '           if (px*px + pz*pz - cylRadius*cylRadius <= 0.0000001) return dist;'+
    '        } '+
    '     }'+
    '   }' +
    '   return ' + infinity + ';' +
    ' }';

// given that hit is a point on the sphere, what is the surface normal?
var normalForSphereSource =
    ' vec3 normalForSphere(vec3 hit, vec3 sphereCenter, float sphereRadius) {' +
    '   return (hit - sphereCenter) / sphereRadius;' +
    ' }';

var normalForCylinderSource =
    ' vec3 normalForCylinder(vec3 hit, vec3 cylCenter, float cylRadius, float cylHeight) {' +
    '   if(hit.y < cylCenter.y - cylHeight/2.0  + ' + epsilon + ') return vec3(0.0, -1.0, 0.0);' +
    '   else if(hit.y > cylCenter.y + cylHeight/2.0 - ' + epsilon + ') return vec3(0.0, 1.0, 0.0);' +
    '   else return (hit - cylCenter) / cylRadius;' +
    ' }';


// use the fragment position for randomness
var randomSource =
    ' float random(vec3 scale, float seed) {' +
    '   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);' +
    ' }';

// random cosine-weighted distributed vector
// from http://www.rorydriscoll.com/2009/01/07/better-sampling/
var cosineWeightedDirectionSource =
    ' vec3 cosineWeightedDirection(float seed, vec3 normal) {' +
    '   float u = random(vec3(12.9898, 78.233, 151.7182), seed);' +
    '   float v = random(vec3(63.7264, 10.873, 623.6736), seed);' +
    '   float r = sqrt(u);' +
    '   float angle = 6.283185307179586 * v;' +
    // compute basis from normal
    '   vec3 sdir, tdir;' +
    '   if (abs(normal.x)<.5) {' +
    '     sdir = cross(normal, vec3(1,0,0));' +
    '   } else {' +
    '     sdir = cross(normal, vec3(0,1,0));' +
    '   }' +
    '   tdir = cross(normal, sdir);' +
    '   return r*cos(angle)*sdir + r*sin(angle)*tdir + sqrt(1.-u)*normal;' +
    ' }';

// random normalized vector
var uniformlyRandomDirectionSource =
    ' vec3 uniformlyRandomDirection(float seed) {' +
    '   float u = random(vec3(12.9898, 78.233, 151.7182), seed);' +
    '   float v = random(vec3(63.7264, 10.873, 623.6736), seed);' +
    '   float z = 1.0 - 2.0 * u;' +
    '   float r = sqrt(1.0 - z * z);' +
    '   float angle = 6.283185307179586 * v;' +
    '   return vec3(r * cos(angle), r * sin(angle), z);' +
    ' }';

// random vector in the unit sphere
// note: this is probably not statistically uniform, saw raising to 1/3 power somewhere but that looks wrong?
var uniformlyRandomVectorSource =
    ' vec3 uniformlyRandomVector(float seed) {' +
    '   return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));' +
    ' }';

// compute specular lighting contribution
var specularReflection =
    ' vec3 reflectedLight = normalize(reflect(light - hit, normal));' +
    ' specularHighlight = max(0.0, dot(reflectedLight, normalize(hit - origin)));';

// update ray using normal and bounce according to a diffuse reflection
var newDiffuseRay =
    ' ray = cosineWeightedDirection(timeSinceStart + float(bounce), normal);';

// update ray using normal according to a specular reflection
var newReflectiveRay =
    ' ray = reflect(ray, normal);' +
    specularReflection +
    ' specularHighlight = 2.0 * pow(specularHighlight, 20.0);';

// update ray using normal and bounce according to a glossy reflection
var newGlossyRay =
    ' ray = normalize(reflect(ray, normal)) + uniformlyRandomVector(timeSinceStart + float(bounce)) * glossiness;' +
    specularReflection +
    ' specularHighlight = pow(specularHighlight, 3.0);';

var colorCornellBox = '';

function updateColorCornellBox() {
    console.log("updating color");
    colorCornellBox = ' if(hit.x < -0.9999) surfaceColor = vec3(' + wall1color[0] + ',' + wall1color[1] + ',' + wall1color[2] + ');' +
        ' else if(hit.x > 0.9999) surfaceColor = vec3(' + wall2color[0] + ',' + wall2color[1] + ',' + wall2color[2] + ');';
}

updateColorCornellBox();

function makeShadow(objects) {
    return '' +
        ' float shadow(vec3 origin, vec3 ray) {' +
        concat(objects, function (o) { return o.getShadowTestCode(); }) +
        '   return 1.0;' +
        ' }';
}

function makeCalculateColor(objects) {
    updateColorCornellBox();
    return '' +
        ' vec3 calculateColor(vec3 origin, vec3 ray, vec3 light) {' +
        '   vec3 colorMask = vec3(1.0);' +
        '   vec3 accumulatedColor = vec3(0.0);' +

        // main raytracing loop
        '   for(int bounce = 0; bounce < ' + bounces + '; bounce++) {' +
        // compute the intersection with everything
        '     vec2 tRoom = intersectCube(origin, ray, roomCubeMin, roomCubeMax);' +
        concat(objects, function (o) { return o.getIntersectCode(); }) +

        // find the closest intersection
        '     float t = ' + infinity + ';' +
        '     if(tRoom.x < tRoom.y) t = tRoom.y;' +
        concat(objects, function (o) { return o.getMinimumIntersectCode(); }) +

        // info about hit
        '     vec3 hit = origin + ray * t;' +
        '     vec3 surfaceColor = vec3(0.75);' +
        '     float specularHighlight = 0.0;' +
        '     vec3 normal;' +

        // calculate the normal (and change wall color)
        '     if(t == tRoom.y) {' +
        '       normal = -normalForCube(hit, roomCubeMin, roomCubeMax);' +
        colorCornellBox +
        newDiffuseRay +
        '     } else if(t == ' + infinity + ') {' +
        '       break;' +
        '     } else {' +
        '       if(false) ;' + // hack to discard the first 'else' in 'else if'
        concat(objects, function (o) { return o.getNormalCalculationCode(); }) +
        [newDiffuseRay, newReflectiveRay, newGlossyRay][material] +
        '     }' +

        // compute diffuse lighting contribution
        '     vec3 toLight = light - hit;' +
        '     float diffuse = max(0.0, dot(normalize(toLight), normal));' +

        // trace a shadow ray to the light
        '     float shadowIntensity = shadow(hit + normal * ' + epsilon + ', toLight);' +

        // do light bounce
        '     colorMask *= surfaceColor;' +
        '     accumulatedColor += colorMask * (' + lightVal + ' * diffuse * shadowIntensity);' +
        '     accumulatedColor += colorMask * specularHighlight * shadowIntensity;' +

        // calculate next origin
        '     origin = hit;' +
        '   }' +

        '   return accumulatedColor;' +
        ' }';
}

function makeMain() {
    return '' +
        ' void main() {' +
        '   vec3 newLight = light + uniformlyRandomVector(timeSinceStart - 53.0) * ' + lightSize + ';' +
        '   vec3 texture = texture2D(texture, gl_FragCoord.xy / 512.0).rgb;' +
        '   gl_FragColor = vec4(mix(calculateColor(eye, initialRay, newLight), texture, textureWeight), 1.0);' +
        ' }';
}

function makeTracerFragmentSource(objects) {
    return tracerFragmentSourceHeader +
        concat(objects, function (o) { return o.getGlobalCode(); }) +
        intersectCubeSource +
        normalForCubeSource +
        intersectSphereSource +
        intersectCylinderSource +
        normalForSphereSource +
        normalForCylinderSource +
        randomSource +
        cosineWeightedDirectionSource +
        uniformlyRandomDirectionSource +
        uniformlyRandomVectorSource +
        makeShadow(objects) +
        makeCalculateColor(objects) +
        makeMain();
}
