#!/usr/bin/env python3
"""Validate and byte-reproduce the accepted idle/classic character batch."""

from argparse import ArgumentParser
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage


ROOT = Path(__file__).resolve().parent.parent
CANVAS = (384, 512)
PIVOT = (192, 472)
BODIES = ('base-a', 'base-b')
DIRECTIONS = ('north', 'north_east', 'east', 'south_east', 'south', 'south_west', 'west', 'north_west')
QA_RELATIVE = Path('planning/art-qa/character-remediation-idle-classic-v1')
ZERO_TOTALS = (
    'maskOverlapPixels',
    'diffuseMaskUnionMismatchPixels',
    'uncoveredRearLegPixels',
    'garmentPixelsOnProtectedFace',
    'garmentPixelsOnProtectedHands',
    'garmentPixelsOnProtectedFeetFromEdit',
    'garmentPixelsOnProtectedScalp',
    'garmentPixelsOnProtectedFeet',
)


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def load_runtime_png(path):
    raw = path.read_bytes()
    if raw[:8] != b'\x89PNG\r\n\x1a\n' or raw[24] != 8 or raw[25] != 6:
        raise ValueError(f'{path}: expected 8-bit RGBA PNG')
    image = Image.open(path)
    image.load()
    if image.size != CANVAS or image.mode != 'RGBA':
        raise ValueError(f'{path}: expected {CANVAS} RGBA, got {image.size} {image.mode}')
    return np.array(image)


def body_anchor(data):
    alpha = data[:, :, 3].astype(np.float64)
    yy, xx = np.indices(alpha.shape)
    y, _x = np.where(alpha > 20)
    top, bottom = int(y.min()), int(y.max())
    band = (alpha > 20) & (yy >= bottom - max(6, round((bottom - top + 1) * .04)))
    weight = np.where(band, alpha, 0.)
    return float((xx * weight).sum() / weight.sum()), bottom


def green_edge_pixels(data):
    mask = data[:, :, 3] > 0
    eroded = mask.copy()
    for _ in range(4):
        eroded = ndimage.binary_erosion(eroded, np.ones((3, 3)), border_value=0)
    rgb = data[:, :, :3].astype(np.int16)
    return int(((mask & ~eroded) & ((rgb[:, :, 1] - np.maximum(rgb[:, :, 0], rgb[:, :, 2])) >= 4)).sum())


def runtime_relatives():
    paths = []
    for body in BODIES:
        for direction in DIRECTIONS:
            paths.extend((
                Path(f'apps/client-godot/assets/characters/body/{body}/idle/{direction}.png'),
                Path(f'apps/client-godot/assets/characters/body/{body}/idle/skin-diffuse/{direction}.png'),
                Path(f'apps/client-godot/assets/characters/body/{body}/idle/skin-mask/{direction}.png'),
                Path(f'apps/client-godot/assets/characters/outfits/classic/{body}/idle/diffuse/{direction}.png'),
                Path(f'apps/client-godot/assets/characters/outfits/classic/{body}/idle/primary-mask/{direction}.png'),
                Path(f'apps/client-godot/assets/characters/outfits/classic/{body}/idle/secondary-mask/{direction}.png'),
            ))
    return paths


def verify_recorded_hashes(repo, records):
    for record in records:
        path = repo / record['path']
        if not path.is_file() or digest(path) != record['sha256']:
            raise ValueError(f'recorded hash mismatch: {record["path"]}')


def compare_files(repo, reproduced, relatives):
    for relative in relatives:
        accepted = repo / relative
        candidate = reproduced / relative
        if not candidate.is_file() or accepted.read_bytes() != candidate.read_bytes():
            raise ValueError(f'byte reproduction mismatch: {relative}')


def reproduce(repo):
    body_runtime = [path for path in runtime_relatives() if '/body/' in f'/{path.as_posix()}']
    classic_runtime = [path for path in runtime_relatives() if '/outfits/classic/' in f'/{path.as_posix()}']
    with tempfile.TemporaryDirectory(prefix='rro-character-remediation-check-') as temp:
        temp_root = Path(temp)
        body_root = temp_root / 'body'
        classic_root = temp_root / 'classic'
        subprocess.run((sys.executable, str(repo / 'tools/normalize-character-idle-v1.py'), '--repo-root', str(repo), '--output-root', str(body_root)), check=True, capture_output=True, text=True)
        subprocess.run((sys.executable, str(repo / 'tools/process-character-classic-edited-v1.py'), '--repo-root', str(repo), '--body-root', str(body_root / 'apps/client-godot/assets/characters'), '--output-root', str(classic_root)), check=True, capture_output=True, text=True)
        compare_files(repo, body_root, body_runtime + [QA_RELATIVE / 'normalized-bodies-full.png'])
        compare_files(repo, classic_root, classic_runtime + [QA_RELATIVE / 'classic-composites-full.png', QA_RELATIVE / 'classic-composites-gameplay.png'])
    return len(body_runtime) + len(classic_runtime) + 3


def main():
    parser = ArgumentParser()
    parser.add_argument('--repo-root')
    args = parser.parse_args()
    repo = Path(args.repo_root).resolve() if args.repo_root else ROOT
    runtime = runtime_relatives()
    hashes = []
    max_pivot_error = 0.
    green = skin_mismatch = mask_overlap = union_mismatch = 0
    for index in range(0, len(runtime), 6):
        group = runtime[index:index + 6]
        body, skin_diffuse, skin_mask, classic, primary, secondary = [load_runtime_png(repo / path) for path in group]
        hashes.extend(digest(repo / path) for path in group)
        x, y = body_anchor(body)
        max_pivot_error = max(max_pivot_error, abs(x - PIVOT[0]))
        if y != PIVOT[1]:
            raise ValueError(f'{group[0]}: body pivot Y {y}')
        green += green_edge_pixels(body)
        skin_mismatch += int((skin_diffuse[:, :, 3] != skin_mask[:, :, 3]).sum())
        mask_overlap += int(((primary[:, :, 3] > 0) & (secondary[:, :, 3] > 0)).sum())
        union_mismatch += int((classic[:, :, 3] != np.maximum(primary[:, :, 3], secondary[:, :, 3])).sum())
    if len(runtime) != 96 or len(set(hashes)) != 96:
        raise ValueError('expected 96 unique runtime PNGs')
    if max_pivot_error > .51 or green or skin_mismatch or mask_overlap or union_mismatch:
        raise ValueError('runtime raster gate failed')

    body_metrics = json.loads((repo / QA_RELATIVE / 'normalized-bodies-metrics.json').read_text())
    classic_metrics = json.loads((repo / QA_RELATIVE / 'classic-composites-metrics.json').read_text())
    verify_recorded_hashes(repo, body_metrics['outputs'])
    verify_recorded_hashes(repo, classic_metrics['sourcePreservation']['generatedSources'])
    verify_recorded_hashes(repo, classic_metrics['sourcePreservation']['bodyInputs'])
    verify_recorded_hashes(repo, classic_metrics['outputs'])
    for name in ZERO_TOTALS:
        if classic_metrics['totals'][name] != 0:
            raise ValueError(f'{name}: {classic_metrics["totals"][name]}')

    expected_qa = {
        'normalized-bodies-full.png': ((1616, 2278), 'RGB'),
        'classic-composites-full.png': ((1616, 2278), 'RGB'),
        'classic-composites-gameplay.png': ((1008, 322), 'RGB'),
    }
    for name, (size, mode) in expected_qa.items():
        image = Image.open(repo / QA_RELATIVE / name)
        image.load()
        if image.size != size or image.mode != mode:
            raise ValueError(f'{name}: invalid QA image')

    checksum_lines = (repo / QA_RELATIVE / 'SHA256SUMS.txt').read_text().splitlines()
    if len(checksum_lines) != 108:
        raise ValueError(f'expected 108 recorded checksums, got {len(checksum_lines)}')
    for line in checksum_lines:
        expected, relative = line.split('  ', 1)
        if digest(repo / relative) != expected:
            raise ValueError(f'batch checksum mismatch: {relative}')

    reproduced = reproduce(repo)
    result = {
        'ok': True,
        'batch': 'character-remediation-idle-classic-v1',
        'runtimePngs': len(runtime),
        'uniqueRuntimeHashes': len(set(hashes)),
        'byteReproducedFiles': reproduced,
        'recordedSha256Files': len(checksum_lines),
        'canvas': list(CANVAS),
        'groundContactPivot': list(PIVOT),
        'maximumPivotXError': max_pivot_error,
        'greenEdgePixels': green,
        'skinAlphaMismatchPixels': skin_mismatch,
        'classicMaskOverlapPixels': mask_overlap,
        'classicDiffuseUnionMismatchPixels': union_mismatch,
        'protectedFaceOverlapPixels': classic_metrics['totals']['garmentPixelsOnProtectedFace'],
        'protectedHandOverlapPixels': classic_metrics['totals']['garmentPixelsOnProtectedHands'],
        'protectedFootOverlapPixels': classic_metrics['totals']['garmentPixelsOnProtectedFeetFromEdit'],
        'rearLegLeakagePixels': classic_metrics['totals']['uncoveredRearLegPixels'],
    }
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
