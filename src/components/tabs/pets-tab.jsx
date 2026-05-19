import { useState, useMemo, useEffect } from "react";
import { assetUrl, rarityClassName, sortPets } from "../../utils";
import { PetDetail } from "../ui/pet-detail";

export function PetsTab({
  petsData,
  query,
  setQuery,
  selectedPetKey,
  setSelectedPetKey,
}) {
  const rarityOptions = useMemo(
    () =>
      [...new Set(petsData.pets.map((pet) => pet.rarity).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [petsData.pets],
  );
  const categoryOptions = useMemo(
    () =>
      [
        ...new Set(petsData.pets.map((pet) => pet.category).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    [petsData.pets],
  );
  const [rarityFilter, setRarityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("avg");

  const filteredPets = useMemo(() => {
    const search = query.trim().toLowerCase();

    const next = petsData.pets.filter((pet) => {
      if (
        rarityFilter !== "all" &&
        pet.rarity?.toLowerCase() !== rarityFilter
      ) {
        return false;
      }

      if (categoryFilter !== "all" && pet.category !== categoryFilter) {
        return false;
      }

      const haystack = [
        pet.name,
        pet.description,
        pet.source,
        pet.rarity,
        pet.category,
        pet.subgroup,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !search || haystack.includes(search);
    });

    return sortPets(next, sortOrder);
  }, [petsData.pets, query, rarityFilter, categoryFilter, sortOrder]);

  const selectedPet =
    petsData.petIndex[selectedPetKey] || filteredPets[0] || petsData.pets[0];

  useEffect(() => {
    if (!selectedPet) return;
    setSelectedPetKey(selectedPet.nodeKey);
  }, [selectedPet, setSelectedPetKey]);

  return (
    <section className="workspace">
      <aside className="panel-sidebar">
        <div className="panel-header">
          <h2>Pets</h2>
          <span>{filteredPets.length}</span>
        </div>
        <input
          className="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by pet name, effect, source, or section"
        />
        <div className="filter-grid">
          <label className="filter-field">
            <span>Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, " ")}
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
        <div className="filter-grid single">
          <label className="filter-field">
            <span>Order</span>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="avg">Avg Power</option>
              <option value="name">Name</option>
              <option value="rarity">Rarity</option>
            </select>
          </label>
        </div>
        <div className="node-list">
          {filteredPets.map((pet) => (
            <button
              key={pet.nodeKey}
              className={`node-row ${pet.imagePath ? "has-icon" : "no-icon"} ${rarityClassName(pet.rarity)} ${selectedPet?.nodeKey === pet.nodeKey ? "active" : ""
                }`}
              onClick={() => setSelectedPetKey(pet.nodeKey)}
              type="button"
            >
              {pet.imagePath ? (
                <img
                  className="thumb small"
                  src={assetUrl(pet.imagePath)}
                  alt={pet.name}
                />
              ) : null}
              <span>
                <strong>{pet.name}</strong>
                <small>
                  {pet.rarity} / {pet.avg} avg
                </small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="detail-stack">
        <PetDetail pet={selectedPet} />

        <article className="panel">
          <div className="panel-header">
            <h2>Proc Summary</h2>
            <span>{selectedPet?.category.replace(/_/g, " ")}</span>
          </div>
          <p className="recipe-inline">{selectedPet?.description}</p>
          <div className="requirement-list">
            <div className="requirement-pill">
              <div className="requirement-pill-title">Source</div>
              <div className="requirement-pill-source">
                {selectedPet?.source || "-"}
              </div>
            </div>
            <div className="requirement-pill">
              <div className="requirement-pill-title">Upgrade Growth</div>
              <div className="requirement-pill-source">
                {selectedPet?.upgrade || "Not listed on the archived page"}
              </div>
            </div>
            <div className="requirement-pill">
              <div className="requirement-pill-title">Reforge</div>
              <div className="requirement-pill-source">
                {selectedPet?.canReforge
                  ? "Available on the archived pets page."
                  : "Listed as non-reforgeable event gear."}
              </div>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}
