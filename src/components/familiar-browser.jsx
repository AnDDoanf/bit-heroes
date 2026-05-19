"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseUrlState, buildUrlState } from "../utils";
import { Header } from "./layout/header";
import { Footer } from "./layout/footer";
import { DashboardTab } from "./tabs/dashboard-tab";
import { EnchantsTab } from "./tabs/enchants-tab";
import { EquipmentTab } from "./tabs/equipment-tab";
import { FamiliarTab } from "./tabs/familiar-tab";
import { FavoritesTab } from "./tabs/favorites-tab";
import { AugmentsTab } from "./tabs/augments-tab";
import { MaterialsTab } from "./tabs/materials-tab";
import { PetsTab } from "./tabs/pets-tab";
import { MountsTab } from "./tabs/mounts-tab";
import { RunesTab } from "./tabs/runes-tab";

export default function FamiliarBrowser({
  familiarData,
  materialData,
  petsData,
  mountsData,
  equipmentsData,
  enchantsData,
  augmentsData,
  runesData,
}) {
  const nodeBySlug = useMemo(
    () =>
      Object.fromEntries(
        familiarData.nodes
          .filter((node) => node.slug)
          .map((node) => [node.slug, node]),
      ),
    [familiarData.nodes],
  );
  const petBySlug = useMemo(
    () =>
      Object.fromEntries(
        petsData.pets.filter((pet) => pet.slug).map((pet) => [pet.slug, pet]),
      ),
    [petsData.pets],
  );

  const equipmentBySlug = useMemo(
    () =>
      Object.fromEntries(
        equipmentsData.equipments
          .filter((equipment) => equipment.slug)
          .map((equipment) => [equipment.slug, equipment]),
      ),
    [equipmentsData.equipments],
  );
  const [activeTab, setActiveTab] = useState("dashboard");
  const [familiarQuery, setFamiliarQuery] = useState("");
  const [materialQuery, setMaterialQuery] = useState("");
  const [petQuery, setPetQuery] = useState("");
  const [mountQuery, setMountQuery] = useState("");
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [enchantQuery, setEnchantQuery] = useState("");
  const [augmentQuery, setAugmentQuery] = useState("");
  const [runeQuery, setRuneQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState(
    familiarData.nodes[0]?.nodeKey || "",
  );
  const [selectedPetKey, setSelectedPetKey] = useState(
    petsData.pets[0]?.nodeKey || "",
  );
  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState(
    equipmentsData.equipments[0]?.nodeKey || "",
  );
  const [favoriteKeys, setFavoriteKeys] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function toggleFavorite(nodeKey) {
    setFavoriteKeys((current) => {
      const next = current.includes(nodeKey)
        ? current.filter((key) => key !== nodeKey)
        : [...current, nodeKey];
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "bit-heroes-favorites",
          JSON.stringify(next),
        );
      }
      return next;
    });
  }

  function openNode(nodeKey) {
    setSelectedKey(nodeKey);
    setActiveTab("familiars");
  }

  function openPet(nodeKey) {
    setSelectedPetKey(nodeKey);
    setActiveTab("pets");
  }

  useEffect(() => {
    const applyUrlState = () => {
      const next = parseUrlState(nodeBySlug, petBySlug, equipmentBySlug);
      setActiveTab(next.tab);
      if (next.selectedKey) {
        setSelectedKey(next.selectedKey);
      }
      if (next.selectedPetKey) {
        setSelectedPetKey(next.selectedPetKey);
      }
      if (next.selectedEquipmentKey) {
        setSelectedEquipmentKey(next.selectedEquipmentKey);
      }
    };

    applyUrlState();
    try {
      const raw = window.localStorage.getItem("bit-heroes-favorites");
      const parsed = raw ? JSON.parse(raw) : [];
      setFavoriteKeys(
        Array.isArray(parsed)
          ? parsed.filter((key) => familiarData.nodeIndex[key])
          : [],
      );
    } catch {
      setFavoriteKeys([]);
    }
    hasHydratedRef.current = true;
    window.addEventListener("popstate", applyUrlState);
    return () => window.removeEventListener("popstate", applyUrlState);
  }, [nodeBySlug, petBySlug, equipmentBySlug, familiarData.nodeIndex]);

  useEffect(() => {
    if (!hasHydratedRef.current || typeof window === "undefined") return;

    const selectedNode =
      familiarData.nodeIndex[selectedKey] || familiarData.nodes[0];
    const selectedPet = petsData.petIndex[selectedPetKey] || petsData.pets[0];
    const selectedEquipment =
      equipmentsData.equipmentIndex[selectedEquipmentKey] ||
      equipmentsData.equipments[0];
    const nextUrl = buildUrlState(
      activeTab,
      selectedNode,
      selectedPet,
      selectedEquipment,
    );
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.pushState({}, "", nextUrl);
    }
  }, [
    activeTab,
    selectedKey,
    selectedPetKey,
    selectedEquipmentKey,
    familiarData.nodeIndex,
    familiarData.nodes,
    petsData.petIndex,
    petsData.pets,
    equipmentsData.equipmentIndex,
    equipmentsData.equipments,
  ]);
  return (
    <main className="page-shell">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "dashboard" ? (
        <DashboardTab
          familiarData={familiarData}
          materialData={materialData}
          petsData={petsData}
          mountsData={mountsData}
          equipmentsData={equipmentsData}
          enchantsData={enchantsData}
          augmentsData={augmentsData}
          runesData={runesData}
          onSelectNode={openNode}
          onSelectPet={openPet}
          onChangeTab={setActiveTab}
        />
      ) : null}

      {activeTab === "familiars" ? (
        <FamiliarTab
          familiarData={familiarData}
          materialData={materialData}
          query={familiarQuery}
          setQuery={setFamiliarQuery}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          favoriteKeys={favoriteKeys}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}

      {activeTab === "pets" ? (
        <PetsTab
          petsData={petsData}
          query={petQuery}
          setQuery={setPetQuery}
          selectedPetKey={selectedPetKey}
          setSelectedPetKey={setSelectedPetKey}
        />
      ) : null}

      {activeTab === "mounts" ? (
        <MountsTab
          mountsData={mountsData}
          query={mountQuery}
          setQuery={setMountQuery}
        />
      ) : null}

      {activeTab === "equipments" ? (
        <EquipmentTab
          equipmentsData={equipmentsData}
          query={equipmentQuery}
          setQuery={setEquipmentQuery}
          selectedEquipmentKey={selectedEquipmentKey}
          setSelectedEquipmentKey={setSelectedEquipmentKey}
        />
      ) : null}

      {activeTab === "enchants" ? (
        <EnchantsTab
          enchantsData={enchantsData}
          query={enchantQuery}
          setQuery={setEnchantQuery}
        />
      ) : null}

      {activeTab === "augments" ? (
        <AugmentsTab
          augmentsData={augmentsData}
          query={augmentQuery}
          setQuery={setAugmentQuery}
        />
      ) : null}

      {activeTab === "runes" ? (
        <RunesTab
          runesData={runesData}
          query={runeQuery}
          setQuery={setRuneQuery}
        />
      ) : null}

      {activeTab === "favorites" ? (
        <FavoritesTab
          familiarData={familiarData}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          favoriteKeys={favoriteKeys}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}

      {activeTab === "materials" ? (
        <MaterialsTab
          materialData={materialData}
          query={materialQuery}
          setQuery={setMaterialQuery}
        />
      ) : null}

      <Footer
        familiarData={familiarData}
        petsData={petsData}
        equipmentsData={equipmentsData}
        enchantsData={enchantsData}
        augmentsData={augmentsData}
        runesData={runesData}
      />

      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </main>
  );
}
