import { assetUrl } from "../../utils";

export function RequirementBadge({ requirement, materialIndex }) {
  const material =
    requirement.type === "material" ? materialIndex?.[requirement.slug] : null;

  return (
    <div
      className={`tree-requirement ${requirement.type} ${material?.imagePath ? "has-icon" : "no-icon"}`}
    >
      {material?.imagePath ? (
        <img
          className="thumb small"
          src={assetUrl(material.imagePath)}
          alt={requirement.name}
        />
      ) : null}
      <div className="requirement-copy">
        <div className="requirement-title">
          {requirement.quantity}x {requirement.name}
        </div>
        <div className="requirement-meta">
          {requirement.type === "material"
            ? "Material"
            : requirement.type === "gold"
              ? "Gold cost"
              : "Requirement"}
        </div>
        {material?.sourceNotes?.length ? (
          <div className="tree-source">
            {material.sourceNotes.slice(0, 2).join(" / ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
