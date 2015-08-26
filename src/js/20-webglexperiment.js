
function ShaderEffectPass(opts) {
  this.gl = opts.gl || null;
  this.vertexShader = opts.vertexShader || null;
  this.fragmentShader = opts.fragmentShader || null;
  this.width = 256;
  this.height = 256;
  this.textures = [];
  this.recreate();
}

ShaderEffectPass.prototype.recreate = function() {

  if (this.vertexShader == null) {
    this.vertexShader = createShader(
      this.gl,
      "precision mediump float;\n" +
      "attribute vec2 position;\n" +
      "void main() { gl_Position = vec4(position.x, position.y, 0, 1); }",
      this.gl.VERTEX_SHADER);
  }

  

  this.program = createProgram(this.gl, [this.vertexShader, this.fragmentShader]);
  this.positionLocation = this.gl.getAttribLocation(this.program, "position");
  this.resolutionLocation = this.gl.getUniformLocation(this.program, "resolution");
  this.timeLocation = this.gl.getUniformLocation(this.program, "time");
  this.mouseLocation = this.gl.getUniformLocation(this.program, "mouse");
  this.textureLocation = [
    this.gl.getUniformLocation(this.program, "texture"),
    this.gl.getUniformLocation(this.program, "texture2"),
    this.gl.getUniformLocation(this.program, "texture3"),
    this.gl.getUniformLocation(this.program, "texture4")
  ];
  this.buffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0,  1.0,
    -1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), this.gl.STATIC_DRAW);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.enableVertexAttribArray(this.positionLocation);
  this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
}

ShaderEffectPass.prototype.render = function(env) {
  this.gl.useProgram(this.program);
  this.gl.uniform2f(this.mouseLocation, env.mousePosition.x / env.screenWidth, env.mousePosition.y / env.screenHeight);
  this.gl.uniform2f(this.resolutionLocation, env.targetWidth, env.targetHeight);
  for(var i=0; i<this.textures.length; i++) {
    this.gl.activeTexture(this.gl.TEXTURE0 + i);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i]);
    this.gl.uniform1i(this.textureLocation[i], i);
  }
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  this.gl.enableVertexAttribArray(this.positionLocation);
  this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  this.gl.uniform1f(this.timeLocation, env.time);
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}

ShaderEffectPass.prototype.setInputTexture = function(texture, n) {
  this.textures[n || 0] = texture;
}






function RenderTargetHelper(opts) {
  this.gl = opts.gl || null;
  this.width = opts.width || 256;
  this.height = opts.height || 256;
  this.rttFramebuffer = null;
  this.rttTexture = null;
  this.recreate();
}

RenderTargetHelper.prototype.recreate = function() {
  this.rttFramebuffer = this.gl.createFramebuffer();
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rttFramebuffer);
  this.rttFramebuffer.width = this.width;
  this.rttFramebuffer.height = this.height;
  this.rttTexture = this.gl.createTexture();
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.rttTexture);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
  this.gl.generateMipmap(this.gl.TEXTURE_2D);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.rttFramebuffer.width, this.rttFramebuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
  var renderbuffer = this.gl.createRenderbuffer();
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.rttFramebuffer.width, this.rttFramebuffer.height);
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.rttTexture, 0);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer);
  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
}

RenderTargetHelper.prototype.beforeRender = function(env) {
  env.targetWidth = this.rttFramebuffer.width;
  env.targetHeight = this.rttFramebuffer.height;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rttFramebuffer);
  this.gl.viewport(0, 0, this.rttFramebuffer.width, this.rttFramebuffer.height);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

RenderTargetHelper.prototype.afterRender = function(env) {
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.rttTexture);
  this.gl.generateMipmap(this.gl.TEXTURE_2D);
  this.gl.bindTexture(this.gl.TEXTURE_2D, null);
}

RenderTargetHelper.prototype.getTexture = function() {
  return this.rttTexture;
}

RenderTargetHelper.prototype.render = function(env, inner) {
  this.beforeRender(env);
  inner(env);
  this.afterRender(env);
}






function TextureHelper(opts) {
  this.gl = opts.gl || null;
  this.filename = opts.filename || null;
  this.rttTexture = null;
  this.recreate();
}

TextureHelper.prototype.recreate = function() {
  this.rttTexture = this.gl.createTexture();

  var _this = this;
  var img = new Image();
  img.onload = function() {
    _this.gl.bindTexture(_this.gl.TEXTURE_2D, _this.rttTexture);
    _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, img);
    _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MAG_FILTER, _this.gl.LINEAR);
    _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MIN_FILTER, _this.gl.LINEAR_MIPMAP_NEAREST);
    _this.gl.generateMipmap(_this.gl.TEXTURE_2D);
    _this.gl.bindTexture(_this.gl.TEXTURE_2D, null);
  }
  img.src = this.filename;

  /*
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
  this.gl.generateMipmap(this.gl.TEXTURE_2D);
  this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.rttFramebuffer.width, this.rttFramebuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
  var renderbuffer = this.gl.createRenderbuffer();
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
  this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.rttFramebuffer.width, this.rttFramebuffer.height);
  this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.rttTexture, 0);
  this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer);
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  */
}

TextureHelper.prototype.getTexture = function() {
  return this.rttTexture;
}






function ScreenTargetHelper(opts) {
  this.gl = opts.gl || null;
  this.recreate();
}

ScreenTargetHelper.prototype.recreate = function() {
}

ScreenTargetHelper.prototype.beforeRender = function(env) {
  env.targetWidth = env.screenWidth;
  env.targetHeight = env.screenHeight;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  this.gl.viewport(0, 0, env.screenWidth, env.screenHeight);
}

ScreenTargetHelper.prototype.afterRender = function(env) {
}

ScreenTargetHelper.prototype.getTexture = function() {
}

ScreenTargetHelper.prototype.render = function(env, inner) {
  this.beforeRender(env);
  inner(env);
  this.afterRender(env);
}








function WebGLExperiment(opts) {
  this.setup = function() {};
  this.render = function() {};
}

WebGLExperiment.prototype.run = function() {

  var _this = this;

  // Get A WebGL context
  var canvas = document.getElementById("canvas");

  var gl = getWebGLContext(canvas);
  if (!gl) {
    return;
  }

  var mousePosition = { x:0, y:0 };

  var w = 500;
  var h = 500;
  var time = 0.0;

  var resize = function() {
    w = window.innerWidth;
    h = window.innerHeight;
    console.log('resize', w, h);
    canvas.width = w;
    canvas.height = h;
  }

  resize();

  window.addEventListener('mousemove', function(e) {
    // onsole.log('mousemove', e);
    mousePosition.x = e.x;
    mousePosition.y = e.y;
  });

  window.addEventListener('resize', resize);

  var renderFrame = function() {

    var env = {
      mousePosition: mousePosition,
      time: time,
      screenResolution: [w, h],
      screenWidth: w,
      screenHeight: h
    };

    _this.render(gl, env);

    // loop
    time += 1.0 / 60.0;
    requestAnimFrame(renderFrame);
  }

  _this.setup(gl);

  requestAnimFrame(renderFrame);

}




