#define PHONG

uniform vec3  diffuse;
uniform vec3  emissive;
uniform vec3  specular;
uniform float shininess;
uniform float opacity;

uniform float time;
uniform vec2  mouse;

varying vec2  vUv;
varying vec3  newPosition;
varying float noise;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// Smooth gradient across 5 color stops (t in 0..1)
vec3 palette(float t) {
  // Blue → Purple → Red → Orange → Blue  (very slow cycle)
  vec3 c0 = vec3(0.10, 0.45, 0.90);  // Neuralis electric blue
  vec3 c1 = vec3(0.45, 0.18, 0.88);  // deep violet-purple
  vec3 c2 = vec3(0.82, 0.08, 0.22);  // crimson red
  vec3 c3 = vec3(0.96, 0.42, 0.05);  // burnt orange
  vec3 c4 = vec3(0.10, 0.45, 0.90);  // back to blue (loop)

  // Scale t over 4 segments
  t = fract(t);
  float seg = t * 4.0;
  int  i   = int(floor(seg));
  float f  = fract(seg);

  // Smooth step to ease between stops
  f = f * f * (3.0 - 2.0 * f);

  if (i == 0) return mix(c0, c1, f);
  if (i == 1) return mix(c1, c2, f);
  if (i == 2) return mix(c2, c3, f);
              return mix(c3, c4, f);
}

void main() {
  #include <clipping_planes_fragment>

  float n = clamp(noise * 0.5 + 0.5, 0.0, 1.0);

  // Very slow color cycle: full rotation every ~80 seconds
  float cycle = time * 0.0125;

  // Sample the palette at cycle offset, perturbed by noise for organic feel
  float paletteT = cycle + n * 0.25;
  vec3 baseColor = palette(paletteT);

  // Bright highlight band driven by high-noise areas
  vec3 highlightColor = palette(paletteT + 0.08);
  float highlight = smoothstep(0.6, 1.0, n);
  baseColor = mix(baseColor, highlightColor * 1.4, highlight * 0.55);

  // Subtle iridescent shift at extremes
  vec3 rimColor = palette(paletteT + 0.5);
  float rim = smoothstep(0.75, 1.0, n) * 0.35;
  baseColor = mix(baseColor, rimColor, rim);

  vec4 diffuseColor = vec4(baseColor, 1.0);

  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

  #include <logdepthbuf_fragment>
  #include <map_fragment>
  #include <color_fragment>
  #include <alphamap_fragment>
  #include <alphatest_fragment>
  #include <alphahash_fragment>
  #include <specularmap_fragment>
  #include <normal_fragment_begin>
  #include <normal_fragment_maps>
  #include <emissivemap_fragment>

  #include <lights_phong_fragment>
  #include <lights_fragment_begin>
  #include <lights_fragment_maps>
  #include <lights_fragment_end>

  #include <aomap_fragment>

  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse
                     + reflectedLight.directSpecular + reflectedLight.indirectSpecular
                     + totalEmissiveRadiance;

  #include <envmap_fragment>
  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>

  gl_FragColor = vec4(outgoingLight, diffuseColor.a);
}
