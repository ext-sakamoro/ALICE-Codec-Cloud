use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_encodes: u64, total_decodes: u64, total_analyses: u64, bytes_processed: u64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct EncodeRequest { input_format: Option<String>, output_format: Option<String>, width: Option<u32>, height: Option<u32>, fps: Option<u32>, quality: Option<u8>, duration_secs: Option<f64> }
#[derive(Serialize)]
struct EncodeResponse { job_id: String, status: String, input_format: String, output_format: String, resolution: String, original_size_bytes: u64, encoded_size_bytes: u64, compression_ratio: f64, bitrate_kbps: u32, psnr_db: f64, elapsed_us: u128 }

#[derive(Deserialize)]
struct DecodeRequest { format: Option<String>, output_format: Option<String> }
#[derive(Serialize)]
struct DecodeResponse { job_id: String, status: String, output_format: String, frames_decoded: u64, elapsed_us: u128 }

#[derive(Deserialize)]
struct TranscodeRequest { input_format: Option<String>, output_format: String, quality: Option<u8>, target_bitrate_kbps: Option<u32> }
#[derive(Serialize)]
struct TranscodeResponse { job_id: String, status: String, input_format: String, output_format: String, input_size_bytes: u64, output_size_bytes: u64, quality_score: f64, elapsed_us: u128 }

#[derive(Deserialize)]
struct AnalyzeRequest { format: Option<String>, duration_secs: Option<f64> }
#[derive(Serialize)]
struct AnalyzeResponse { format: String, width: u32, height: u32, fps: f64, bitrate_kbps: u32, duration_secs: f64, codec: String, wavelet_type: String, entropy_coder: String, psnr_db: f64, ssim: f64 }

#[derive(Serialize)]
struct CodecInfo { name: String, description: String, wavelet: String, entropy: String, typical_ratio: String, best_for: String }
#[derive(Serialize)]
struct StatsResponse { total_encodes: u64, total_decodes: u64, total_analyses: u64, bytes_processed: u64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "codec_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_encodes: 0, total_decodes: 0, total_analyses: 0, bytes_processed: 0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/codec/encode", post(encode))
        .route("/api/v1/codec/decode", post(decode))
        .route("/api/v1/codec/transcode", post(transcode))
        .route("/api/v1/codec/analyze", post(analyze))
        .route("/api/v1/codec/codecs", get(codecs))
        .route("/api/v1/codec/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("CODEC_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Codec Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_encodes + st.total_decodes + st.total_analyses })
}

async fn encode(State(s): State<Arc<AppState>>, Json(req): Json<EncodeRequest>) -> Json<EncodeResponse> {
    let t = Instant::now();
    let w = req.width.unwrap_or(1920); let h = req.height.unwrap_or(1080);
    let fps = req.fps.unwrap_or(30); let quality = req.quality.unwrap_or(80);
    let dur = req.duration_secs.unwrap_or(10.0);
    let in_fmt = req.input_format.unwrap_or_else(|| "raw".into());
    let out_fmt = req.output_format.unwrap_or_else(|| "alice-wv".into());
    let raw_size = (w as u64) * (h as u64) * 3 * (fps as u64) * (dur as u64);
    let ratio = 20.0 + (quality as f64 - 50.0).abs() * 0.3;
    let enc_size = (raw_size as f64 / ratio) as u64;
    let bitrate = if dur > 0.0 { (enc_size as f64 * 8.0 / dur / 1000.0) as u32 } else { 0 };
    let psnr = 30.0 + quality as f64 * 0.15;
    { let mut st = s.stats.lock().unwrap(); st.total_encodes += 1; st.bytes_processed += raw_size; }
    Json(EncodeResponse { job_id: uuid::Uuid::new_v4().to_string(), status: "completed".into(), input_format: in_fmt, output_format: out_fmt, resolution: format!("{}x{}", w, h), original_size_bytes: raw_size, encoded_size_bytes: enc_size, compression_ratio: ratio, bitrate_kbps: bitrate, psnr_db: psnr, elapsed_us: t.elapsed().as_micros() })
}

async fn decode(State(s): State<Arc<AppState>>, Json(req): Json<DecodeRequest>) -> Json<DecodeResponse> {
    let t = Instant::now();
    let out = req.output_format.unwrap_or_else(|| "raw".into());
    s.stats.lock().unwrap().total_decodes += 1;
    Json(DecodeResponse { job_id: uuid::Uuid::new_v4().to_string(), status: "completed".into(), output_format: out, frames_decoded: 300, elapsed_us: t.elapsed().as_micros() })
}

async fn transcode(State(s): State<Arc<AppState>>, Json(req): Json<TranscodeRequest>) -> Json<TranscodeResponse> {
    let t = Instant::now();
    let in_fmt = req.input_format.unwrap_or_else(|| "h264".into());
    let quality = req.quality.unwrap_or(80) as f64;
    let in_size: u64 = 50_000_000; let out_size = (in_size as f64 * (100.0 - quality * 0.5) / 100.0) as u64;
    { let mut st = s.stats.lock().unwrap(); st.total_encodes += 1; st.bytes_processed += in_size; }
    Json(TranscodeResponse { job_id: uuid::Uuid::new_v4().to_string(), status: "completed".into(), input_format: in_fmt, output_format: req.output_format, input_size_bytes: in_size, output_size_bytes: out_size, quality_score: quality / 100.0, elapsed_us: t.elapsed().as_micros() })
}

async fn analyze(State(s): State<Arc<AppState>>, Json(req): Json<AnalyzeRequest>) -> Json<AnalyzeResponse> {
    let fmt = req.format.unwrap_or_else(|| "alice-wv".into());
    let dur = req.duration_secs.unwrap_or(10.0);
    s.stats.lock().unwrap().total_analyses += 1;
    Json(AnalyzeResponse { format: fmt, width: 1920, height: 1080, fps: 30.0, bitrate_kbps: 5000, duration_secs: dur, codec: "3D-Wavelet-rANS".into(), wavelet_type: "CDF 9/7".into(), entropy_coder: "rANS".into(), psnr_db: 42.5, ssim: 0.97 })
}

async fn codecs() -> Json<Vec<CodecInfo>> {
    Json(vec![
        CodecInfo { name: "alice-wv".into(), description: "3D Wavelet + rANS entropy coding".into(), wavelet: "CDF 9/7".into(), entropy: "rANS".into(), typical_ratio: "20-50x".into(), best_for: "High quality video, streaming".into() },
        CodecInfo { name: "alice-wv-fast".into(), description: "Fast wavelet with Haar basis".into(), wavelet: "Haar".into(), entropy: "rANS".into(), typical_ratio: "10-30x".into(), best_for: "Real-time encoding, low latency".into() },
        CodecInfo { name: "alice-wv-hq".into(), description: "High quality with Daubechies wavelet".into(), wavelet: "Daubechies D8".into(), entropy: "rANS".into(), typical_ratio: "15-40x".into(), best_for: "Archival, broadcast quality".into() },
    ])
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    Json(StatsResponse { total_encodes: st.total_encodes, total_decodes: st.total_decodes, total_analyses: st.total_analyses, bytes_processed: st.bytes_processed })
}
