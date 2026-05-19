"use client";

import { useEffect, useMemo, useState } from "react";
import { assetUrl, rarityClassName } from "../../utils";

export function EquipmentTab({
  equipmentsData,
  query,
  setQuery,
  selectedEquipmentKey,
  setSelectedEquipmentKey,
}) {
  const rarityOptions = useMemo(
    () =>
      [...new Set(equipmentsData.equipments.map((item) => item.rarity).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [equipmentsData.equipments],
  );
  const slotOptions = useMemo(
    () =>
      [...new Set(equipmentsData.equipments.map((item) => item.slot).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [equipmentsData.equipments],
  );
  const tierOptions = useMemo(
    () =>
      [...new Set(equipmentsData.equipments.map((item) => item.tier).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
      ),
    [equipmentsData.equipments],
  );
  const [rarityFilter, setRarityFilter] = useState("all");
  const [slotFilter, setSlotFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("power");

  const filteredEquipments = useMemo(() => {
    const search = query.trim().toLowerCase();
    const next = equipmentsData.equipments.filter((equipment) => {
      if (
        rarityFilter !== "all" &&
        equipment.rarity?.toLowerCase() !== rarityFilter
      ) {
        return false;
      }

      if (slotFilter !== "all" && equipment.slot !== slotFilter) {
        return false;
      }

      if (tierFilter !== "all" && equipment.tier !== tierFilter) {
        return false;
      }

      const haystack = [
        equipment.name,
        equipment.rarity,
        equipment.slot,
        equipment.tier,
        equipment.location,
        equipment.bonus,
        equipment.elementBonus,
        equipment.setName,
        ...(equipment.setBonuses || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });

    return [...next].sort((left, right) => {
      if (sortOrder === "name") {
        return left.name.localeCompare(right.name);
      }

      if (sortOrder === "tier") {
        return left.tier.localeCompare(right.tier, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      if ((right.statValues?.total || 0) !== (left.statValues?.total || 0)) {
        return (right.statValues?.total || 0) - (left.statValues?.total || 0);
      }

      return left.name.localeCompare(right.name);
    });
  }, [equipmentsData.equipments, query, rarityFilter, slotFilter, tierFilter, sortOrder]);

  const selectedEquipment =
    equipmentsData.equipmentIndex[selectedEquipmentKey] ||
    filteredEquipments[0] ||
    equipmentsData.equipments[0];

  useEffect(() => {
    if (!selectedEquipment) return;
    setSelectedEquipmentKey(selectedEquipment.nodeKey);
  }, [selectedEquipment, setSelectedEquipmentKey]);

  return (
    <section className="workspace">
      <aside className="panel-sidebar">
        <div className="panel-header">
          <h2>Equipments</h2>
          <span>{filteredEquipments.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, rarity, slot, tier, set, or bonus"
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
            <span>Slot</span>
            <select
              value={slotFilter}
              onChange={(event) => setSlotFilter(event.target.value)}
            >
              <option value="all">All slots</option>
              {slotOptions.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>
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
            <span>Order</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="power">Power</option>
              <option value="tier">Tier</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
        <div className="node-list">
          {filteredEquipments.map((equipment) => (
            <button
              key={equipment.nodeKey}
              className={`node-row ${equipment.imagePath ? "has-icon" : "no-icon"} ${rarityClassName(equipment.rarity)} ${selectedEquipment?.nodeKey === equipment.nodeKey ? "active" : ""}`}
              onClick={() => setSelectedEquipmentKey(equipment.nodeKey)}
              type="button"
            >
              {equipment.imagePath ? (
                <img
                  className="thumb small"
                  src={assetUrl(equipment.imagePath)}
                  alt={equipment.name}
                />
              ) : null}
              <span>
                <strong>{equipment.name}</strong>
                <small>
                  {equipment.rarity} / {equipment.slot}
                  {equipment.tier ? ` / ${equipment.tier}` : ""}
                </small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="detail-stack">
        <article className={`panel detail-card ${rarityClassName(selectedEquipment?.rarity)}`}>
          <div className={`detail-top ${selectedEquipment?.imagePath ? "has-image" : "no-image"}`}>
            {selectedEquipment?.imagePath ? (
              <img
                className="detail-image"
                src={assetUrl(selectedEquipment.imagePath)}
                alt={selectedEquipment.name}
              />
            ) : null}
            <div>
              <p className="eyebrow">{selectedEquipment?.rarity} equipment</p>
              <h2>{selectedEquipment?.name}</h2>
              <p className="summary-line">
                {selectedEquipment?.slot}
                {selectedEquipment?.tier ? ` / ${selectedEquipment.tier}` : ""}
              </p>
              {selectedEquipment?.location ? (
                <p className="summary-note">{selectedEquipment.location}</p>
              ) : null}
            </div>
          </div>

          <div className="stat-grid">
            <div>
              <span>Power</span>
              <strong>{selectedEquipment?.stats?.power || "-"}</strong>
            </div>
            <div>
              <span>Stamina</span>
              <strong>{selectedEquipment?.stats?.stamina || "-"}</strong>
            </div>
            <div>
              <span>Agility</span>
              <strong>{selectedEquipment?.stats?.agility || "-"}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{selectedEquipment?.statValues?.total || 0}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Effect Summary</h2>
            <span>{selectedEquipment?.page}</span>
          </div>
          <div className="requirement-list">
            <div className="requirement-pill">
              <div className="requirement-pill-title">Bonus</div>
              <div className="requirement-pill-source">
                {selectedEquipment?.bonus || "No special bonus listed on the archived page."}
              </div>
            </div>
            {selectedEquipment?.elementBonus ? (
              <div className="requirement-pill">
                <div className="requirement-pill-title">Element Bonus</div>
                <div className="requirement-pill-source">
                  {selectedEquipment.elementBonus}
                </div>
              </div>
            ) : null}
            {selectedEquipment?.setName ? (
              <div className="requirement-pill">
                <div className="requirement-pill-title">Set</div>
                <div className="requirement-pill-source">
                  <strong>{selectedEquipment.setName}</strong>
                  {selectedEquipment.setBonuses?.length ? (
                    <div className="equipment-set-bonuses">
                      {selectedEquipment.setBonuses.map((bonus) => (
                        <div key={bonus}>{bonus}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </section>
  );
}
