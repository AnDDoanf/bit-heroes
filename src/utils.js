const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function assetUrl(path) {
  if (!path) return "";
  return `${basePath}${path}`;
}

export function rarityClassName(rarity = "") {
  return rarity
    ? `rarity-${rarity.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : "rarity-unknown";
}

export function formatGeneratedAt(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

export function parseUrlState(nodeBySlug, petBySlug, equipmentBySlug) {
  if (typeof window === "undefined") {
    return {
      tab: "dashboard",
      selectedKey: "",
      selectedPetKey: "",
      selectedEquipmentKey: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const requestedTab = params.get("tab");
  const tab =
    requestedTab === "familiars" ||
    requestedTab === "materials" ||
    requestedTab === "favorites" ||
    requestedTab === "dashboard" ||
    requestedTab === "pets" ||
    requestedTab === "mounts" ||
    requestedTab === "equipments" ||
    requestedTab === "enchants" ||
    requestedTab === "augments" ||
    requestedTab === "runes"
      ? requestedTab
      : "dashboard";
  const id = params.get("id") || "";
  const selectedKey =
    tab !== "pets" && tab !== "mounts" && tab !== "equipments" && id && nodeBySlug[id]
      ? nodeBySlug[id].nodeKey
      : "";
  const selectedPetKey =
    tab === "pets" && id && petBySlug[id] ? petBySlug[id].nodeKey : "";
  const selectedEquipmentKey =
    tab === "equipments" && id && equipmentBySlug[id]
      ? equipmentBySlug[id].nodeKey
      : "";

  return { tab, selectedKey, selectedPetKey, selectedEquipmentKey };
}

export function buildUrlState(
  activeTab,
  selectedNode,
  selectedPet,
  selectedEquipment,
) {
  const params = new URLSearchParams();

  if (activeTab !== "dashboard") {
    params.set("tab", activeTab);
  }

  if (
    (activeTab === "familiars" || activeTab === "favorites") &&
    selectedNode?.slug
  ) {
    params.set("id", selectedNode.slug);
  }

  if (activeTab === "pets" && selectedPet?.slug) {
    params.set("id", selectedPet.slug);
  }

  if (activeTab === "equipments" && selectedEquipment?.slug) {
    params.set("id", selectedEquipment.slug);
  }

  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

export function parseStatValue(value = "") {
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export function compareByStats(left, right) {
  const leftPower = parseStatValue(left.stats?.power);
  const rightPower = parseStatValue(right.stats?.power);
  const leftAgility = parseStatValue(left.stats?.agility);
  const rightAgility = parseStatValue(right.stats?.agility);
  const leftStamina = parseStatValue(left.stats?.stamina);
  const rightStamina = parseStatValue(right.stats?.stamina);
  const leftTotal = leftPower + leftAgility + leftStamina;
  const rightTotal = rightPower + rightAgility + rightStamina;

  if (rightTotal !== leftTotal) {
    return rightTotal - leftTotal;
  }

  if (rightPower !== leftPower) {
    return rightPower - leftPower;
  }

  if (rightAgility !== leftAgility) {
    return rightAgility - leftAgility;
  }

  if (rightStamina !== leftStamina) {
    return rightStamina - leftStamina;
  }

  return left.name.localeCompare(right.name);
}

export function compareByName(left, right) {
  return left.name.localeCompare(right.name);
}

export function compareByRarityThenName(left, right) {
  const rarityCompare = (left.rarity || "").localeCompare(right.rarity || "");
  if (rarityCompare !== 0) {
    return rarityCompare;
  }

  return left.name.localeCompare(right.name);
}

export function compareBySingleStat(statKey) {
  return (left, right) => {
    const leftValue = parseStatValue(left.stats?.[statKey]);
    const rightValue = parseStatValue(right.stats?.[statKey]);

    if (rightValue !== leftValue) {
      return rightValue - leftValue;
    }

    return compareByStats(left, right);
  };
}

export function sortNodes(nodes, sortOrder) {
  const copy = [...nodes];

  switch (sortOrder) {
    case "power":
      return copy.sort(compareBySingleStat("power"));
    case "agility":
      return copy.sort(compareBySingleStat("agility"));
    case "stamina":
      return copy.sort(compareBySingleStat("stamina"));
    case "name":
      return copy.sort(compareByName);
    case "rarity":
      return copy.sort(compareByRarityThenName);
    case "stats":
    default:
      return copy.sort(compareByStats);
  }
}
export function multiplyQuantity(quantity, multiplier) {
  const left = Number(quantity || 1);
  const right = Number(multiplier || 1);

  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    return String(quantity || multiplier || "1");
  }

  return String(left * right);
}

export function collectLeafRequirements(nodeKey, nodeIndex, multiplier = "1") {
  const node = nodeIndex[nodeKey];
  if (!node) return [];

  if (!node.requirements?.length) {
    return [
      {
        type: "familiar",
        name: node.name,
        quantity: multiplier,
      },
    ];
  }

  return node.requirements.flatMap((requirement) => {
    const nextQuantity = multiplyQuantity(requirement.quantity, multiplier);

    if (
      (requirement.type === "familiar" || requirement.type === "fusion") &&
      requirement.nodeKey &&
      nodeIndex[requirement.nodeKey]
    ) {
      return collectLeafRequirements(
        requirement.nodeKey,
        nodeIndex,
        nextQuantity,
      );
    }

    if (requirement.type === "fusion") {
      return [];
    }

    return [
      {
        type: requirement.type,
        name: requirement.name,
        quantity: nextQuantity,
      },
    ];
  });
}

export function formatLeafRequirements(node, nodeIndex) {
  if (!node || node.type !== "fusion") {
    return "";
  }

  const totals = new Map();

  for (const item of collectLeafRequirements(node.nodeKey, nodeIndex)) {
    const key = `${item.type}:${item.name}`;
    const current = totals.get(key);
    const nextQuantity = Number(item.quantity || 0);

    if (
      current &&
      Number.isFinite(nextQuantity) &&
      Number.isFinite(Number(current.quantity))
    ) {
      current.quantity = String(Number(current.quantity) + nextQuantity);
      continue;
    }

    if (current) {
      current.quantity = `${current.quantity} + ${item.quantity}`;
      continue;
    }

    totals.set(key, {
      type: item.type,
      name: item.name,
      quantity: item.quantity,
    });
  }

  return [...totals.values()]
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(" + ");
}
export function sortPets(pets, sortOrder) {
  const copy = [...pets];

  switch (sortOrder) {
    case "rarity":
      return copy.sort(compareByRarityThenName);
    case "avg":
      return copy.sort((left, right) => {
        if (right.avgValue !== left.avgValue) {
          return right.avgValue - left.avgValue;
        }
        return left.name.localeCompare(right.name);
      });
    case "name":
    default:
      return copy.sort(compareByName);
  }
}
