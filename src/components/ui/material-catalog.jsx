import { assetUrl, rarityClassName } from "../../utils";

export function MaterialCatalog({ materials }) {
  return (
    <div className="material-grid">
      {materials.map((material) => (
        <article
          key={material.slug}
          className={`material-card ${rarityClassName(material.rarity)}`}
        >
          <div className="material-top">
            {material.imagePath ? (
              <img
                className="thumb"
                src={assetUrl(material.imagePath)}
                alt={material.name}
              />
            ) : null}
            <div>
              <h3>{material.name}</h3>
              <p>
                {[material.rarity, material.tier || material.group]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
            </div>
          </div>
          <ul>
            {material.sourceNotes.slice(0, 3).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
