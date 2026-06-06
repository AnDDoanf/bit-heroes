import { useState, useEffect, useRef } from "react";

function BookIcon() {
  return (
    <svg
      className="tab-button-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 5.5a2.5 2.5 0 0 1 2.5-2.5h10.5v16H7A2.5 2.5 0 0 0 4.5 21z" />
      <path d="M7 3v16" />
      <path d="M17.5 5H9.5" />
      <path d="M17.5 9H9.5" />
    </svg>
  );
}

export function Header({ activeTab, setActiveTab }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("");
  const lastScrollY = useRef(0);
  const navRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const closeHoverTimer = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };
  const dropdownGroups = [
    {
      id: "fusion",
      label: "Familiars",
      items: [
        { id: "familiars", label: "Familiars" },
        { id: "augments", label: "Augments" },
      ],
    },
    {
      id: "magic",
      label: "Runes",
      items: [
        { id: "runes", label: "Runes" },
        { id: "enchants", label: "Enchants" },
      ],
    },
    {
      id: "gear",
      label: "Equipments",
      items: [
        { id: "equipments", label: "Equipments" },
        { id: "pets", label: "Pets" },
        { id: "mounts", label: "Mounts" },
      ],
    },
  ];
  const directTabs = [
    { id: "materials", label: "Materials" },
  ];

  useEffect(() => {
    let ticking = false;
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY.current;

          if (isMenuOpen) {
            setIsVisible(true);
            lastScrollY.current = currentScrollY;
            ticking = false;
            return;
          }

          if (currentScrollY <= 24) {
            setIsVisible(true);
          } else if (Math.abs(delta) >= 8) {
            if (delta > 0 && currentScrollY > 80) {
              setIsVisible(false);
            } else if (delta < 0) {
              setIsVisible(true);
            }
          }

          if (delta > 0) {
            setOpenDropdown("");
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (isMenuOpen) {
        setIsVisible(true);
        return;
      }

      if (window.scrollY > 80 && event.clientY <= 88) {
        setIsVisible(true);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!openDropdown) return;

    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setOpenDropdown("");
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, [openDropdown]);

  useEffect(
    () => () => {
      closeHoverTimer();
    },
    [],
  );

  const isDropdownActive = (group) =>
    group.items.some((item) => item.id === activeTab);

  const handleDropdownMouseEnter = (groupId) => {
    if (window.innerWidth <= 720) return;

    closeHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(groupId);
      hoverTimerRef.current = null;
    }, 200);
  };

  return (
    <>
      {isMenuOpen ? (
        <div
          className="menu-backdrop"
          onClick={() => {
            setIsMenuOpen(false);
            setOpenDropdown("");
          }}
        />
      ) : null}
      <header
        className={`menu-bar ${isVisible ? "visible" : "hidden"} ${isMenuOpen ? "menu-open" : ""}`}
      >
      <div className="menu-brand">
        <p className="eyebrow">Bit Heroes Atlas</p>
        <strong>by AnDDoanf</strong>
      </div>
      
      <button
        className="menu-toggle"
        type="button"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
          setOpenDropdown("");
        }}
        aria-label="Toggle menu"
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>

      <nav ref={navRef} className="menu-nav" aria-label="Sections">
        <button
          className={`tab-button tab-button-iconic ${activeTab === "how-to-use" ? "active" : ""}`}
          type="button"
          onClick={() => {
            setActiveTab("how-to-use");
            setIsMenuOpen(false);
            setOpenDropdown("");
          }}
        >
          <BookIcon/>
        </button>

        <button
          className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
          type="button"
          onClick={() => {
            setActiveTab("dashboard");
            setIsMenuOpen(false);
            setOpenDropdown("");
          }}
        >
          Dashboard
        </button>

        {dropdownGroups
          .sort((left, right) => {
            const order = ["fusion", "gear", "magic"];
            return order.indexOf(left.id) - order.indexOf(right.id);
          })
          .map((group) => (
          <div
            key={group.id}
            className={`menu-dropdown ${openDropdown === group.id ? "open" : ""}`}
            onMouseEnter={() => handleDropdownMouseEnter(group.id)}
          >
            <button
              className={`tab-button dropdown-trigger ${isDropdownActive(group) ? "active" : ""}`}
              type="button"
              aria-expanded={openDropdown === group.id}
              onClick={() => setOpenDropdown(group.id)}
            >
              {group.label}
              <span className="dropdown-caret">▾</span>
            </button>
            <div className="dropdown-menu">
              {group.items.map((tab) => (
                <button
                  key={tab.id}
                  className={`dropdown-item ${activeTab === tab.id ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                    setOpenDropdown("");
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {directTabs
          .filter((tab) => tab.id === "materials")
          .map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setIsMenuOpen(false);
              setOpenDropdown("");
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  </>
  );
}

export function Hero({
  familiarData,
  materialData,
  petsData,
  mountsData,
  equipmentsData,
  enchantsData,
  augmentsData,
  runesData,
}) {
  return (
    <section className="hero">
      <div>
        <h1>Fusion trees, materials, pets, mounts, equipments, enchants, augments, and runes.</h1>
        <p className="lede">
          Static data from archived Bit Heroes familiar, fusion, material, pet, mount,
          equipment, enchant, augment, and rune pages.
        </p>
      </div>
      <div className="hero-stats hero-stats-three">
        <div>
          <strong>{familiarData.counts.familiars}</strong>
          <span>Base familiars</span>
        </div>
        <div>
          <strong>{familiarData.counts.fusions}</strong>
          <span>Fusion familiars</span>
        </div>
        <div>
          <strong>{materialData.counts.materials}</strong>
          <span>Materials</span>
        </div>
        <div>
          <strong>{petsData.counts.pets}</strong>
          <span>Pets</span>
        </div>
        <div>
          <strong>{mountsData?.counts?.mounts || 0}</strong>
          <span>Mounts</span>
        </div>
        <div>
          <strong>{equipmentsData?.counts?.equipments || 0}</strong>
          <span>Equipments</span>
        </div>
        <div>
          <strong>{enchantsData?.counts?.enchants || 0}</strong>
          <span>Enchants</span>
        </div>
        <div>
          <strong>{augmentsData?.counts?.augments || 0}</strong>
          <span>Augments</span>
        </div>
        <div>
          <strong>{runesData?.counts?.runes || 0}</strong>
          <span>Runes</span>
        </div>
      </div>
    </section>
  );
}
