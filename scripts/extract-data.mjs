import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "src", "data", "generated");
const FAMILIARS_OUTPUT_FILE = path.join(OUTPUT_DIR, "familiars.json");
const MATERIALS_OUTPUT_FILE = path.join(OUTPUT_DIR, "materials.json");
const PETS_OUTPUT_FILE = path.join(OUTPUT_DIR, "pets.json");
const MOUNTS_OUTPUT_FILE = path.join(OUTPUT_DIR, "mounts.json");
const EQUIPMENTS_OUTPUT_FILE = path.join(OUTPUT_DIR, "equipments.json");
const ENCHANTS_OUTPUT_FILE = path.join(OUTPUT_DIR, "enchants.json");
const AUGMENTS_OUTPUT_FILE = path.join(OUTPUT_DIR, "augments.json");
const RUNES_OUTPUT_FILE = path.join(OUTPUT_DIR, "runes.json");

const htmlFiles = {
  dungeon: path.join(ROOT, "htmls", "dungeon-familiars.html"),
  fusion: path.join(ROOT, "htmls", "fusion-familiar.html"),
  materials: path.join(ROOT, "htmls", "materials.html"),
  stable: path.join(ROOT, "htmls", "familiar-stable.html"),
  pets: path.join(ROOT, "htmls", "pets.html"),
  mounts: path.join(ROOT, "htmls", "mounts.html"),
  equipmentsCommon: path.join(ROOT, "htmls", "equipments-common.html"),
  equipmentsRare: path.join(ROOT, "htmls", "equipments-rare.html"),
  equipmentsEpic: path.join(ROOT, "htmls", "equipments-epic.html"),
  equipmentsLegendary: path.join(ROOT, "htmls", "equipments-legendary.html"),
  equipmentsMythic: path.join(ROOT, "htmls", "equipments-mythic.html"),
  equipmentsSet: path.join(ROOT, "htmls", "equipments-set.html"),
  equipmentsAncient: path.join(ROOT, "htmls", "equipments-ancient.html"),
  enchants: path.join(ROOT, "htmls", "enchants.html"),
  augments: path.join(ROOT, "htmls", "augments.html"),
  runes: path.join(ROOT, "htmls", "runes.html")
};

const ENTITY_MAP = {
  "&amp;": "&",
  "&quot;": "\"",
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
  "&ndash;": "-",
  "&mdash;": "-",
  "&rsquo;": "'",
  "&lsquo;": "'",
  "&ldquo;": "\"",
  "&rdquo;": "\""
};

function readLines(filePath) {
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/);
}

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITY_MAP[entity] ?? entity);
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " "));
}

function cleanText(value = "") {
  return stripTags(value).replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findHeadingContexts(lines) {
  const h2 = [];
  const h3 = [];

  lines.forEach((line, index) => {
    const h2Match = line.match(/<h2><span class="mw-headline" id="[^"]+">([^<]+)</);
    const h3Match = line.match(/<h3><span class="mw-headline" id="[^"]+">([^<]+)</);

    if (h2Match) {
      h2.push({ line: index + 1, text: cleanText(h2Match[1]) });
    }

    if (h3Match) {
      h3.push({ line: index + 1, text: cleanText(h3Match[1]) });
    }
  });

  return { h2, h3 };
}

function getCurrentHeading(headings, lineNumber) {
  let current = "";

  for (const heading of headings) {
    if (heading.line > lineNumber) {
      break;
    }

    current = heading.text;
  }

  return current;
}

function findCaption(lines, startLine) {
  for (let i = startLine - 1; i >= 0 && i >= startLine - 30; i -= 1) {
    const captionMatch = lines[i].match(/<caption>([^<]+)/);
    if (captionMatch) {
      return cleanText(captionMatch[1]);
    }
  }

  return "";
}

function firstMatch(chunk, pattern) {
  const match = chunk.match(pattern);
  return match ? cleanText(match[1]) : "";
}

function extractRows(chunk) {
  return [...chunk.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
}

function extractCells(row) {
  return [...row.matchAll(/<td(?: [^>]*)?>([\s\S]*?)<\/td>/g)].map((match) => match[1]);
}

function extractRowId(line = "") {
  const match = line.match(/<tr id="([^"]+)">/);
  return match ? match[1] : "";
}

function firstImageUrl(chunk, predicate) {
  const regex = /(?:data-src|src)="([^"]+)"/g;
  let match;

  while ((match = regex.exec(chunk))) {
    const url = match[1];
    if (url.startsWith("data:")) {
      continue;
    }
    if (predicate(url, chunk.slice(Math.max(0, match.index - 120), match.index + 200))) {
      return url;
    }
  }

  return "";
}

function assetInfoFromUrl(url = "") {
  if (!url) {
    return { fileName: "", publicPath: "" };
  }

  let fileName = "";

  try {
    const parts = new URL(url).pathname.split("/");
    const revisionIndex = parts.indexOf("revision");
    fileName = decodeURIComponent(revisionIndex > 0 ? parts[revisionIndex - 1] : parts.at(-1));
  } catch {
    fileName = path.basename(url.split("?")[0]);
  }

  let folder = "misc";
  if (fileName.startsWith("Familiar_") || fileName.startsWith("Fusion_")) folder = "familiars";
  if (fileName.startsWith("Material_")) folder = "materials";
  if (fileName.startsWith("Custom_")) folder = "rarity";
  if (fileName.startsWith("UI")) folder = "ui";
  if (/^(Mainhand|Offhand|Head|Body|Neck|Ring)_/i.test(fileName)) folder = "equipments";
  if (fileName.startsWith("Enchant_")) folder = "enchants";
  if (fileName.startsWith("Augment_")) folder = "augments";
  if (fileName.startsWith("Rune_")) folder = "runes";

  return {
    fileName,
    publicPath: fileName ? `/assets/${folder}/${fileName}` : ""
  };
}

function rarityFromIconUrl(url = "") {
  if (!url) return "";

  const match = url.match(/Custom_Icon([A-Za-z]+)\.png/i);
  return match ? cleanText(match[1]) : "";
}

function extractAnchorTexts(fragment = "") {
  return [...fragment.matchAll(/<a [^>]*>(.*?)<\/a>/g)].map((match) => cleanText(match[1])).filter(Boolean);
}

function extractListItems(fragment = "") {
  const items = [...fragment.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => cleanText(match[1]));
  return items.length ? items : [cleanText(fragment)].filter(Boolean);
}

function normalizeKey(value = "") {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[%()]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseSkillHeader(value = "") {
  const text = cleanText(value);
  if (!text) {
    return { name: "", sp_consume: 0 };
  }

  const match = text.match(/^(.*?)(?:\s*\((\d+)SP\))?$/i);
  return {
    name: cleanText(match?.[1] || text),
    sp_consume: Number(match?.[2] || 0)
  };
}

function parseFamiliarBonus(value = "") {
  const text = cleanText(value);
  if (!text) return {};

  const bonuses = {};
  for (const part of text.split(/\s*,\s*/)) {
    const match = part.match(/^([+-]?\d+(?:\.\d+)?%)\s+(.+)$/i);
    if (!match) continue;
    bonuses[normalizeKey(match[2])] = match[1];
  }

  return bonuses;
}

function parseSkills(row1, row2, row3, options = {}) {
  const headerStart = options.headerStart ?? 4;
  const detailStart = options.detailStart ?? 3;
  const skillCount = Math.max(0, row1.length - headerStart);
  const skills = [];

  for (let index = 0; index < skillCount; index += 1) {
    const header = parseSkillHeader(row1[headerStart + index] || "");
    if (!header.name) continue;

    skills.push({
      name: header.name,
      sp_consume: header.sp_consume,
      description: cleanText(row2[detailStart + index] || ""),
      effect: cleanText(row3[detailStart + index] || "")
    });
  }

  return skills;
}

function buildAbilityCompatibility(skills) {
  return {
    attack: skills[0] ? `${skills[0].name} (${skills[0].sp_consume}SP)` : "",
    special: skills[1] ? `${skills[1].name} (${skills[1].sp_consume}SP)` : "",
    staminaEffect: skills[0]?.description || "",
    specialEffect: skills[1]?.description || "",
    agilityEffect: skills[0]?.effect || "",
    agilitySpecialEffect: skills[1]?.effect || ""
  };
}

function parseRecipeRequirements(fragment = "") {
  const segments = fragment
    .split(/\s+\+\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return segments.map((segment) => {
    const text = cleanText(segment);
    const goldMatch = text.match(/^(\d+(?:\.\d+)?(?:K|M)?)\s+Gold$/i);
    if (goldMatch) {
      return {
        type: "gold",
        quantity: goldMatch[1],
        name: "Gold",
        slug: "gold"
      };
    }

    const quantityMatch = text.match(/^(\d+(?:\.\d+)?(?:K|M)?)\s+(.+)$/i);
    const quantity = quantityMatch ? quantityMatch[1] : "1";
    const name = quantityMatch ? quantityMatch[2] : text;
    const hrefMatch = segment.match(/href="([^"]+)"/i);
    const href = hrefMatch?.[1] || "";
    let type = "unknown";

    if (/\/wiki\/Familiar#/i.test(href)) {
      type = "familiar";
    } else if (/\/wiki\/Materials/i.test(href) || /\/wiki\/Craft/i.test(href)) {
      type = "material";
    } else if (/href="#/i.test(segment) || /mw-selflink-fragment/i.test(segment)) {
      type = "fusion";
    } else if (/<a /i.test(segment)) {
      type = "fusion";
    }

    return {
      type,
      quantity,
      name: cleanText(name),
      slug: slugify(name)
    };
  });
}

function parseDungeon(lines) {
  const headings = findHeadingContexts(lines);
  const records = [];
  let currentCaption = "";

  for (let i = 0; i < lines.length; i += 1) {
    const captionMatch = lines[i].match(/<caption>([^<]+)/);
    if (captionMatch) {
      currentCaption = cleanText(captionMatch[1]);
      continue;
    }

    const rowId = extractRowId(lines[i]);
    if (!rowId) continue;

    const nextRecordIndex = lines.findIndex((line, index) => index > i && extractRowId(line));
    const endIndex = nextRecordIndex === -1 ? Math.min(lines.length, i + 40) : nextRecordIndex;
    const chunk = lines.slice(i, endIndex).join("\n");
    const rows = extractRows(chunk);
    const row1 = extractCells(rows[0] || "");
    const row2 = extractCells(rows[1] || "");
    const row3 = extractCells(rows[2] || "");
    const name = firstMatch(row1[1] || "", /<b>([^<]+)<\/b>/);
    const role = firstMatch(row1[1] || "", /\(([^)]+)\)/);
    const imageUrl = firstImageUrl(chunk, (url) => url.includes("/Familiar_"));
    const rarityIconUrl = firstImageUrl(chunk, (url) => url.includes("/Custom_Icon"));
    const rarityLabel = rarityFromIconUrl(rarityIconUrl) || currentCaption.replace(/\s+Familiars$/i, "");
    const locationText = cleanText(row3[0] || "");
    const locationLinks = extractAnchorTexts(row3[0] || "");
    const skills = parseSkills(row1, row2, row3);
    const power = cleanText(row1[3] || "");
    const stamina = cleanText(row2[1] || "");
    const agility = cleanText(row3[2] || "");

    records.push({
      slug: slugify(name),
      nodeKey: `familiar:${rowId}`,
      sourceId: rowId,
      type: "familiar",
      name,
      role,
      rarity: rarityLabel,
      imageUrl,
      imagePath: assetInfoFromUrl(imageUrl).publicPath,
      rarityIconUrl,
      rarityIconPath: assetInfoFromUrl(rarityIconUrl).publicPath,
      category: getCurrentHeading(headings.h2, i + 1) || "Familiars",
      subgroup: getCurrentHeading(headings.h3, i + 1),
      locationText,
      locations: locationLinks.length ? locationLinks : locationText.split("/").map((part) => part.trim()).filter(Boolean),
      stats: {
        power,
        stamina,
        agility
      },
      skills,
      abilities: buildAbilityCompatibility(skills)
    });
  }

  return records.filter((record) => record.name);
}

function parseFusion(lines) {
  const headings = findHeadingContexts(lines);
  const records = [];
  let currentCaption = "";

  for (let i = 0; i < lines.length; i += 1) {
    const captionMatch = lines[i].match(/<caption>([^<]+)/);
    if (captionMatch) {
      currentCaption = cleanText(captionMatch[1]);
      continue;
    }

    const rowId = extractRowId(lines[i]);
    if (!rowId) continue;

    const nextRecordIndex = lines.findIndex((line, index) => index > i && extractRowId(line));
    const endIndex = nextRecordIndex === -1 ? Math.min(lines.length, i + 45) : nextRecordIndex;
    const chunk = lines.slice(i, endIndex).join("\n");
    const rows = extractRows(chunk);
    const row1 = extractCells(rows[0] || "");
    const row2 = extractCells(rows[1] || "");
    const row3 = extractCells(rows[2] || "");
    const name = firstMatch(row1[1] || "", /<b>([^<]+)<\/b>/);
    const role = firstMatch(row1[1] || "", /\(([^)]+)\)/);
    const requirements = parseRecipeRequirements(row3[0] || "");
    const components = requirements.filter((item) => item.type !== "gold").map((item) => item.name);
    const imageUrl = firstImageUrl(chunk, (url) => url.includes("/Fusion_"));
    const rarityIconUrl = firstImageUrl(chunk, (url) => url.includes("/Custom_Icon"));
    const h2 = getCurrentHeading(headings.h2, i + 1);
    const h3 = getCurrentHeading(headings.h3, i + 1);
    const skills = parseSkills(row1, row2, row3);
    const power = cleanText(row1[3] || "");
    const stamina = cleanText(row2[2] || "");
    const agility = cleanText(row3[2] || "");

    records.push({
      slug: slugify(name),
      nodeKey: `fusion:${rowId}`,
      sourceId: rowId,
      type: "fusion",
      name,
      role,
      rarity: rarityFromIconUrl(rarityIconUrl) || currentCaption.replace(/\s+Fusions$/i, ""),
      collection: h2,
      subgroup: h3,
      imageUrl,
      imagePath: assetInfoFromUrl(imageUrl).publicPath,
      rarityIconUrl,
      rarityIconPath: assetInfoFromUrl(rarityIconUrl).publicPath,
      recipeText: cleanText(row3[0] || ""),
      requirements,
      fusion_components: requirements.filter((item) => item.type !== "gold"),
      components,
      componentSlugs: components.map(slugify),
      familiar_bonus: parseFamiliarBonus(row2[0] || ""),
      stats: {
        power,
        stamina,
        agility
      },
      skills,
      abilities: buildAbilityCompatibility(skills)
    });
  }

  return records.filter((record) => record.name && record.components.length);
}

function findMaterialSections(lines) {
  const sections = [];

  for (let i = 0; i < lines.length - 1; i += 1) {
    if (!extractRowId(lines[i])) continue;
    const next = lines[i + 1].match(/<td colspan="4"[^>]*><b><u>([^<]+)<\/u>/);
    if (next) {
      sections.push({ line: i + 1, text: cleanText(next[1]) });
    }
  }

  return sections;
}

function parseMaterials(lines) {
  const headings = findHeadingContexts(lines);
  const sections = findMaterialSections(lines);
  const materials = [];

  for (let i = 0; i < lines.length; i += 1) {
    const rowId = extractRowId(lines[i]);
    if (!rowId) continue;

    if (lines[i + 1]?.includes('colspan="4"')) continue;

    const endIndex = lines.findIndex((line, index) => index > i && extractRowId(line));
    const chunk = lines.slice(i, endIndex === -1 ? i + 20 : endIndex).join("\n");
    const rows = extractRows(chunk);
    const cells = extractCells(rows[0] || "");
    const imageUrl = firstImageUrl(chunk, (url) => url.includes("/Material_"));
    if (!imageUrl) continue;

    const name = cleanText(cells[2] || "");
    const rarityIconUrl = firstImageUrl(chunk, (url) => url.includes("/Custom_Icon"));
    const sourceHtml = cells[3] || "";
    const sourceNotes = extractListItems(sourceHtml);
    const materialSection = getCurrentHeading(sections, i + 1);

    materials.push({
      slug: slugify(name),
      nodeKey: `material:${rowId}`,
      sourceId: rowId,
      name,
      group: getCurrentHeading(headings.h2, i + 1) || "Materials",
      tier: materialSection,
      rarity: rarityFromIconUrl(rarityIconUrl),
      imageUrl,
      imagePath: assetInfoFromUrl(imageUrl).publicPath,
      rarityIconUrl,
      rarityIconPath: assetInfoFromUrl(rarityIconUrl).publicPath,
      sourceNotes
    });
  }

  return materials;
}

function parseStable(lines) {
  const description = lines.find((line) => line.includes('<meta name="description"'))?.match(/content="([^"]+)"/)?.[1] || "";

  return {
    description: decodeHtml(description)
  };
}

function parseAvgNumber(value = "") {
  const match = String(value).match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function buildPalette(rarity, category) {
  const rarityKey = String(rarity || "").toLowerCase();
  const categoryKey = String(category || "").toLowerCase();
  const rarityMap = {
    common: ["#d8ffe0", "#7ac288"],
    rare: ["#dff1ff", "#6196e5"],
    epic: ["#ffe2d1", "#d67e43"],
    legendary: ["#fff1b9", "#d1a02b"],
    mythic: ["#ffd7d7", "#dc4f4f"],
    set: ["#d9fbff", "#3da8b8"],
    guild: ["#e7f8f3", "#2c9375"],
    event: ["#f3e6ff", "#8d62c4"]
  };
  const categoryMap = {
    offensive: "#b6512d",
    defensive: "#1f7a72",
    craftable: "#8d5f17",
    guild_shop: "#3c8065",
    event: "#6f4cb4"
  };
  const [top, bottom] = rarityMap[rarityKey] || rarityMap[categoryKey] || ["#fffaf1", "#d9c9b6"];
  const accent = categoryMap[categoryKey] || "#6a4b33";
  return { top, bottom, accent };
}

function createSvgAsset(pet) {
  const { top, bottom, accent } = buildPalette(pet.rarity, pet.category);
  const initials = pet.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">${pet.name}</title>
  <desc id="desc">${pet.rarity} ${pet.category.replace(/_/g, " ")} pet placeholder</desc>
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${top}"/>
      <stop offset="100%" stop-color="${bottom}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="38" fill="url(#bg)"/>
  <circle cx="128" cy="104" r="58" fill="rgba(255,255,255,0.45)"/>
  <path d="M58 210c14-34 42-52 70-52s56 18 70 52" fill="rgba(255,255,255,0.42)"/>
  <text x="128" y="122" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="54" font-weight="700" fill="${accent}">${initials}</text>
  <text x="128" y="188" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="18" fill="${accent}">${pet.rarity}</text>
</svg>
`;
}







function getCaption(table = "") {
  const match = table.match(/<caption>([\s\S]*?)<\/caption>/);
  return cleanText((match?.[1] || "").replace(/<button[\s\S]*?<\/button>/i, ""));
}



function imageInfo(fragment = "") {
  const dataSrcMatch = fragment.match(/data-src="([^"]+)"/i);
  const srcMatch = fragment.match(/\bsrc="([^"]+)"/i);
  const altMatch = fragment.match(/alt="([^"]+)"/i);
  const keyMatch = fragment.match(/data-image-key="([^"]+)"/i);
  const nameMatch = fragment.match(/data-image-name="([^"]+)"/i);
  const imageUrl = dataSrcMatch?.[1] || srcMatch?.[1] || "";

  return {
    imageUrl,
    imageAlt: decodeHtml(altMatch?.[1] || ""),
    fileName: decodeHtml(keyMatch?.[1] || nameMatch?.[1] || "")
  };
}

function getSectionBlocks(html) {
  const headings = [...html.matchAll(/<h2><span class="mw-headline" id="([^"]+)">([^<]+)<\/span>/g)].map((match) => ({
    id: match[1],
    title: cleanText(match[2]),
    index: match.index
  }));

  const wanted = ["Guild_Shop", "Offensive", "Defensive", "Craftable", "Event"];
  const sections = {};

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    if (!wanted.includes(heading.id)) {
      continue;
    }

    const nextHeading = headings.slice(index + 1).find((candidate) => wanted.includes(candidate.id)) || null;
    sections[heading.id] = {
      title: heading.title,
      html: html.slice(heading.index, nextHeading ? nextHeading.index : html.length)
    };
  }

  return sections;
}

function inferEventRarity(imageAlt = "") {
  const match = cleanText(imageAlt).match(/^Pet\s+(Common|Rare|Epic|Legendary)\s+/i);
  return match ? cleanText(match[1]) : "Event";
}

function basePetRecord({ name, description, upgrade, power, avg, source, imageUrl, fileName, imageAlt, category, subgroup, rarity, canReforge, isExclusive }) {
  const safeFileName = fileName || `${imageAlt || name}.png`.replace(/[^\w.-]+/g, "_");
  const assetStem = safeFileName.replace(/\.[^.]+$/, "");
  const slugBase = [name, category, rarity, subgroup].filter(Boolean).join(" ");

  return {
    slug: slugify(slugBase),
    nodeKey: `pet:${slugify(slugBase)}`,
    name: cleanText(name),
    imageLabel: cleanText(imageAlt),
    imageUrl,
    sourceImageFileName: safeFileName,
    imagePath: `/assets/pets/${safeFileName}`,
    category,
    subgroup,
    rarity,
    description: cleanText(description),
    upgrade: cleanText(upgrade),
    power: cleanText(power),
    avg: cleanText(avg),
    avgValue: parseAvgNumber(avg),
    source: cleanText(source),
    canReforge,
    isExclusive
  };
}

function parsePairedTable(table, options) {
  const rows = extractRows(table).slice(1);
  const pets = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const cells = extractCells(row);

    if (cells.length < options.expectedCells) {
      continue;
    }

    let source = "";
    const nextRow = rows[index + 1] || "";
    const nextCells = extractCells(nextRow);
    const nextFirstCell = cleanText(nextCells[0] || "");

    if (
      nextCells.length &&
      !/<img\b/i.test(nextCells[0] || "") &&
      nextFirstCell &&
      !/^name$/i.test(nextFirstCell)
    ) {
      source = nextFirstCell;
      index += 1;
    }

    const { imageUrl, imageAlt, fileName } = imageInfo(cells[0]);
    const name = cleanText(cells[1]);
    const description = cleanText(cells[2]);
    const rarity = typeof options.rarity === "function" ? options.rarity({ row, cells, imageAlt }) : options.rarity;

    const record = basePetRecord({
      name,
      description,
      upgrade: options.hasUpgrade ? cleanText(cells[3]) : "",
      power: options.hasUpgrade ? cleanText(cells[4]) : cleanText(cells[3]),
      avg: options.hasUpgrade ? cleanText(cells[5]) : cleanText(cells[4]),
      source,
      imageUrl,
      fileName,
      imageAlt,
      category: options.category,
      subgroup: options.subgroup,
      rarity,
      canReforge: options.canReforge,
      isExclusive: options.isExclusive
    });

    pets.push(record);
  }

  return pets;
}

function parseGuild(section) {
  const table = extractTables(section.html)[0] || "";

  return parsePairedTable(table, {
    expectedCells: 5,
    hasUpgrade: false,
    category: "guild_shop",
    subgroup: "guild shop",
    rarity: ({ row }) => {
      const match = row.match(/<tr class="([^"]+)"/i);
      return cleanText(match?.[1] || "Guild");
    },
    canReforge: true,
    isExclusive: false
  });
}

function parseRarityTables(section, category) {
  return extractTables(section.html).flatMap((table) => {
    const caption = getCaption(table);
    if (!caption) return [];

    return parsePairedTable(table, {
      expectedCells: 6,
      hasUpgrade: true,
      category,
      subgroup: category,
      rarity: caption,
      canReforge: true,
      isExclusive: false
    });
  });
}

function parseSetRows(section, category) {
  const match = section.html.match(
    /<tr class="set">([\s\S]*?<img alt="Pet Karlorr"[\s\S]*?)<\/tr>\s*<tr class="set">([\s\S]*?)<\/tr>/i
  );

  if (!match) {
    return [];
  }

  const cells = extractCells(match[1]);
  const sourceCells = extractCells(match[2]);
  if (cells.length < 6) {
    return [];
  }

  const { imageUrl, imageAlt, fileName } = imageInfo(cells[0]);

  return [
    basePetRecord({
      name: cleanText(cells[1]),
      description: cleanText(cells[2]),
      upgrade: cleanText(cells[3]),
      power: cleanText(cells[4]),
      avg: cleanText(cells[5]),
      source: cleanText(sourceCells[0] || ""),
      imageUrl,
      fileName,
      imageAlt,
      category,
      subgroup: category,
      rarity: "Set",
      canReforge: true,
      isExclusive: false
    })
  ];
}

function parseCraftable(section) {
  const table = extractTables(section.html)[0] || "";
  const rows = extractRows(table).slice(1);
  const pets = [];
  let subgroup = "defensive";

  for (const row of rows) {
    const cells = extractCells(row);
    if (!cells.length) continue;

    if (cells.length === 1) {
      subgroup = cleanText(cells[0]).toLowerCase();
      continue;
    }

    if (cells.length < 6) {
      continue;
    }

    const { imageUrl, imageAlt, fileName } = imageInfo(cells[0]);
    pets.push(
      basePetRecord({
        name: cleanText(cells[1]),
        description: cleanText(cells[2]),
        upgrade: cleanText(cells[3]),
        power: cleanText(cells[4]),
        avg: cleanText(cells[5]),
        source: "Craft",
        imageUrl,
        fileName,
        imageAlt,
        category: "craftable",
        subgroup,
        rarity: "Mythic",
        canReforge: true,
        isExclusive: false
      })
    );
  }

  return pets;
}

function parseEvent(section) {
  const table = extractTables(section.html)[0] || "";

  return parsePairedTable(table, {
    expectedCells: 6,
    hasUpgrade: true,
    category: "event",
    subgroup: "event",
    rarity: ({ imageAlt }) => inferEventRarity(imageAlt),
    canReforge: false,
    isExclusive: true
  });
}

function getMetaDescription(html = "") {
  const match = html.match(/<meta name="description" content="([^"]+)"/i);
  return decodeHtml(match?.[1] || "");
}

function buildPayload(html) {
  const sections = getSectionBlocks(html);
  const pets = [
    ...parseGuild(sections.Guild_Shop),
    ...parseRarityTables(sections.Offensive, "offensive"),
    ...parseSetRows(sections.Offensive, "offensive"),
    ...parseRarityTables(sections.Defensive, "defensive"),
    ...parseCraftable(sections.Craftable),
    ...parseEvent(sections.Event)
  ]
    .filter((pet, index, list) => list.findIndex((candidate) => candidate.nodeKey === pet.nodeKey) === index)
    .sort((left, right) => {
      if (right.avgValue !== left.avgValue) {
        return right.avgValue - left.avgValue;
      }
      return left.name.localeCompare(right.name);
    });

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      pets: pets.length,
      guildShop: pets.filter((pet) => pet.category === "guild_shop").length,
      offensive: pets.filter((pet) => pet.category === "offensive").length,
      defensive: pets.filter((pet) => pet.category === "defensive").length,
      craftable: pets.filter((pet) => pet.category === "craftable").length,
      event: pets.filter((pet) => pet.category === "event").length
    },
    notes: {
      description: getMetaDescription(html),
      craftable: "As of April 30, 2020, players are able to craft mythic pets.",
      event: "Event pets listed on the archived page cannot be reforged."
    },
    pets,
    petIndex: Object.fromEntries(pets.map((pet) => [pet.nodeKey, pet]))
  };
}


function extractTables(chunk = "") {
  return [...chunk.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)].map((match) => match[1]);
}

function parseMounts(html) {
  const tables = extractTables(html).slice(0, 2);
  const mounts = [];

  for (const table of tables) {
    const rows = extractRows(table).slice(1);
    for (const row of rows) {
      const cells = extractCells(row);
      if (cells.length < 5) continue;
      
      const rarityMatch = row.match(/<tr class="([^"]+)"/i);
      const rarity = rarityMatch ? rarityMatch[1] : "unknown";
      
      const { imageUrl, fileName, imageAlt } = imageInfo(cells[0] || "");
      const name = cleanText(cells[1]).replace(/\[\d+\]/g, ""); // Remove reference superscripts like [3]
      const moveSpeed = cleanText(cells[2]);
      const bonus = cleanText(cells[3]);
      const uniqueSkill = cleanText(cells[4]);
      let originalCost = "";
      
      if (cells.length >= 6) {
        originalCost = cleanText(cells[5]).replace(/^[\s\S]*?<\/a><\/span>/i, "").trim();
        // Fallback if regex fails to strip image
        if (originalCost.includes("<img")) {
           originalCost = cleanText(originalCost.replace(/<[^>]+>/g, ""));
        }
      }

      mounts.push({
        slug: slugify(name),
        nodeKey: `mount:${slugify(name)}`,
        name,
        rarity: rarity.charAt(0).toUpperCase() + rarity.slice(1),
        imageUrl,
        sourceImageFileName: fileName || (name.replace(/[\s']+/g, "_") + ".png"),
        imagePath: `/assets/mounts/${fileName || (name.replace(/[\s']+/g, "_") + ".png")}`,
        moveSpeed,
        bonus,
        uniqueSkill,
        originalCost
      });
    }
  }

  return mounts;
}

function buildMountsPayload(html) {
  const mounts = parseMounts(html);
  return {
    generatedAt: new Date().toISOString(),
    counts: {
      mounts: mounts.length
    },
    mounts,
    mountIndex: Object.fromEntries(mounts.map((mount) => [mount.nodeKey, mount]))
  };
}

function singularizeSlot(slot = "") {
  const value = cleanText(slot).replace(/\s+/g, " ");
  if (value === "Bodies") return "Body";
  if (value === "Mainhands") return "Mainhand";
  if (value === "Offhands") return "Offhand";
  if (value === "Heads") return "Head";
  if (value === "Necks") return "Neck";
  if (value === "Rings") return "Ring";
  if (value === "Necklace") return "Neck";
  if (/^Mainhand\b/i.test(value)) return "Mainhand";
  if (/^Offhand\b/i.test(value)) return "Offhand";
  return value.replace(/s$/i, "");
}

function titleCase(value = "") {
  const text = cleanText(value).toLowerCase();
  return text.replace(/\b[a-z]/g, (match) => match.toUpperCase());
}

function parseTierValue(value = "") {
  const text = cleanText(value);
  const match = text.match(/\bT(?:ier)?\s*(\d+)\b/i);
  return match ? `T${match[1]}` : text;
}

function parseRootLocation(value = "") {
  const text = cleanText(value);
  const zoneMatch = text.match(/\b([ZR]\d+(?:D\d+)?)\b/i);
  return zoneMatch ? zoneMatch[1].toUpperCase() : "";
}

function parseEquipmentStatValue(value = "") {
  const text = cleanText(value);
  const totalMatch = text.match(/=\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (totalMatch) {
    return Number(totalMatch[1]);
  }

  const numbers = [...text.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  return numbers.length ? numbers.at(-1) : 0;
}

function stripReferences(value = "") {
  return cleanText(value.replace(/\[\d+\]/g, ""));
}

function parseCellAttributes(raw = "") {
  return {
    rowspan: Number(raw.match(/\browspan="(\d+)"/i)?.[1] || 1),
    colspan: Number(raw.match(/\bcolspan="(\d+)"/i)?.[1] || 1),
    className: cleanText(raw.match(/\bclass="([^"]+)"/i)?.[1] || ""),
    id: cleanText(raw.match(/\bid="([^"]+)"/i)?.[1] || "")
  };
}

function cloneTableCell(cell) {
  return {
    ...cell,
    attrs: { ...cell.attrs }
  };
}

function extractTableRowsDetailed(table = "") {
  const rawRows = [...table.matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/g)].map((match) => ({
    attrs: match[1] || "",
    html: match[2] || ""
  }));
  const pending = [];
  const rows = [];

  for (const rawRow of rawRows) {
    const parsedCells = [...rawRow.html.matchAll(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g)].map((match) => ({
      tag: match[1],
      attrs: parseCellAttributes(match[2] || ""),
      html: match[3] || "",
      text: stripReferences(match[3] || "")
    }));
    const row = [];
    let column = 0;

    const flushPending = () => {
      while (pending[column]) {
        const pendingCell = pending[column];
        row.push(cloneTableCell(pendingCell.cell));
        pendingCell.remaining -= 1;
        if (pendingCell.remaining <= 0) {
          delete pending[column];
        }
        column += pendingCell.cell.attrs.colspan;
      }
    };

    for (const cell of parsedCells) {
      flushPending();
      row.push(cell);
      if (cell.attrs.rowspan > 1) {
        for (let offset = 0; offset < cell.attrs.colspan; offset += 1) {
          pending[column + offset] = {
            remaining: cell.attrs.rowspan - 1,
            cell
          };
        }
      }
      column += cell.attrs.colspan;
    }

    flushPending();
    rows.push({
      attrs: parseCellAttributes(rawRow.attrs),
      html: rawRow.html,
      cells: row
    });
  }

  return rows;
}

function createEquipmentRecord(record) {
  const rarity = titleCase(record.rarity);
  const slot = singularizeSlot(record.slot);
  const tier = parseTierValue(record.tier);
  const stats = record.stats || {};
  const powerValue = parseEquipmentStatValue(stats.power);
  const staminaValue = parseEquipmentStatValue(stats.stamina);
  const agilityValue = parseEquipmentStatValue(stats.agility);
  const slugBase = [record.name, rarity, slot, tier || record.location || record.page].filter(Boolean).join(" ");
  const imageUrl = record.imageUrl || "";
  const rarityIconUrl = record.rarityIconUrl || "";
  const imageFileName = assetInfoFromUrl(imageUrl).fileName;

  return {
    slug: slugify(slugBase),
    nodeKey: `equipment:${slugify(slugBase)}`,
    sourceId: record.sourceId || slugify(slugBase),
    name: cleanText(record.name),
    rarity,
    slot,
    tier,
    location: cleanText(record.location || ""),
    rootLocation: parseRootLocation(record.location || ""),
    page: cleanText(record.page || rarity.toLowerCase()),
    section: cleanText(record.section || slot),
    imageUrl,
    imagePath: imageFileName ? `/assets/equipments/${imageFileName}` : "",
    rarityIconUrl,
    rarityIconPath: assetInfoFromUrl(rarityIconUrl).publicPath,
    bonus: cleanText(record.bonus || ""),
    elementBonus: cleanText(record.elementBonus || ""),
    setName: cleanText(record.setName || ""),
    setBonuses: (record.setBonuses || []).map((item) => cleanText(item)).filter(Boolean),
    sourceNotes: (record.sourceNotes || []).map((item) => cleanText(item)).filter(Boolean),
    stats: {
      power: cleanText(stats.power || ""),
      stamina: cleanText(stats.stamina || ""),
      agility: cleanText(stats.agility || "")
    },
    statValues: {
      power: powerValue,
      stamina: staminaValue,
      agility: agilityValue,
      total: powerValue + staminaValue + agilityValue
    }
  };
}

function parseStatRarityPage(html, rarity) {
  const headings = [...html.matchAll(/<h2><span class="mw-headline" id="[^"]+">([^<]+)<\/span>/g)].map((match) => ({
    title: cleanText(match[1]),
    index: match.index
  }));
  const records = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const nextHeading = headings[index + 1];
    const sectionHtml = html.slice(heading.index, nextHeading ? nextHeading.index : html.length);
    const table = extractTables(sectionHtml)[0] || "";
    if (!table) continue;

    const rows = extractRows(table).slice(1);
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 2) {
      const row1 = rows[rowIndex] || "";
      const row2 = rows[rowIndex + 1] || "";
      const cells1 = extractCells(row1);
      const cells2 = extractCells(row2);

      if (cells1.length < 5) continue;

      const hasTypeCell = cells1.length >= 6;
      const statStart = hasTypeCell ? 3 : 2;
      const image = imageInfo(cells1[0] || "");
      const name = firstMatch(cells1[1] || "", /<b>([^<]+)<\/b>/) || cleanText(cells1[1] || "");
      const slot = singularizeSlot(heading.title);
      const type = hasTypeCell ? cleanText(cells1[2] || "") : slot;
      const location = cleanText(cells2[0] || "");

      records.push(
        createEquipmentRecord({
          sourceId: image.fileName || `${name}-${rarity}-${slot}`,
          name,
          rarity,
          slot,
          type,
          section: heading.title,
          page: rarity.toLowerCase(),
          location,
          imageUrl: image.imageUrl,
          stats: {
            power: cleanText(cells1[statStart] || ""),
            stamina: cleanText(cells1[statStart + 1] || ""),
            agility: cleanText(cells1[statStart + 2] || "")
          }
        })
      );
    }
  }

  return records;
}

function parseLegendaryPage(html) {
  const headings = [...html.matchAll(/<h2><span class="mw-headline" id="[^"]+">([^<]+)<\/span>/g)].map((match) => ({
    title: cleanText(match[1]),
    index: match.index
  }));
  const records = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    if (!["Mainhands", "Offhands", "Heads", "Bodies", "Necks", "Rings"].includes(heading.title)) {
      continue;
    }

    const nextHeading = headings[index + 1];
    const sectionHtml = html.slice(heading.index, nextHeading ? nextHeading.index : html.length);
    for (const table of extractTables(sectionHtml)) {
      const caption = getCaption(table);
      const tier = parseTierValue(caption);
      const rows = extractRows(table).slice(1);

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 2) {
        const row1 = rows[rowIndex] || "";
        const row2 = rows[rowIndex + 1] || "";
        const cells1 = extractCells(row1);
        const cells2 = extractCells(row2);

        if (cells1.length < 3) continue;

        const image = imageInfo(cells1[0] || "");
        const name = firstMatch(cells1[1] || "", /<b>([^<]+)<\/b>/) || cleanText(cells1[1] || "");
        const type = cleanText(cells1[2] || "");
        const location = cleanText(cells2[0] || "");

        records.push(
          createEquipmentRecord({
            sourceId: image.fileName || `${name}-legendary-${tier}`,
            name,
            rarity: "Legendary",
            slot: heading.title,
            type,
            tier,
            section: heading.title,
            page: "legendary",
            location,
            imageUrl: image.imageUrl,
            rarityIconUrl: firstImageUrl(table, (url) => url.includes("/Custom_IconLegendary"))
          })
        );
      }
    }
  }

  return records;
}

function parseMythicPage(html) {
  const table = extractTables(html)[0] || "";
  const rows = extractRows(table).slice(1);
  const records = [];

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length < 6) continue;

    const image = imageInfo(cells[0] || "");
    const name = firstMatch(cells[1] || "", /<b>([^<]+)<\/b>/) || cleanText(cells[1] || "");
    const type = cleanText(cells[2] || "");
    const bonusHtml = cells[5] || "";
    const bonus = firstMatch(bonusHtml, /<b>\s*Bonus\s*<\/b>\s*:?\s*([^<]+)/i) || cleanText(bonusHtml.split(/<p>/i)[0] || "");
    const elementBonus = firstMatch(bonusHtml, /<b>\s*Element Bonus\s*<\/b>\s*:?\s*([\s\S]*?)<\/p>/i);

    records.push(
      createEquipmentRecord({
        sourceId: image.fileName || `${name}-mythic`,
        name,
        rarity: "Mythic",
        slot: type.split("-")[0] || type,
        type,
        tier: cleanText(cells[3] || ""),
        location: cleanText(cells[4] || ""),
        section: "Overview",
        page: "mythic",
        imageUrl: image.imageUrl,
        bonus,
        elementBonus,
        rarityIconUrl: firstImageUrl(table, (url) => url.includes("/Custom_IconMythic"))
      })
    );
  }

  return records;
}

function parseAncientPage(html) {
  const table = extractTables(html)[0] || "";
  const rows = extractTableRowsDetailed(table).slice(1);
  const records = [];

  for (const row of rows) {
    const cells = row.cells;
    if (cells.length < 5 || cells[0].tag === "th") continue;

    const image = imageInfo(cells[0].html || "");
    const name = firstMatch(cells[1].html || "", /<b>([^<]+)<\/b>/) || cleanText(cells[1].html || "");
    const type = cleanText(cells[2].html || "");
    const bonus = cleanText(cells[4].html || "");

    records.push(
      createEquipmentRecord({
        sourceId: image.fileName || `${name}-ancient-${type}`,
        name,
        rarity: "Ancient",
        slot: type.split("-")[0] || type,
        type,
        tier: cleanText(cells[3].html || ""),
        section: "Overview",
        page: "ancient",
        imageUrl: image.imageUrl,
        bonus,
        rarityIconUrl: firstImageUrl(html, (url) => url.includes("/Custom_IconAncient"))
      })
    );
  }

  return records;
}

function parseSetPage(html) {
  const table = extractTables(html)[0] || "";
  const rows = extractTableRowsDetailed(table).slice(1);
  const records = [];
  let currentSetName = "";
  let currentSetBonuses = [];

  for (const row of rows) {
    const className = row.attrs.className;
    const cells = row.cells;

    if (/\binfo\b/i.test(className) && row.attrs.id && cells[0]?.tag === "th") {
      currentSetName = cleanText(cells[0].html || "");
      currentSetBonuses = extractListItems(cells[1]?.html || "");
      continue;
    }

    if (/\binfo\b/i.test(className)) {
      continue;
    }

    if (cells.length < 6) {
      continue;
    }

    const image = imageInfo(cells[0].html || "");
    const name = firstMatch(cells[1].html || "", /<b>([^<]+)<\/b>/) || cleanText(cells[1].html || "");
    const type = cleanText(cells[3].html || "");

    records.push(
      createEquipmentRecord({
        sourceId: row.attrs.id || image.fileName || `${name}-set`,
        name,
        rarity: "Set",
        slot: type.split("-")[0] || type,
        type,
        tier: cleanText(cells[4].html || ""),
        location: cleanText(cells[5].html || ""),
        section: "Sets",
        page: "set",
        imageUrl: image.imageUrl,
        setName: currentSetName || cleanText(cells[2].html || ""),
        setBonuses: currentSetBonuses,
        rarityIconUrl: firstImageUrl(html, (url) => url.includes("/Custom_IconSet"))
      })
    );
  }

  return records;
}

function buildEquipmentsPayload(equipmentPages) {
  const equipments = [
    ...parseStatRarityPage(equipmentPages.common, "Common"),
    ...parseStatRarityPage(equipmentPages.rare, "Rare"),
    ...parseStatRarityPage(equipmentPages.epic, "Epic"),
    ...parseLegendaryPage(equipmentPages.legendary),
    ...parseMythicPage(equipmentPages.mythic),
    ...parseSetPage(equipmentPages.set),
    ...parseAncientPage(equipmentPages.ancient)
  ]
    .filter((item) => item.name)
    .filter((item, index, list) => list.findIndex((candidate) => candidate.nodeKey === item.nodeKey) === index)
    .sort((left, right) => {
      if ((right.statValues?.total || 0) !== (left.statValues?.total || 0)) {
        return (right.statValues?.total || 0) - (left.statValues?.total || 0);
      }
      return left.name.localeCompare(right.name);
    });

  const countsByRarity = equipments.reduce((accumulator, item) => {
    const key = item.rarity.toLowerCase();
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      equipments: equipments.length,
      common: countsByRarity.common || 0,
      rare: countsByRarity.rare || 0,
      epic: countsByRarity.epic || 0,
      legendary: countsByRarity.legendary || 0,
      mythic: countsByRarity.mythic || 0,
      set: countsByRarity.set || 0,
      ancient: countsByRarity.ancient || 0
    },
    notes: {
      description: "Static equipment data extracted from archived Bit Heroes equipment pages."
    },
    equipments,
    equipmentIndex: Object.fromEntries(equipments.map((equipment) => [equipment.nodeKey, equipment]))
  };
}

function parseRarityFromText(value = "") {
  const text = cleanText(value);
  const match = text.match(/(Common|Rare|Epic|Legendary|Mythic)/i);
  return match ? titleCase(match[1]) : text;
}

function parseRarityCell(cell = {}) {
  const fromText = parseRarityFromText(cell.html || cell.text || "");
  if (fromText && /^(Common|Rare|Epic|Legendary|Mythic)$/i.test(fromText)) {
    return titleCase(fromText);
  }

  const image = imageInfo(cell.html || "");
  const fromImage = parseRarityFromText(image.imageAlt || image.fileName || "");
  if (fromImage && /^(Common|Rare|Epic|Legendary|Mythic)$/i.test(fromImage)) {
    return titleCase(fromImage);
  }

  return fromText;
}

function splitNameAndEffect(text = "") {
  const clean = cleanText(text);
  const match = clean.match(/^([^:]+):\s*(.+)$/);
  if (!match) {
    return {
      name: clean,
      effect: clean
    };
  }

  return {
    name: cleanText(match[1]),
    effect: cleanText(match[2])
  };
}

function parseRangeLabel(label = "", fallbackIndex = 1) {
  const text = cleanText(label);
  const matches = [...text.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (!matches.length) {
    return { start: fallbackIndex, end: fallbackIndex };
  }

  if (matches.length === 1) {
    return { start: matches[0], end: matches[0] };
  }

  return { start: matches[0], end: matches.at(-1) };
}

function parseHeaderRanges(row, startColumn = 1) {
  const groups = [];
  let fallbackIndex = 1;

  for (const cell of row.cells.slice(startColumn)) {
    const label = cleanText(cell.html || cell.text || "");
    if (!label) continue;
    const range = parseRangeLabel(label, fallbackIndex);
    groups.push({
      label,
      start: range.start,
      end: range.end
    });
    fallbackIndex = range.end + 1;
  }

  return groups;
}

function groupLabelForIndex(groups, index) {
  const found = groups.find((group) => index >= group.start && index <= group.end);
  return found?.label || "";
}

function getOrderedListItems(sectionHtml = "") {
  const orderedList = sectionHtml.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i)?.[1] || "";
  return [...orderedList.matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
}

function firstParagraph(sectionHtml = "") {
  return sectionHtml.match(/<p>([\s\S]*?)<\/p>/i)?.[1] || "";
}

function parseScaleRows(rows, startColumn = 1) {
  return rows.slice(1).map((row) => {
    const rarity = parseRarityCell(row.cells[0] || {});
    const values = row.cells.slice(startColumn).map((cell) => cleanText(cell.html || cell.text || ""));
    return { rarity, values };
  }).filter((row) => row.rarity);
}

function parseEnchantCostTable(table) {
  const rows = extractTableRowsDetailed(table);
  const result = {};

  for (const row of rows.slice(1)) {
    const cells = row.cells;
    if (cells.length < 4) continue;
    const rarity = parseRarityCell(cells[0] || {});
    if (!rarity) continue;
    result[rarity] = {
      baseCost: cleanText(cells[1].html || ""),
      firstReroll: cleanText(cells[2].html || ""),
      secondReroll: cleanText(cells[3].html || "")
    };
  }

  return result;
}

function parseEnchantBonusTable(table) {
  const rows = extractTableRowsDetailed(table);
  const headers = rows[0]?.cells
    .slice(1)
    .map((cell) => parseRarityFromText(cell.html || cell.text || ""))
    .filter(Boolean);
  const rarityOrder = ["Common", "Rare", "Epic", "Legendary", "Mythic"];

  const bonuses = rows.slice(1).map((row) => {
    const cells = row.cells;
    const bonus = cleanText(cells[0]?.html || "");
    const rowValues = Object.fromEntries(
      headers.map((header, index) => [header, cleanText(cells[index + 1]?.html || "")]),
    );
    const values = Object.fromEntries(
      rarityOrder.map((rarity) => [rarity, rowValues[rarity] || ""]),
    );
    return { bonus, values };
  }).filter((item) => item.bonus);

  return {
    headers: rarityOrder,
    bonuses,
  };
}

function parseEnchantsPage(html) {
  const sectionHeading = html.indexOf('<span class="mw-headline" id="Enchants">');
  const sectionHtml = sectionHeading >= 0 ? html.slice(sectionHeading) : "";
  const tables = extractTables(html);
  const costTable = tables.find((table) => /Base cost/i.test(table) && /1st reroll/i.test(table)) || "";
  const meltTable = tables.find((table) => /Base melt/i.test(table) && /1st reroll/i.test(table)) || "";
  const bonusTable = tables.find((table) => /<th>\s*Bonus\s*<\/th>/i.test(table)) || "";
  const enchantTable = extractTables(sectionHtml).find((table) => /<th>\s*Tier\s*<\/th>/i.test(table) && /<th>\s*Obtained in\s*<\/th>/i.test(table)) || "";
  const costByRarity = parseEnchantCostTable(costTable);
  const meltByRarity = parseEnchantCostTable(meltTable);
  const bonusData = parseEnchantBonusTable(bonusTable);
  const enchantRows = extractTableRowsDetailed(enchantTable);
  const enchants = [];
  const enchantRarities = ["Common", "Rare", "Epic", "Legendary"];
  let rarityIndex = 0;

  for (const row of enchantRows.slice(1)) {
    const cells = row.cells;
    if (cells.length < 5) continue;

    const tier = cleanText(cells[0]?.html || "");
    const family = firstMatch(cells[1]?.html || "", /<b>([^<]+)<\/b>/) || cleanText(cells[1]?.html || "");
    const image = imageInfo(cells[2]?.html || "");
    const description = cleanText(cells[3]?.html || "");
    const obtainedIn = cleanText(cells[4]?.html || "");
    const parsedRarity = parseRarityFromText(image.imageAlt || image.fileName || "");
    const rarity = /^(Common|Rare|Epic|Legendary|Mythic)$/i.test(parsedRarity)
      ? titleCase(parsedRarity)
      : enchantRarities[rarityIndex % enchantRarities.length];

    enchants.push({
      slug: slugify([family, tier, rarity].filter(Boolean).join(" ")),
      nodeKey: `enchant:${slugify([family, tier, rarity].filter(Boolean).join(" "))}`,
      name: family,
      tier,
      rarity,
      description,
      obtainedIn,
      imageUrl: image.imageUrl,
      imagePath: assetInfoFromUrl(image.imageUrl).publicPath,
      sourceImageFileName: assetInfoFromUrl(image.imageUrl).fileName,
      baseCost: costByRarity[rarity]?.baseCost || "",
      firstRerollCost: costByRarity[rarity]?.firstReroll || "",
      secondRerollCost: costByRarity[rarity]?.secondReroll || "",
      baseMelt: meltByRarity[rarity]?.baseCost || "",
      firstRerollMelt: meltByRarity[rarity]?.firstReroll || "",
      secondRerollMelt: meltByRarity[rarity]?.secondReroll || ""
    });
    rarityIndex += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      enchants: enchants.length,
      bonuses: bonusData.bonuses.length
    },
    notes: {
      description: getMetaDescription(html)
    },
    enchants,
    bonusHeaders: bonusData.headers,
    bonuses: bonusData.bonuses
  };
}

function parseAugmentSection(sectionHtml, headingTitle) {
  const paragraph = firstParagraph(sectionHtml);
  const image = imageInfo(paragraph);
  const listItems = getOrderedListItems(sectionHtml).map((item) => cleanText(item));
  const table = extractTables(sectionHtml)[0] || "";
  const rows = extractTableRowsDetailed(table);
  const groups = parseHeaderRanges(rows[0] || { cells: [] }, 1);
  const scaleRows = parseScaleRows(rows, 1);
  const title = cleanText(headingTitle).replace(/\s+Augment$/i, "");
  const material = cleanText(paragraph.match(/Materials#([^"]+)/i)?.[1] || "");

  return listItems.map((item, index) => {
    const { name, effect } = splitNameAndEffect(item);
    const effectIndex = index + 1;
    const scaleGroup = groupLabelForIndex(groups, effectIndex);
    const rarityValues = Object.fromEntries(
      scaleRows.map((row) => {
        const groupIndex = groups.findIndex((group) => group.label === scaleGroup);
        return [row.rarity, groupIndex >= 0 ? row.values[groupIndex] || "" : ""];
      })
    );

    return {
      slug: slugify([title, name, effectIndex].join(" ")),
      nodeKey: `augment:${slugify([title, name, effectIndex].join(" "))}`,
      category: title,
      name,
      effect,
      order: effectIndex,
      scaleGroup,
      material,
      imageUrl: image.imageUrl,
      imagePath: assetInfoFromUrl(image.imageUrl).publicPath,
      sourceImageFileName: assetInfoFromUrl(image.imageUrl).fileName,
      rarityValues
    };
  });
}

function parseAugmentsPage(html) {
  const headings = [...html.matchAll(/<h2><span class="mw-headline" id="([^"]+)">([^<]+)<\/span>/g)].map((match) => ({
    id: match[1],
    title: cleanText(match[2]),
    index: match.index
  })).filter((item) => /_Augment$/i.test(item.id));

  const augments = headings.flatMap((heading, index) => {
    const next = headings[index + 1];
    const sectionHtml = html.slice(heading.index, next ? next.index : html.length);
    return parseAugmentSection(sectionHtml, heading.title);
  });

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      augments: augments.length,
      categories: headings.length
    },
    notes: {
      description: getMetaDescription(html)
    },
    augments
  };
}

function parseRuneSection(sectionHtml, headingTitle) {
  const paragraph = firstParagraph(sectionHtml);
  const image = imageInfo(paragraph);
  const listItems = getOrderedListItems(sectionHtml);
  const table = extractTables(sectionHtml)[0] || "";
  const rows = extractTableRowsDetailed(table);
  const groups = parseHeaderRanges(rows[0] || { cells: [] }, 1);
  const scaleRows = parseScaleRows(rows, 1);
  const category = cleanText(headingTitle).replace(/\s+Runes$/i, "");

  return listItems.map((item, index) => {
    const parsed = splitNameAndEffect(item);
    const runeIndex = index + 1;
    const scaleGroup = groupLabelForIndex(groups, runeIndex);
    const groupIndex = groups.findIndex((group) => group.label === scaleGroup);
    const rarityValues = Object.fromEntries(
      scaleRows.map((row) => [row.rarity, groupIndex >= 0 ? row.values[groupIndex] || "" : ""])
    );

    return {
      slug: slugify([category, parsed.name, runeIndex].join(" ")),
      nodeKey: `rune:${slugify([category, parsed.name, runeIndex].join(" "))}`,
      category,
      name: parsed.name,
      effect: parsed.effect,
      order: runeIndex,
      scaleGroup,
      imageUrl: image.imageUrl,
      imagePath: assetInfoFromUrl(image.imageUrl).publicPath,
      sourceImageFileName: assetInfoFromUrl(image.imageUrl).fileName,
      rarityValues
    };
  });
}

function parseRunesPage(html) {
  const headings = [...html.matchAll(/<h2><span class="mw-headline" id="([^"]+)">([^<]+)<\/span>/g)].map((match) => ({
    id: match[1],
    title: cleanText(match[2]),
    index: match.index
  })).filter((item) => /_Runes$/i.test(item.id));

  const runes = headings.flatMap((heading, index) => {
    const next = headings[index + 1];
    const sectionHtml = html.slice(heading.index, next ? next.index : html.length);
    return parseRuneSection(sectionHtml, heading.title);
  });

  return {
    generatedAt: new Date().toISOString(),
    counts: {
      runes: runes.length,
      categories: headings.length
    },
    notes: {
      description: getMetaDescription(html)
    },
    runes
  };
}

function buildData() {
  const dungeonLines = readLines(htmlFiles.dungeon);
  const fusionLines = readLines(htmlFiles.fusion);
  const materialsLines = readLines(htmlFiles.materials);
  const stableLines = readLines(htmlFiles.stable);
  const petsHtml = fs.readFileSync(htmlFiles.pets, "utf8");
  const mountsHtml = fs.readFileSync(htmlFiles.mounts, "utf8");
  const enchantsHtml = fs.readFileSync(htmlFiles.enchants, "utf8");
  const augmentsHtml = fs.readFileSync(htmlFiles.augments, "utf8");
  const runesHtml = fs.readFileSync(htmlFiles.runes, "utf8");
  const equipmentPages = {
    common: fs.readFileSync(htmlFiles.equipmentsCommon, "utf8"),
    rare: fs.readFileSync(htmlFiles.equipmentsRare, "utf8"),
    epic: fs.readFileSync(htmlFiles.equipmentsEpic, "utf8"),
    legendary: fs.readFileSync(htmlFiles.equipmentsLegendary, "utf8"),
    mythic: fs.readFileSync(htmlFiles.equipmentsMythic, "utf8"),
    set: fs.readFileSync(htmlFiles.equipmentsSet, "utf8"),
    ancient: fs.readFileSync(htmlFiles.equipmentsAncient, "utf8")
  };

  const familiars = parseDungeon(dungeonLines);
  const fusions = parseFusion(fusionLines);
  const materials = parseMaterials(materialsLines);
  const stableInfo = parseStable(stableLines);
  const petsPayload = buildPayload(petsHtml);
  const mountsPayload = buildMountsPayload(mountsHtml);
  const equipmentsPayload = buildEquipmentsPayload(equipmentPages);
  const enchantsPayload = parseEnchantsPage(enchantsHtml);
  const augmentsPayload = parseAugmentsPage(augmentsHtml);
  const runesPayload = parseRunesPage(runesHtml);
  const familiarMap = new Map(familiars.map((item) => [item.slug, item]));
  const fusionMap = new Map(fusions.map((item) => [item.slug, item]));
  const materialMap = new Map(materials.map((item) => [item.slug, item]));

  for (const fusion of fusions) {
    fusion.requirements = fusion.requirements.map((requirement) => {
      if (requirement.type === "gold") {
        return requirement;
      }

      if (requirement.type === "material" && materialMap.has(requirement.slug)) {
        return { ...requirement, materialKey: materialMap.get(requirement.slug).nodeKey };
      }

      if (requirement.type === "familiar" && familiarMap.has(requirement.slug)) {
        return { ...requirement, nodeKey: familiarMap.get(requirement.slug).nodeKey };
      }

      if (requirement.type === "fusion" && fusionMap.has(requirement.slug)) {
        return { ...requirement, nodeKey: fusionMap.get(requirement.slug).nodeKey };
      }

      if (materialMap.has(requirement.slug)) {
        return { ...requirement, type: "material", materialKey: materialMap.get(requirement.slug).nodeKey };
      }

      if (familiarMap.has(requirement.slug)) {
        return { ...requirement, type: "familiar", nodeKey: familiarMap.get(requirement.slug).nodeKey };
      }

      if (fusionMap.has(requirement.slug)) {
        return { ...requirement, type: "fusion", nodeKey: fusionMap.get(requirement.slug).nodeKey };
      }

      return requirement;
    });

    fusion.familiarRequirements = fusion.requirements.filter(
      (requirement) => requirement.type === "familiar" || requirement.type === "fusion"
    );
    fusion.materialRequirements = fusion.requirements.filter((requirement) => requirement.type === "material");
    fusion.goldRequirement = fusion.requirements.find((requirement) => requirement.type === "gold") || null;
    fusion.componentSlugs = fusion.familiarRequirements.map((requirement) => requirement.slug);
    fusion.componentKeys = fusion.familiarRequirements.map((requirement) => requirement.nodeKey).filter(Boolean);
  }

  const nodes = [...familiars, ...fusions].map((item) => ({
    ...item,
    usedIn: []
  }));

  const nodeMap = new Map(nodes.map((item) => [item.nodeKey, item]));

  for (const fusion of fusions) {
    for (const componentKey of fusion.componentKeys) {
      const component = nodeMap.get(componentKey);
      if (component) {
        component.usedIn.push(fusion.nodeKey);
      }
    }
  }

  function computeDepth(nodeKey, stack = new Set()) {
    const node = nodeMap.get(nodeKey);
    if (!node || node.type !== "fusion") return 0;
    if (stack.has(nodeKey)) return 0;

    stack.add(nodeKey);
    const depth = 1 + Math.max(0, ...node.componentKeys.map((child) => computeDepth(child, new Set(stack))));
    return depth;
  }

  for (const node of nodes) {
    node.recipeDepth = computeDepth(node.nodeKey);
    node.usedIn.sort((a, b) => {
      const left = nodeMap.get(a)?.name || a;
      const right = nodeMap.get(b)?.name || b;
      return left.localeCompare(right);
    });
  }

  nodes.sort((a, b) => a.name.localeCompare(b.name));
  familiars.sort((a, b) => a.name.localeCompare(b.name));
  fusions.sort((a, b) => a.name.localeCompare(b.name));
  materials.sort((a, b) => a.name.localeCompare(b.name));

  const familiarPayload = {
    generatedAt: new Date().toISOString(),
    counts: {
      familiars: familiars.length,
      fusions: fusions.length,
      materials: materials.length
    },
    stableInfo,
    familiars,
    fusions,
    nodes,
    nodeIndex: Object.fromEntries(nodes.map((node) => [node.nodeKey, node]))
  };

  const materialsPayload = {
    generatedAt: familiarPayload.generatedAt,
    counts: familiarPayload.counts,
    materials,
    materialIndex: Object.fromEntries(materials.map((material) => [material.slug, material]))
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(FAMILIARS_OUTPUT_FILE, `${JSON.stringify(familiarPayload, null, 2)}\n`);
  fs.writeFileSync(MATERIALS_OUTPUT_FILE, `${JSON.stringify(materialsPayload, null, 2)}\n`);
  fs.writeFileSync(PETS_OUTPUT_FILE, `${JSON.stringify(petsPayload, null, 2)}\n`);
  fs.writeFileSync(MOUNTS_OUTPUT_FILE, `${JSON.stringify(mountsPayload, null, 2)}\n`);
  fs.writeFileSync(EQUIPMENTS_OUTPUT_FILE, `${JSON.stringify(equipmentsPayload, null, 2)}\n`);
  fs.writeFileSync(ENCHANTS_OUTPUT_FILE, `${JSON.stringify(enchantsPayload, null, 2)}\n`);
  fs.writeFileSync(AUGMENTS_OUTPUT_FILE, `${JSON.stringify(augmentsPayload, null, 2)}\n`);
  fs.writeFileSync(RUNES_OUTPUT_FILE, `${JSON.stringify(runesPayload, null, 2)}\n`);

  console.log(`Wrote ${FAMILIARS_OUTPUT_FILE}`);
  console.log(`Wrote ${MATERIALS_OUTPUT_FILE}`);
  console.log(`Familiars: ${familiars.length}`);
  console.log(`Fusions: ${fusions.length}`);
  console.log(`Materials: ${materials.length}`);
  console.log(`Pets: ${petsPayload.counts.pets}`);
  console.log(`Mounts: ${mountsPayload.counts.mounts}`);
  console.log(`Equipments: ${equipmentsPayload.counts.equipments}`);
  console.log(`Enchants: ${enchantsPayload.counts.enchants}`);
  console.log(`Augments: ${augmentsPayload.counts.augments}`);
  console.log(`Runes: ${runesPayload.counts.runes}`);
  console.log(`Wrote ${MOUNTS_OUTPUT_FILE}`);
  console.log(`Wrote ${PETS_OUTPUT_FILE}`);
  console.log(`Wrote ${EQUIPMENTS_OUTPUT_FILE}`);
  console.log(`Wrote ${ENCHANTS_OUTPUT_FILE}`);
  console.log(`Wrote ${AUGMENTS_OUTPUT_FILE}`);
  console.log(`Wrote ${RUNES_OUTPUT_FILE}`);
}

buildData();
