import { useState, useEffect, useRef } from "react";

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
        { id: "favorites", label: "Favorites" },
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
    { id: "dashboard", label: "Dashboard" },
    { id: "materials", label: "Materials" },
  ];

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.innerWidth <= 720) {
            setIsVisible(true);
            lastScrollY.current = window.scrollY;
            ticking = false;
            return;
          }

          const currentScrollY = window.scrollY;
          
          // Show header if scrolling up, hide if scrolling down
          if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
            setIsVisible((prev) => {
              if (prev === true) return false;
              return prev;
            });
            setIsMenuOpen(false); // Close mobile menu when scrolling down
            setOpenDropdown("");
          } else {
            setIsVisible((prev) => {
              if (prev === false) return true;
              return prev;
            });
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => () => closeHoverTimer(), []);

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
