



window.addEventListener('load', function() {
	// Get A WebGL context
	var canvas = document.getElementById("canvas");
	var gl = getWebGLContext(canvas);
	if (!gl) {
		return;
	}

	// setup GLSL program
	vertexShader = createShaderFromScriptElement(gl, "2d-vertex-shader");
	fragmentShader = createShaderFromScriptElement(gl, "2d-fragment-shader");
	program = createProgram(gl, [vertexShader, fragmentShader]);
	gl.useProgram(program);

	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "position");

	var resolutionLocation = gl.getUniformLocation(program, "resolution");
	var timeLocation = gl.getUniformLocation(program, "time");
	var mouseLocation = gl.getUniformLocation(program, "mouse");

	// Create a buffer and put a single clipspace rectangle in
	// it (2 triangles)
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	-1.0, -1.0, 1.0, -1.0, -1.0,  1.0,
	-1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	function resize() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		canvas.width = w;
		canvas.height = h;
		gl.uniform2f(resolutionLocation, w, h);
		gl.viewport(0, 0, w, h);
	}

	function mousemove(e) {
		var w = window.innerWidth;
		var h = window.innerHeight;
		gl.uniform2f(mouseLocation, e.offsetX / w, e.offsetY / h);
	}

	function renderFrame() {
		gl.uniform1f(timeLocation, time);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		time += 1.0 / 60.0;
		requestAnimFrame(renderFrame);
	}

	var time = 0.0;

	window.addEventListener('mousemove', mousemove);
	window.addEventListener('resize', resize);

	resize();
	requestAnimFrame(renderFrame);

});
