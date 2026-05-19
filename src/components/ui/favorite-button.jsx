import { PanelButton } from "./panel-button";

export function FavoriteButton({ active, onToggle }) {
  return (
    <PanelButton
      className={active ? "active" : ""}
      onClick={onToggle}
    >
      {active ? "Favorited" : "Add Favorite"}
    </PanelButton>
  );
}
