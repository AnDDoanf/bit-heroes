import familiarData from "src/data/generated/familiars.json";
import materialData from "src/data/generated/materials.json";
import petsData from "src/data/generated/pets.json";
import mountsData from "src/data/generated/mounts.json";
import equipmentsData from "src/data/generated/equipments.json";
import enchantsData from "src/data/generated/enchants.json";
import augmentsData from "src/data/generated/augments.json";
import runesData from "src/data/generated/runes.json";
import FamiliarBrowser from "src/components/familiar-browser";

export default function Page() {
  return (
    <FamiliarBrowser
      familiarData={familiarData}
      materialData={materialData}
      petsData={petsData}
      mountsData={mountsData}
      equipmentsData={equipmentsData}
      enchantsData={enchantsData}
      augmentsData={augmentsData}
      runesData={runesData}
    />
  );
}
