export default function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  interactive = false,
  className = "",
  ...props
}) {
  const interactiveClass = interactive ? "card-interactive" : "";

  return (
    <div className={`card ${interactiveClass} ${className}`.trim()} {...props}>
      {(title || subtitle || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
