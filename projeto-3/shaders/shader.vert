const vec4 lightPosition = vec4(0.0, 3.0, 0.0, 0.0);

attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 mModelView;
uniform mat4 mNormals;
uniform mat4 mView;
uniform mat4 mViewNormals;
uniform mat4 mProjection;

varying vec3 fNormal;
varying vec3 fLight;
varying vec3 fViewer;

void main() {

    vec3 posC = (mModelView * vPosition).xyz;
    fNormal = (mNormals * vNormal).xyz;

    if(lightPosition.w == 0.0)
        fLight = normalize((mViewNormals * lightPosition).xyz);
    else
        fLight = normalize((mView*lightPosition).xyz - posC);

    fViewer = vec3(0.0, 0.0, 1.0);
    gl_Position = mProjection * mModelView * vPosition;
}