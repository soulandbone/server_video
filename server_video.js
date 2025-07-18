const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use("/segments", express.static(path.join(__dirname, "segments")));
const segmentsDir = path.join(__dirname, "segments");

let currentSegments = ["segment0.ts", "segment1.ts", "segment2.ts"];
let mediaSequence = 0;
let discontinuityFlag = false;

function generatePlaylist() {
  const discontinuityTag = discontinuityFlag ? "#EXT-X-DISCONTINUITY\n" : "";
  return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:${mediaSequence}
${discontinuityTag}
${currentSegments.map((s) => `#EXTINF:10,\nsegments/${s}`).join("\n")} 
`;
}

function getLastSegmentNumber() {
  const files = fs.readdirSync(segmentsDir);

  const segmentNumbers = files
    .map((file) => {
      const match = file.match(/^segment(\d+)\.ts$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null);

  if (segmentNumbers.length === 0) {
    return null; // no segments found
  }

  const maxNumber = Math.max(...segmentNumbers);
  return maxNumber;
}

const lastNumber = getLastSegmentNumber();
console.log("Last segment number:", lastNumber);

setInterval(updatePlaylist, 10000);

function updatePlaylist() {
  currentSegments.shift(); //sacamos el ultimo (primer elemento en la lista) 62
  if (mediaSequence === lastNumber) {
    mediaSequence = 0;
    discontinuityFlag = true;
    currentSegments = ["segment0.ts", "segment1.ts", "segment2.ts"];
    generatePlaylist(); //testing
    // resets the logic
  } else {
    mediaSequence += 1;
    newSequenceNumber = mediaSequence + 2;
    if (newSequenceNumber > lastNumber) {
      newSequenceNumber = newSequenceNumber - (lastNumber + 1);
    }
    newSequenceName = `segment${newSequenceNumber}.ts`;
    currentSegments.push(newSequenceName);

    if (discontinuityFlag) {
      discontinuityFlag = false;
    }
  }
  console.log("Media Sequence", mediaSequence);
  console.log(`La lista actual es ${currentSegments}`);
}

app.get("/playlist.m3u8", (req, res) => {
  res.type("application/vnd.apple.mpegurl");
  res.send(generatePlaylist());
});

app.get("/segments/:segment", (req, res) => {
  const segmentPath = path.join(segmentsDir, req.params.segment);
  res.sendFile(segmentPath);
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
console.log("Playlist actualizada:", currentSegments);
