import { useState, useMemo } from "react";
import { MaterialCatalog } from "../ui/material-catalog";

export function MaterialsTab({ materialData, query, setQuery }) {
  const rarityOptions = useMemo(
    () =>
      [
        ...new Set(
          materialData.materials
            .map((material) => material.rarity)
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [materialData.materials],
  );
  const tierOptions = useMemo(
    () =>
      [
        ...new Set(
          materialData.materials
            .map((material) => material.tier)
            .filter(Boolean),
        ),
      ].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      ),
    [materialData.materials],
  );
  const [rarityFilter, setRarityFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filteredMaterials = useMemo(() => {
    const search = query.trim().toLowerCase();

    return materialData.materials.filter((material) => {
      if (
        rarityFilter !== "all" &&
        material.rarity?.toLowerCase() !== rarityFilter
      ) {
        return false;
      }

      if (tierFilter !== "all" && material.tier !== tierFilter) {
        return false;
      }

      const haystack = [
        material.name,
        material.group,
        material.tier,
        ...(material.sourceNotes || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [materialData.materials, query, rarityFilter, tierFilter]);

  return (
    <section className="detail-stack">
      <article className="panel catalog-panel">
        <div className="panel-header">
          <h2>Fusion Materials</h2>
          <span>{filteredMaterials.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by material name, tier, group, or source"
        />
        <div className="filter-grid">
          <label className="filter-field">
            <span>Tier</span>
            <select
              value={tierFilter}
              onChange={(event) => setTierFilter(event.target.value)}
            >
              <option value="all">All tiers</option>
              {tierOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </label>
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
        </div>
        <MaterialCatalog materials={filteredMaterials} />
      </article>
    </section>
  );
}
