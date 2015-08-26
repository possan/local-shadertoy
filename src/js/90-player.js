



window.addEventListener('load', function() {
	console.log('yo!');

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
	var hue1Location = gl.getUniformLocation(program, "hue1");
	var color1Location = gl.getUniformLocation(program, "color1");
	var hue2Location = gl.getUniformLocation(program, "hue2");
	var color2Location = gl.getUniformLocation(program, "color2");

	// Create a buffer and put a single clipspace rectangle in
	// it (2 triangles)
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
	-1.0, -1.0, 1.0, -1.0, -1.0,  1.0,
	-1.0,  1.0, 1.0, -1.0, 1.0,  1.0]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	var beatoffset = 0;
	var targethue1 = 45;
	var targethue2 = 180;
	var hue1 = 0;// * Math.ceil(Math.random() * 8.0);
	var hue2 = 0;// * Math.ceil(Math.random() * 8.0);

	function resize() {
    	var w = window.innerWidth;
    	var h = window.innerHeight;
    	console.log('resize', w, h);
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

	function keydown(e) {
		console.log(e, e.keyCode);
		if (e.keyCode == 32) {
			beatoffset += 5.0 + Math.random() * 30.0;
		}
		if (e.keyCode == 49) {
			targethue1 += 45 * Math.ceil(Math.random() * 4.0);
		}
		if (e.keyCode == 50) {
			targethue2 += 45 * Math.ceil(Math.random() * 4.0);
		}
	}

	function hslToRgb(h, s, l) {
		var r, g, b;
	    function hue2rgb(p, q, t) {
	        if(t < 0) t += 1;
	        if(t > 1) t -= 1;
	        if(t < 1/6) return p + (q - p) * 6 * t;
	        if(t < 1/2) return q;
	        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	        return p;
	    }
	    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	    var p = 2 * l - q;
	    r = hue2rgb(p, q, h + 1/3);
	    g = hue2rgb(p, q, h);
	    b = hue2rgb(p, q, h - 1/3);
		return [r, g, b];
	}

    function renderFrame() {
        rgb1 = hslToRgb((hue1 / 360.0) % 1.0, 1.0, 0.5);
        rgb2 = hslToRgb((hue2 / 360.0) % 1.0, 1.0, 0.5);
        gl.uniform1f(timeLocation, time + beatoffset);
        gl.uniform1f(hue1Location, hue1);
        gl.uniform1f(hue2Location, hue2);
        gl.uniform3f(color1Location, rgb1[0], rgb1[1], rgb1[2]);
        gl.uniform3f(color2Location, rgb2[0], rgb2[1], rgb2[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        time += 1.0 / 60.0;
        hue1 += (targethue1 - hue1) * 0.5;
        hue2 += (targethue2 - hue2) * 0.1;
        requestAnimFrame(renderFrame);
    }

    var time = 0.0;

    window.addEventListener('keydown', keydown);
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('resize', resize);

    resize();
    requestAnimFrame(renderFrame);

});
