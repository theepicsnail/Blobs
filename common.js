function* range(min, max, step) {
	if(step==undefined) {
		step=1;
	}
	if(max==undefined) {
		max = min;
		min = 0;
	}

	for(let i = min; i < max; i += step) {
		yield i;
	}
}


function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function array2d(size, cb) {
	const out = [];
	for(var row = 0 ; row < size ; row++) {
		const r = [];
		out.push(r);
		for(var col = 0 ; col < size ; col++) {
			r.push(cb(row, col));
		}
	}
	return out;
}
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function lerp(a,b, p) {
	return a + (b-a)*p;
}

function getArgs() {
	const out = {};
	window.location.search.substr(1).split("&").forEach((arg)=>{
		const parts = arg.split("=");
		out[parts[0]]=parts[1];
		try{
			out[parts[0]] = parseInt(out[parts[0]]);
		}catch(x){}
	})
	return out;
}