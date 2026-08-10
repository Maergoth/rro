import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const EXPECTED_GROUND_ANGLE_DEGREES = 26.56505117707799;

export const CAMERA_GEOMETRY_CONTRACT = Object.freeze({
  schemaVersion: 1,
  algorithm: "rgba-sobel-orientation-constrained-hough-v1",
  requiredDirections: Object.freeze(["north", "east", "south", "west"]),
  expectedGroundSlopes: Object.freeze([-0.5, 0.5]),
  expectedGroundAnglesDegrees: Object.freeze([-EXPECTED_GROUND_ANGLE_DEGREES, EXPECTED_GROUND_ANGLE_DEGREES]),
  groundAngleToleranceDegrees: 1.25,
  groundSlopeTolerance: 0.03,
  expectedVerticalAngleDegrees: 90,
  verticalAngleToleranceDegrees: 1.25,
  scanStepDegrees: 0.5,
  edgeOrientationToleranceDegrees: 2.5,
  strongEdgePercentile: 0.82,
  minimumEdgeMagnitude: 100,
  minimumDominantLineScore: 8,
});

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  return leftDistance <= upDistance && leftDistance <= upperLeftDistance
    ? left
    : upDistance <= upperLeftDistance ? up : upperLeft;
}

export function decodeRgbaPng(path) {
  const data = readFileSync(path);
  if (!data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`${path}: invalid PNG signature`);
  }
  let offset = 8;
  let header = null;
  const compressed = [];
  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    const payload = data.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      header = {
        width: payload.readUInt32BE(0),
        height: payload.readUInt32BE(4),
        bitDepth: payload[8],
        colorType: payload[9],
        interlace: payload[12],
      };
    }
    if (type === "IDAT") compressed.push(payload);
    offset += length + 12;
    if (type === "IEND") break;
  }
  if (!header || header.bitDepth !== 8 || header.colorType !== 6 || header.interlace !== 0) {
    throw new Error(`${path}: camera geometry requires a non-interlaced 8-bit RGBA PNG`);
  }
  const scanlines = inflateSync(Buffer.concat(compressed));
  const stride = header.width * 4;
  const rgba = Buffer.alloc(stride * header.height);
  for (let y = 0; y < header.height; y += 1) {
    const input = y * (stride + 1);
    const filter = scanlines[input];
    if (filter < 0 || filter > 4) throw new Error(`${path}: unsupported PNG filter ${filter}`);
    for (let x = 0; x < stride; x += 1) {
      const index = y * stride + x;
      const left = x >= 4 ? rgba[index - 4] : 0;
      const up = y > 0 ? rgba[index - stride] : 0;
      const upperLeft = y > 0 && x >= 4 ? rgba[index - stride - 4] : 0;
      const predictor = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? up
            : filter === 3 ? Math.floor((left + up) / 2)
              : paeth(left, up, upperLeft);
      rgba[index] = (scanlines[input + 1 + x] + predictor) & 255;
    }
  }
  return { ...header, rgba };
}

function angularDistance(a, b) {
  const distance = Math.abs(a - b) % 180;
  return Math.min(distance, 180 - distance);
}

function rounded(value, digits = 6) {
  return Number(value.toFixed(digits));
}

function slopeForAngle(angle) {
  return Math.tan(angle * Math.PI / 180);
}

export function cameraGeometryReasons(dominantLines) {
  const reasons = [];
  const { positiveGround, negativeGround, vertical } = dominantLines;
  const contract = CAMERA_GEOMETRY_CONTRACT;
  if (Math.abs(positiveGround.angleDegrees - contract.expectedGroundAnglesDegrees[1]) > contract.groundAngleToleranceDegrees
      || Math.abs(positiveGround.slope - contract.expectedGroundSlopes[1]) > contract.groundSlopeTolerance) {
    reasons.push(`positive ground axis ${positiveGround.angleDegrees.toFixed(1)}° / slope ${positiveGround.slope.toFixed(3)} is outside +${contract.expectedGroundAnglesDegrees[1].toFixed(3)}° / +0.500 tolerance`);
  }
  if (Math.abs(negativeGround.angleDegrees - contract.expectedGroundAnglesDegrees[0]) > contract.groundAngleToleranceDegrees
      || Math.abs(negativeGround.slope - contract.expectedGroundSlopes[0]) > contract.groundSlopeTolerance) {
    reasons.push(`negative ground axis ${negativeGround.angleDegrees.toFixed(1)}° / slope ${negativeGround.slope.toFixed(3)} is outside ${contract.expectedGroundAnglesDegrees[0].toFixed(3)}° / -0.500 tolerance`);
  }
  if (Math.abs(vertical.angleDegrees - contract.expectedVerticalAngleDegrees) > contract.verticalAngleToleranceDegrees) {
    reasons.push(`dominant upright ${vertical.angleDegrees.toFixed(1)}° is outside screen-vertical tolerance`);
  }
  for (const [label, line] of Object.entries({ positiveGround, negativeGround, vertical })) {
    if (line.score < contract.minimumDominantLineScore) reasons.push(`${label} line support ${line.score.toFixed(2)} is below ${contract.minimumDominantLineScore}`);
  }
  return reasons;
}

export function measureCameraGeometry(path) {
  const { width, height, rgba } = decodeRgbaPng(path);
  const gray = new Float32Array(width * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const alpha = rgba[pixel * 4 + 3] / 255;
    const luminance = rgba[pixel * 4] * 0.2126 + rgba[pixel * 4 + 1] * 0.7152 + rgba[pixel * 4 + 2] * 0.0722;
    gray[pixel] = luminance * alpha;
  }

  const edges = [];
  const magnitudes = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const gradientX = -gray[index - width - 1] + gray[index - width + 1]
        - 2 * gray[index - 1] + 2 * gray[index + 1]
        - gray[index + width - 1] + gray[index + width + 1];
      const gradientY = -gray[index - width - 1] - 2 * gray[index - width] - gray[index - width + 1]
        + gray[index + width - 1] + 2 * gray[index + width] + gray[index + width + 1];
      const magnitude = Math.hypot(gradientX, gradientY);
      if (magnitude < 40) continue;
      let tangent = Math.atan2(gradientY, gradientX) * 180 / Math.PI + 90;
      while (tangent >= 90) tangent -= 180;
      while (tangent < -90) tangent += 180;
      edges.push({ x, y, tangent, magnitude });
      magnitudes.push(magnitude);
    }
  }
  magnitudes.sort((a, b) => a - b);
  const percentileIndex = Math.min(magnitudes.length - 1, Math.floor(magnitudes.length * CAMERA_GEOMETRY_CONTRACT.strongEdgePercentile));
  const strongThreshold = Math.max(CAMERA_GEOMETRY_CONTRACT.minimumEdgeMagnitude, magnitudes[percentileIndex] ?? CAMERA_GEOMETRY_CONTRACT.minimumEdgeMagnitude);
  const strongEdges = edges.filter((edge) => edge.magnitude >= strongThreshold);

  const scoreAngle = (angleDegrees) => {
    const radians = angleDegrees * Math.PI / 180;
    const normalX = -Math.sin(radians);
    const normalY = Math.cos(radians);
    const rhoBins = new Map();
    for (const edge of strongEdges) {
      if (angularDistance(edge.tangent, angleDegrees) > CAMERA_GEOMETRY_CONTRACT.edgeOrientationToleranceDegrees) continue;
      const rho = Math.round(edge.x * normalX + edge.y * normalY);
      rhoBins.set(rho, (rhoBins.get(rho) ?? 0) + Math.min(edge.magnitude, 800) / 800);
    }
    const supports = [...rhoBins.values()].sort((a, b) => b - a);
    return {
      angleDegrees,
      slope: slopeForAngle(angleDegrees),
      score: (supports[0] ?? 0) + (supports[1] ?? 0) * 0.75 + (supports[2] ?? 0) * 0.5,
      strongestParallelLineSupports: supports.slice(0, 3),
    };
  };

  const candidates = [];
  for (let angle = -60; angle <= 60; angle += CAMERA_GEOMETRY_CONTRACT.scanStepDegrees) {
    if (Math.abs(angle) >= 5) candidates.push(scoreAngle(angle));
  }
  for (let angle = 75; angle < 90; angle += CAMERA_GEOMETRY_CONTRACT.scanStepDegrees) candidates.push(scoreAngle(angle));
  const strongest = (predicate) => candidates.filter(predicate).sort((a, b) => b.score - a.score)[0];
  const simplify = (line, vertical = false) => ({
    angleDegrees: rounded(vertical ? Math.abs(line.angleDegrees) : line.angleDegrees, 3),
    ...(vertical ? {} : { slope: rounded(line.slope) }),
    score: rounded(line.score, 3),
    strongestParallelLineSupports: line.strongestParallelLineSupports.map((support) => rounded(support, 3)),
  });
  const measurement = {
    path,
    dimensions: [width, height],
    algorithm: CAMERA_GEOMETRY_CONTRACT.algorithm,
    strongEdgeThreshold: rounded(strongThreshold, 3),
    strongEdgePixels: strongEdges.length,
    dominantLines: {
      positiveGround: simplify(strongest((candidate) => candidate.angleDegrees > 0 && candidate.angleDegrees < 70)),
      negativeGround: simplify(strongest((candidate) => candidate.angleDegrees < 0 && candidate.angleDegrees > -70)),
      vertical: simplify(strongest((candidate) => candidate.angleDegrees >= 75), true),
    },
  };
  measurement.reasons = cameraGeometryReasons(measurement.dominantLines);
  measurement.passed = measurement.reasons.length === 0;
  return measurement;
}

export function auditDirectionalAsset(assetId, directions) {
  const measurements = Object.fromEntries(CAMERA_GEOMETRY_CONTRACT.requiredDirections.map((direction) => {
    const path = directions[direction];
    if (!path) throw new Error(`${assetId}: missing ${direction} camera-geometry source path`);
    return [direction, measureCameraGeometry(path)];
  }));
  const failedDirections = Object.entries(measurements).filter(([, measurement]) => !measurement.passed).map(([direction]) => direction);
  return {
    assetId,
    status: failedDirections.length === 0 ? "passed-measured-camera-geometry" : "failed-measured-camera-geometry",
    passed: failedDirections.length === 0,
    failedDirections,
    measurements,
  };
}
