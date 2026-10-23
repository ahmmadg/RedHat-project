export default function Badge({
  variant = "delivered",
  dot = true,
  children,
  className = "",
  ...props
}) {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...props}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
}
