import { useEffect, useState, useRef } from "react";

const SectionNav = ({ artCount, postsCount }) => {
  const [active, setActive] = useState("art");
  const observerRef = useRef(null);

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const ids = ["art-section", "posts-section"];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(
              entry.target.id === "posts-section" ? "posts" : "art",
            );
          }
        });
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const links = [
    { key: "art", id: "art-section", label: "Artwork", count: artCount },
    { key: "posts", id: "posts-section", label: "Posts", count: postsCount },
  ];

  return (
    <div className="sticky top-0 z-40 bg-[#050816]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-1">
        {links.map((link) => (
          <button
            key={link.key}
            onClick={() => scrollTo(link.id)}
            className={`relative px-5 py-3.5 text-sm font-medium transition-colors duration-200 ${
              active === link.key
                ? "text-yellow-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {link.label}
            <span className="ml-1.5 text-gray-600 text-xs">{link.count}</span>
            {active === link.key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-yellow-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectionNav;
