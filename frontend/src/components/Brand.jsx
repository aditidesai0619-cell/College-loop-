// Official College Loop logo (cropped/resized from brand_assests/loopppp.png — artwork unchanged)
export default function Brand({ size = 36, showName = true, className = '' }) {
  return (
    <span className={`brand-lockup ${className}`}>
      <img
        className="brand-logo"
        src="/brand/college-loop-logo-96.png"
        srcSet="/brand/college-loop-logo-48.png 48w, /brand/college-loop-logo-96.png 96w, /brand/college-loop-logo-192.png 192w, /brand/college-loop-logo-512.png 512w"
        sizes={`${size}px`}
        width={size}
        height={size}
        alt={showName ? '' : 'College Loop'}
      />
      {showName && <span className="brand-name">College <em>Loop</em></span>}
    </span>
  );
}
