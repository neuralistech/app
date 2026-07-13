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

void main() {
  #include <clipping_planes_fragment>

  // Organic blob color palette — deep navy → electric blue → soft cyan
  // with iridescent shift driven by noise and mouse proximity
  float n = clamp(noise * 0.5 + 0.5, 0.0, 1.0);

  // Mouse-influenced hue drift
  vec2  m      = mouse - 0.5;
  float mDist  = length(m);
  float mShift = mDist * 0.4 + time * 0.06;

  // Three color stops for the blob
  vec3 colorDeep  = vec3(0.03, 0.08, 0.28);   // deep navy
  vec3 colorMid   = vec3(0.12, 0.48, 0.93);   // electric blue (Neuralis #1e7aed)
  vec3 colorHigh  = vec3(0.45, 0.82, 1.00);   // bright cyan highlight

  // Blend based on displacement noise + subtle time oscillation
  float t1 = smoothstep(0.0, 0.55, n + 0.12 * sin(time * 0.5 + vUv.x * 6.0));
  float t2 = smoothstep(0.45, 1.0,  n + 0.10 * cos(time * 0.4 + vUv.y * 5.0 + mShift));

  vec3 blobColor = mix(colorDeep, colorMid, t1);
  blobColor      = mix(blobColor, colorHigh, t2 * 0.7);

  // Iridescent rim — purple tinge at grazing angles (approximated via noise)
  vec3 rimColor   = vec3(0.55, 0.30, 0.95);
  float rimFactor = smoothstep(0.7, 1.0, n) * 0.45;
  blobColor       = mix(blobColor, rimColor, rimFactor);

  vec4 diffuseColor = vec4(blobColor, 1.0);

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
