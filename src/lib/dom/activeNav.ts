/**
 * activeNav.ts — highlights the active nav link (lime color) based on
 * which section is currently visible in the viewport.
 *
 * Watches all anchored sections via IntersectionObserver.
 * The link whose section has the highest intersection ratio wins.
 * When nothing intersects, keeps the last active link highlighted.
 *
 * Spec: CAP-02 "Active nav link updates on scroll"
 */

const LIME = '#C6F24E';
const MUTED = 'inherit'; // falls back to the nav's color: #93938B via CSS

export function initActiveNav(): void {
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('nav .nav-link[href^="#"]')
  );
  if (navLinks.length === 0) return;

  // Build map: section id → nav link element
  const linkMap = new Map<string, HTMLAnchorElement>();
  for (const link of navLinks) {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) linkMap.set(id, link);
  }

  const sectionIds = Array.from(linkMap.keys());
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean) as HTMLElement[];

  if (sections.length === 0) return;

  // Track which section has the highest intersection ratio
  const ratios = new Map<string, number>();

  function updateActive(): void {
    let bestId = '';
    let bestRatio = -1;
    for (const [id, ratio] of ratios) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    }
    if (!bestId) return;

    for (const [id, link] of linkMap) {
      const isActive = id === bestId;
      link.style.color = isActive ? LIME : MUTED;
      link.style.opacity = isActive ? '1' : '0.7';
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        ratios.set(id, entry.intersectionRatio);
      }
      updateActive();
    },
    {
      // rootMargin accounts for the fixed nav height (~67px)
      rootMargin: '-67px 0px -40% 0px',
      threshold: Array.from({ length: 21 }, (_, i) => i / 20), // 0.00..1.00 in steps of 0.05
    }
  );

  sections.forEach((section) => {
    ratios.set(section.id, 0);
    observer.observe(section);
  });
}
