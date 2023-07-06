export const normalizeColor = `
    vec3 normalizeColor(float r, float g, float b) {
        return vec3(r/255.0,g/255.0,b/255.0);
    }
    vec3 normalizeColor(vec3 color) {
        return color / 255.;
    }
    vec4 normalizeColor(float r, float g, float b, float a) {
        return vec4(r/255.0,g/255.0,b/255.0, a);
    }
    vec4 normalizeColor(vec4 color) {
        return vec4(color.r/255.0,color.g/255.0,color.b/255.0, color.a);
    }
`