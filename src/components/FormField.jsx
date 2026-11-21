import "../styles/checkout.css";

// Label, hint and error message for one form control. The control itself is
// rendered by the caller through the children function, which receives the id
// and the aria attributes that tie the label, hint and error to the control.
export default function FormField({ id, label, hint, error, required = false, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field${error ? " field-invalid" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="field-required"> (required)</span> : <span className="field-optional"> (optional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {children({ id, "aria-invalid": error ? "true" : undefined, "aria-describedby": describedBy })}
      {error && (
        <p id={errorId} className="field-error">
          <strong>Problem:</strong> {error}
        </p>
      )}
    </div>
  );
}
