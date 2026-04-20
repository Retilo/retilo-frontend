function tileSvg(inner: string): string {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${inner}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

export const RIBBON_TILES = [
  {
    alt: "Tile: serif capital A on crimson",
    src: tileSvg(
      `<rect width="128" height="128" fill="#c41e3a"/><text x="64" y="90" text-anchor="middle" font-size="78" font-weight="700" fill="#0c0c0c" font-family="Georgia,Times New Roman,serif">A</text>`
    ),
  },
  {
    alt: "Tile: ampersand on soft pink",
    src: tileSvg(
      `<rect width="128" height="128" fill="#f4b8c5"/><text x="64" y="86" text-anchor="middle" font-size="64" font-weight="600" fill="#1a1a1a" font-family="ui-serif,Georgia,serif">&amp;</text>`
    ),
  },
  {
    alt: "Tile: lowercase g on deep teal",
    src: tileSvg(
      `<rect width="128" height="128" fill="#0d9488"/><text x="64" y="92" text-anchor="middle" font-size="76" font-weight="600" fill="#ecfdf5" font-family="system-ui,sans-serif">g</text>`
    ),
  },
  {
    alt: "Tile: condensed alphabet specimen",
    src: tileSvg(
      `<rect width="128" height="128" fill="#e8e0d5"/><text x="64" y="22" text-anchor="middle" font-size="9" fill="#292524" font-family="ui-monospace,monospace" letter-spacing="0.02em">a b c d e f g</text><text x="64" y="36" text-anchor="middle" font-size="9" fill="#292524" font-family="ui-monospace,monospace">h i j k l m n</text><text x="64" y="50" text-anchor="middle" font-size="9" fill="#292524" font-family="ui-monospace,monospace">o p q r s t u</text><text x="64" y="64" text-anchor="middle" font-size="9" fill="#292524" font-family="ui-monospace,monospace">v w x y z</text><rect x="16" y="76" width="96" height="32" fill="#1c1917"/><text x="64" y="98" text-anchor="middle" font-size="20" font-weight="700" fill="#f97316" font-family="system-ui,sans-serif">&amp;</text>`
    ),
  },
  {
    alt: "Tile: royal blue with white ampersand",
    src: tileSvg(
      `<rect width="128" height="128" fill="#1e3a5f"/><text x="64" y="88" text-anchor="middle" font-size="70" font-weight="700" fill="#f8fafc" font-family="Georgia,serif">&amp;</text>`
    ),
  },
  {
    alt: "Tile: sage field with bold W",
    src: tileSvg(
      `<rect width="128" height="128" fill="#9caf88"/><text x="64" y="86" text-anchor="middle" font-size="68" font-weight="800" fill="#1c2e1a" font-family="system-ui,sans-serif">W</text>`
    ),
  },
  {
    alt: "Tile: lavender with layered letters",
    src: tileSvg(
      `<rect width="128" height="128" fill="#c4b5fd"/><text x="52" y="72" font-size="42" font-weight="800" fill="#4c1d95" font-family="system-ui,sans-serif" opacity="0.35">g</text><text x="64" y="88" text-anchor="middle" font-size="56" font-weight="800" fill="#312e81" font-family="Georgia,serif">&amp;</text>`
    ),
  },
  {
    alt: "Tile: black square with orange outline letter O",
    src: tileSvg(
      `<rect width="128" height="128" fill="#0a0a0a"/><circle cx="64" cy="64" r="28" fill="none" stroke="#ea580c" stroke-width="8"/><text x="64" y="78" text-anchor="middle" font-size="48" font-weight="700" fill="#fafafa" font-family="ui-monospace,monospace">O</text>`
    ),
  },
] as const;
