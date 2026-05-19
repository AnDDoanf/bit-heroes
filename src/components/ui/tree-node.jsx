import { assetUrl, rarityClassName } from "../../utils";
import { RequirementBadge } from "./requirement-badge";

export function TreeNode({
  nodeKey,
  nodeIndex,
  materialIndex,
  level = 0,
  trail = new Set(),
  quantity = "",
}) {
  const node = nodeIndex[nodeKey];
  if (!node) return null;

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
