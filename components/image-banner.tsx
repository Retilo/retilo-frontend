"use client";

import {
  type AnimationOptions,
  animate,
  type MotionValue,
  motion,
  motionValue,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import Image, { type StaticImageData } from "next/image";
import {
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import lowes1 from "../images/projects/Clay-1.png";
import merc3 from "../images/projects/Clay-2.png";
import lowes2 from "../images/projects/Clay-3.png";
import allyMilestone2 from "../images/projects/Clay-4.png";
import allyMilestone from "../images/projects/Clay-5.png";
import merc4 from "../images/projects/Clay-6.png";
import allyArena1 from "../images/projects/img-1.png";
import allyArena2 from "../images/projects/img-2.png";
import allyArena3 from "../images/projects/img-3.png";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// --- camera/utils (flat classes + utils object, matching prior barrel `export { utils }`) ---

const DEFAULT_PAN_TRANSITON: AnimationOptions = {
  type: "spring",
  damping: 23,
  mass: 0.85,
  stiffness: 100,
  restDelta: 0.0,
};

const DEFAULT_ZOOM_TRANSITON: AnimationOptions = {
  type: "spring",
  damping: 23,
  mass: 0.85,
  stiffness: 100,
  restDelta: 0.001,
};

const DEFAULT_ROTATE_TRANSITON: AnimationOptions = {
  type: "spring",
  damping: 23,
  mass: 0.85,
  stiffness: 100,
  restDelta: 0.001,
};

const PointType = {
  Center: "center",
  TopLeft: "top-left",
  TopRight: "top-right",
  BottomLeft: "bottom-left",
  BottomRight: "bottom-right",
} as const;

type PointTypeValue = (typeof PointType)[keyof typeof PointType];

export class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  sub(other: Vector) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiplyScalar(factor: number) {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  distanceTo(other: Vector) {
    return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2);
  }

  clone() {
    return new Vector(this.x, this.y);
  }
}

function getElementPoint(el: HTMLElement, pointType: PointTypeValue): Vector {
  const rect = el.getBoundingClientRect();
  switch (pointType) {
    case PointType.Center:
      return new Vector(rect.x + rect.width / 2, rect.y + rect.height / 2);
    case PointType.TopLeft:
      return new Vector(rect.x, rect.y);
    case PointType.TopRight:
      return new Vector(rect.x + rect.width, rect.y);
    case PointType.BottomLeft:
      return new Vector(rect.x, rect.y + rect.height);
    case PointType.BottomRight:
      return new Vector(rect.x + rect.width, rect.y + rect.height);
    default: {
      const _exhaustive: never = pointType;
      return _exhaustive;
    }
  }
}

export class CameraModel {
  containerEl!: HTMLElement;
  contentEl!: HTMLElement;
  motionValues: {
    zoom: MotionValue<number>;
    posX: MotionValue<number>;
    posY: MotionValue<number>;
    rotation: MotionValue<number>;
  };
  following: {
    interval: NodeJS.Timer;
    target: CameraTargetModel;
  } | null = null;

  constructor() {
    this.motionValues = {
      posX: motionValue(0),
      posY: motionValue(0),
      zoom: motionValue(1),
      rotation: motionValue(0),
    };
  }

  get position() {
    return new Vector(this.motionValues.posX.get(), this.motionValues.posY.get());
  }

  get rotation() {
    return this.motionValues.rotation.get();
  }

  get zoom() {
    return this.motionValues.zoom.get();
  }

  panTo(position: Vector, transition: AnimationOptions = DEFAULT_PAN_TRANSITON) {
    animate(this.motionValues.posX, position.x, transition);
    animate(this.motionValues.posY, position.y, transition);
  }

  setZoom(zoom: number, transition: AnimationOptions = DEFAULT_ZOOM_TRANSITON) {
    console.log("zoom", zoom, transition);
    animate(this.motionValues.zoom, zoom, transition);
  }

  setRotation(rotation: number, transition: AnimationOptions = DEFAULT_ROTATE_TRANSITON) {
    animate(this.motionValues.rotation, rotation, transition);
  }

  follow(target: CameraTargetModel, transition: AnimationOptions = DEFAULT_PAN_TRANSITON) {
    if (this.following) {
      clearInterval(this.following.interval);
      this.following = null;
    }
    const panToTarget = () => {
      this.panTo(target.center, transition);
    };
    panToTarget();
    this.following = {
      target,
      interval: setInterval(panToTarget, 100),
    };
  }

  unfollow(target: CameraTargetModel) {
    if (this.following?.target === target) {
      clearInterval(this.following.interval);
      this.following = null;
    }
  }
}

export class CameraTargetModel {
  el!: HTMLElement;
  camera: CameraModel;

  constructor(camera: CameraModel) {
    this.camera = camera;
  }

  getPoint(pointType: PointTypeValue) {
    const targetCenter = getElementPoint(this.el, pointType);
    const containerCenter = getElementPoint(this.camera.containerEl, PointType.Center);
    const targetOffset = targetCenter
      .clone()
      .sub(containerCenter)
      .multiplyScalar(1 / this.camera.zoom);
    return this.camera.position.clone().add(targetOffset);
  }

  get center(): Vector {
    return this.getPoint(PointType.Center);
  }

  get topLeft(): Vector {
    return this.getPoint(PointType.TopLeft);
  }

  get topRight(): Vector {
    return this.getPoint(PointType.TopRight);
  }

  get bottomLeft(): Vector {
    return this.getPoint(PointType.BottomLeft);
  }

  get bottomRight(): Vector {
    return this.getPoint(PointType.BottomRight);
  }
}

/** Same shape as `import * as utils from "./utils"` + `export { utils }` from the old camera barrel */
export const utils = {
  Vector,
  Camera: CameraModel,
  CameraTarget: CameraTargetModel,
} as const;

type CameraTargetInstance = InstanceType<typeof utils.CameraTarget>;

// --- camera/components ---

const CameraContext = createContext<CameraModel | null>(null);

export const useCamera = () => {
  const camera = useContext(CameraContext);
  if (!camera) {
    throw new Error("useCamera can only be called inside of a Camera");
  }
  return camera;
};

interface CameraProps extends HTMLAttributes<HTMLDivElement> {}

export const Camera = ({ children, ...otherProps }: CameraProps) => {
  const [camera] = useState(() => new utils.Camera());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (camera) {
      // @ts-expect-error
      camera.containerEl = containerRef.current;
      // @ts-expect-error
      camera.contentEl = contentRef.current;
    }
  }, [camera]);

  const translate = useTransform(
    [camera.motionValues.posX, camera.motionValues.posY],
    // @ts-expect-error
    ([x, y]) => `${-x}px ${-y}px`
  );

  const transformOrigin = useTransform(
    [camera.motionValues.posX, camera.motionValues.posY],
    ([x, y]) => `calc(50% + ${x}px) calc(50% + ${y}px)`
  );

  return (
    <CameraContext.Provider value={camera}>
      {/* @ts-ignore */}
      <motion.div className="overflow-hidden" ref={containerRef} {...otherProps}>
        <motion.div
          className="h-full w-full"
          ref={contentRef}
          style={{
            translate,
            transformOrigin,
            scale: camera.motionValues.zoom,
            rotate: camera.motionValues.rotation,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </CameraContext.Provider>
  );
};

// @ts-expect-error
export interface CameraTargetProps extends HTMLAttributes<HTMLDivElement> {
  children: ((target: CameraTargetInstance) => ReactNode) | ReactNode;
}

export const CameraTarget = forwardRef<CameraTargetInstance, CameraTargetProps>(
  ({ children, ...otherProps }, forwardedRef) => {
    const ref = useRef<HTMLDivElement>(null);
    const camera = useCamera();
    const [cameraTarget] = useState(() => new utils.CameraTarget(camera));

    useIsomorphicLayoutEffect(() => {
      // @ts-expect-error
      cameraTarget.el = ref.current;
      if (typeof forwardedRef === "function") {
        forwardedRef(cameraTarget);
      } else if (forwardedRef) {
        forwardedRef.current = cameraTarget;
      }
    }, []);

    return (
      <div ref={ref} {...otherProps}>
        {typeof children === "function" ? children(cameraTarget) : children}
      </div>
    );
  }
);

// --- ScrollMount ---

interface ScrollMountProps {
  withinTop?: string;
  withinRight?: string;
  withinBottom?: string;
  withinLeft?: string;
  once?: boolean;
  children: ReactNode;
}

export const ScrollMount = ({
  withinTop = "0px",
  withinRight = "0px",
  withinBottom = "0px",
  withinLeft = "0px",
  once = false,
  children,
  ...otherProps
}: ScrollMountProps) => {
  const docRef = useRef<Element | null>(null);

  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (docRef) {
      // @ts-expect-error
      docRef.current = window.document;
    }
  }, []);

  return (
    <motion.div
      {...otherProps}
      onViewportEnter={() => setMounted(true)}
      onViewportLeave={() => setMounted(false)}
      viewport={{
        root: docRef,
        margin: `${withinBottom} ${withinLeft} ${withinTop} ${withinRight}`,
        amount: "some",
        once,
      }}
    >
      {mounted && children}
    </motion.div>
  );
};

// --- Banners ---

interface InfiniteBannerProps extends HTMLProps<HTMLDivElement> {
  clock: MotionValue<number>;
  loopDuration?: number;
  children: ReactNode;
}

const InfiniteBanner = ({ clock, loopDuration = 22_000, children, ...otherProps }: InfiniteBannerProps) => {
  const progress = useTransform(clock, (time) => (time % loopDuration) / loopDuration);
  const percentage = useTransform(progress, (t) => t * 100);
  const translateX = useMotionTemplate`-${percentage}%`;
  return (
    <div
      {...otherProps}
      className="relative w-max overflow-hidden"
      style={{
        ...otherProps.style,
      }}
    >
      <motion.div style={{ translateX, width: "max-content" }}>
        <div>{children}</div>
        <div className="absolute top-0 left-full h-full w-full">{children}</div>
      </motion.div>
    </div>
  );
};

export const useClock = ({ defaultValue = 0, reverse = false, speed = 1 } = {}) => {
  const clock = useMotionValue(defaultValue);
  const paused = useRef(false);
  useAnimationFrame((_t, dt) => {
    if (paused.current) {
      return;
    }
    if (reverse) {
      clock.set(clock.get() - dt * speed);
    } else {
      clock.set(clock.get() + dt * speed);
    }
  });
  return {
    value: clock,
    stop: () => {
      paused.current = true;
    },
    start: () => {
      paused.current = false;
    },
  };
};

const bannerOneImages = [allyArena1, lowes2, merc3, allyArena2, allyMilestone2];

const bannerTwoImages = [allyMilestone, merc4, allyArena1, lowes1, allyArena3];

interface PhotoProps {
  src: StaticImageData;
  onClick: (target: CameraTargetInstance | null) => void;
}

const Photo = ({ src, onClick }: PhotoProps) => {
  const ref = useRef<CameraTargetInstance>(null);
  const [isFull, setIsFull] = useState(false);

  return (
    <CameraTarget ref={ref}>
      <Image
        alt={"project-image"}
        className={cn(
          "cursor-pointer rounded-xl border-8 border-black",
          isFull
            ? "aspect-auto h-64 w-auto object-cover md:h-[300px] md:w-[450px]"
            : "aspect-video h-64 w-auto object-cover md:h-[300px] md:w-[450px]"
        )}
        onClick={() => {
          onClick(ref.current);
          setIsFull((isFull) => !isFull);
        }}
        placeholder="blur"
        src={src}
        tabIndex={0}
      />
    </CameraTarget>
  );
};

function ImageBannerMarquee() {
  const camera = useCamera();
  const shouldReduceMotion = useReducedMotion();
  const [_target, setTarget] = useState<CameraTargetInstance | null>(null);
  const clock = useClock({
    defaultValue: Date.now(),
    reverse: false,
  });
  const reverseClock = useClock({
    defaultValue: Date.now(),
    reverse: true,
  });

  const clockRef = useRef(clock);
  const reverseClockRef = useRef(reverseClock);
  clockRef.current = clock;
  reverseClockRef.current = reverseClock;

  useEffect(() => {
    if (shouldReduceMotion) {
      clockRef.current.stop();
      reverseClockRef.current.stop();
    } else {
      clockRef.current.start();
      reverseClockRef.current.start();
    }
  }, [shouldReduceMotion]);

  camera.setRotation(-10);

  return (
    <div className="space-y-6">
      <InfiniteBanner clock={clock.value}>
        <div className="flex space-x-6 pr-6">
          {bannerOneImages.map((img) => (
            <Photo key={img.src} onClick={(t) => setTarget((prev) => (prev === t ? null : t))} src={img} />
          ))}
        </div>
      </InfiniteBanner>
      <InfiniteBanner clock={reverseClock.value}>
        <div className="flex space-x-6 pr-6">
          {bannerTwoImages.map((img) => (
            <Photo key={img.src} onClick={(t) => setTarget((prev) => (prev === t ? null : t))} src={img} />
          ))}
        </div>
      </InfiniteBanner>
    </div>
  );
}

/** Camera + dual marquee rows — use inside sections or standalone. */
export function OrganicImageBanner({ className }: { className?: string }) {
  return (
    <Camera className={cn("min-h-[min(44rem,88vh)] w-full overflow-x-hidden overflow-y-visible", className)}>
      <ImageBannerMarquee />
    </Camera>
  );
}
