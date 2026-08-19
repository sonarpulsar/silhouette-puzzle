// Turns any image with transparency into a solid silhouette.
// Opaque pixels become `color` (default black); transparent stays transparent.
// Returns a <canvas> you can draw or export.
function makeSilhouette(img, { color = [0, 0, 0], threshold = 20 } = {}) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const p = imgData.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] > threshold) {
      p[i] = color[0];
      p[i + 1] = color[1];
      p[i + 2] = color[2];
      p[i + 3] = 255;
    } else {
      p[i + 3] = 0;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

// Loads an image URL and resolves once it's ready to draw.
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
