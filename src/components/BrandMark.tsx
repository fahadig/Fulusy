/** Card-holder + multi-card + Middle East tap-to-pay brand mark */
export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <img
      className="logo"
      src="/icon.svg"
      width={size}
      height={size}
      alt="Fulusy — cards and tap to pay"
    />
  );
}
