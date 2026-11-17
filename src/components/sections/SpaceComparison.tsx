"use client";

import { useEffect, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

/**
 * Hero animation: the same kind of boxes in the same floor area, stored the lock-and-key way
 * (aisles, turning space, wasted floor) versus on EcoStorage pallets (no wasted floor).
 * Box size and room size are identical on both sides. Everything is inline SVG, driven by one
 * shared loop so both sides stay in step. Every box a vehicle moves physically rides with it:
 * the carried box is swapped for the placed (or removed) box at exactly the same spot.
 */

const LOOP = 12; // seconds for the whole scene
const BOX = 44;
const PINK = "#ff3ea5";
const GREEN = "#19ffa8";
const RED = "#ff2d55";
const PANEL = "#0b0f17";

const COPY = {
  en: {
    region: "Same boxes, same floor space. Lock-and-key storage loses floor to aisles and turning space. EcoStorage pallets lose none.",
    typical: "Lock-and-key storage",
    eco: "EcoStorage pallets",
    wasted: "SQFT WASTED",
    note: "Illustration of floor area lost to walkways, turning space and access.",
  },
  zh: {
    region: "同样的箱子，同样的占地。带锁储物仓的地面被通道和转弯空间浪费，EcoStorage 的托盘则零浪费。",
    typical: "带锁储物仓",
    eco: "EcoStorage 托盘仓储",
    wasted: "平方英尺浪费",
    note: "示意图：通道、转弯和取物空间占用的地面面积。",
  },
};

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

function useCopy() {
  const zh = useSyncExternalStore(
    subscribe,
    () => document.documentElement.lang?.toLowerCase().startsWith("zh") ?? false,
    () => false,
  );
  return zh ? COPY.zh : COPY.en;
}

const OFF = 380; // resting spot below the room, out of sight

type Still = boolean;
type Track = { values: number[]; times: number[]; ease?: "linear" | "easeInOut" };

/** Animates several properties on one shared loop; holds the final frame when motion is reduced. */
function track(tracks: Record<string, Track>, still: Still) {
  const names = Object.keys(tracks);
  const last = Object.fromEntries(names.map((n) => [n, tracks[n].values[tracks[n].values.length - 1]]));
  if (still) return { initial: false as const, animate: last, transition: { duration: 0 } };
  return {
    initial: Object.fromEntries(names.map((n) => [n, tracks[n].values[0]])),
    animate: Object.fromEntries(names.map((n) => [n, tracks[n].values])),
    transition: Object.fromEntries(
      names.map((n) => [
        n,
        { duration: LOOP, times: tracks[n].times, ease: tracks[n].ease ?? "linear", repeat: Infinity, repeatType: "loop" as const },
      ]),
    ),
  };
}

/** On/off switch at time `at` (fraction of the loop): shows from `at` on, or hides from `at` on. */
function switchTrack(at: number, visibleAfter: boolean): Track {
  const on = visibleAfter ? 1 : 0;
  return { values: [1 - on, 1 - on, on, on], times: [0, at - 0.005, at, 1] };
}

function Box({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={BOX} height={BOX} rx={4} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2.5} />
      <path d={`M6 ${BOX / 2}H${BOX - 6}M${BOX / 2} 6V${BOX - 6}`} stroke={color} strokeOpacity={0.45} strokeWidth={1.5} />
    </g>
  );
}

/** A box that appears (visible=true) or disappears (visible=false) at time `at`. */
function SwitchBox({ x, y, color, at, visible, still }: { x: number; y: number; color: string; at: number; visible: boolean; still: Still }) {
  const props = track({ opacity: switchTrack(at, visible) }, still);
  return (
    <motion.g {...props}>
      <Box x={x} y={y} color={color} />
    </motion.g>
  );
}

/** Top-down person heading "up" (towards negative y): head, shoulders, and arms reaching forward. */
function Person({ color }: { color: string }) {
  return (
    <g>
      <path d="M-11 4V-9M11 4V-9" stroke={color} strokeWidth={4.5} strokeLinecap="round" />
      <ellipse cx={0} cy={7} rx={15} ry={7} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={2} />
      <circle cx={0} cy={7} r={7} fill={color} />
    </g>
  );
}

function Wall() {
  return <rect x={4} y={4} width={392} height={292} rx={6} fill="none" stroke="#ffffff" strokeOpacity={0.22} strokeWidth={2} strokeDasharray="6 6" />;
}

/** Red line = floor you pay for but cannot use. Static. */
function RedLines({ lines }: { lines: string[] }) {
  return (
    <g fill="none" stroke={RED} strokeWidth={3.5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${RED})` }}>
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
}

const range = (n: number, start: number, step: number) => Array.from({ length: n }, (_, i) => start + i * step);

/**
 * Lock-and-key layout: 2-wide blocks of boxes with walkways between. The two empty slots sit at the
 * far end of the middle aisle, so the trolley pushes each box straight into place (deeper slot first).
 */
const PINK_BLOCKS = [16, 148, 280];
const PINK_ROWS = [16, 60, 148, 192];

function TypicalScene({ still }: { still: Still }) {
  // Trip 1 delivers to the deeper slot (box centre y=38), trip 2 to the nearer one (y=82).
  // The trolley box sits 38 ahead of the person, so the person stops at 76, then 120.
  // After each drop the person turns 180 degrees on the spot and walks out facing the exit.
  const times = [0, 0.02, 0.16, 0.2, 0.25, 0.36, 0.37, 0.4, 0.56, 0.6, 0.65, 0.76, 0.77, 1];
  const walk = track(
    {
      x: { values: Array(14).fill(126), times },
      y: { values: [OFF, OFF, 76, 76, 76, OFF, OFF, OFF, 120, 120, 120, OFF, OFF, OFF], times, ease: "easeInOut" },
      rotate: { values: [0, 0, 0, 0, 180, 180, 0, 0, 0, 0, 180, 180, 0, 0], times, ease: "easeInOut" },
    },
    still,
  );
  const carry = track({ opacity: { values: [1, 1, 0, 0, 1, 1, 0, 0], times: [0, 0.18, 0.185, 0.38, 0.385, 0.58, 0.585, 1] } }, still);
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden focusable="false">
      <Wall />
      <RedLines lines={["M126 108V296", "M258 10V296", "M16 126H368", "M16 266H368"]} />
      {PINK_BLOCKS.flatMap((bx) =>
        [0, 44].flatMap((dx) =>
          PINK_ROWS.filter((by) => !(bx === 280 && by === 192)).map((by) => <Box key={`${bx + dx}-${by}`} x={bx + dx} y={by} color={PINK} />),
        ),
      )}
      <SwitchBox x={104} y={16} color={PINK} at={0.185} visible still={still} />
      <SwitchBox x={104} y={60} color={PINK} at={0.585} visible still={still} />
      {/* Person pushing a trolley up the middle aisle; turns round on the spot after each drop */}
      <motion.g {...walk} style={{ originX: 0, originY: 0, transformBox: "view-box" }}>
        {/* The trolley (box and handle bar) is only there while a box is being carried */}
        <motion.g {...carry}>
          <Box x={-22} y={-60} color={PINK} />
          <path d="M-16 -12H16" stroke={PINK} strokeWidth={3} strokeLinecap="round" />
        </motion.g>
        <Person color={PINK} />
      </motion.g>
    </svg>
  );
}

/** Pallet layout: the boxes packed side by side with a thin gap. The far top-right slot starts empty. */
const GREEN_COLS = range(6, 16, 47);
const GREEN_ROWS = range(4, 16, 47);
const FAR_SLOT = { x: 251, y: 16 };
const NEAR_PALLET = { x: 110, y: 157 }; // closest to the entrance: the one that gets taken out

function EcoScene({ still }: { still: Still }) {
  // Trip 1: in from the bottom, right along the clear strip under the block, up the right-hand side,
  // curving left to push a pallet into the far corner slot, then out the same way.
  // Trip 2: straight in, forks under the nearest pallet, lift, reverse out of frame with it.
  const times = [0, 0.02, 0.1, 0.13, 0.25, 0.28, 0.36, 0.4, 0.44, 0.47, 0.5, 0.53, 0.6, 0.61, 0.62, 0.72, 0.75, 0.88, 1];
  const drive = track(
    {
      x: { values: [120, 120, 120, 120, 330, 330, 330, 330, 311, 311, 330, 330, 330, 132, 132, 132, 132, 132, 132], times, ease: "easeInOut" },
      y: { values: [OFF, OFF, 268, 268, 268, 268, 90, 38, 38, 38, 38, 38, OFF, OFF, OFF, 217, 217, OFF, OFF], times, ease: "easeInOut" },
      rotate: { values: [0, 0, 0, 90, 90, 0, 0, -90, -90, -90, -90, -180, -180, 0, 0, 0, 0, 0, 0], times, ease: "easeInOut" },
    },
    still,
  );
  const carry = track({ opacity: { values: [1, 1, 0, 0, 1, 1], times: [0, 0.435, 0.44, 0.73, 0.735, 1] } }, still);
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden focusable="false">
      <Wall />
      {GREEN_COLS.flatMap((bx) =>
        GREEN_ROWS.filter((by) => !(bx === FAR_SLOT.x && by === FAR_SLOT.y) && !(bx === NEAR_PALLET.x && by === NEAR_PALLET.y)).map((by) => (
          <Box key={`${bx}-${by}`} x={bx} y={by} color={GREEN} />
        )),
      )}
      <SwitchBox x={FAR_SLOT.x} y={FAR_SLOT.y} color={GREEN} at={0.44} visible still={still} />
      <SwitchBox x={NEAR_PALLET.x} y={NEAR_PALLET.y} color={GREEN} at={0.735} visible={false} still={still} />
      {/* Person on a forklift: the whole vehicle turns, so forks and arms always point where it is heading */}
      <motion.g {...drive} style={{ originX: 0, originY: 0, transformBox: "view-box" }}>
        <rect x={-20} y={-6} width={40} height={46} rx={5} fill={PANEL} stroke={GREEN} strokeWidth={2} />
        <path d="M-15 -4V-58M15 -4V-58" stroke={GREEN} strokeWidth={4} strokeLinecap="round" />
        <motion.g {...carry}>
          <Box x={-22} y={-60} color={GREEN} />
        </motion.g>
        <g transform="translate(0 16)">
          <Person color={GREEN} />
        </g>
      </motion.g>
    </svg>
  );
}

/**
 * The wasted-space counter. The number sits in a fixed-width slot, so digits never nudge the layout;
 * instead it deliberately grows and warms from white to red as the waste climbs.
 */
function WastedCounter({ still, label }: { still: Still; label: string }) {
  const value = useMotionValue(still ? 200 : 0);
  const shown = useTransform(value, (v) => String(Math.round(v)));
  const scale = useTransform(value, [0, 200], [1, 1.35]);
  const color = useTransform(value, [0, 200], ["#ffffff", "#ff5a7a"]);
  useEffect(() => {
    if (still) return;
    // Climbs while the two boxes are delivered, holds at 200, then drops back to 0 when the scene resets.
    const controls = animate(value, [0, 0, 200, 200], {
      duration: LOOP,
      times: [0, 0.02, 0.62, 1],
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [still, value]);
  return (
    <motion.span className="inline-flex items-baseline gap-2 whitespace-nowrap" style={{ scale, color, originX: 0, originY: 0.5, textShadow: `0 0 14px ${RED}` }}>
      <motion.span className="inline-block min-w-[3ch] text-right tabular-nums">{shown}</motion.span>
      <span>{label}</span>
    </motion.span>
  );
}

export function SpaceComparison() {
  const t = useCopy();
  const reduced = useReducedMotion();
  const still = Boolean(reduced);

  return (
    <div role="img" aria-label={t.region} className="flex h-[56svh] min-h-[336px] w-full flex-col gap-2 lg:h-auto lg:min-h-0">
      <div className="grid min-h-0 flex-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1 lg:gap-4">
        {/* Lock-and-key */}
        <figure className="m-0 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/15 lg:aspect-[4/3]" style={{ background: `${PANEL}e0` }}>
          <figcaption className="flex flex-col pr-14 pl-3 pt-2 lg:px-5 lg:pt-4">
            <span className="text-[11px] font-semibold tracking-wide uppercase lg:text-sm" style={{ color: PINK }}>
              {t.typical}
            </span>
            <span className="text-xl font-extrabold tracking-tight lg:text-4xl">
              <WastedCounter still={still} label={t.wasted} />
            </span>
          </figcaption>
          <div className="min-h-0 flex-1 p-2 lg:p-4">
            <TypicalScene still={still} />
          </div>
        </figure>

        {/* EcoStorage */}
        <figure className="m-0 flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/15 lg:aspect-[4/3]" style={{ background: `${PANEL}e0` }}>
          <figcaption className="flex flex-col px-3 pt-2 lg:px-5 lg:pt-4">
            <span className="text-[11px] font-semibold tracking-wide uppercase lg:text-sm" style={{ color: GREEN }}>
              {t.eco}
            </span>
            <span className="text-3xl font-extrabold tracking-tight lg:text-6xl" style={{ color: GREEN, textShadow: `0 0 18px ${GREEN}88` }}>
              0 {t.wasted}
            </span>
          </figcaption>
          <div className="min-h-0 flex-1 p-2 lg:p-4">
            <EcoScene still={still} />
          </div>
        </figure>
      </div>
      <p className="hidden text-center text-xs text-foreground/60 lg:block">{t.note}</p>
    </div>
  );
}
