import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FAMILIARS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "familiars.json");
const MATERIALS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "materials.json");
const PETS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "pets.json");
const MOUNTS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "mounts.json");
const EQUIPMENTS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "equipments.json");
const ENCHANTS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "enchants.json");
const AUGMENTS_DATA_FILE = path.join(ROOT, "src", "data", "generated", "augments.json");
const RUNES_DATA_FILE = path.join(ROOT, "src", "data", "generated", "runes.json");
const PUBLIC_DIR = path.join(ROOT, "public");

function toPairs(items, urlKey, pathKey) {
  return items
    .map((item) => ({ url: item[urlKey], publicPath: item[pathKey] }))
    .filter((item) => item.url && item.publicPath);
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, Buffer.from(arrayBuffer));
}

async function main() {
  const familiarData = JSON.parse(fs.readFileSync(FAMILIARS_DATA_FILE, "utf8"));
  const materialData = JSON.parse(fs.readFileSync(MATERIALS_DATA_FILE, "utf8"));
  const petsData = fs.existsSync(PETS_DATA_FILE) ? JSON.parse(fs.readFileSync(PETS_DATA_FILE, "utf8")) : { pets: [] };
  const mountsData = fs.existsSync(MOUNTS_DATA_FILE) ? JSON.parse(fs.readFileSync(MOUNTS_DATA_FILE, "utf8")) : { mounts: [] };
  const equipmentsData = fs.existsSync(EQUIPMENTS_DATA_FILE) ? JSON.parse(fs.readFileSync(EQUIPMENTS_DATA_FILE, "utf8")) : { equipments: [] };
  const enchantsData = fs.existsSync(ENCHANTS_DATA_FILE) ? JSON.parse(fs.readFileSync(ENCHANTS_DATA_FILE, "utf8")) : { enchants: [] };
  const augmentsData = fs.existsSync(AUGMENTS_DATA_FILE) ? JSON.parse(fs.readFileSync(AUGMENTS_DATA_FILE, "utf8")) : { augments: [] };
  const runesData = fs.existsSync(RUNES_DATA_FILE) ? JSON.parse(fs.readFileSync(RUNES_DATA_FILE, "utf8")) : { runes: [] };
  const assets = [
    ...toPairs(familiarData.nodes, "imageUrl", "imagePath"),
    ...toPairs(familiarData.nodes, "rarityIconUrl", "rarityIconPath"),
    ...toPairs(materialData.materials, "imageUrl", "imagePath"),
    ...toPairs(materialData.materials, "rarityIconUrl", "rarityIconPath"),
    ...petsData.pets
      .filter((pet) => pet.imageUrl && pet.sourceImageFileName)
      .map((pet) => ({
        url: pet.imageUrl,
        publicPath: `/assets/pets/${pet.sourceImageFileName}`
      })),
    ...mountsData.mounts
      .filter((mount) => mount.imageUrl && mount.sourceImageFileName)
      .map((mount) => ({
        url: mount.imageUrl,
        publicPath: `/assets/mounts/${mount.sourceImageFileName}`
      })),
    ...toPairs(equipmentsData.equipments, "imageUrl", "imagePath"),
    ...toPairs(equipmentsData.equipments, "rarityIconUrl", "rarityIconPath"),
    ...toPairs(enchantsData.enchants, "imageUrl", "imagePath"),
    ...toPairs(augmentsData.augments, "imageUrl", "imagePath"),
    ...toPairs(runesData.runes, "imageUrl", "imagePath")
  ];

  const uniqueAssets = [...new Map(assets.map((asset) => [asset.publicPath, asset])).values()];

  for (const asset of uniqueAssets) {
    const destination = path.join(PUBLIC_DIR, asset.publicPath.replace(/^\//, ""));
    if (fs.existsSync(destination)) {
      continue;
    }

    await download(asset.url, destination);
    console.log(`Downloaded ${asset.publicPath}`);
  }

  console.log(`Downloaded ${uniqueAssets.length} assets`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
