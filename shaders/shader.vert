precision highp float;

const int MAX_LIGHTS = 8;

struct LightInfo {
    vec4 pos;
    vec3 Ia;
    vec3 Id;
    vec3 Is;
};

struct MaterialInfo {
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float shininess;
};

uniform float shadow;

uniform LightInfo uLight[MAX_LIGHTS]; // The array of lights present in the scene
uniform MaterialInfo uMaterial;

attribute vec4 vPosition;
attribute vec4 vNormal;

uniform mat4 mModelView;// model-view transformation
uniform mat4 mNormals; // model-view transformation

uniform mat4 mView; // view transformation
uniform mat4 mViewNormals; // view transf. for vectors
uniform mat4 mProjection; // projection matrix
varying vec4 fColor;

void main() {
    if (shadow == 1.0) {
        vec3 amb = vec3(0.0, 0.0, 0.0);
        vec3 dif = vec3(0.0, 0.0, 0.0);
        vec3 spe = vec3(0.0, 0.0, 0.0);

        for ( int i = 0; i < MAX_LIGHTS; i++) {
            vec3 posC = (mModelView * vPosition).xyz;
            
            vec3 ambientColor = uLight[i].Ia * uMaterial.Ka;
            vec3 diffuseColor = uLight[i].Id * uMaterial.Kd;
            vec3 specularColor = uLight[i].Is * uMaterial.Ks;

            vec3 L;
            if(uLight[i].pos.w == 0.0)
                L = normalize((mViewNormals*uLight[i].pos).xyz);
            else
                L = normalize((mView*uLight[i].pos).xyz - posC);

            vec3 V = vec3(0,0,1); // Projeção paralela...
            vec3 H = normalize(L+V);
            vec3 N = normalize((mNormals * vNormal).xyz);
            float diffuseFactor = max( dot(L,N), 0.0 );
            vec3 diffuse = diffuseFactor * diffuseColor;
            float specularFactor = pow(max(dot(N,H), 0.0), uMaterial.shininess);
            vec3 specular = specularFactor * specularColor;

            if( dot(L,N) < 0.0 ) {
                specular = vec3(0.0, 0.0, 0.0);
            }

            amb += ambientColor;
            dif += diffuse;
            spe += specular;
        }    
        fColor = vec4(amb + dif + spe, 1.0);
    }
    else {
        fColor = vec4(uMaterial.Ka+uMaterial.Kd+uMaterial.Ks, 1.0);
    }

    gl_Position = mProjection * mModelView * vPosition;
} 