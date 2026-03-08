import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <span className="text-green-400 font-mono font-bold text-lg tracking-wide">
          ALICE-Codec-Cloud
        </span>
        <Link
          href="/dashboard/console"
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-semibold transition-colors"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <span className="text-green-400 font-mono text-sm uppercase tracking-widest mb-4">
          Project A.L.I.C.E.
        </span>
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          Next-Generation<br />
          <span className="text-green-400">Codec Cloud</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mb-10">
          Hardware-native 3D Wavelet + rANS codec with CDF 9/7 and Haar
          wavelets. Encode, decode, transcode and analyze video with
          PSNR/SSIM metrics — all through a single API.
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/console"
            className="px-7 py-3 bg-green-700 hover:bg-green-600 rounded-lg font-semibold text-lg transition-colors"
          >
            Open Console
          </Link>
          <a
            href="#features"
            className="px-7 py-3 border border-gray-700 hover:border-green-500 rounded-lg font-semibold text-lg text-gray-300 hover:text-white transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-14 text-green-300">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl p-7 border border-gray-700">
            <div className="text-green-400 text-3xl mb-4">🌊</div>
            <h3 className="text-xl font-bold mb-2">3D Wavelet + rANS</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              CDF 9/7 and Haar wavelet transforms combined with range
              Asymmetric Numeral Systems entropy coding for state-of-the-art
              compression ratios on both images and video.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-7 border border-gray-700">
            <div className="text-green-400 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Video Quality Analysis</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Compute PSNR and SSIM metrics in a single API call. Compare
              encoded output against reference frames and monitor bitrate
              efficiency across transcode operations.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-7 border border-gray-700">
            <div className="text-green-400 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">SIMD-Accelerated Transcode</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              AVX2 / NEON SIMD acceleration across encode, decode and
              transcode pipelines. Rayon-powered parallelism extracts full
              multi-core throughput from every request.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm py-8 border-t border-gray-800">
        ALICE-Codec-Cloud — Project A.L.I.C.E. &mdash; AGPL-3.0-or-later
      </footer>
    </div>
  );
}
