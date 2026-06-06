import mainLogo from "../../../assets/MainLogo.webp";
import { assetUrl } from "../../utils";

export function DashboardTab({
  familiarData,
  materialData,
  petsData,
  mountsData,
  equipmentsData,
  enchantsData,
  augmentsData,
  runesData,
  onChangeTab,
}) {
  const familiarRecordCount =
    familiarData.counts.familiars + familiarData.counts.fusions;
  const upgradeEntryCount =
    enchantsData.counts.enchants +
    augmentsData.counts.augments +
    runesData.counts.runes;
  const loadoutEntryCount =
    petsData.counts.pets +
    mountsData.counts.mounts +
    equipmentsData.counts.equipments;

  const featuredFusion = [...familiarData.fusions]
    .filter((item) => item.imagePath)
    .sort((left, right) => {
      if ((right.recipeDepth || 0) !== (left.recipeDepth || 0)) {
        return (right.recipeDepth || 0) - (left.recipeDepth || 0);
      }

      return left.name.localeCompare(right.name);
    })[0];

  const featuredMaterial = [...materialData.materials]
    .filter((item) => item.imagePath)
    .sort((left, right) => {
      const leftCount = left.sourceNotes?.length || 0;
      const rightCount = right.sourceNotes?.length || 0;

      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return left.name.localeCompare(right.name);
    })[0];

  const featuredSupport =
    [...petsData.pets]
      .filter((item) => item.imagePath)
      .sort((left, right) => (right.avgValue || 0) - (left.avgValue || 0))[0] ||
    [...equipmentsData.equipments]
      .filter((item) => item.imagePath)
      .sort(
        (left, right) =>
          (right.statValues?.total || 0) - (left.statValues?.total || 0),
      )[0];

  const featuredUpgrade =
    [...runesData.runes].find((item) => item.imagePath) ||
    [...enchantsData.enchants].find((item) => item.imagePath) ||
    [...augmentsData.augments].find((item) => item.imagePath);

  const quickCards = [
    {
      label: "Planning",
      title: "Familiars",
      summary: "Trace fusion routes, inspect requirements, and track owned copies.",
      metrics: [
        `${familiarData.counts.fusions} fusion entries`,
        `${familiarData.counts.familiars} base entries`,
      ],
      action: "Open Familiars",
      target: "familiars",
      imageSrc: featuredFusion?.imagePath
        ? assetUrl(featuredFusion.imagePath)
        : "",
      imageAlt: featuredFusion?.name || "Familiar preview",
    },
    {
      label: "Lookup",
      title: "Materials",
      summary: "Find ingredients fast by tier, rarity, name, or source note.",
      metrics: [
        `${materialData.counts.materials} materials`,
        "filters included",
      ],
      action: "Open Materials",
      target: "materials",
      imageSrc: featuredMaterial?.imagePath
        ? assetUrl(featuredMaterial.imagePath)
        : "",
      imageAlt: featuredMaterial?.name || "Material preview",
    },
    {
      label: "Support",
      title: "Pets and Gear",
      summary: "Browse support pieces across pets, mounts, and equipments.",
      metrics: [
        `${petsData.counts.pets} pets`,
        `${equipmentsData.counts.equipments} equipments`,
      ],
      action: "Open Pets",
      target: "pets",
      imageSrc: featuredSupport?.imagePath
        ? assetUrl(featuredSupport.imagePath)
        : "",
      imageAlt: featuredSupport?.name || "Support preview",
    },
    {
      label: "Upgrades",
      title: "Runes, Enchants, Augments",
      summary: "Compare scaling, costs, and upgrade values in one place.",
      metrics: [
        `${upgradeEntryCount} upgrade entries`,
        `${runesData.counts.runes} runes`,
      ],
      action: "Open Runes",
      target: "runes",
      imageSrc: featuredUpgrade?.imagePath
        ? assetUrl(featuredUpgrade.imagePath)
        : "",
      imageAlt: featuredUpgrade?.name || "Upgrade preview",
    },
  ];

  const coverageItems = [
    { value: familiarRecordCount, label: "Familiar records" },
    { value: materialData.counts.materials, label: "Materials" },
    { value: loadoutEntryCount, label: "Loadout entries" },
    { value: upgradeEntryCount, label: "Upgrade entries" },
  ];

  return (
    <section className="detail-stack dashboard-shell landing-shell">
      <section className="panel landing-browser motion-rise motion-delay-1">
        <div className="landing-browser-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="landing-browser-field">
          Bit Heroes Atlas organizes the archive by question, not by page.
        </div>
      </section>

      <section className="panel landing-hero motion-rise motion-delay-2">
        <div className="landing-hero-copy">
          <span className="section-kicker">Bit Heroes Atlas</span>
          <h2>Plan fusions. Find materials. Compare support and upgrades.</h2>
          <p className="summary-note">
            This dashboard is the landing page for the atlas. Start here to see
            what the project covers and jump into the right tab quickly.
          </p>
          <div className="landing-highlight-list">
            <div className="landing-highlight-item">
              <span className="landing-highlight-dot" aria-hidden="true" />
              <span>Familiars means planning.</span>
            </div>
            <div className="landing-highlight-item">
              <span className="landing-highlight-dot" aria-hidden="true" />
              <span>Materials means lookup.</span>
            </div>
            <div className="landing-highlight-item">
              <span className="landing-highlight-dot" aria-hidden="true" />
              <span>Pets, gear, and upgrade tabs mean comparison.</span>
            </div>
          </div>
          <div className="landing-cta-actions">
            <button
              className="action-button"
              type="button"
              onClick={() => onChangeTab("familiars")}
            >
              Open Familiars
            </button>
            <button
              className="action-button alt"
              type="button"
              onClick={() => onChangeTab("materials")}
            >
              Open Materials
            </button>
            <button
              className="action-button"
              type="button"
              onClick={() => onChangeTab("how-to-use")}
            >
              How To Use
            </button>
          </div>
        </div>

        <div className="landing-hero-shot">
          <div className="landing-shot-window">
            <div className="landing-shot-toolbar">
              <span className="landing-shot-pill">Planning</span>
              <span className="landing-shot-pill">Lookup</span>
              <span className="landing-shot-pill">Comparison</span>
            </div>
            <div className="landing-shot-canvas">
              <div className="landing-logo-wrap">
                <img
                  className="landing-logo"
                  src={mainLogo.src}
                  alt="Bit Heroes"
                />
              </div>
              <div className="landing-shot-stats">
                <div>
                  <strong>{familiarRecordCount}</strong>
                  <span>Records</span>
                </div>
                <div>
                  <strong>{materialData.counts.materials}</strong>
                  <span>Materials</span>
                </div>
                <div>
                  <strong>{upgradeEntryCount}</strong>
                  <span>Upgrades</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-atlas-grid">
        {quickCards.map((card, index) => (
          <article
            key={card.title}
            className={`panel landing-atlas-card motion-rise ${
              index < 2 ? "motion-delay-3" : "motion-delay-4"
            }`}
          >
            <div className="landing-atlas-head">
              <div className="landing-atlas-copy">
                <span className="section-kicker">{card.label}</span>
                <h3>{card.title}</h3>
              </div>
              {card.imageSrc ? (
                <div className="landing-atlas-visual">
                  <img
                    className="landing-atlas-image"
                    src={card.imageSrc}
                    alt={card.imageAlt}
                  />
                </div>
              ) : null}
            </div>
            <p className="summary-note">{card.summary}</p>
            <div className="dashboard-chip-row">
              {card.metrics.map((metric) => (
                <span key={metric} className="dashboard-chip">
                  {metric}
                </span>
              ))}
            </div>
            <button
              className="panel-btn"
              type="button"
              onClick={() => onChangeTab(card.target)}
            >
              {card.action}
            </button>
          </article>
        ))}
      </section>

      <section className="panel landing-proof motion-rise motion-delay-4">
        <div className="landing-proof-copy">
          <span className="section-kicker">Coverage</span>
          <h2>The atlas brings the main archive systems into one surface.</h2>
        </div>
        <div className="landing-proof-grid">
          {coverageItems.map((item) => (
            <article key={item.label} className="landing-proof-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel landing-final motion-rise motion-delay-4">
        <div className="landing-final-copy">
          <span className="section-kicker">Next Step</span>
          <h2>Choose the first path into the archive.</h2>
          <p className="summary-note">
            Start with planning, ingredient lookup, or the guided walkthrough.
          </p>
        </div>
        <div className="landing-final-card">
          <img
            className="landing-final-logo"
            src={mainLogo.src}
            alt="Bit Heroes"
          />
          <div className="landing-final-actions">
            <button
              className="action-button"
              type="button"
              onClick={() => onChangeTab("familiars")}
            >
              Plan a Fusion
            </button>
            <button
              className="action-button"
              type="button"
              onClick={() => onChangeTab("materials")}
            >
              Find Materials
            </button>
            <button
              className="action-button"
              type="button"
              onClick={() => onChangeTab("how-to-use")}
            >
              Learn the Flow
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
