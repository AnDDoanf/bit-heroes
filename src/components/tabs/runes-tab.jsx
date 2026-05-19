"use client";

import { useMemo, useState } from "react";
import { assetUrl } from "../../utils";

function formatRarityValues(values = {}) {
  return Object.entries(values).filter(([, value]) => value);
}

export function RunesTab({ runesData, query, setQuery }) {
  const categoryOptions = useMemo(
    () =>
      [...new Set(runesData.runes.map((item) => item.category).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [runesData.runes],
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredRunes = useMemo(() => {
    const search = query.trim().toLowerCase();

    return runesData.runes.filter((rune) => {
      if (categoryFilter !== "all" && rune.category !== categoryFilter) {
        return false;
      }

      const haystack = [
        rune.category,
        rune.name,
        rune.effect,
        rune.scaleGroup,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [categoryFilter, query, runesData.runes]);

  return (
    <section className="detail-stack">
      <article className="panel catalog-panel">
        <div className="panel-header">
          <h2>Runes</h2>
          <span>{filteredRunes.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by category, rune name, effect, or scale group"
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
          {filteredRunes.map((rune) => (
            <article key={rune.nodeKey} className="material-card rarity-generic">
              <div className="material-top">
                {rune.imagePath ? (
                  <img
                    className="thumb"
                    src={assetUrl(rune.imagePath)}
                    alt={rune.name}
                  />
                ) : null}
                <div>
                  <h3>{rune.name}</h3>
                  <p>
                    {[rune.category, `#${rune.order}`]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                </div>
              </div>
              <div className="catalog-copy">
                <p>{rune.effect}</p>
                <p>{rune.scaleGroup ? `Group ${rune.scaleGroup}` : "-"}</p>
              </div>
              <div className="value-list">
                {formatRarityValues(rune.rarityValues).map(([rarity, value]) => (
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
