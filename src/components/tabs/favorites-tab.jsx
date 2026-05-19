import { useEffect, useMemo } from "react";
import { assetUrl, rarityClassName } from "../../utils";
import { FavoriteButton } from "../ui/favorite-button";

export function FavoritesTab({
  familiarData,
  selectedKey,
  setSelectedKey,
  favoriteKeys,
  onToggleFavorite,
}) {
  const favoriteNodes = useMemo(
    () =>
      [...favoriteKeys]
        .reverse()
        .map((key) => familiarData.nodeIndex[key])
        .filter(Boolean),
    [favoriteKeys, familiarData.nodeIndex],
  );
  const selectedNode =
    favoriteNodes.find((node) => node.nodeKey === selectedKey) ||
    favoriteNodes[0] ||
    null;

  useEffect(() => {
    if (
      favoriteNodes.length &&
      !favoriteNodes.some((node) => node.nodeKey === selectedKey)
    ) {
      setSelectedKey(favoriteNodes[0].nodeKey);
    }
  }, [favoriteNodes, selectedKey, setSelectedKey]);

  return (
    <section className="workspace">
      <aside className="panel-sidebar">
        <div className="panel-header">
          <h2>Favorites</h2>
          <span>{favoriteNodes.length}</span>
        </div>
        {favoriteNodes.length ? (
          <div className="node-list">
            {favoriteNodes.map((node) => (
              <button
                key={node.nodeKey}
                className={`node-row ${node.imagePath ? "has-icon" : "no-icon"} ${rarityClassName(node.rarity)} ${selectedNode?.nodeKey === node.nodeKey ? "active" : ""
                  }`}
                onClick={() => setSelectedKey(node.nodeKey)}
                type="button"
              >
                {node.imagePath ? (
                  <img
                    className="thumb small"
                    src={assetUrl(node.imagePath)}
                    alt={node.name}
                  />
                ) : null}
                <span>
                  <strong>{node.name}</strong>
                  <small>
                    {[node.rarity, node.subgroup || node.locationText]
                      .filter(Boolean)
                      .join(" / ")}
                  </small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No favorites yet. Save a familiar from the detail view.
          </p>
        )}
      </aside>

      <section className="detail-stack">
        {selectedNode ? (
          <article className="panel detail-card">
            <div
              className={`detail-top ${selectedNode.imagePath ? "has-image" : "no-image"}`}
            >
              {selectedNode.imagePath ? (
                <img
                  className="detail-image"
                  src={assetUrl(selectedNode.imagePath)}
                  alt={selectedNode.name}
                />
              ) : null}
              <div>
                <p className="eyebrow">
                  {selectedNode.type === "fusion"
                    ? "Fusion Familiar"
                    : "Base Familiar"}
                </p>
                <h2>{selectedNode.name}</h2>
                <FavoriteButton
                  active={favoriteKeys.includes(selectedNode.nodeKey)}
                  onToggle={() => onToggleFavorite(selectedNode.nodeKey)}
                />
                <p className="summary-line">
                  {selectedNode.rarity}
                  {selectedNode.role ? ` / ${selectedNode.role}` : ""}
                  {selectedNode.collection
                    ? ` / ${selectedNode.collection}`
                    : ""}
                  {selectedNode.subgroup ? ` / ${selectedNode.subgroup}` : ""}
                </p>
                {selectedNode.locationText ? (
                  <p className="summary-note">
                    Found in {selectedNode.locationText}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ) : null}
      </section>
    </section>
  );
}
