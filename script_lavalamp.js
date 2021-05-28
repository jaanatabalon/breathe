// JavaScript Document

// Audio functionalities
const audio = document.getElementById("lavalampAudio");
let musicIsPlaying = true;

function audioControls() {
	if (musicIsPlaying) {
		audio.pause();
		musicIsPlaying = false;
	}
	else if (!musicIsPlaying) {
		audio.play();
		musicIsPlaying = true;
	}
}

// Animation Function
function animate(c) {
	const canvas = c.getContext("2d");

    const imgSize = 512;

    c.width = imgSize;
    c.height = imgSize;

    const imageRender = canvas.createImageData(imgSize, imgSize);

    for (let i = 0; i < imageRender.data.length; i += 4) {
        imageRender.data[i] = 0; 		// R
        imageRender.data[i + 1] = 0; 	// G
        imageRender.data[i + 2] = 0; 	// B
        imageRender.data[i + 3] = 255; 	// A
    }

    const heightmapSize = 1024;

    const distance = (x, y) => Math.sqrt(x * x + y * y);

    const heightMap1 = [];
    for (let row = 0; row < heightmapSize; row++) {
        for (let col = 0; col < heightmapSize; col++) {
            const coordIndex = row * heightmapSize + col;

            const cx = row - heightmapSize / 2;
            const cy = col - heightmapSize / 2;

            const dist = distance(cx, cy);

            const wavyHeight = Math.sin(dist * ((3 * Math.PI) / (heightmapSize / 2)));
            const wavyHeightScaled = (wavyHeight + 1) / 2;

            heightMap1[coordIndex] = Math.floor(wavyHeightScaled * 128);
        }
    }

    const heightMap2 = [];
    for (let row = 0; row < heightmapSize; row++) {
        for (let col = 0; col < heightmapSize; col++) {
            const coordIndex = row * heightmapSize + col;

            const cx = row - heightmapSize / 2;
            const cy = col - heightmapSize / 2;

            const d1 = distance(0.8 * cx, 1.3 * cy) * 0.022;
            const d2 = distance(1.35 * cx, 0.45 * cy) * 0.022;

            const sin = Math.sin(d1);
            const cos = Math.cos(d2);
            const heightVal = sin + cos;

            // height value between 0..1
            const normalized = (heightVal + 2) / 4;
            // height value between 0..127, integer
            heightMap2[coordIndex] = Math.floor(normalized * 127);
        }
    }

    // Color palettes
    const colorBtwn = (color1, color2, frac) => {
        return {
            r: Math.floor(color1.r + (color2.r - color1.r) * frac),
            g: Math.floor(color1.g + (color2.g - color1.g) * frac),
            b: Math.floor(color1.b + (color2.b - color1.b) * frac),
        };
    };

    const fiveColGradient = (color1, color2, color3, color4, color5) => {
        const gradient = [];

        for (let i = 0; i < 64; i++) {
          const frac = i / 64;
          gradient[i] = colorBtwn(color1, color2, frac);
        }

        for (let i = 64; i < 128; i++) {
          const frac = (i - 64) / 64;
          gradient[i] = colorBtwn(color2, color3, frac);
        }

        for (let i = 128; i < 192; i++) {
          const frac = (i - 128) / 64;
          gradient[i] = colorBtwn(color3, color4, frac);
        }

        for (let i = 192; i < 256; i++) {
          const frac = (i - 192) / 64;
          gradient[i] = colorBtwn(color4, color5, frac);
        }

        return gradient;
    };

    let fireColorScheme = fiveColGradient(
		{r: 54, g: 4, b: 18},
		{r: 60, g: 0, b: 20},
		{r: 108, g: 1, b: 42},
		{r: 255, g: 0, b: 116},
		{r: 254, g: 148, b: 167}
    );

    let dx1 = 0;
    let dy1 = 0;

    let dx2 = 0;
    let dy2 = 0;

    const movement = t => {
          dx1 = Math.floor((((Math.cos(t * 0.0002 + 0.4 + Math.PI) + 1) / 2) * heightmapSize) / 2);
          dy1 = Math.floor((((Math.cos(t * 0.0003 - 0.1) + 1) / 2) * heightmapSize) / 2);
          dx2 = Math.floor((((Math.cos(t * -0.0002 + 1.2) + 1) / 2) * heightmapSize) / 2);
          dy2 = Math.floor((((Math.cos(t * -0.0003 - 0.8 + Math.PI) + 1) / 2) * heightmapSize) / 2)
    };

    const updateImage = () => {
        for (let row = 0; row < imgSize; row++) {
            for (let col = 0; col < imgSize; col++) {
                // indexes into height maps for pixel
                const ind1 = (row + dy1) * heightmapSize + (col + dx1);
                const ind2 = (row + dy2) * heightmapSize + (col + dx2);

                // index for pixel in image data
                const pixelInd = row * imgSize * 4 + col * 4;

                // height value of 0..255
                let h = heightMap1[ind1] + heightMap2[ind2];

				const pixelColor = fireColorScheme[h];

                // set pixel data
                imageRender.data[pixelInd] = pixelColor.r;
                imageRender.data[pixelInd + 1] = pixelColor.g;
                imageRender.data[pixelInd + 2] = pixelColor.b;
            }
        }
    };

    const tick = time => {
        movement(time/2);
        updateImage();

        canvas.putImageData(imageRender, 0, 0);

        requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
}

// Animate every canvas
for (let c of document.getElementsByTagName("canvas")) {
	animate(c);
}
