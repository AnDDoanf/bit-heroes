import { useState, useMemo, useEffect } from "react";
import {
  assetUrl,
  rarityClassName,
  sortNodes,
  collectLeafRequirements,
  formatLeafRequirements,
} from "../../utils";
import { FavoriteButton } from "../ui/favorite-button";
import { PanelButton } from "../ui/panel-button";
import { RequirementBadge } from "../ui/requirement-badge";
import { TreeNode } from "../ui/tree-node";
import { RequirementPills } from "../ui/requirement-pills";
import { SkillCards } from "../ui/skill-cards";

export function FamiliarTab({
  familiarData,
  materialData,
  query,
  setQuery,
  selectedKey,
  setSelectedKey,
  favoriteKeys,
  onToggleFavorite,
}) {
  const rarityOptions = useMemo(
    () =>
      [
        ...new Set(
          familiarData.nodes.map((node) => node.rarity).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [familiarData.nodes],
  );
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("stats");
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [fuseExpanded, setFuseExpanded] = useState(true);

  useEffect(() => {
    setInfoExpanded(true);
    setFuseExpanded(true);
  }, [selectedKey]);

  const filteredNodes = useMemo(() => {
    const search = query.trim().toLowerCase();

    const nodes = familiarData.nodes.filter((node) => {
      if (
        rarityFilter !== "all" &&
        node.rarity?.toLowerCase() !== rarityFilter
      ) {
        return false;
      }

      const haystack = [
        node.name,
        node.rarity,
        node.role,
        node.collection,
        node.subgroup,
        node.locationText,
        ...(node.components || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });

    return sortNodes(nodes, sortOrder);
  }, [familiarData.nodes, query, rarityFilter, sortOrder]);

  const selectedNode =
    familiarData.nodeIndex[selectedKey] ||
    filteredNodes[0] ||
    familiarData.nodes[0];
  const flattenedRequirements = useMemo(
    () =>
      selectedNode?.type === "fusion"
        ? collectLeafRequirements(selectedNode.nodeKey, familiarData.nodeIndex)
        : [],
    [selectedNode, familiarData.nodeIndex],
  );
  const fusionSummary = useMemo(
    () => formatLeafRequirements(selectedNode, familiarData.nodeIndex),
    [selectedNode, familiarData.nodeIndex],
  );

  useEffect(() => {
    if (!selectedNode) return;
    setSelectedKey(selectedNode.nodeKey);
  }, [selectedNode, setSelectedKey]);

  return (
    <section className="workspace">
      <aside className="panel-sidebar">
        <div className="panel-header">
          <h2>Familiars</h2>
          <span>{filteredNodes.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, rarity, location, role, or component"
        />
        <div className="filter-grid">
          <label className="filter-field">
            <span>Rarity</span>
            <select
              value={rarityFilter}
              onChange={(event) => setRarityFilter(event.target.value)}
            >
              <option value="all">All rarities</option>
              {rarityOptions.map((rarity) => (
                <option key={rarity} value={rarity.toLowerCase()}>
                  {rarity}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span>Order</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="stats">Total Stats</option>
              <option value="power">Power</option>
              <option value="agility">Agility</option>
              <option value="stamina">Stamina</option>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
            </select>
          </label>
        </div>
        <div className="node-list">
          {filteredNodes.map((node) => (
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
                  {node.type === "fusion"
                    ? `${node.rarity} fusion`
                    : `${node.rarity} familiar`}
                  {node.subgroup ? ` / ${node.subgroup}` : ""}
                </small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="detail-stack">
        {selectedNode ? (
          <>
            {/* Section 1: Detail Infos */}
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
                  <div className="detail-title-group">
                    <h2>{selectedNode.name}</h2>
                    <div className="detail-actions">
                      <FavoriteButton
                        active={favoriteKeys.includes(selectedNode.nodeKey)}
                        onToggle={() => onToggleFavorite(selectedNode.nodeKey)}
                      />
                      <PanelButton
                        className="mobile-only"
                        onClick={() => setInfoExpanded(!infoExpanded)}
                      >
                        {infoExpanded ? "Hide" : "Show"}
                      </PanelButton>
                    </div>
                  </div>
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

              <div className={`details-content ${infoExpanded ? "expanded" : "collapsed"}`}>
                <div className="stat-grid">
                  <div>
                    <span>Power</span>
                    <strong>{selectedNode.stats.power || "-"}</strong>
                  </div>
                  <div>
                    <span>Stamina</span>
                    <strong>{selectedNode.stats.stamina || "-"}</strong>
                  </div>
                  <div>
                    <span>Agility</span>
                    <strong>{selectedNode.stats.agility || "-"}</strong>
                  </div>
                  <div>
                    <span>Recipe Depth</span>
                    <strong>{selectedNode.recipeDepth}</strong>
                  </div>
                </div>

                <div className="ability-grid">
                  <div>
                    <span>Skill Count</span>
                    <strong>{selectedNode.skills?.length || 0}</strong>
                  </div>
                  <div>
                    <span>Familiar Bonus</span>
                    <strong>
                      {selectedNode.familiar_bonus &&
                        Object.keys(selectedNode.familiar_bonus).length
                        ? Object.entries(selectedNode.familiar_bonus)
                          .map(
                            ([key, value]) =>
                              `${value} ${key.replace(/_/g, " ")}`,
                          )
                          .join(" / ")
                        : "-"}
                    </strong>
                  </div>
                  <div>
                    <span>Recipe Components</span>
                    <strong>
                      {selectedNode.requirements?.length ||
                        selectedNode.components?.length ||
                        0}
                    </strong>
                  </div>
                  <div>
                    <span>Used In</span>
                    <strong>{selectedNode.usedIn.length}</strong>
                  </div>
                </div>

                <div className="recipe-groups">
                  <div>
                    <span className="section-kicker">Skills</span>
                    <SkillCards skills={selectedNode.skills} />
                  </div>
                </div>

                {selectedNode.type === "fusion" ? (
                  <div className="recipe-groups">
                    <div>
                      <span className="section-kicker">Familiar Components</span>
                      <RequirementPills
                        requirements={selectedNode.familiarRequirements}
                        materialIndex={materialData.materialIndex}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </article>

            {/* Section 2: How To Fuse */}
            <article className="panel">
              <div className="panel-header">
                <h2>How To Fuse</h2>
                <div className="panel-header-actions">
                  <span>
                    {flattenedRequirements.length ||
                      selectedNode.requirements?.length ||
                      selectedNode.componentSlugs?.length ||
                      0}{" "}
                    requirements
                  </span>
                  <PanelButton
                    className="mobile-only"
                    onClick={() => setFuseExpanded(!fuseExpanded)}
                  >
                    {fuseExpanded ? "Hide" : "Show"}
                  </PanelButton>
                </div>
              </div>

              <div className={`details-content ${fuseExpanded ? "expanded" : "collapsed"}`}>
                {selectedNode.type === "fusion" ? (
                  <>
                    <p className="recipe-inline">
                      {fusionSummary ||
                        selectedNode.recipeText ||
                        selectedNode.components.join(" + ")}
                    </p>
                    <div className="tree-root">
                      <TreeNode
                        nodeKey={selectedNode.nodeKey}
                        nodeIndex={familiarData.nodeIndex}
                        materialIndex={materialData.materialIndex}
                      />
                    </div>
                  </>
                ) : (
                  <p className="empty-state">
                    This is a base familiar. Select a fusion familiar to view its
                    full dependency tree.
                  </p>
                )}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Reverse Dependencies</h2>
                <span>{selectedNode.usedIn.length}</span>
              </div>
              <div className={`details-content ${fuseExpanded ? "expanded" : "collapsed"}`}>
                {selectedNode.usedIn.length ? (
                  <div className="dependency-list">
                    {selectedNode.usedIn.map((nodeKey) => {
                      const node = familiarData.nodeIndex[nodeKey];
                      return (
                        <button
                          key={nodeKey}
                          className="dependency-pill"
                          type="button"
                          onClick={() => setSelectedKey(nodeKey)}
                        >
                          {node?.name || nodeKey}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-state">
                    No downstream fusion records were linked from the archived
                    pages.
                  </p>
                )}
              </div>
            </article>
          </>
        ) : null}
      </section>
    </section>
  );
}
