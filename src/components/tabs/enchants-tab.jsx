"use client";

import { useMemo, useState } from "react";
import { assetUrl, rarityClassName } from "../../utils";

export function EnchantsTab({ enchantsData, query, setQuery }) {
  const tierOptions = useMemo(
    () =>
      [...new Set(enchantsData.enchants.map((item) => item.tier).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      ),
    [enchantsData.enchants],
  );
  const rarityOptions = useMemo(
    () =>
      [...new Set(enchantsData.enchants.map((item) => item.rarity).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [enchantsData.enchants],
  );
  const [tierFilter, setTierFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");

  const filteredEnchants = useMemo(() => {
    const search = query.trim().toLowerCase();

    return enchantsData.enchants.filter((enchant) => {
      if (tierFilter !== "all" && enchant.tier !== tierFilter) {
        return false;
      }

      if (
        rarityFilter !== "all" &&
        enchant.rarity?.toLowerCase() !== rarityFilter
      ) {
        return false;
      }

      const haystack = [
        enchant.name,
        enchant.tier,
        enchant.rarity,
        enchant.description,
        enchant.obtainedIn,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [enchantsData.enchants, query, rarityFilter, tierFilter]);

  return (
    <section className="detail-stack">
      <article className="panel catalog-panel">
        <div className="panel-header">
          <h2>Enchants</h2>
          <span>{filteredEnchants.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, tier, rarity, description, or source"
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
        <div className="material-grid">
          {filteredEnchants.map((enchant) => (
            <article
              key={enchant.nodeKey}
              className={`material-card ${rarityClassName(enchant.rarity)}`}
            >
              <div className="material-top">
                {enchant.imagePath ? (
                  <img
                    className="thumb"
                    src={assetUrl(enchant.imagePath)}
                    alt={enchant.name}
                  />
                ) : null}
                <div>
                  <h3>{enchant.name}</h3>
                  <p>
                    {[enchant.rarity, enchant.tier].filter(Boolean).join(" / ")}
                  </p>
                </div>
              </div>
              <div className="catalog-copy">
                <p>{enchant.description}</p>
                <p>Obtained in: {enchant.obtainedIn || "-"}</p>
              </div>
              <div className="catalog-stat-grid">
                <div>
                  <span>Base Cost</span>
                  <strong>{enchant.baseCost || "-"}</strong>
                </div>
                <div>
                  <span>1st Reroll</span>
                  <strong>{enchant.firstRerollCost || "-"}</strong>
                </div>
                <div>
                  <span>Base Melt</span>
                  <strong>{enchant.baseMelt || "-"}</strong>
                </div>
                <div>
                  <span>1st Melt</span>
                  <strong>{enchant.firstRerollMelt || "-"}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <h2>Enchant Bonus Table</h2>
          <span>{enchantsData.bonuses?.length || 0}</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bonus</th>
                {(enchantsData.bonusHeaders || []).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(enchantsData.bonuses || []).map((row) => (
                <tr key={row.bonus}>
                  <th scope="row">{row.bonus}</th>
                  {(enchantsData.bonusHeaders || []).map((header) => (
                    <td key={`${row.bonus}-${header}`}>{row.values?.[header] || "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
