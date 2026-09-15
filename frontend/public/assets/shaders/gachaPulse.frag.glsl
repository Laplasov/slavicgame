precision mediump float;

uniform float uTime;
uniform vec2 uResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    vec2 centered = uv - 0.5;
    centered.x *= uResolution.x / uResolution.y;

    float dist = length(centered);
    float angle = atan(centered.y, centered.x);

    float boltCount = 6.0;
    float thickness = 0.005;

    const float TAU = 6.28318530718;
    float wedgeSize = TAU / boltCount;

    // Snap to the nearest spoke's base angle
    float spokeIndex = floor(angle / wedgeSize + 0.5);
    float baseAngle = spokeIndex * wedgeSize;

    // Zigzag driven by radial distance — same triangle-wave math as your original,
    // but now it's a function of dist instead of uv.x
    float frequency = 2.0;   // how many zigzag segments along each bolt's length
    float amplitude = 0.3;   // how far each zigzag jags sideways, in radians

    float zigzag = abs(fract(dist * frequency) - 0.5) * 2.0;
    float angleOffset = (zigzag - 0.5) * amplitude;

    float targetAngle = baseAngle + angleOffset;

    // Angular distance from this pixel to the bolt's jagged path at this radius,
    // converted to actual on-screen distance by multiplying by dist (arc length)
    float angleDiff = angle - targetAngle;
    float distToBolt = abs(angleDiff) * dist;

    if (distToBolt < thickness) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}