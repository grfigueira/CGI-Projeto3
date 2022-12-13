precision mediump float;

struct MaterialI{
    vec3 ka;
    vec3 kd;
    vec3 ks;
    float shininess;
};

uniform MaterialI uMaterial;

varying vec3 fPosition;
varying vec3 fNormal;


const vec3 lightAmb = vec3(0.2, 0.2, 0.2);
const vec3 lightDif = vec3(0.7, 0.7, 0.7);
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);

vec3 ambientColor = lightAmb * uMaterial.ka;
vec3 diffuseColor = lightDif * uMaterial.kd;
vec3 specularColor = lightSpe * uMaterial.ks;

varying vec3 fLight;
varying vec3 fViewer;





void main() {
    vec3 L = normalize(fLight);
    vec3 V = normalize(fViewer);
    vec3 N = normalize(fNormal);
    vec3 H = normalize(L+V);

    float diffuseFactor = max( dot(L, N), 0.0 );
    vec3 diffuse = diffuseFactor * diffuseColor;
    float specularFactor = pow(max(dot(N, H) , 0.0), uMaterial.shininess);
    vec3 specular = specularFactor * specularColor;

    if( dot(L,N) < 0.0) {
        specular = vec3(0.0, 0.0, 0.0);
    }
    gl_FragColor = vec4(ambientColor + diffuse + specular, 1.0) ;
}