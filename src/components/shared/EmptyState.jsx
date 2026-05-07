import React from "react";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4">
          <Icon size={48} style={{ color: "#E8DFD4" }} />
        </div>
      )}

      <h3
        className="text-lg font-medium mb-1"
        style={{ color: "#3D3227", fontFamily: "Georgia, serif" }}
      >
        {title}
      </h3>

      {description && (
        <p className="text-sm mb-6 max-w-sm" style={{ color: "#8C7B6B" }}>
          {description}
        </p>
      )}

      {/* action can be a JSX element or an {href,label}/{onClick,label} object */}
      {action && (React.isValidElement(action) ? action : null)}
    </div>
  );
}
