precision mediump float;

const int MAX_LIGHTS = 3;

struct MaterialI{
    vec3 ka;
    vec3 kd;
    vec3 ks;
    float shininess;
};

struct LightInfo{
    vec4 pos;
    vec3 ia;
    vec3 id;
    vec3 is;
};

uniform MaterialI uMaterial;
uniform LightInfo uLight[MAX_LIGHTS];
uniform mat4 mView;
uniform mat4 mViewNormals;

varying vec3 fPosition;
varying vec3 fNormal;

varying vec3 fLight;
varying vec3 fViewer;


void main() {
    for(int i = 0; i < 3; i++){
        vec3 L;

        if(uLight[i].pos.w == 0.0){ // Means its directional
            L = normalize((mViewNormals * uLight[i].pos).xyz);
        } else {
            L = normalize((mView * uLight[i].pos).xyz - fPosition);
        }

        vec3 V = normalize(-fPosition);
        vec3 N = normalize(fNormal);
        vec3 R = reflect(-L, N);

        float diffuseFactor = max(dot(N, L), 0.0);
        float specularFactor = pow(max(dot(R,V), 0.0), uMaterial.shininess);

        vec3 ambientColor = uLight[i].ia * uMaterial.ka;
        vec3 diffuseColor = uLight[i].id * uMaterial.kd;
        vec3 diffuse = diffuseFactor * diffuseColor;

        vec3 specularColor = uLight[i].is * uMaterial.ks;
        vec3 specular = specularFactor * specularColor;

        if(dot(L, N) < 0.0) {
            specular = vec3(0.0, 0.0, 0.0);
        }

        gl_FragColor.xyz += vec3(ambientColor + diffuse + specular) ;
    }
// Old version
/*    vec3 L = normalize(fLight);
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
*/
}