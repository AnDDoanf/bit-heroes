import { assetUrl, rarityClassName } from "../../utils";
import { RequirementBadge } from "./requirement-badge";
import { PanelButton } from "./panel-button";

export function TreeNode({
  nodeKey,
  nodeIndex,
  materialIndex,
  ownedCounts = {},
  onSetOwnedCount,
  level = 0,
  trail = new Set(),
  quantity = "",
}) {
  const node = nodeIndex[nodeKey];
  if (!node) return null;
  const ownedCount = ownedCounts[node.nodeKey] || 0;
  const requiredCount = Number.parseInt(String(quantity || ""), 10);
  const hasRequiredCount =
    Number.isFinite(requiredCount) && requiredCount > 0;

  function handleOwnedChange(value) {
    if (!onSetOwnedCount) return;

    const parsed = Number.parseInt(String(value || ""), 10);
    onSetOwnedCount(node.nodeKey, Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
  }

  function adjustOwnedCount(delta) {
    if (!onSetOwnedCount) return;
    onSetOwnedCount(node.nodeKey, Math.max(0, ownedCount + delta));
  }

  const nextTrail = new Set(trail);
  const repeated = nextTrail.has(nodeKey);
  nextTrail.add(nodeKey);

  return (
    <div className="tree-node" style={{ marginLeft: level * 18 }}>
      <div className={`tree-card ${rarityClassName(node.rarity)}`}>
        <div className="tree-title-row">
          {node.imagePath ? (
            <img
              className="thumb small"
              src={assetUrl(node.imagePath)}
              alt={node.name}
            />
          ) : null}
          <div className="tree-copy">
            <div className="tree-name">
              {quantity ? `${quantity}x ${node.name}` : node.name}
            </div>
            <div className="tree-meta">
              {node.type === "fusion" && node.subgroup ? node.subgroup : ""}
              {node.type === "familiar" && node.locationText
                ? node.locationText
                : ""}
            </div>
          </div>
        </div>
        <div className="tree-owned-row">
          <div className="tree-owned-copy">
            <span>Owned</span>
            {hasRequiredCount ? (
              <strong>
                {ownedCount >= requiredCount
                  ? "Ready"
                  : `${requiredCount - ownedCount} short`}
              </strong>
            ) : (
              <strong>Tracked</strong>
            )}
          </div>
          <div className="tree-owned-controls">
            <PanelButton
              aria-label={`Decrease owned count for ${node.name}`}
              className="count-stepper tree-count-stepper"
              disabled={ownedCount === 0}
              onClick={() => adjustOwnedCount(-1)}
            >
              -
            </PanelButton>
            <label className="tree-owned-field">
              <span className="sr-only">Owned count for {node.name}</span>
              <input
                aria-label={`Owned count for ${node.name}`}
                inputMode="numeric"
                min="0"
                onChange={(event) => handleOwnedChange(event.target.value)}
                type="number"
                value={ownedCount}
              />
            </label>
            <PanelButton
              aria-label={`Increase owned count for ${node.name}`}
              className="count-stepper tree-count-stepper"
              onClick={() => adjustOwnedCount(1)}
            >
              +
            </PanelButton>
          </div>
        </div>
      </div>
      {!repeated && node.requirements?.length ? (
        <div className="tree-children">
          {node.requirements.map((requirement) => {
            if (
              requirement.type === "familiar" ||
              requirement.type === "fusion"
            ) {
              return (
                <TreeNode
                  key={`${nodeKey}-${requirement.nodeKey}-${requirement.quantity}`}
                  nodeKey={requirement.nodeKey}
                  nodeIndex={nodeIndex}
                  materialIndex={materialIndex}
                  ownedCounts={ownedCounts}
                  onSetOwnedCount={onSetOwnedCount}
                  level={level + 1}
                  trail={nextTrail}
                  quantity={requirement.quantity}
                />
              );
            }

            return (
              <div
                key={`${nodeKey}-${requirement.type}-${requirement.slug}-${requirement.quantity}`}
                style={{ marginLeft: (level + 1) * 18 }}
              >
                <RequirementBadge
                  requirement={requirement}
                  materialIndex={materialIndex}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
