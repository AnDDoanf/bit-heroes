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
  onSelectNode,
  onSelectPet,
  onChangeTab,
}) {
  const deepestFusions = [...familiarData.fusions]
    .sort((left, right) => {
      if (right.recipeDepth !== left.recipeDepth) {
        return right.recipeDepth - left.recipeDepth;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 6);

  const contestedNodes = [...familiarData.nodes]
    .filter((node) => node.usedIn?.length)
    .sort((left, right) => {
      if (right.usedIn.length !== left.usedIn.length) {
        return right.usedIn.length - left.usedIn.length;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 6);

  const hardToFindMaterials = [...materialData.materials]
    .sort((left, right) => {
      const leftCount = left.sourceNotes?.length || 0;
      const rightCount = right.sourceNotes?.length || 0;
      if (leftCount !== rightCount) {
        return leftCount - rightCount;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 6);

  const standoutPets = [...petsData.pets]
    .sort((left, right) => right.avgValue - left.avgValue)
    .slice(0, 6);
  const standoutEquipments = [...equipmentsData.equipments]
    .sort((left, right) => (right.statValues?.total || 0) - (left.statValues?.total || 0))
    .slice(0, 6);
  const overviewCards = [
    {
      kicker: "Fusion Atlas",
      title: "Build routes and ingredient pressure",
      summary:
        "Trace deep fusion chains, spot repeated nodes, and pivot straight into material farming.",
      action: "Open familiars",
      target: "familiars",
      tone: "dashboard-card-fusion",
      metrics: [
        `${familiarData.counts.fusions} fusion recipes`,
        `${materialData.counts.materials} materials`,
      ],
    },
    {
      kicker: "Arcane Index",
      title: "Stat scaling and bonus ladders",
      summary:
        "Compare enchant rolls, augment ranges, and rune value bands from the archived pages.",
      action: "Open runes",
      target: "runes",
      tone: "dashboard-card-arcane",
      metrics: [
        `${enchantsData.counts.enchants} enchants`,
        `${augmentsData.counts.augments} augments`,
        `${runesData.counts.runes} runes`,
      ],
    },
    {
      kicker: "Loadout Board",
      title: "Companions, mounts, and equipment spikes",
      summary:
        "Jump into combat support systems and inspect the strongest archived pets and gear pieces.",
      action: "Open equipments",
      target: "equipments",
      tone: "dashboard-card-loadout",
      metrics: [
        `${petsData.counts.pets} pets`,
        `${mountsData.counts.mounts} mounts`,
        `${equipmentsData.counts.equipments} equipments`,
      ],
    },
  ];

  return (
    <section className="detail-stack dashboard-shell">
      <section className="panel dashboard-overview motion-rise motion-delay-1">
        <div className="dashboard-overview-copy">
          <span className="section-kicker">Archive Snapshot</span>
          <h2>Browse the atlas by build path, stat layer, or loadout system.</h2>
          <p className="summary-note">
            Start with fusion trees, pivot into arcane upgrades, or review
            companion and gear standouts from the archived dataset.
          </p>
        </div>
        <div className="dashboard-overview-metrics">
          <div>
            <strong>{familiarData.counts.familiars + familiarData.counts.fusions}</strong>
            <span>Familiar records</span>
          </div>
          <div>
            <strong>{enchantsData.counts.enchants + augmentsData.counts.augments + runesData.counts.runes}</strong>
            <span>Upgrade entries</span>
          </div>
          <div>
            <strong>{petsData.counts.pets + mountsData.counts.mounts + equipmentsData.counts.equipments}</strong>
            <span>Loadout entries</span>
          </div>
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid-three">
        {overviewCards.map((card, index) => (
          <article
            key={card.title}
            className={`panel dashboard-card ${card.tone} motion-rise motion-delay-${index + 2}`}
          >
            <span className="section-kicker">{card.kicker}</span>
            <h2>{card.title}</h2>
            <p className="summary-note">{card.summary}</p>
            <div className="dashboard-chip-row">
              {card.metrics.map((metric) => (
                <span key={metric} className="dashboard-chip">
                  {metric}
                </span>
              ))}
            </div>
            <button
              className="action-button"
              type="button"
              onClick={() => onChangeTab(card.target)}
            >
              {card.action}
            </button>
          </article>
        ))}
      </section>
    </section>
  );
}
