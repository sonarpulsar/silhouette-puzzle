// Turns a captured frame into a smooth solid-black body silhouette
// by comparing it to the empty-floor reference (background subtraction).

// Loads the stored empty-floor reference into a size×size canvas.
async function loadBackground(size) {
  const url = localStorage.getItem("bgRef");
  if (!url) return null;
  const img = await loadImage(url);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  c.getContext("2d").drawImage(img, 0, 0, size, size);
  return c;
}

// frameCanvas + bgCanvas are the same size. Returns a canvas: black shape on white.
function makeBodySilhouette(frameCanvas, bgCanvas, { threshold = 45, blur = 4 } = {}) {
  const size = frameCanvas.width;
  const f = frameCanvas.getContext("2d").getImageData(0, 0, size, size).data;
  const b = bgCanvas.getContext("2d").getImageData(0, 0, size, size).data;

  // 1) Raw mask: black where the pixel differs enough from the empty floor.
  const mask = document.createElement("canvas");
  mask.width = size;
  mask.height = size;
  const mctx = mask.getContext("2d");
  const m = mctx.createImageData(size, size);
  const md = m.data;
  for (let i = 0; i < f.length; i += 4) {
    const d = Math.max(
      Math.abs(f[i] - b[i]),
      Math.abs(f[i + 1] - b[i + 1]),
      Math.abs(f[i + 2] - b[i + 2])
    );
    if (d > threshold) {
      md[i] = md[i + 1] = md[i + 2] = 0;
      md[i + 3] = 255;
    } else {
      md[i + 3] = 0;
    }
  }
  mctx.putImageData(m, 0, 0);

  // 2) Blur to remove specks + smooth edges, over a white background.
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const octx = out.getContext("2d");
  octx.fillStyle = "#fff";
  octx.fillRect(0, 0, size, size);
  octx.filter = `blur(${blur}px)`;
  octx.drawImage(mask, 0, 0);
  octx.filter = "none";

  // 3) Snap back to solid black / white for a clean silhouette.
  const fin = octx.getImageData(0, 0, size, size);
  const fd = fin.data;
  for (let i = 0; i < fd.length; i += 4) {
    const lum = (fd[i] + fd[i + 1] + fd[i + 2]) / 3;
    const on = lum < 170;
    fd[i] = fd[i + 1] = fd[i + 2] = on ? 0 : 255;
    fd[i + 3] = 255;
  }
  octx.putImageData(fin, 0, 0);

  // 4) Fill interior holes (e.g. pale clothing that matched the floor).
  fillHoles(out);
  return out;
}

// Fills any white region that is fully enclosed by black (i.e. not connected to
// the image border) with black. Leaves the outside background white.
function fillHoles(canvas) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  const N = size * size;

  const isBg = new Uint8Array(N); // 1 = white (background/hole candidate)
  for (let i = 0; i < N; i++) isBg[i] = d[i * 4] > 127 ? 1 : 0;

  const reached = new Uint8Array(N); // white connected to the border = real outside
  const stack = [];
  const seed = (x, y) => {
    const idx = y * size + x;
    if (isBg[idx] && !reached[idx]) { reached[idx] = 1; stack.push(idx); }
  };
  for (let x = 0; x < size; x++) { seed(x, 0); seed(x, size - 1); }
  for (let y = 0; y < size; y++) { seed(0, y); seed(size - 1, y); }

  while (stack.length) {
    const idx = stack.pop();
    const x = idx % size;
    const y = (idx - x) / size;
    if (x > 0)        { const n = idx - 1;    if (isBg[n] && !reached[n]) { reached[n] = 1; stack.push(n); } }
    if (x < size - 1) { const n = idx + 1;    if (isBg[n] && !reached[n]) { reached[n] = 1; stack.push(n); } }
    if (y > 0)        { const n = idx - size; if (isBg[n] && !reached[n]) { reached[n] = 1; stack.push(n); } }
    if (y < size - 1) { const n = idx + size; if (isBg[n] && !reached[n]) { reached[n] = 1; stack.push(n); } }
  }

  for (let i = 0; i < N; i++) {
    if (isBg[i] && !reached[i]) { // enclosed white -> fill black
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 0;
      d[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// A plain white canvas (used if no background was captured yet).
function blankWhite(size) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  return c;
}
