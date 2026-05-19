"use client";

import { useMemo, useState } from "react";
import { assetUrl } from "../../utils";

function formatRarityValues(values = {}) {
  return Object.entries(values).filter(([, value]) => value);
}

export function AugmentsTab({ augmentsData, query, setQuery }) {
  const categoryOptions = useMemo(
    () =>
      [...new Set(augmentsData.augments.map((item) => item.category).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [augmentsData.augments],
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredAugments = useMemo(() => {
    const search = query.trim().toLowerCase();

    return augmentsData.augments.filter((augment) => {
      if (categoryFilter !== "all" && augment.category !== categoryFilter) {
        return false;
      }

      const haystack = [
        augment.category,
        augment.name,
        augment.effect,
        augment.material,
        augment.scaleGroup,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [augmentsData.augments, categoryFilter, query]);

  return (
    <section className="detail-stack">
      <article className="panel catalog-panel">
        <div className="panel-header">
          <h2>Augments</h2>
          <span>{filteredAugments.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by category, augment name, effect, or material"
        />
        <div className="filter-grid single">
          <label className="filter-field">
            <span>Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="material-grid">
          {filteredAugments.map((augment) => (
            <article key={augment.nodeKey} className="material-card rarity-generic">
              <div className="material-top">
                {augment.imagePath ? (
                  <img
                    className="thumb"
                    src={assetUrl(augment.imagePath)}
                    alt={augment.name}
                  />
                ) : null}
                <div>
                  <h3>{augment.name}</h3>
                  <p>
                    {[augment.category, `#${augment.order}`]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                </div>
              </div>
              <div className="catalog-copy">
                <p>{augment.effect}</p>
                <p>
                  Material: {augment.material || "-"}
                  {augment.scaleGroup ? ` / Group ${augment.scaleGroup}` : ""}
                </p>
              </div>
              <div className="value-list">
                {formatRarityValues(augment.rarityValues).map(([rarity, value]) => (
                  <div key={rarity} className="value-pill">
                    <span>{rarity}</span>
                    <strong>{value}%</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}
