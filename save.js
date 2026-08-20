// Saves a capture (4 images) to Supabase Storage + a row in the `captures` table.

function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((res) => canvas.toBlob(res, type, quality));
}

function slugify(s) {
  return (s || "puzzle")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "puzzle";
}

// r = { name, colorFile, puzzleSil(canvas), raw(canvas), bodySil(canvas) }
async function saveResult(r) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const folder = `${stamp}_${slugify(r.name)}`;

  const colorBlob = await (await fetch(r.colorFile)).blob();
  const files = [
    ["color.png", colorBlob],
    ["puzzle_sil.png", await canvasToBlob(r.puzzleSil, "image/png")],
    ["body_raw.jpg", await canvasToBlob(r.raw, "image/jpeg", 0.9)],
    ["body_sil.png", await canvasToBlob(r.bodySil, "image/png")],
  ];

  const urls = {};
  for (const [fname, blob] of files) {
    const path = `${folder}/${fname}`;
    const { error } = await supabaseClient.storage
      .from("captures")
      .upload(path, blob, { upsert: true, contentType: blob.type });
    if (error) throw error;
    urls[fname] = supabaseClient.storage.from("captures").getPublicUrl(path).data.publicUrl;
  }

  const { error: dbErr } = await supabaseClient.from("captures").insert({
    puzzle_name: r.name,
    color_url: urls["color.png"],
    puzzle_sil_url: urls["puzzle_sil.png"],
    body_raw_url: urls["body_raw.jpg"],
    body_sil_url: urls["body_sil.png"],
  });
  if (dbErr) throw dbErr;
}
