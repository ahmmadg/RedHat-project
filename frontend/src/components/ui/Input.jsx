import { useState } from "react";
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from "./Icons";

export default function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  minLength,
  error = "",
  hint = "",
  icon = null,
  disabled = false,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const hasIconClass = icon ? "has-icon" : "";
  const hasActionClass = isPassword ? "has-action" : "";

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label">
          <span>
            {label} {required && <span style={{ color: "var(--color-primary)" }}>*</span>}
          </span>
        </label>
      )}

      <div className="form-input-wrapper">
        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          disabled={disabled}
          className={`form-input ${hasIconClass} ${hasActionClass}`.trim()}
          style={error ? { borderColor: "var(--status-exception)" } : undefined}
          {...props}
        />

        {icon && <span className="form-input-icon">{icon}</span>}

        {isPassword && (
          <button
            type="button"
            className="form-input-action"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="form-error-text" role="alert">
          <AlertCircleIcon size={14} />
          <span>{error}</span>
        </p>
      )}

      {hint && !error && <p className="form-hint">{hint}</p>}
    </div>
  );
}
