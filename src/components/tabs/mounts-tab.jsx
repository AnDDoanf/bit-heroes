import { useState, useMemo } from "react";
import { assetUrl, rarityClassName } from "../../utils";

function MountCatalog({ mounts }) {
  return (
    <div className="material-grid">
      {mounts.map((mount) => (
        <article
          key={mount.nodeKey}
          className={`material-card ${rarityClassName(mount.rarity)}`}
        >
          <div className="material-top">
            {mount.imagePath ? (
              <img
                className="thumb"
                src={assetUrl(mount.imagePath)}
                alt={mount.name}
              />
            ) : null}
            <div>
              <h3>{mount.name}</h3>
              <p>{mount.rarity}</p>
            </div>
          </div>
          <ul>
            <li>
              <strong>Speed:</strong> {mount.moveSpeed || "-"}
            </li>
            <li>
              <strong>Bonus:</strong> {mount.bonus || "-"}
            </li>
            <li>
              <strong>Skill:</strong> {mount.uniqueSkill || "-"}
            </li>
            {mount.originalCost ? (
              <li>
                <strong>Cost:</strong> {mount.originalCost}
              </li>
            ) : null}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function MountsTab({ mountsData, query, setQuery }) {
  const rarityOptions = useMemo(
    () =>
      [
        ...new Set(
          mountsData.mounts.map((mount) => mount.rarity).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [mountsData.mounts],
  );
  const [rarityFilter, setRarityFilter] = useState("all");

  const filteredMounts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return mountsData.mounts.filter((mount) => {
      if (
        rarityFilter !== "all" &&
        mount.rarity?.toLowerCase() !== rarityFilter
      ) {
        return false;
      }

      const haystack = [
        mount.name,
        mount.rarity,
        mount.bonus,
        mount.uniqueSkill,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });
  }, [mountsData.mounts, query, rarityFilter]);

  return (
    <section className="detail-stack">
      <article className="panel catalog-panel">
        <div className="panel-header">
          <h2>Mounts</h2>
          <span>{filteredMounts.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by mount name, rarity, or bonus"
        />
        <div className="filter-grid single">
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
        <MountCatalog mounts={filteredMounts} />
      </article>
    </section>
  );
}
