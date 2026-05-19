import { formatGeneratedAt } from "../../utils";

export function Footer({
  familiarData,
  petsData,
  equipmentsData,
  enchantsData,
  augmentsData,
  runesData,
}) {
  return (
    <footer className="footer-note">
      {/* <p>{familiarData.stableInfo.description}</p>
      <p>{petsData.notes.description}</p>
      <p>{equipmentsData?.notes?.description}</p>
      <p>{enchantsData?.notes?.description}</p>
      <p>{augmentsData?.notes?.description}</p>
      <p>{runesData?.notes?.description}</p> */}
      <p>
        Generated from static snapshots on{" "}
        {formatGeneratedAt(familiarData.generatedAt)}.
      </p>
    </footer>
  );
}
