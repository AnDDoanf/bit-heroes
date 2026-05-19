import { assetUrl } from "../../utils";

export function PetDetail({ pet }) {
  if (!pet) return null;

  return (
    <article className="panel detail-card">
      <div className={`detail-top ${pet.imagePath ? "has-image" : "no-image"}`}>
        {pet.imagePath ? (
          <img
            className="detail-image"
            src={assetUrl(pet.imagePath)}
            alt={pet.name}
          />
        ) : null}
        <div>
          <p className="eyebrow">Pet</p>
          <h2>{pet.name}</h2>
          <p className="summary-line">
            {pet.rarity}
            {pet.category ? ` / ${pet.category.replace(/_/g, " ")}` : ""}
            {pet.subgroup && pet.subgroup !== "event"
              ? ` / ${pet.subgroup}`
              : ""}
          </p>
          <p className="summary-note">{pet.description}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div>
          <span>Upgrade</span>
          <strong>{pet.upgrade || "-"}</strong>
        </div>
        <div>
          <span>Power</span>
          <strong>{pet.power || "-"}</strong>
        </div>
        <div>
          <span>Avg</span>
          <strong>{pet.avg || "-"}</strong>
        </div>
        <div>
          <span>Source</span>
          <strong>{pet.source || "-"}</strong>
        </div>
      </div>

      <div className="ability-grid">
        <div>
          <span>Reforge</span>
          <strong>{pet.canReforge ? "Available" : "Unavailable"}</strong>
        </div>
        <div>
          <span>Exclusive</span>
          <strong>{pet.isExclusive ? "Event only" : "Standard pool"}</strong>
        </div>
        <div>
          <span>Section</span>
          <strong>{pet.category.replace(/_/g, " ")}</strong>
        </div>
        <div>
          <span>Listing</span>
          <strong>{pet.imageLabel.replace(/^Pet\s+/i, "")}</strong>
        </div>
      </div>
    </article>
  );
}
