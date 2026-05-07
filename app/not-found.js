import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#FAF6F1" }}
    >
      <div className="text-center max-w-md">
        <h1
          className="text-7xl font-bold mb-4"
          style={{ color: "#1B4332", fontFamily: "Newsreader, serif" }}
        >
          404
        </h1>
        <h2 className="text-xl font-medium mb-2" style={{ color: "#3D3227" }}>
          Page Not Found
        </h2>
        <p className="text-sm mb-8" style={{ color: "#8C7B6B" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-md"
          style={{ background: "#1B4332" }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
