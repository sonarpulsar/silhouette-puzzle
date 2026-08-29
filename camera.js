// Camera + calibration helper for the projector computer (Logitech C270).
// Everything here is device-specific and saved in localStorage on that machine.

function defaultCalib() {
  // Fractions are resolution-independent (0..1).
  // sizeFrac is a fraction of the video HEIGHT (the square's side).
  return { xFrac: 0.5, yFrac: 0.5, sizeFrac: 0.8, flipH: false, rotate: 0, threshold: 45 };
}

function loadCalib() {
  try {
    return Object.assign(defaultCalib(), JSON.parse(localStorage.getItem("calib")));
  } catch (e) {
    return defaultCalib();
  }
}

function saveCalib(c) {
  localStorage.setItem("calib", JSON.stringify(c));
}

const CAMERA = {
  video: null,
  stream: null,
  started: false,
  calib: loadCalib(),
  camId: null, // currently selected camera (session only, not persisted)

  // Opens a stream (optionally for a specific camera) and attaches it.
  async _open(videoEl) {
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    const video = { width: { ideal: 1280 }, height: { ideal: 720 } };
    if (this.camId) video.deviceId = { exact: this.camId };
    this.stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
    this.video = videoEl;
    videoEl.srcObject = this.stream;
    await videoEl.play();
    this.started = true;
  },

  // Starts the webcam once and attaches it to a <video> element.
  async ensure(videoEl) {
    if (this.started && this.video) {
      // Re-attach the existing stream to whichever <video> is on screen now.
      if (videoEl && videoEl.srcObject !== this.stream) {
        videoEl.srcObject = this.stream;
        await videoEl.play().catch(() => {});
        this.video = videoEl;
      }
      return;
    }
    await this._open(videoEl);
  },

  // Lists available cameras. Labels are only filled in after permission is granted.
  async listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "videoinput")
      .map((d, i) => ({ deviceId: d.deviceId, label: d.label || "Camera " + (i + 1) }));
  },

  // Switches to a chosen camera and re-attaches to the given <video>.
  async switchTo(deviceId, videoEl) {
    this.camId = deviceId || null;
    await this._open(videoEl || this.video);
  },

  // The deviceId of the currently active stream (to preselect the dropdown).
  currentDeviceId() {
    const track = this.stream && this.stream.getVideoTracks()[0];
    return track ? track.getSettings().deviceId : null;
  },

  // Draws the calibrated (cropped + flipped + rotated) square into `dest`.
  // Returns false if the video isn't ready yet.
  draw(dest, size) {
    const v = this.video;
    if (!v || !v.videoWidth) return false;
    const c = this.calib;
    const vw = v.videoWidth,
      vh = v.videoHeight;
    const cs = c.sizeFrac * vh; // square side in video pixels
    const sx = c.xFrac * vw - cs / 2;
    const sy = c.yFrac * vh - cs / 2;

    dest.width = size;
    dest.height = size;
    const ctx = dest.getContext("2d");
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((c.rotate * Math.PI) / 180);
    if (c.flipH) ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, cs, cs, -size / 2, -size / 2, size, size);
    ctx.restore();
    return true;
  },

  // Grabs the current calibrated frame as the "empty floor" reference.
  captureBackground(size = 720) {
    const c = document.createElement("canvas");
    if (!this.draw(c, size)) return null;
    const url = c.toDataURL("image/jpeg", 0.85);
    localStorage.setItem("bgRef", url);
    return url;
  },

  hasBackground() {
    return !!localStorage.getItem("bgRef");
  },
};
