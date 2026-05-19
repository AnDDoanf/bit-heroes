export function RequirementPills({ requirements, materialIndex }) {
  if (!requirements?.length) return null;

  return (
    <div className="requirement-list">
      {requirements.map((requirement) => (
        <div
          key={`${requirement.type}-${requirement.slug}-${requirement.quantity}`}
          className={`requirement-pill ${requirement.type}`}
        >
          <div className="requirement-pill-title">
            {requirement.quantity}x {requirement.name}
          </div>
          {requirement.type === "material" &&
          materialIndex?.[requirement.slug]?.sourceNotes?.length ? (
            <div className="requirement-pill-source">
              {materialIndex[requirement.slug].sourceNotes
                .slice(0, 2)
                .join(" / ")}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
