-- ALICE Codec Cloud: Domain-specific tables
CREATE TABLE IF NOT EXISTS encode_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL DEFAULT 'alice-wv',
    width INTEGER NOT NULL DEFAULT 1920,
    height INTEGER NOT NULL DEFAULT 1080,
    fps INTEGER NOT NULL DEFAULT 30,
    quality SMALLINT NOT NULL DEFAULT 80 CHECK (quality BETWEEN 1 AND 100),
    original_size_bytes BIGINT NOT NULL DEFAULT 0,
    encoded_size_bytes BIGINT NOT NULL DEFAULT 0,
    compression_ratio DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    psnr_db DOUBLE PRECISION,
    ssim DOUBLE PRECISION,
    wavelet_type TEXT NOT NULL DEFAULT 'CDF 9/7',
    entropy_coder TEXT NOT NULL DEFAULT 'rANS',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'encoding', 'completed', 'failed')),
    elapsed_us BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transcode_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    input_size_bytes BIGINT NOT NULL DEFAULT 0,
    output_size_bytes BIGINT NOT NULL DEFAULT 0,
    quality_score DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'transcoding', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_encode_jobs_user ON encode_jobs(user_id, created_at);
CREATE INDEX idx_transcode_jobs_user ON transcode_jobs(user_id, created_at);
