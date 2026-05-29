type IconProps = { size?: number; className?: string };

function Icon({ d, size = 22, fill = false, children, vb = 24 }: {
  d?: string; size?: number; fill?: boolean; children?: React.ReactNode; vb?: number;
}) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export const Icons = {
  shield: (p: IconProps) => <Icon size={p.size}><path d="M12 3l7 3v5c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V6l7-3z" /><path d="M9.2 12l2 2 3.6-3.8" /></Icon>,
  lock: (p: IconProps) => <Icon size={p.size}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>,
  whistle: (p: IconProps) => <Icon size={p.size}><path d="M3 10h11l4 2.5c1.2.7 1.2 2.3 0 3L14 18H7a4 4 0 0 1-4-4v-4z" /><circle cx="8" cy="14" r="2.4" /></Icon>,
  user: (p: IconProps) => <Icon size={p.size}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.2-3.6 4.3-5.5 8-5.5s6.8 1.9 8 5.5" /></Icon>,
  truck: (p: IconProps) => <Icon size={p.size}><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></Icon>,
  doc: (p: IconProps) => <Icon size={p.size}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 13h6M10 17h6" /></Icon>,
  flow: (p: IconProps) => <Icon size={p.size}><rect x="3" y="4" width="7" height="5" rx="1.5" /><rect x="14" y="15" width="7" height="5" rx="1.5" /><path d="M6.5 9v4a3 3 0 0 0 3 3h4.5" /></Icon>,
  bolt: (p: IconProps) => <Icon size={p.size}><path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" /></Icon>,
  globe: (p: IconProps) => <Icon size={p.size}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18" /></Icon>,
  check: (p: IconProps) => <Icon size={p.size}><path d="M5 12.5l4.5 4.5L19 7" /></Icon>,
  arrow: (p: IconProps) => <Icon size={p.size}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>,
  clock: (p: IconProps) => <Icon size={p.size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Icon>,
  scale: (p: IconProps) => <Icon size={p.size}><path d="M12 4v16M7 20h10" /><path d="M12 6l-6 2 3 5a3 3 0 0 1-6 0l3-5M12 6l6 2-3 5a3 3 0 0 0 6 0l-3-5" /></Icon>,
  eye: (p: IconProps) => <Icon size={p.size}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></Icon>,
  layers: (p: IconProps) => <Icon size={p.size}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></Icon>,
  bell: (p: IconProps) => <Icon size={p.size}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 19a2 2 0 0 0 4 0" /></Icon>,
  chart: (p: IconProps) => <Icon size={p.size}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></Icon>,
};
