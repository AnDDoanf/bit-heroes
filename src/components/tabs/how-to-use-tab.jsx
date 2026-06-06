function GuideCompassIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="m9 15 2.1-6.1L15 9l-2.1 6.1L9 15Z" />
      <path d="M12 4v2" />
      <path d="M20 12h-2" />
      <path d="M12 20v-2" />
      <path d="M4 12h2" />
    </svg>
  );
}

function GuideSearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function GuideEyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function GuideTrackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10" />
      <path d="M7 12h6" />
      <path d="M7 17h8" />
      <path d="m16.5 17 2 2 4-5" />
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

function GuideSparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="m18.5 14 0.9 2.1 2.1 0.9-2.1 0.9-0.9 2.1-0.9-2.1-2.1-0.9 2.1-0.9 0.9-2.1Z" />
      <path d="m5.5 15.5 0.8 1.8 1.8 0.8-1.8 0.8-0.8 1.8-0.8-1.8-1.8-0.8 1.8-0.8 0.8-1.8Z" />
    </svg>
  );
}

function GuidePreview({
  variant,
  familiarCount,
  materialCount,
  petCount,
  equipmentCount,
  mountCount,
  fusionCount,
  fusionName,
  trackerName,
  materialName,
  petName,
  equipmentName,
  runeCount,
  enchantCount,
  augmentCount,
}) {
  if (variant === "tabs") {
    return (
      <div className="guide-preview-shell">
        <div className="guide-preview-top">
          <span className="guide-window-dot active" />
          <span className="guide-window-line" />
        </div>
        <div className="guide-preview-nav">
          <span className="guide-preview-chip active">Dashboard</span>
          <span className="guide-preview-chip">Familiars</span>
          <span className="guide-preview-chip">Materials</span>
          <span className="guide-preview-chip">Pets</span>
        </div>
        <div className="guide-preview-metrics">
          <div className="guide-preview-metric accent">
            <strong>{familiarCount}</strong>
            <span>Familiars</span>
          </div>
          <div className="guide-preview-metric">
            <strong>{materialCount}</strong>
            <span>Materials</span>
          </div>
          <div className="guide-preview-metric">
            <strong>{petCount}</strong>
            <span>Pets</span>
          </div>
          <div className="guide-preview-metric">
            <strong>{equipmentCount}</strong>
            <span>Equipments</span>
          </div>
        </div>
        <div className="guide-preview-footer">
          <span>{fusionCount} fusion entries</span>
          <span>{mountCount} mounts</span>
        </div>
      </div>
    );
  }

  if (variant === "search") {
    return (
      <div className="guide-preview-shell">
        <div className="guide-preview-top">
          <span className="guide-window-dot active" />
          <span className="guide-window-line" />
        </div>
        <div className="guide-search-bar">
          <span className="guide-search-lens" />
          <span>{fusionName}</span>
        </div>
        <div className="guide-search-filters">
          <span className="guide-filter-pill">Rarity</span>
          <span className="guide-filter-pill">Order</span>
          <span className="guide-filter-pill">Favorites</span>
        </div>
        <div className="guide-search-results">
          <div className="guide-search-row active">
            <strong>{fusionName}</strong>
            <small>Fusion familiar</small>
          </div>
          <div className="guide-search-row">
            <strong>{trackerName}</strong>
            <small>Shared component</small>
          </div>
          <div className="guide-search-row">
            <strong>{materialName}</strong>
            <small>Material note match</small>
          </div>
        </div>
        <div className="guide-preview-footer">
          <span>Search + filters</span>
          <span>Fast narrowing</span>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="guide-preview-shell">
        <div className="guide-preview-top">
          <span className="guide-window-dot active" />
          <span className="guide-window-line" />
        </div>
        <div className="guide-detail-card">
          <div className="guide-detail-head">
            <div className="guide-detail-title">
              <strong>{fusionName}</strong>
              <span>{equipmentName}</span>
            </div>
            <span className="guide-inline-button">View detail</span>
          </div>
          <div className="guide-detail-lines">
            <span className="guide-line w-full" />
            <span className="guide-line w-full" />
            <span className="guide-line w-full" />
            <span className="guide-line w-short" />
          </div>
          <div className="guide-detail-actions">
            <span className="guide-square active" />
            <span className="guide-square" />
            <span className="guide-square" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "tracking") {
    return (
      <div className="guide-preview-shell">
        <div className="guide-preview-top">
          <span className="guide-window-dot active" />
          <span className="guide-window-line" />
        </div>
        <div className="guide-tree-preview">
          <div className="guide-tree-node root">
            <strong>{fusionName}</strong>
            <span>Target build</span>
          </div>
          <div className="guide-tree-branches">
            <div className="guide-tree-node">
              <strong>{trackerName}</strong>
              <span>Owned 2</span>
            </div>
            <div className="guide-tree-node">
              <strong>{materialName}</strong>
              <span>Need farm</span>
            </div>
            <div className="guide-tree-node">
              <strong>Gold</strong>
              <span>Recipe cost</span>
            </div>
          </div>
          <div className="guide-preview-footer">
            <span>Tracker saved locally</span>
            <span>Dependency tree</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-preview-shell">
      <div className="guide-preview-top">
        <span className="guide-window-dot active" />
        <span className="guide-window-line" />
      </div>
      <div className="guide-support-grid">
        <div className="guide-support-card active">
          <span>Pets</span>
          <strong>{petName}</strong>
          <small>{petCount} entries</small>
        </div>
        <div className="guide-support-card">
          <span>Equipments</span>
          <strong>{equipmentName}</strong>
          <small>{equipmentCount} entries</small>
        </div>
        <div className="guide-support-card">
          <span>Runes</span>
          <strong>{runeCount}</strong>
          <small>upgrade lines</small>
        </div>
      </div>
      <div className="guide-upgrade-row">
        <div className="guide-upgrade-pill">
          <span>Enchants</span>
          <strong>{enchantCount}</strong>
        </div>
        <div className="guide-upgrade-pill">
          <span>Augments</span>
          <strong>{augmentCount}</strong>
        </div>
      </div>
      <div className="guide-progress">
        <span className="guide-progress-fill" />
      </div>
    </div>
  );
}

export function HowToUseTab({
  familiarData,
  materialData,
  petsData,
  mountsData,
  equipmentsData,
  enchantsData,
  augmentsData,
  runesData,
  onSelectNode,
  onSelectPet,
  onChangeTab,
}) {
  const deepestFusion = [...familiarData.fusions].sort((left, right) => {
    if (right.recipeDepth !== left.recipeDepth) {
      return right.recipeDepth - left.recipeDepth;
    }

    return left.name.localeCompare(right.name);
  })[0];

  const hotspotNode = [...familiarData.nodes]
    .filter((node) => node.usedIn?.length)
    .sort((left, right) => {
      if (right.usedIn.length !== left.usedIn.length) {
        return right.usedIn.length - left.usedIn.length;
      }

      return left.name.localeCompare(right.name);
    })[0];

  const featuredMaterial = [...materialData.materials].sort((left, right) => {
    const leftCount = left.sourceNotes?.length || 0;
    const rightCount = right.sourceNotes?.length || 0;

    if (rightCount !== leftCount) {
      return rightCount - leftCount;
    }

    return left.name.localeCompare(right.name);
  })[0];

  const standoutPet = [...petsData.pets].sort(
    (left, right) => right.avgValue - left.avgValue,
  )[0];

  const standoutEquipment = [...equipmentsData.equipments].sort(
    (left, right) =>
      (right.statValues?.total || 0) - (left.statValues?.total || 0),
  )[0];

  const mountCount = mountsData?.counts?.mounts || 0;
  const familiarCount = familiarData?.counts?.familiars || 0;
  const fusionCount = familiarData?.counts?.fusions || 0;
  const materialCount = materialData?.counts?.materials || 0;
  const petCount = petsData?.counts?.pets || 0;
  const equipmentCount = equipmentsData?.counts?.equipments || 0;
  const runeCount = runesData?.counts?.runes || 0;
  const enchantCount = enchantsData?.counts?.enchants || 0;
  const augmentCount = augmentsData?.counts?.augments || 0;

  const fusionName = deepestFusion?.name || "Fusion Familiar";
  const trackerName = hotspotNode?.name || "Tracked Familiar";
  const materialName = featuredMaterial?.name || "Fusion Material";
  const petName = standoutPet?.name || "Support Pet";
  const equipmentName = standoutEquipment?.name || "Equipment";

  const overviewCards = [
    {
      number: "01",
      title: "Pick the right tab",
      description:
        "Start with Dashboard for a quick overview, then jump into Familiars, Materials, Pets, or Equipments depending on what you are trying to solve.",
      icon: <GuideCompassIcon />,
    },
    {
      number: "02",
      title: "Search and filter fast",
      description:
        "Use the search box plus rarity, tier, category, or order filters to narrow long lists before you open any detail view.",
      icon: <GuideSearchIcon />,
    },
    {
      number: "03",
      title: "Open the detail view",
      description:
        "Inspect a familiar, pet, or equipment entry to read stats, sources, effects, and archived notes before you commit to a build.",
      icon: <GuideEyeIcon />,
    },
    {
      number: "04",
      title: "Track fusion progress",
      description:
        "Inside Familiars you can review the dependency tree, reverse dependencies, and save owned counts directly in the browser.",
      icon: <GuideTrackIcon />,
    },
    {
      number: "05",
      title: "Check upgrade tabs",
      description:
        "Use Materials, Runes, Enchants, and Augments as reference tabs when you want to plan farming, upgrades, or a support loadout.",
      icon: <GuideSparkIcon />,
    },
  ];

  const walkthroughSections = [
    {
      number: "1",
      title: "Start in the section that matches your goal",
      description:
        "Dashboard is best for a quick pulse check. Familiars is where you build fusion routes and manage tracking, while Materials, Pets, Mounts, Equipments, Enchants, Augments, and Runes are focused lookup tabs.",
      tags: [
        `${familiarCount} familiars`,
        `${materialCount} materials`,
        `${mountCount} mounts`,
      ],
      action: "Open Dashboard",
      onAction: () => onChangeTab("dashboard"),
      preview: "tabs",
    },
    {
      number: "2",
      title: "Search first, then read deeper",
      description:
        "Most tabs give you search and filters in the left column. Search by name, rarity, source, slot, or category to cut the list down before you spend time comparing records.",
      tags: [fusionName, trackerName, materialName],
      action: "Open Familiars",
      onAction: () => onChangeTab("familiars"),
      preview: "search",
    },
    {
      number: "3",
      title: "Use details to compare before building",
      description:
        "Once you have the right record open, use the detail panels to compare stats, skills, bonuses, set effects, source notes, and proc descriptions before choosing what to build or farm.",
      tags: [fusionName, equipmentName, petName],
      action: deepestFusion ? `View ${fusionName}` : "Open Familiars",
      onAction: deepestFusion
        ? () => onSelectNode(deepestFusion.nodeKey)
        : () => onChangeTab("familiars"),
      preview: "detail",
    },
    {
      number: "4",
      title: "Track what you own and what is missing",
      description:
        "For fusion familiars, the How To Fuse section shows the pieces you need, the supporting materials, and which nodes are reused elsewhere. You can also adjust owned counts to see what is still missing.",
      tags: ["How To Fuse", "Owned count", "Reverse dependencies"],
      action: deepestFusion ? "Open familiar tracker" : "Open Familiars",
      onAction: deepestFusion
        ? () => onSelectNode(deepestFusion.nodeKey)
        : () => onChangeTab("familiars"),
      preview: "tracking",
    },
    {
      number: "5",
      title: "Finish with support and upgrade tabs",
      description:
        "After you lock in the main familiar path, check Pets, Equipments, Runes, Enchants, and Augments to round out the build. These tabs are useful when you want quick comparisons for bonuses, stats, and upgrade options.",
      tags: [
        `${petCount} pets`,
        `${runeCount} runes`,
        `${enchantCount} enchants`,
      ],
      action: standoutPet ? `View ${petName}` : "Open Pets",
      onAction: standoutPet
        ? () => onSelectPet(standoutPet.nodeKey)
        : () => onChangeTab("pets"),
      preview: "support",
    },
  ];

  return (
    <section className="detail-stack guide-shell">
      <section className="panel guide-intro motion-rise motion-delay-1">
        <div className="guide-intro-copy">
          <span className="guide-label">How To Use</span>
          <h2>How to use Bit Heroes Atlas</h2>
          <p>
            Learn the dashboard, fusion tree, materials lookup, and support tabs
            in a few quick steps. This page is meant to be a compact walkthrough
            so you know where to start and where to jump next.
          </p>
        </div>
        <div className="guide-pill-row">
          <div className="guide-pill-card">
            <strong>{familiarCount}</strong>
            <span>Familiars</span>
          </div>
          <div className="guide-pill-card">
            <strong>{materialCount}</strong>
            <span>Materials</span>
          </div>
          <div className="guide-pill-card">
            <strong>{petCount}</strong>
            <span>Pets</span>
          </div>
          <div className="guide-pill-card">
            <strong>{runeCount}</strong>
            <span>Runes</span>
          </div>
        </div>
      </section>

      <section className="guide-overview-grid motion-rise motion-delay-2">
        {overviewCards.map((card) => (
          <article key={card.number} className="guide-overview-card">
            <span className="guide-card-number">{card.number}</span>
            <div className="guide-overview-head">
              <span className="guide-overview-icon">{card.icon}</span>
              <strong>{card.title}</strong>
            </div>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="guide-showcase-list">
        {walkthroughSections.map((section, index) => (
          <article
            key={section.number}
            className={`panel guide-showcase motion-rise ${
              index === 0
                ? "motion-delay-1"
                : index === 1
                  ? "motion-delay-2"
                  : index === 2
                    ? "motion-delay-3"
                    : "motion-delay-4"
            }`}
          >
            <div className="guide-preview-column">
              <GuidePreview
                variant={section.preview}
                familiarCount={familiarCount}
                materialCount={materialCount}
                petCount={petCount}
                equipmentCount={equipmentCount}
                mountCount={mountCount}
                fusionCount={fusionCount}
                fusionName={fusionName}
                trackerName={trackerName}
                materialName={materialName}
                petName={petName}
                equipmentName={equipmentName}
                runeCount={runeCount}
                enchantCount={enchantCount}
                augmentCount={augmentCount}
              />
            </div>
            <div className="guide-showcase-copy">
              <h3>
                {section.number}. {section.title}
              </h3>
              <p>{section.description}</p>
              <div className="guide-tag-row">
                {section.tags.map((tag) => (
                  <span key={tag} className="guide-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                className="action-button"
                type="button"
                onClick={section.onAction}
              >
                {section.action}
              </button>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
