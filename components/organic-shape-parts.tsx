export const fillOrganic = "fill-[var(--organic-surface)]";

const svgShapeAttrs = {
  preserveAspectRatio: "xMidYMid meet" as const,
};

export function OrganicShapeAscendingWall() {
  return (
    <svg
      aria-hidden="true"
      className="-mr-px h-full w-auto shrink-0"
      fill="none"
      viewBox="0 0 18 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path
        className={fillOrganic}
        d="M7.101 40H18V0H16C13.594 0 11.4403 1.49249 10.5955 3.74532L0.546698 30.5421C-1.1694 35.1184 2.21356 40 7.101 40Z"
      />
    </svg>
  );
}

export function OrganicShapeFlatRoundedRight() {
  return (
    <svg
      aria-hidden="true"
      className="-ml-px h-full w-auto shrink-0"
      fill="none"
      viewBox="0 0 10 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path className={fillOrganic} d="M0 40V0H4C7.31371 0 10 2.68629 10 6V34C10 37.3137 7.31371 40 4 40H0Z" />
    </svg>
  );
}

export function OrganicShapeDescendingWall() {
  return (
    <svg
      aria-hidden="true"
      className="-ml-px h-full w-auto shrink-0"
      fill="none"
      viewBox="0 0 18 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path
        className={fillOrganic}
        d="M10.899 0H0V40H2C4.40603 40 6.55968 38.5075 7.4045 36.2547L17.4533 9.45786C19.1694 4.88161 15.7864 0 10.899 0Z"
      />
    </svg>
  );
}

export function OrganicShapeRoundedFlatLeft() {
  return (
    <svg
      aria-hidden="true"
      className="-mr-px h-full w-auto shrink-0"
      fill="none"
      viewBox="0 0 10 40"
      xmlns="http://www.w3.org/2000/svg"
      {...svgShapeAttrs}
    >
      <path className={fillOrganic} d="M10 40V0H6C2.68629 0 0 2.68629 0 6V34C0 37.3137 2.68629 40 6 40H10Z" />
    </svg>
  );
}
