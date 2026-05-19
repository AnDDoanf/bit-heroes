export function PanelButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`panel-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
