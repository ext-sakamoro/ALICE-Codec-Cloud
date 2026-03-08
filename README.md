# ALICE-Codec-Cloud

Cloud-native codec service built on Project A.L.I.C.E. — hardware-native
3D Wavelet + rANS compression with CDF 9/7 and Haar wavelets, SIMD-accelerated
encode/decode/transcode, and PSNR/SSIM video quality analysis through a single REST API.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│          Landing Page  │  Dashboard Console         │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│                 Codec API (Rust / Axum)              │
│  /encode  /decode  /transcode  /analyze  /stats     │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              ALICE-Codec Engine (Rust)               │
│   Wavelet (CDF 9/7 + Haar)  │  rANS Entropy Coder  │
│   SIMD AVX2/NEON            │  Rayon Parallelism    │
└─────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| 3D Wavelet Transform | CDF 9/7 and Haar wavelets for spatial + temporal compression |
| rANS Entropy Coding | Range ANS for near-optimal bit-packing |
| Encode / Decode | Lossless and lossy modes with configurable quality |
| Transcode | Convert between H.264, VP9, AV1, and Wavelet-rANS |
| Video Analysis | PSNR and SSIM metrics computed per frame |
| SIMD Acceleration | AVX2 (8-wide) and NEON (4-wide) codepaths |
| Rayon Parallelism | Work-stealing parallelism across all codec operations |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/codec/encode` | Encode raw data with selected codec and quality |
| POST | `/api/v1/codec/decode` | Decode a previously encoded payload |
| POST | `/api/v1/codec/transcode` | Convert between codec formats |
| POST | `/api/v1/codec/analyze` | Compute PSNR / SSIM / bitrate metrics |
| GET | `/api/v1/codec/codecs` | List all supported codecs and their capabilities |
| GET | `/api/v1/codec/stats` | Service throughput and performance statistics |

## Quick Start

```bash
# Clone and start the backend
git clone https://github.com/ext-sakamoro/ALICE-Codec-Cloud
cd ALICE-Codec-Cloud
cargo build --release
./target/release/alice-codec-server

# In a separate terminal, start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Encode example

```bash
curl -X POST http://localhost:8081/api/v1/codec/encode \
  -H "Content-Type: application/json" \
  -d '{"data":"SGVsbG8gV29ybGQ=","codec":"wavelet_rans","quality":90}'
```

### Analyze example

```bash
curl -X POST http://localhost:8081/api/v1/codec/analyze \
  -H "Content-Type: application/json" \
  -d '{"data":"SGVsbG8gV29ybGQ=","metrics":["psnr","ssim","bitrate"]}'
```

## License

AGPL-3.0-or-later — see [LICENSE](./LICENSE)
