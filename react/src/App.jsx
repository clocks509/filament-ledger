import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  Search,
  Plus,
  X,
  Trash2,
  Pencil,
  Package,
  ClipboardCopy,
  Check,
  Minus,
  Scale,
  ScanLine,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  History,
  ExternalLink,
  ArrowUpDown,
  ShoppingCart,
  LayoutDashboard,
  ListChecks,
  Settings,
} from 'lucide-react';

const FONT_DISPLAY = "'Cinzel', Georgia, serif";
const FONT_BODY = "'Special Elite', 'Courier New', monospace";

const theme = {
  bg: '#1C110C',
  panel: '#2A1E16',
  panelAlt: '#3D2B1F',
  dial: '#F4E8D1',
  inkOnDial: '#2B1D12',
  ink: '#F4E8D1',
  line: '#6B4A2A',
  lineBright: '#D8A94A',
  muted: '#B8996A',
  faint: '#7A6443',
  accent: '#C9A227',
  onAccent: '#1C110C',
  copper: '#B5651D',
  patina: '#5B8266',
  warn: '#D98C2B',
  danger: '#8C2F1E',
  silver: '#D0D8E0',
  silverDark: '#A0AAB4',
  glassGlow: 'rgba(200, 150, 70, 0.25)',
};

function useGoogleFonts() {
  useEffect(() => {
    const id = 'spoollog-steampunk-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Special+Elite&display=swap';
    document.head.appendChild(link);
  }, []);
}

const SPOOL_PRESETS = [
  { id: 'bambu', label: 'Bambu Lab', tare: 250 },
  { id: 'overture', label: 'Overture (Cardboard)', tare: 237 },
  { id: 'esun_plastic', label: 'eSUN (Classic Plastic)', tare: 260 },
  { id: 'esun_cardboard', label: 'eSUN (New Cardboard)', tare: 153 },
  { id: 'polymaker', label: 'Polymaker (Cardboard)', tare: 145 },
  { id: 'prusament', label: 'Prusament (Honeycomb Plastic)', tare: 201 },
  { id: 'sunlu', label: 'Sunlu (Standard Plastic)', tare: 220 },
  { id: 'custom', label: 'Custom Brand', tare: 0 },
];

const BRAND_OPTIONS = [
  { value: 'bambu', label: 'Bambu Lab' },
  { value: 'overture', label: 'Overture' },
  { value: 'esun', label: 'eSUN' },
  { value: 'polymaker', label: 'Polymaker' },
  { value: 'prusament', label: 'Prusament' },
  { value: 'sunlu', label: 'Sunlu' },
  { value: 'custom', label: 'Custom' },
];

const BRAND_TO_PRESET = {
  bambu: 'bambu',
  overture: 'overture',
  esun: 'esun_plastic',
  polymaker: 'polymaker',
  prusament: 'prusament',
  sunlu: 'sunlu',
};

const AMS_SLOTS = [
  { value: '1', label: 'Slot 1' },
  { value: '2', label: 'Slot 2' },
  { value: '3', label: 'Slot 3' },
  { value: '4', label: 'Slot 4' },
  { value: 'external', label: 'External Storage Shelf' },
];

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'Nylon', 'Other'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Default (grouped)' },
  { value: 'remaining', label: 'Remaining weight' },
  { value: 'brand', label: 'Brand' },
  { value: 'color', label: 'Color' },
];

function getPreset(id) {
  return SPOOL_PRESETS.find((p) => p.id === id) || SPOOL_PRESETS[0];
}

function tareFor(spool) {
  if (
    spool.tareWeight !== undefined &&
    spool.tareWeight !== null &&
    spool.tareWeight > 0
  )
    return Number(spool.tareWeight);
  const preset = getPreset(spool.spoolPreset);
  if (preset.id === 'custom') return Number(spool.customTareWeight) || 0;
  return preset.tare;
}

function defaultPriceFor(spoolPreset, material) {
  if (!spoolPreset || spoolPreset === 'custom') return 0;
  if (spoolPreset === 'bambu')
    return material === 'PLA' || material === 'PETG' ? 24.99 : 43.99;
  if (
    ['overture', 'sunlu', 'esun_plastic', 'esun_cardboard'].includes(
      spoolPreset
    )
  )
    return material === 'PLA' ? 27.99 : null;
  if (spoolPreset === 'polymaker') return material === 'PLA' ? 29.99 : null;
  return null;
}

function costPerGram(s) {
  const tw = Number(s.totalWeight) || 0;
  if (tw <= 0) return 0;
  return (Number(s.spoolPrice) || 0) / tw;
}

function uid() {
  return `s_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function pct(remaining, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

function formatTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMoney(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

const INTERACTIVE_TAGS = new Set([
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'BUTTON',
  'A',
  'LABEL',
]);

function Gear({
  size = 18,
  color,
  spin = false,
  duration = '4s',
  direction = 'normal',
}) {
  const cx = size / 2,
    cy = size / 2,
    outerR = size * 0.3,
    toothLen = size * 0.14,
    teeth = 8;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        animation: spin
          ? `spoollog-gear-spin ${duration} linear infinite ${
              direction === 'reverse' ? 'reverse' : 'normal'
            }`
          : undefined,
      }}
    >
      {[...Array(teeth)].map((_, i) => (
        <rect
          key={i}
          x={cx - size * 0.07}
          y={cy - outerR - toothLen}
          width={size * 0.14}
          height={toothLen + size * 0.04}
          fill={color}
          transform={`rotate(${(360 / teeth) * i} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={outerR} fill={color} />
      <circle cx={cx} cy={cy} r={outerR * 0.4} fill={theme.bg} />
    </svg>
  );
}

function Rivets() {
  const rivet = {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 9999,
    background: theme.lineBright,
    boxShadow:
      'inset -1px -1px 1px rgba(0,0,0,0.5), inset 1px 1px 1px rgba(255,228,170,0.5)',
  };
  return (
    <>
      <span style={{ ...rivet, top: 4, left: 4 }} />
      <span style={{ ...rivet, top: 4, right: 4 }} />
      <span style={{ ...rivet, bottom: 4, left: 4 }} />
      <span style={{ ...rivet, bottom: 4, right: 4 }} />
    </>
  );
}

function PressureGauge({ percent, size = 44 }) {
  const angle = -120 + (percent / 100) * 240;
  const rad = (angle * Math.PI) / 180;
  const needleX = 50 + 30 * Math.sin(rad);
  const needleY = 50 - 30 * Math.cos(rad);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ flexShrink: 0 }}
    >
      <circle cx="50" cy="50" r="47" fill={theme.accent} />
      <circle cx="50" cy="50" r="41" fill={theme.dial} />
      {[...Array(13)].map((_, i) => {
        const a = -120 + i * 20;
        const r2 = (a * Math.PI) / 180;
        const x1 = 50 + 36 * Math.sin(r2);
        const y1 = 50 - 36 * Math.cos(r2);
        const x2 = 50 + 30 * Math.sin(r2);
        const y2 = 50 - 30 * Math.cos(r2);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={theme.inkOnDial}
            strokeWidth="1.6"
          />
        );
      })}
      <line
        x1="50"
        y1="50"
        x2={needleX}
        y2={needleY}
        stroke={theme.danger}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="50"
        cy="50"
        r="5"
        fill={theme.copper}
        stroke={theme.inkOnDial}
        strokeWidth="1"
      />
    </svg>
  );
}

function WaxSeal({ hex, size = 16 }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: 9999,
        background: hex || theme.accent,
        border: `2px solid ${theme.lineBright}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
        flexShrink: 0,
      }}
    />
  );
}

function WarningLamp({ color, label }) {
  return (
    <span
      style={{ border: `1px solid ${color}`, color, fontFamily: FONT_BODY }}
      className="text-[9px] uppercase px-2 py-1 inline-flex items-center gap-1.5 rounded-sm"
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: color,
          boxShadow: `0 0 5px ${color}`,
        }}
      />
      {label}
    </span>
  );
}

function SectionHeader({ label, right }) {
  return (
    <div
      className="flex items-center justify-between mb-4 pb-2.5"
      style={{ borderBottom: `1px solid ${theme.silver}` }}
    >
      <div className="flex items-center gap-2.5">
        <Gear
          size={14}
          color={theme.silver}
          spin
          duration="6s"
          direction="normal"
        />
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: theme.silver,
          }}
          className="text-[13px] uppercase"
        >
          {label}
        </span>
      </div>
      {right}
    </div>
  );
}

function StatPlate({ label, value, color }) {
  return (
    <div
      style={{
        position: 'relative',
        background: theme.panel,
        border: `1px solid ${theme.silver}`,
      }}
      className="px-4 py-3.5 rounded-sm"
    >
      <Rivets />
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          color: color || theme.silver,
        }}
        className="text-[16px]"
      >
        {value}
      </div>
      <div
        style={{
          color: theme.muted,
          fontFamily: FONT_BODY,
          letterSpacing: '0.04em',
        }}
        className="text-[9px] uppercase mt-0.5"
      >
        {label}
      </div>
    </div>
  );
}

const emptyForm = {
  id: null,
  uid: '',
  brand: '',
  brandOption: 'custom',
  material: 'PLA',
  colorName: '',
  colorHex: '#C9A227',
  spoolPreset: 'bambu',
  customSpoolBrand: '',
  customTareWeight: 0,
  tareWeight: 250,
  amsSlot: 'external',
  scaleWeight: '',
  totalWeight: 1000,
  remainingWeight: 1000,
  spoolPrice: 24.99,
  needsRefill: false,
  location: '',
  notes: '',
  history: [],
  saveTareForBrand: false,
};

function addHistoryEntry(spool, action, details, type = null, extra = {}) {
  const entry = { timestamp: Date.now(), action, details, type, ...extra };
  const history = [entry, ...(spool.history || [])].slice(0, 15);
  return { ...spool, history };
}

function badgeForEntryType(type) {
  switch (type) {
    case 'linked':
      return { label: 'LINKED', color: theme.patina };
    case 'refill':
      return { label: 'REFILL', color: theme.danger };
    case 'deduct':
      return { label: 'DEDUCT', color: theme.warn };
    case 'restocked':
      return { label: 'RESTOCKED', color: theme.patina };
    default:
      return null;
  }
}

function LogBadge({ type }) {
  const badge = badgeForEntryType(type);
  if (!badge) return null;
  return (
    <span
      style={{
        color: badge.color,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        letterSpacing: '0.03em',
      }}
      className="text-[10px] uppercase flex-shrink-0"
    >
      [{badge.label}]
    </span>
  );
}

function formatHistoryLine(entry) {
  if (entry.type === 'deduct') {
    const name = entry.printName ? entry.printName : 'Untitled print';
    return `${name} (-${entry.grams}g)`;
  }
  return entry.action + (entry.details ? ` — ${entry.details}` : '');
}

function DecorativeGears() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const baseOpacity = 0.2;
  const gearSpecs = [
    {
      size: isMobile ? 50 : 90,
      color: theme.silver,
      top: isMobile ? '1%' : '2%',
      left: isMobile ? '1%' : '1%',
      duration: '6s',
      direction: 'normal',
    },
    {
      size: isMobile ? 35 : 60,
      color: theme.copper,
      top: isMobile ? '6%' : '7%',
      left: isMobile ? '6%' : '7%',
      duration: '4s',
      direction: 'reverse',
    },
    {
      size: isMobile ? 60 : 110,
      color: theme.silver,
      top: isMobile ? '1%' : '1%',
      right: isMobile ? '1%' : '1%',
      duration: '8s',
      direction: 'reverse',
    },
    {
      size: isMobile ? 40 : 70,
      color: theme.accent,
      top: isMobile ? '7%' : '8%',
      right: isMobile ? '7%' : '8%',
      duration: '5s',
      direction: 'normal',
    },
    {
      size: isMobile ? 55 : 100,
      color: theme.silver,
      bottom: isMobile ? '1%' : '1%',
      left: isMobile ? '1%' : '1%',
      duration: '7s',
      direction: 'normal',
    },
    {
      size: isMobile ? 35 : 60,
      color: theme.copper,
      bottom: isMobile ? '7%' : '8%',
      left: isMobile ? '7%' : '8%',
      duration: '4.5s',
      direction: 'reverse',
    },
    {
      size: isMobile ? 65 : 120,
      color: theme.silver,
      bottom: isMobile ? '1%' : '1%',
      right: isMobile ? '1%' : '1%',
      duration: '9s',
      direction: 'reverse',
    },
    {
      size: isMobile ? 45 : 80,
      color: theme.accent,
      bottom: isMobile ? '8%' : '9%',
      right: isMobile ? '8%' : '9%',
      duration: '5.5s',
      direction: 'normal',
    },
    {
      size: isMobile ? 40 : 80,
      color: theme.silver,
      top: '40%',
      left: isMobile ? '-4%' : '-2%',
      duration: '5s',
      direction: 'reverse',
    },
    {
      size: isMobile ? 45 : 90,
      color: theme.silver,
      top: '50%',
      right: isMobile ? '-4%' : '-2%',
      duration: '6s',
      direction: 'normal',
    },
    {
      size: isMobile ? 30 : 50,
      color: theme.silver,
      top: '15%',
      left: '45%',
      duration: '3s',
      direction: 'reverse',
    },
  ];
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {gearSpecs.map((g, i) => {
        const style = { position: 'absolute', opacity: baseOpacity };
        if (g.top) style.top = g.top;
        if (g.left) style.left = g.left;
        if (g.bottom) style.bottom = g.bottom;
        if (g.right) style.right = g.right;
        return (
          <div key={i} style={style}>
            <Gear
              size={g.size}
              color={g.color}
              spin
              duration={g.duration}
              direction={g.direction}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function SpoolLog() {
  useGoogleFonts();

  const [activeTab, setActiveTab] = useState('dashboard');
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
    { id: 'history', label: 'History', icon: History },
  ];

  const [spools, setSpools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [form, setForm] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [logUsage, setLogUsage] = useState(null);
  const [weighModal, setWeighModal] = useState(null);
  const [scanAction, setScanAction] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lowThreshold, setLowThreshold] = useState(() => {
    try {
      return Number(localStorage.getItem('spoollog_lowThreshold')) || 15;
    } catch {
      return 15;
    }
  });
  const [pendingThreshold, setPendingThreshold] = useState(15);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingTagId, setUpdatingTagId] = useState(null);
  const [updateTagInput, setUpdateTagInput] = useState('');
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);
  const updateTagInputRef = useRef(null);
  const [expandedBrands, setExpandedBrands] = useState({});
  const [expandedMaterials, setExpandedMaterials] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});

  const [brandOverrides, setBrandOverrides] = useState(() => {
    try {
      const stored = localStorage.getItem('spoollog_brand_tare_overrides');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveBrandOverride = useCallback(
    (brandName, tare) => {
      const newOverrides = { ...brandOverrides };
      if (tare === null || tare === undefined || tare === 0)
        delete newOverrides[brandName];
      else newOverrides[brandName] = Number(tare);
      setBrandOverrides(newOverrides);
      try {
        localStorage.setItem(
          'spoollog_brand_tare_overrides',
          JSON.stringify(newOverrides)
        );
      } catch {}
    },
    [brandOverrides]
  );

  const deleteBrandOverride = useCallback(
    (brandName) => saveBrandOverride(brandName, null),
    [saveBrandOverride]
  );
  const getTareForBrand = useCallback(
    (brandName) =>
      brandOverrides[brandName] !== undefined
        ? brandOverrides[brandName]
        : null,
    [brandOverrides]
  );

  const [scannerValue, setScannerValue] = useState('');
  const scannerRef = useRef(null);

  const anyOverlayOpen =
    !!form ||
    !!confirmDeleteId ||
    !!logUsage ||
    !!weighModal ||
    !!scanAction ||
    exportOpen ||
    importOpen ||
    settingsOpen ||
    !!updatingTagId ||
    purgeConfirmOpen;
  const overlayOpenRef = useRef(anyOverlayOpen);
  useEffect(() => {
    overlayOpenRef.current = anyOverlayOpen;
  }, [anyOverlayOpen]);

  const focusScanner = useCallback(() => {
    if (scannerRef.current) scannerRef.current.focus();
  }, []);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (!overlayOpenRef.current) focusScanner();
    };
    const handleDocClick = (e) => {
      if (overlayOpenRef.current) return;
      if (INTERACTIVE_TAGS.has(e.target.tagName)) return;
      focusScanner();
    };
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('click', handleDocClick);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('click', handleDocClick);
    };
  }, [focusScanner]);

  // Load & migrate
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spools');
      let parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        parsed = parsed.map((s) => {
          let preset = s.spoolPreset;
          if (!preset && s.spoolType) {
            if (s.spoolType === 'custom') preset = 'custom';
            else if (s.spoolType === 'bambu_reusable') preset = 'bambu';
            else preset = 'custom';
          }
          let tare = s.tareWeight;
          if (tare === undefined || tare === null) {
            const presetObj = getPreset(s.spoolPreset || 'bambu');
            if (presetObj.id === 'custom')
              tare = Number(s.customTareWeight) || 0;
            else tare = presetObj.tare;
          }
          return {
            ...s,
            spoolPreset: preset || 'bambu',
            customSpoolBrand: s.customSpoolBrand || '',
            customTareWeight: s.customTareWeight || 0,
            tareWeight: tare,
            amsSlot: s.amsSlot || 'external',
            spoolPrice: typeof s.spoolPrice === 'number' ? s.spoolPrice : 0,
            history: s.history || [],
          };
        });
        setSpools(parsed);
      } else setSpools([]);
    } catch (err) {
      setSpools([]);
    } finally {
      setLoading(false);
    }
    setTimeout(focusScanner, 100);
  }, [focusScanner]);

  const persist = useCallback(async (next) => {
    setSaving(true);
    try {
      localStorage.setItem('spools', JSON.stringify(next));
      setLoadError(false);
    } catch (err) {
      setLoadError(true);
    } finally {
      setSaving(false);
    }
  }, []);

  const saveSpools = useCallback(
    (next) => {
      setSpools(next);
      persist(next);
    },
    [persist]
  );

  const materialsPresent = useMemo(
    () => [
      'All',
      ...Array.from(new Set(spools.map((s) => s.material).filter(Boolean))),
    ],
    [spools]
  );

  const filteredSpools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return spools
      .filter((s) =>
        materialFilter === 'All' ? true : s.material === materialFilter
      )
      .filter((s) => {
        if (!q) return true;
        return [s.brand, s.colorName, s.material, s.uid, s.location, s.notes]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q));
      });
  }, [spools, search, materialFilter]);

  const amsSpools = useMemo(
    () =>
      filteredSpools
        .filter((s) => s.amsSlot && s.amsSlot !== 'external')
        .sort((a, b) => parseInt(a.amsSlot) - parseInt(b.amsSlot)),
    [filteredSpools]
  );
  const externalSpools = useMemo(
    () => filteredSpools.filter((s) => s.amsSlot === 'external' || !s.amsSlot),
    [filteredSpools]
  );

  const groupedExternal = useMemo(() => {
    const groups = {};
    externalSpools.forEach((s) => {
      const brand = s.brand || 'Unbranded';
      if (!groups[brand]) groups[brand] = {};
      const material = s.material || 'Other';
      if (!groups[brand][material]) groups[brand][material] = [];
      groups[brand][material].push(s);
    });
    const sorted = Object.keys(groups).sort();
    const result = {};
    sorted.forEach((brand) => {
      result[brand] = {};
      const materials = Object.keys(groups[brand]).sort();
      materials.forEach((mat) => {
        result[brand][mat] = groups[brand][mat];
      });
    });
    return result;
  }, [externalSpools]);

  const sortedExternal = useMemo(() => {
    if (sortBy === 'default') return null;
    const arr = [...externalSpools];
    if (sortBy === 'remaining')
      arr.sort((a, b) => (a.remainingWeight || 0) - (b.remainingWeight || 0));
    else if (sortBy === 'brand')
      arr.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
    else if (sortBy === 'color')
      arr.sort((a, b) => (a.colorName || '').localeCompare(b.colorName || ''));
    return arr;
  }, [externalSpools, sortBy]);

  const stats = useMemo(() => {
    const loaded = spools.filter(
      (s) => s.amsSlot && s.amsSlot !== 'external'
    ).length;
    const empty = spools.filter(
      (s) => s.needsRefill || s.remainingWeight <= 0
    ).length;
    const low = spools.filter(
      (s) =>
        !s.needsRefill &&
        s.remainingWeight > 0 &&
        pct(s.remainingWeight, s.totalWeight) < lowThreshold
    ).length;
    const totalValue = spools.reduce(
      (sum, s) => sum + (Number(s.spoolPrice) || 0),
      0
    );
    return { total: spools.length, loaded, empty, low, totalValue };
  }, [spools, lowThreshold]);

  const refillList = useMemo(
    () => spools.filter((s) => s.needsRefill || s.remainingWeight <= 0),
    [spools]
  );
  const lowList = useMemo(
    () =>
      spools.filter(
        (s) =>
          !s.needsRefill &&
          s.remainingWeight > 0 &&
          pct(s.remainingWeight, s.totalWeight) < lowThreshold
      ),
    [spools, lowThreshold]
  );

  const globalHistory = useMemo(() => {
    const all = [];
    spools.forEach((s) => {
      (s.history || []).forEach((entry) => {
        all.push({
          ...entry,
          spoolId: s.id,
          spoolBrand: s.brand,
          spoolColor: s.colorName,
          spoolMaterial: s.material,
          spoolHex: s.colorHex,
        });
      });
    });
    all.sort((a, b) => b.timestamp - a.timestamp);
    return all;
  }, [spools]);

  const quickLogSpools = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const s of amsSpools) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        result.push(s);
      }
    }
    const withHistory = [...spools]
      .filter((s) => !seen.has(s.id) && s.history && s.history.length > 0)
      .sort(
        (a, b) =>
          (b.history[0]?.timestamp || 0) - (a.history[0]?.timestamp || 0)
      );
    for (const s of withHistory) {
      if (result.length >= 5) break;
      seen.add(s.id);
      result.push(s);
    }
    return result;
  }, [spools, amsSpools]);

  function openAdd(uidPrefill = '') {
    const defaultBrandOption = 'bambu';
    const defaultPreset = BRAND_TO_PRESET[defaultBrandOption] || 'bambu';
    const defaultTare =
      getTareForBrand('Bambu Lab') || getPreset(defaultPreset).tare;
    setForm({
      ...emptyForm,
      id: null,
      uid: uidPrefill,
      brandOption: defaultBrandOption,
      brand: 'Bambu Lab',
      spoolPreset: defaultPreset,
      tareWeight: defaultTare,
    });
  }

  function openEdit(spool) {
    let brandOption = 'custom';
    let brandName = spool.brand || '';
    for (const opt of BRAND_OPTIONS) {
      if (opt.value !== 'custom' && opt.label === brandName) {
        brandOption = opt.value;
        break;
      }
    }
    if (!brandName) {
      brandOption = 'bambu';
      brandName = 'Bambu Lab';
    }
    const tare =
      spool.tareWeight !== undefined ? spool.tareWeight : tareFor(spool);
    setForm({
      ...emptyForm,
      ...spool,
      brandOption,
      brand: brandName,
      tareWeight: tare,
    });
  }

  function closeForm() {
    setForm(null);
    setTimeout(focusScanner, 50);
  }

  function updateField(key, value) {
    setForm((f) => {
      const next = { ...f, [key]: value };

      if (key === 'brandOption') {
        const opt = BRAND_OPTIONS.find((b) => b.value === value);
        if (opt && opt.value !== 'custom') {
          next.brand = opt.label;
          const presetId = BRAND_TO_PRESET[opt.value];
          if (presetId) {
            next.spoolPreset = presetId;
            const override = getTareForBrand(opt.label);
            if (override !== null && override > 0) next.tareWeight = override;
            else next.tareWeight = getPreset(presetId).tare;
          }
        } else if (opt && opt.value === 'custom') {
          next.brand = f.customSpoolBrand || '';
        }
        const gross = parseFloat(next.scaleWeight) || 0;
        if (gross > 0) {
          const tare = Number(next.tareWeight) || 0;
          next.remainingWeight = Math.max(0, gross - tare);
          next.needsRefill = next.remainingWeight <= 0;
        }
        return next;
      }

      if (key === 'customSpoolBrand') {
        next.brand = value;
      }

      if (
        key === 'scaleWeight' ||
        key === 'spoolPreset' ||
        key === 'tareWeight' ||
        key === 'customTareWeight'
      ) {
        const gross = parseFloat(next.scaleWeight) || 0;
        if (gross > 0) {
          const tare = Number(next.tareWeight) || 0;
          next.remainingWeight = Math.max(0, gross - tare);
          next.needsRefill = next.remainingWeight <= 0;
        }
      }

      if (key === 'spoolPreset' || key === 'material') {
        const def = defaultPriceFor(next.spoolPreset, next.material);
        if (def !== null) next.spoolPrice = def;
      }

      if (key === 'totalWeight' && f.id === null) {
        if (!f.remainingWeight || f.remainingWeight === 0) {
          next.remainingWeight = Number(value) || 0;
        }
      }
      return next;
    });
  }

  function submitForm(e) {
    e.preventDefault();
    if (!form.brand.trim() && !form.colorName.trim()) return;
    const total = Number(form.totalWeight) || 0;
    const remaining = Math.min(
      Number(form.remainingWeight) || 0,
      total || Number(form.remainingWeight) || 0
    );
    const spoolPrice = Number(form.spoolPrice) || 0;
    const tareWeight = Number(form.tareWeight) || 0;

    if (form.saveTareForBrand && form.brand) {
      if (tareWeight > 0) saveBrandOverride(form.brand, tareWeight);
      else deleteBrandOverride(form.brand);
    }

    if (form.id) {
      const next = spools.map((s) => {
        if (s.id === form.id) {
          const updated = {
            ...form,
            totalWeight: total,
            remainingWeight: remaining,
            spoolPrice,
            tareWeight,
          };
          return addHistoryEntry(
            updated,
            'Updated spool',
            `Edited ${form.brand || 'Unbranded'}`,
            'updated'
          );
        }
        return s;
      });
      saveSpools(next);
    } else {
      const newSpool = {
        ...form,
        id: uid(),
        totalWeight: total,
        remainingWeight: remaining,
        spoolPrice,
        tareWeight,
        createdAt: Date.now(),
        history: [
          {
            timestamp: Date.now(),
            action: 'Added spool',
            details: `${form.brand || 'Unbranded'} · ${
              form.colorName || 'No color'
            }`,
            type: 'added',
          },
        ],
      };
      saveSpools([newSpool, ...spools]);
    }
    closeForm();
  }

  function requestDelete(id) {
    setConfirmDeleteId(id);
  }
  function confirmDelete() {
    saveSpools(spools.filter((s) => s.id !== confirmDeleteId));
    setConfirmDeleteId(null);
    setTimeout(focusScanner, 50);
  }

  function openLogUsage(spool) {
    setLogUsage({ id: spool.id, grams: '', printName: '' });
  }
  function closeLogUsage() {
    setLogUsage(null);
    setTimeout(focusScanner, 50);
  }
  function submitLogUsage(e) {
    e.preventDefault();
    const grams = Number(logUsage.grams) || 0;
    if (grams <= 0) {
      closeLogUsage();
      return;
    }
    const printName = (logUsage.printName || '').trim();
    const next = spools.map((s) => {
      if (s.id !== logUsage.id) return s;
      const remaining = Math.max(0, (Number(s.remainingWeight) || 0) - grams);
      const needsRefill = remaining <= 0 ? true : s.needsRefill;
      const cost = grams * costPerGram(s);
      const updated = { ...s, remainingWeight: remaining, needsRefill };
      return addHistoryEntry(
        updated,
        printName ? `Printed "${printName}"` : `Deducted ${grams}g`,
        `${grams}g · ${formatMoney(cost)}`,
        'deduct',
        { printName, grams }
      );
    });
    saveSpools(next);
    closeLogUsage();
  }

  function openWeigh(spool) {
    setWeighModal({ id: spool.id, scaleWeight: '' });
  }
  function closeWeigh() {
    setWeighModal(null);
    setTimeout(focusScanner, 50);
  }
  function submitWeigh(e) {
    e.preventDefault();
    const gross = parseFloat(weighModal.scaleWeight) || 0;
    if (gross <= 0) {
      closeWeigh();
      return;
    }
    const next = spools.map((s) => {
      if (s.id !== weighModal.id) return s;
      const tare = Number(s.tareWeight) || tareFor(s);
      const remaining = Math.max(0, gross - tare);
      const needsRefill = remaining <= 0;
      const updated = { ...s, remainingWeight: remaining, needsRefill };
      return addHistoryEntry(
        updated,
        'Weighed',
        `Gross ${gross}g → ${remaining}g net`,
        'weighed'
      );
    });
    saveSpools(next);
    closeWeigh();
  }

  function closeScanAction() {
    setScanAction(null);
    setTimeout(focusScanner, 50);
  }
  function markNeedsRefillFromScan() {
    if (!scanAction) return;
    const next = spools.map((s) => {
      if (s.id === scanAction.id) {
        const updated = { ...s, needsRefill: true, remainingWeight: 0 };
        return addHistoryEntry(
          updated,
          'Marked empty/refill',
          'Via scan action',
          'refill'
        );
      }
      return s;
    });
    saveSpools(next);
    closeScanAction();
  }

  function startUpdateTag(id) {
    const next = spools.map((s) => (s.id === id ? { ...s, uid: '' } : s));
    saveSpools(next);
    setUpdateTagInput('');
    setUpdatingTagId(id);
  }
  function closeUpdateTag() {
    setUpdatingTagId(null);
    setUpdateTagInput('');
    setTimeout(focusScanner, 50);
  }
  function handleUpdateTagSubmit(e) {
    e.preventDefault();
    const newUid = updateTagInput.trim();
    if (!newUid) return;
    const next = spools.map((s) => {
      if (s.id === updatingTagId) {
        const total = Number(s.totalWeight) || 1000;
        const updated = {
          ...s,
          uid: newUid,
          remainingWeight: total,
          needsRefill: false,
        };
        return addHistoryEntry(
          updated,
          'Updated tag ID',
          `New UID ${newUid}`,
          'linked'
        );
      }
      return s;
    });
    saveSpools(next);
    closeUpdateTag();
  }
  useEffect(() => {
    if (updatingTagId && updateTagInputRef.current)
      updateTagInputRef.current.focus();
  }, [updatingTagId]);

  function markAllRestocked() {
    const ids = new Set(refillList.map((s) => s.id));
    if (ids.size === 0) return;
    const next = spools.map((s) => {
      if (!ids.has(s.id)) return s;
      const total = Number(s.totalWeight) || 0;
      const updated = { ...s, remainingWeight: total, needsRefill: false };
      return addHistoryEntry(
        updated,
        'Restocked',
        `Refilled to ${total}g`,
        'restocked'
      );
    });
    saveSpools(next);
  }

  function purgeHistory() {
    const next = spools.map((s) => ({ ...s, history: [] }));
    saveSpools(next);
    setPurgeConfirmOpen(false);
  }

  function saveLowThreshold(val) {
    const n = Math.max(1, Math.min(50, Number(val) || 15));
    setLowThreshold(n);
    try {
      localStorage.setItem('spoollog_lowThreshold', String(n));
    } catch {}
    setSettingsOpen(false);
  }

  function handleImport() {
    setImportError('');
    try {
      const parsed = JSON.parse(importText.trim());
      if (!Array.isArray(parsed)) {
        setImportError('JSON must be an array of spools.');
        return;
      }
      const migrated = parsed.map((s) => ({
        ...s,
        spoolPreset: s.spoolPreset || 'bambu',
        customSpoolBrand: s.customSpoolBrand || '',
        customTareWeight: s.customTareWeight || 0,
        tareWeight:
          s.tareWeight !== undefined
            ? s.tareWeight
            : (() => {
                const preset = getPreset(s.spoolPreset || 'bambu');
                if (preset.id === 'custom')
                  return Number(s.customTareWeight) || 0;
                return preset.tare;
              })(),
        amsSlot: s.amsSlot || 'external',
        spoolPrice: typeof s.spoolPrice === 'number' ? s.spoolPrice : 0,
        history: s.history || [],
      }));
      saveSpools(migrated);
      setImportOpen(false);
      setImportText('');
    } catch (err) {
      setImportError(
        'Invalid JSON — paste the exported data exactly as copied.'
      );
    }
  }

  function handleScannerSubmit(e) {
    e.preventDefault();
    const raw = scannerValue.trim().replace(/[\r\n]+$/, '');
    if (!raw) return;
    setScannerValue('');
    const found = spools.find(
      (s) => s.uid && s.uid.toLowerCase() === raw.toLowerCase()
    );
    if (found) setScanAction({ id: found.id });
    else openAdd(raw);
  }

  const exportJson = useMemo(() => JSON.stringify(spools, null, 2), [spools]);

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const scanActionTarget = scanAction
    ? spools.find((s) => s.id === scanAction.id)
    : null;
  function getPresetLabel(spool) {
    const preset = getPreset(spool.spoolPreset);
    if (preset.id === 'custom') return spool.customSpoolBrand || 'Custom';
    return preset.label;
  }

  const inputStyle = {
    background: theme.panelAlt,
    border: `1px solid ${theme.line}`,
    color: theme.ink,
    outline: 'none',
    fontFamily: FONT_BODY,
  };

  // ---- Render a single spool plate -----------------------------------------
  let rowIndex = 0;
  function renderSpoolItem(s) {
    rowIndex += 1;
    const percent = pct(s.remainingWeight, s.totalWeight);
    const statusLabel =
      s.needsRefill || s.remainingWeight <= 0
        ? 'Refill'
        : percent < lowThreshold
        ? 'Low'
        : null;
    const statusColor = statusLabel === 'Refill' ? theme.danger : theme.warn;
    const isHistoryExpanded = expandedHistory[s.id] || false;

    return (
      <li
        key={s.id}
        style={{
          position: 'relative',
          background: theme.panel,
          border: `1px solid ${theme.line}`,
        }}
        className="rounded-sm p-4 mb-4 cursor-pointer"
        onClick={() => openEdit(s)}
      >
        <Rivets />
        <div className="flex items-start gap-3.5">
          <PressureGauge percent={percent} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <WaxSeal hex={s.colorHex} />
              <span
                style={{
                  color: theme.ink,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                }}
                className="text-[14px] truncate"
              >
                {s.brand || 'Unbranded'}
                {s.colorName ? ` · ${s.colorName}` : ''}
              </span>
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[10.5px] mt-2 flex items-center gap-2 flex-wrap"
            >
              <span className="uppercase">{s.material}</span>
              <span style={{ color: theme.faint }}>·</span>
              <span style={{ color: theme.ink, fontWeight: 700 }}>
                {Math.round(percent)}%
              </span>
              <span style={{ color: theme.faint }}>
                ({Math.round(s.remainingWeight)}/{Math.round(s.totalWeight)}g)
              </span>
              {s.amsSlot && s.amsSlot !== 'external' && (
                <>
                  <span style={{ color: theme.faint }}>·</span>
                  <span style={{ color: theme.copper, fontWeight: 700 }}>
                    Manifold {s.amsSlot}
                  </span>
                </>
              )}
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[10.5px] mt-1.5 flex items-center gap-2 flex-wrap"
            >
              <span style={{ color: theme.accent, fontWeight: 700 }}>
                {formatMoney(s.spoolPrice)}
              </span>
              <span style={{ color: theme.faint }}>·</span>
              <span>{costPerGram(s).toFixed(4)}/g</span>
              <span style={{ color: theme.faint }}>·</span>
              <span className="truncate">{getPresetLabel(s)}</span>
              {statusLabel && (
                <WarningLamp color={statusColor} label={statusLabel} />
              )}
            </div>
            {(s.uid || s.location) && (
              <div
                style={{ color: theme.faint, fontFamily: FONT_BODY }}
                className="text-[9.5px] mt-1.5 truncate"
              >
                {s.uid && `tag ${s.uid}`}
                {s.uid && s.location ? '  ·  ' : ''}
                {s.location}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 mt-4 pl-[60px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => openWeigh(s)}
            style={{
              border: `1px solid ${theme.line}`,
              background: theme.panelAlt,
            }}
            className="p-2.5 rounded-sm"
            aria-label="Weigh spool"
          >
            <Scale size={13} color={theme.muted} />
          </button>
          <button
            onClick={() => openLogUsage(s)}
            style={{
              border: `1px solid ${theme.line}`,
              background: theme.panelAlt,
            }}
            className="p-2.5 rounded-sm"
            aria-label="Log print usage"
          >
            <Minus size={13} color={theme.muted} />
          </button>
          <button
            onClick={() => startUpdateTag(s.id)}
            style={{
              border: `1px solid ${theme.line}`,
              background: theme.panelAlt,
            }}
            className="p-2.5 rounded-sm"
            aria-label="Update tag ID"
          >
            <RefreshCw size={13} color={theme.muted} />
          </button>
          <button
            onClick={() =>
              setExpandedHistory((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
            }
            style={{
              border: `1px solid ${theme.line}`,
              background: isHistoryExpanded ? theme.accent : theme.panelAlt,
            }}
            className="p-2.5 rounded-sm"
            aria-label="Toggle history"
          >
            <History
              size={13}
              color={isHistoryExpanded ? theme.onAccent : theme.muted}
            />
          </button>
          <button
            onClick={() => openEdit(s)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
            aria-label="Edit spool"
          >
            <Pencil size={13} color={theme.faint} />
          </button>
        </div>

        {isHistoryExpanded && (
          <div
            style={{
              background: theme.panelAlt,
              borderLeft: `3px solid ${theme.copper}`,
            }}
            className="ml-[60px] mt-3 p-4 rounded-sm text-[10px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                color: theme.muted,
                fontFamily: FONT_DISPLAY,
                letterSpacing: '0.06em',
              }}
              className="uppercase mb-2 text-[9.5px]"
            >
              Captain's Log
            </div>
            {s.history && s.history.length > 0 ? (
              <ul className="space-y-2">
                {s.history.slice(0, 15).map((entry, idx) => (
                  <li
                    key={idx}
                    style={{ color: theme.muted, fontFamily: FONT_BODY }}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <LogBadge type={entry.type} />
                      {formatHistoryLine(entry)}
                    </span>
                    <span
                      style={{ color: theme.faint }}
                      className="whitespace-nowrap"
                    >
                      {formatTime(entry.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: theme.faint }}>no entries yet</div>
            )}
          </div>
        )}
      </li>
    );
  }

  // ---- Render grouped list -----------------------------------------------
  function renderGroupedList(groupedData) {
    const brands = Object.keys(groupedData).sort();
    return brands.map((brand) => {
      const isBrandExpanded = expandedBrands[brand] !== false;
      return (
        <div key={brand} className="mb-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none py-2"
            onClick={() =>
              setExpandedBrands((prev) => ({ ...prev, [brand]: !prev[brand] }))
            }
          >
            {isBrandExpanded ? (
              <ChevronDown size={15} color={theme.accent} />
            ) : (
              <ChevronRight size={15} color={theme.accent} />
            )}
            <span
              style={{
                color: theme.ink,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
              className="text-[13px] uppercase"
            >
              {brand}
            </span>
            <span
              style={{ color: theme.faint, fontFamily: FONT_BODY }}
              className="text-[10.5px]"
            >
              (
              {Object.values(groupedData[brand]).reduce(
                (acc, arr) => acc + arr.length,
                0
              )}
              )
            </span>
          </div>
          {isBrandExpanded && (
            <div className="ml-4 mt-2 space-y-3">
              {Object.keys(groupedData[brand])
                .sort()
                .map((material) => {
                  const isMatExpanded =
                    expandedMaterials[`${brand}-${material}`] !== false;
                  const spoolsInMat = groupedData[brand][material];
                  return (
                    <div key={material}>
                      <div
                        className="flex items-center gap-2 cursor-pointer select-none py-1.5"
                        onClick={() =>
                          setExpandedMaterials((prev) => ({
                            ...prev,
                            [`${brand}-${material}`]:
                              !prev[`${brand}-${material}`],
                          }))
                        }
                      >
                        {isMatExpanded ? (
                          <ChevronDown size={13} color={theme.muted} />
                        ) : (
                          <ChevronRight size={13} color={theme.muted} />
                        )}
                        <span
                          style={{ color: theme.muted, fontFamily: FONT_BODY }}
                          className="text-[10.5px] uppercase"
                        >
                          {material}
                        </span>
                        <span
                          style={{ color: theme.faint, fontFamily: FONT_BODY }}
                          className="text-[9.5px]"
                        >
                          {spoolsInMat.length}
                        </span>
                      </div>
                      {isMatExpanded && (
                        <ul className="ml-3 mt-2">
                          {spoolsInMat.map((s) => renderSpoolItem(s))}
                        </ul>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      );
    });
  }

  // ---- Tab content renderers ---------------------------------------------
  const renderDashboard = () => (
    <>
      <div className="flex gap-3 mb-8 flex-wrap">
        <StatPlate label="Spools" value={stats.total} />
        <StatPlate label="Mounted" value={stats.loaded} color={theme.copper} />
        <StatPlate
          label="Empty"
          value={stats.empty}
          color={stats.empty > 0 ? theme.danger : undefined}
        />
        <StatPlate
          label="Low"
          value={stats.low}
          color={stats.low > 0 ? theme.warn : undefined}
        />
        <StatPlate
          label="Value"
          value={formatMoney(stats.totalValue)}
          color={theme.patina}
        />
      </div>

      {quickLogSpools.length > 0 && (
        <div className="mb-8">
          <div
            className="flex items-center justify-between mb-3 pb-2.5"
            style={{ borderBottom: `1px solid ${theme.silver}` }}
          >
            <div className="flex items-center gap-2.5">
              <Gear
                size={14}
                color={theme.silver}
                spin
                duration="6s"
                direction="normal"
              />
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: theme.silver,
                }}
                className="text-[13px] uppercase"
              >
                Quick Log
              </span>
            </div>
            <span
              style={{ color: theme.faint, fontFamily: FONT_BODY }}
              className="text-[10px]"
            >
              tap − to deduct
            </span>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {quickLogSpools.map((s) => {
              const p = Math.round(pct(s.remainingWeight, s.totalWeight));
              const isLow = p < lowThreshold;
              const isEmpty = s.needsRefill || s.remainingWeight <= 0;
              const statusColor = isEmpty
                ? theme.danger
                : isLow
                ? theme.warn
                : theme.patina;
              return (
                <div
                  key={s.id}
                  style={{
                    position: 'relative',
                    background: theme.panel,
                    border: `1px solid ${theme.line}`,
                    flexShrink: 0,
                    width: 110,
                  }}
                  className="rounded-sm p-3 flex flex-col gap-2"
                >
                  <Rivets />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <WaxSeal hex={s.colorHex} size={10} />
                    <span
                      style={{
                        color: theme.ink,
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 600,
                        fontSize: 10.5,
                      }}
                      className="truncate"
                    >
                      {s.colorName || s.brand || 'Spool'}
                    </span>
                  </div>
                  <div
                    style={{ color: theme.faint, fontFamily: FONT_BODY }}
                    className="text-[9px] truncate -mt-1"
                  >
                    {s.brand || 'Unbranded'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PressureGauge percent={p} size={28} />
                    <div>
                      <div
                        style={{
                          color: statusColor,
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                        }}
                        className="text-[13px] leading-none"
                      >
                        {p}%
                      </div>
                      <div
                        style={{ color: theme.faint, fontFamily: FONT_BODY }}
                        className="text-[9px] leading-none mt-0.5"
                      >
                        {Math.round(s.remainingWeight)}g
                      </div>
                    </div>
                  </div>
                  {s.amsSlot && s.amsSlot !== 'external' && (
                    <div
                      style={{
                        color: theme.copper,
                        fontFamily: FONT_BODY,
                        fontSize: 9,
                        letterSpacing: '0.04em',
                      }}
                      className="uppercase"
                    >
                      Slot {s.amsSlot}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLogUsage(s);
                    }}
                    style={{ background: theme.accent, color: theme.onAccent }}
                    className="w-full py-2 rounded-sm flex items-center justify-center gap-1 mt-auto"
                  >
                    <Minus size={12} />
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 10,
                        letterSpacing: '0.04em',
                      }}
                      className="uppercase"
                    >
                      Deduct
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleScannerSubmit} className="max-w-3xl mx-auto mb-8">
        <div
          style={{
            position: 'relative',
            background: theme.panel,
            border: `1.5px solid ${theme.accent}`,
          }}
          className="flex items-center gap-3 px-4 py-3.5 rounded-sm"
        >
          <Rivets />
          <ScanLine size={17} color={theme.accent} style={{ flexShrink: 0 }} />
          <input
            ref={scannerRef}
            value={scannerValue}
            onChange={(e) => setScannerValue(e.target.value)}
            placeholder="Reader primed — present a tag…"
            style={{
              background: 'transparent',
              color: theme.ink,
              outline: 'none',
              fontFamily: FONT_BODY,
              fontSize: '16px',
            }}
            className="flex-1 text-sm placeholder:opacity-50"
            autoFocus
            aria-label="RFID reader input"
          />
          {scannerValue && (
            <button
              type="button"
              onClick={() => setScannerValue('')}
              aria-label="Clear scanner"
            >
              <X size={15} color={theme.faint} />
            </button>
          )}
        </div>
        <div
          style={{
            color: theme.muted,
            fontFamily: FONT_BODY,
            background: theme.bg,
          }}
          className="text-[9.5px] mt-2 px-1 inline-block"
        >
          the apparatus listens — no need to touch the glass, simply scan
        </div>
      </form>

      <div className="mb-10">
        <SectionHeader
          label="AMS Manifold"
          right={
            <span
              style={{ color: theme.faint, fontFamily: FONT_BODY }}
              className="text-[10.5px]"
            >
              {amsSpools.length}/4
            </span>
          }
        />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((slotNum) => {
            const spool = amsSpools.find(
              (s) => parseInt(s.amsSlot) === slotNum
            );
            const p = spool ? pct(spool.remainingWeight, spool.totalWeight) : 0;
            return (
              <div
                key={slotNum}
                style={{
                  position: 'relative',
                  background: theme.panel,
                  border: `1px solid ${theme.line}`,
                }}
                className="rounded-sm p-3 text-center"
              >
                <Rivets />
                <div
                  style={{
                    height: 44,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {spool ? (
                    <>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: theme.glassGlow,
                          boxShadow: `0 0 12px ${theme.accent}55`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PressureGauge percent={p} size={30} />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          marginTop: 5,
                          maxWidth: '100%',
                        }}
                        title={`${spool.brand} ${spool.colorName}`}
                      >
                        <WaxSeal hex={spool.colorHex} size={8} />
                        <div
                          style={{
                            color: theme.ink,
                            fontFamily: FONT_DISPLAY,
                            fontWeight: 600,
                            fontSize: 8.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {spool.brand || '?'}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        color: theme.faint,
                        fontFamily: FONT_BODY,
                        fontSize: 8.5,
                        marginTop: 10,
                      }}
                    >
                      vacant
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <div
          style={{ background: theme.panel, border: `1px solid ${theme.line}` }}
          className="flex items-center gap-2.5 px-4 py-3 rounded-sm flex-1 min-w-0"
        >
          <Search size={15} color={theme.faint} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, color, tag, locale"
            style={{
              background: 'transparent',
              color: theme.ink,
              outline: 'none',
              fontFamily: FONT_BODY,
            }}
            className="flex-1 text-sm placeholder:opacity-50 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search">
              <X size={14} color={theme.faint} />
            </button>
          )}
        </div>
        <div
          style={{ background: theme.panel, border: `1px solid ${theme.line}` }}
          className="flex items-center gap-1.5 px-3 rounded-sm flex-shrink-0"
        >
          <ArrowUpDown size={13} color={theme.copper} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'transparent',
              color: theme.ink,
              outline: 'none',
              fontFamily: FONT_BODY,
            }}
            className="text-[10.5px] py-3"
            aria-label="Sort spools"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="flex gap-2 mb-8 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {materialsPresent.map((m) => {
          const active = materialFilter === m;
          return (
            <button
              key={m}
              onClick={() => setMaterialFilter(m)}
              style={{
                background: active ? theme.accent : theme.panel,
                color: active ? theme.onAccent : theme.muted,
                border: `1px solid ${active ? theme.accent : theme.line}`,
                whiteSpace: 'nowrap',
                fontFamily: FONT_BODY,
              }}
              className="px-3.5 py-2 rounded-sm text-[10.5px] uppercase flex-shrink-0"
            >
              {m}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div
          className="text-center py-20 flex flex-col items-center gap-3.5"
          style={{ color: theme.faint, fontFamily: FONT_BODY }}
        >
          <Gear
            size={24}
            color={theme.accent}
            spin
            duration="4s"
            direction="normal"
          />{' '}
          winding the mechanism…
        </div>
      ) : (
        <>
          {amsSpools.length > 0 && (
            <div className="mb-10">
              <SectionHeader label="Mounted in Manifold" />
              <ul>{amsSpools.map((s) => renderSpoolItem(s))}</ul>
            </div>
          )}
          {Object.keys(groupedExternal).length > 0 && (
            <div className="mb-10">
              <SectionHeader
                label="Storage Cabinet"
                right={<ExternalLink size={13} color={theme.muted} />}
              />
              {sortBy === 'default' ? (
                renderGroupedList(groupedExternal)
              ) : (
                <ul>{sortedExternal.map((s) => renderSpoolItem(s))}</ul>
              )}
            </div>
          )}
          {amsSpools.length === 0 &&
            Object.keys(groupedExternal).length === 0 && (
              <div className="text-center py-20 px-6">
                <Package
                  size={30}
                  color={theme.faint}
                  style={{ margin: '0 auto 16px' }}
                />
                <div
                  style={{ color: theme.muted, fontFamily: FONT_BODY }}
                  className="text-[13.5px] leading-relaxed"
                >
                  {spools.length === 0
                    ? 'The cabinet stands empty. Scan a tag or tap + to log your first spool.'
                    : 'Nothing in the ledger matches that search.'}
                </div>
              </div>
            )}
        </>
      )}
    </>
  );

  const renderShoppingList = () => {
    const totalEmptyCost = refillList.reduce(
      (sum, s) => sum + (Number(s.spoolPrice) || 0),
      0
    );
    const totalLowCost = lowList.reduce(
      (sum, s) => sum + (Number(s.spoolPrice) || 0),
      0
    );
    const totalCombined = totalEmptyCost + totalLowCost;
    const nothingNeeded = refillList.length === 0 && lowList.length === 0;

    const copyShoppingList = async () => {
      if (nothingNeeded) return;
      const lines = [];
      if (refillList.length > 0) {
        lines.push('== ORDER NOW (Empty) ==');
        refillList.forEach((s) =>
          lines.push(
            `${s.brand || 'Unbranded'} ${s.colorName || ''} (${
              s.material
            }) — ${formatMoney(s.spoolPrice)}`
          )
        );
      }
      if (lowList.length > 0) {
        lines.push('== ORDER SOON (Low) ==');
        lowList.forEach((s) => {
          const p = Math.round(pct(s.remainingWeight, s.totalWeight));
          lines.push(
            `${s.brand || 'Unbranded'} ${s.colorName || ''} (${
              s.material
            }) ${p}% left — ${formatMoney(s.spoolPrice)}`
          );
        });
      }
      try {
        await navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* fallback */
      }
    };

    const SpoolRow = ({ s, urgency }) => {
      const p = Math.round(pct(s.remainingWeight, s.totalWeight));
      const rowAccent = urgency === 'empty' ? theme.danger : theme.warn;
      return (
        <li
          className="flex items-center gap-3.5"
          style={{
            borderBottom: `1px dashed ${theme.line}`,
            paddingBottom: 14,
          }}
        >
          <WaxSeal hex={s.colorHex} size={15} />
          <div className="flex-1 min-w-0">
            <div
              style={{ color: theme.ink, fontFamily: FONT_BODY }}
              className="text-[13.5px] truncate"
            >
              {s.brand || 'Unbranded'}
              {s.colorName ? ` · ${s.colorName}` : ''}
              <span
                style={{ color: theme.muted }}
                className="text-[10.5px] ml-2 uppercase"
              >
                {s.material}
              </span>
            </div>
            <div
              style={{ color: rowAccent, fontFamily: FONT_BODY }}
              className="text-[10px] mt-0.5"
            >
              {urgency === 'empty'
                ? 'Empty — needs refill'
                : `${p}% remaining · ${Math.round(s.remainingWeight)}g left`}
            </div>
          </div>
          <span
            style={{
              color: theme.accent,
              fontFamily: FONT_BODY,
              fontWeight: 700,
            }}
            className="text-[13.5px] flex-shrink-0"
          >
            {formatMoney(s.spoolPrice)}
          </span>
        </li>
      );
    };

    return (
      <div className="mt-4">
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            color: theme.silver,
          }}
          className="text-lg uppercase mb-5"
        >
          Requisition Ledger
        </h2>
        <div
          style={{
            position: 'relative',
            background: theme.panel,
            border: `1.5px solid ${theme.accent}`,
          }}
          className="rounded-sm p-5 mb-6"
        >
          <Rivets />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div
                style={{
                  color: theme.muted,
                  fontFamily: FONT_BODY,
                  letterSpacing: '0.06em',
                }}
                className="text-[10px] uppercase"
              >
                Total Re-Stock Cost
              </div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  color: theme.accent,
                }}
                className="text-[30px] mt-1 leading-none"
              >
                {formatMoney(totalCombined)}
              </div>
              <div
                style={{ color: theme.faint, fontFamily: FONT_BODY }}
                className="text-[10.5px] mt-2 flex items-center gap-3 flex-wrap"
              >
                {refillList.length > 0 && (
                  <span style={{ color: theme.danger }}>
                    {refillList.length} empty
                  </span>
                )}
                {refillList.length > 0 && lowList.length > 0 && (
                  <span style={{ color: theme.faint }}>·</span>
                )}
                {lowList.length > 0 && (
                  <span style={{ color: theme.warn }}>
                    {lowList.length} running low
                  </span>
                )}
                {nothingNeeded && <span>All spools well stocked</span>}
              </div>
            </div>
            <Gear
              size={34}
              color={theme.accent}
              spin
              duration="4s"
              direction="normal"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5 mb-8 flex-wrap">
          <button
            onClick={copyShoppingList}
            disabled={nothingNeeded}
            style={{
              background: theme.panelAlt,
              border: `1px solid ${theme.line}`,
              color: theme.muted,
              opacity: nothingNeeded ? 0.5 : 1,
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-[11px] uppercase"
          >
            <ClipboardCopy size={14} />
            {copied ? 'Copied!' : 'Copy List'}
          </button>
          <button
            onClick={markAllRestocked}
            disabled={refillList.length === 0}
            style={{
              background: theme.patina,
              border: `1px solid ${theme.patina}`,
              color: theme.bg,
              opacity: refillList.length === 0 ? 0.5 : 1,
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-[11px] uppercase font-semibold"
          >
            <Check size={14} /> Mark Empty Restocked
          </button>
        </div>
        {nothingNeeded ? (
          <div
            style={{ color: theme.faint, fontFamily: FONT_BODY }}
            className="text-[13.5px] py-12 text-center leading-relaxed"
          >
            Nothing wanting — the cabinet is well stocked.
          </div>
        ) : (
          <>
            {refillList.length > 0 && (
              <div className="mb-8">
                <div
                  className="flex items-center justify-between mb-3 pb-2"
                  style={{ borderBottom: `1px solid ${theme.danger}` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 9999,
                        background: theme.danger,
                        boxShadow: `0 0 6px ${theme.danger}`,
                        flexShrink: 0,
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 600,
                        color: theme.danger,
                        letterSpacing: '0.06em',
                      }}
                      className="text-[12px] uppercase"
                    >
                      Order Now — Empty
                    </span>
                  </div>
                  <span
                    style={{
                      color: theme.danger,
                      fontFamily: FONT_BODY,
                      fontWeight: 700,
                    }}
                    className="text-[12px]"
                  >
                    {formatMoney(totalEmptyCost)}
                  </span>
                </div>
                <ul className="space-y-4">
                  {refillList.map((s) => (
                    <SpoolRow key={s.id} s={s} urgency="empty" />
                  ))}
                </ul>
              </div>
            )}
            {lowList.length > 0 && (
              <div className="mb-8">
                <div
                  className="flex items-center justify-between mb-3 pb-2"
                  style={{ borderBottom: `1px solid ${theme.warn}` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 9999,
                        background: theme.warn,
                        boxShadow: `0 0 6px ${theme.warn}`,
                        flexShrink: 0,
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 600,
                        color: theme.warn,
                        letterSpacing: '0.06em',
                      }}
                      className="text-[12px] uppercase"
                    >
                      Order Soon — Running Low
                    </span>
                  </div>
                  <span
                    style={{
                      color: theme.warn,
                      fontFamily: FONT_BODY,
                      fontWeight: 700,
                    }}
                    className="text-[12px]"
                  >
                    {formatMoney(totalLowCost)}
                  </span>
                </div>
                <ul className="space-y-4">
                  {lowList.map((s) => (
                    <SpoolRow key={s.id} s={s} urgency="low" />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderGlobalHistory = () => (
    <div className="mt-4">
      <div
        className="flex items-center justify-between mb-4 pb-2.5"
        style={{ borderBottom: `1px solid ${theme.silver}` }}
      >
        <div className="flex items-center gap-2.5">
          <Gear
            size={14}
            color={theme.silver}
            spin
            duration="6s"
            direction="normal"
          />
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: theme.silver,
            }}
            className="text-[13px] uppercase"
          >
            Global Ledger
          </span>
        </div>
        <button
          onClick={() => setPurgeConfirmOpen(true)}
          disabled={globalHistory.length === 0}
          style={{
            background: theme.panelAlt,
            border: `1px solid ${theme.danger}`,
            color: theme.danger,
            opacity: globalHistory.length === 0 ? 0.5 : 1,
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] uppercase"
        >
          <Trash2 size={12} /> Purge Log
        </button>
      </div>
      {globalHistory.length === 0 ? (
        <div
          style={{ color: theme.faint, fontFamily: FONT_BODY }}
          className="text-[13.5px] py-12 text-center leading-relaxed"
        >
          No events recorded yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {globalHistory.map((entry, idx) => {
            const spool = spools.find((s) => s.id === entry.spoolId);
            return (
              <li
                key={idx}
                style={{ borderBottom: `1px dotted ${theme.line}` }}
                className="pb-3 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <WaxSeal hex={entry.spoolHex} size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    style={{ color: theme.ink, fontFamily: FONT_BODY }}
                    className="text-[12.5px] flex items-center gap-2 flex-wrap"
                  >
                    <LogBadge type={entry.type} />
                    <span className="font-semibold">
                      {formatHistoryLine(entry)}
                    </span>
                  </div>
                  <div
                    style={{ color: theme.faint, fontFamily: FONT_BODY }}
                    className="text-[10.5px] mt-1 flex items-center gap-2"
                  >
                    <span>
                      {spool?.brand || 'Unknown'} {spool?.colorName || ''}
                    </span>
                    <span>·</span>
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  // ---- Main render -------------------------------------------------------
  return (
    <div
      style={{
        background: theme.bg,
        color: theme.ink,
        minHeight: '100vh',
        fontFamily: FONT_BODY,
        position: 'relative',
        overflow: 'hidden',
      }}
      className="w-full pb-64"
    >
      <style>{`@keyframes spoollog-gear-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <DecorativeGears />
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 md:px-6 pt-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Gear
              size={28}
              color={theme.accent}
              spin
              duration="4s"
              direction="normal"
            />
            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                color: theme.silver,
                letterSpacing: '0.04em',
              }}
              className="text-[26px] uppercase"
            >
              The Filament Ledger
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setImportOpen(true)}
              className="p-2 hover:bg-[#3D2B1F] rounded-full transition-colors"
              title="Import JSON"
            >
              <Package size={22} color={theme.muted} />
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="p-2 hover:bg-[#3D2B1F] rounded-full transition-colors"
              title="Export JSON"
            >
              <ClipboardCopy size={22} color={theme.muted} />
            </button>
            <button
              onClick={() => {
                setSettingsOpen(true);
                setPendingThreshold(lowThreshold);
              }}
              className="p-2 hover:bg-[#3D2B1F] rounded-full transition-colors"
              title="Settings"
            >
              <Settings size={22} color={theme.muted} />
            </button>
          </div>
        </div>
        <div
          style={{
            color: theme.muted,
            fontFamily: FONT_BODY,
            letterSpacing: '0.04em',
          }}
          className="text-[10.5px] mb-7"
        >
          ye olde filament inventory, est. workshop log
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'shopping' && renderShoppingList()}
        {activeTab === 'history' && renderGlobalHistory()}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: theme.panel,
          borderTop: `1px solid ${theme.silver}`,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.4)',
          zIndex: 20,
        }}
        className="flex items-center justify-around py-3 px-3"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? theme.accent : 'transparent',
                color: isActive ? theme.onAccent : theme.muted,
                border: isActive ? `1px solid ${theme.lineBright}` : 'none',
              }}
              className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-sm transition-colors"
            >
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
              <span
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 9.5,
                  letterSpacing: '0.04em',
                }}
                className="uppercase"
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => openAdd()}
        style={{
          position: 'fixed',
          bottom: 'calc(110px + env(safe-area-inset-bottom))',
          right: '1.75rem',
          background: theme.accent,
          color: theme.onAccent,
          border: `2px solid ${theme.lineBright}`,
          boxShadow: '0 8px 18px rgba(0,0,0,0.45)',
          zIndex: 10,
        }}
        className="w-16 h-16 rounded-full flex items-center justify-center"
        aria-label="Add spool"
      >
        <Plus size={28} />
      </button>

      {saving && (
        <div
          style={{
            background: theme.panel,
            color: theme.accent,
            border: `1px solid ${theme.line}`,
            fontFamily: FONT_BODY,
          }}
          className="fixed top-5 left-1/2 -translate-x-1/2 text-[10.5px] px-4 py-2 rounded-sm flex items-center gap-2.5 z-50"
        >
          <Gear
            size={12}
            color={theme.accent}
            spin
            duration="3s"
            direction="normal"
          />{' '}
          recording…
        </div>
      )}

      {/* ---- All modals (unchanged) ---- */}
      {scanActionTarget && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-end sm:items-center sm:justify-center z-30"
          onClick={closeScanAction}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.lineBright}`,
            }}
            className="w-full sm:max-w-md sm:rounded-sm rounded-t-sm p-7"
          >
            <Rivets />
            <div
              style={{
                color: theme.copper,
                fontFamily: FONT_BODY,
                letterSpacing: '0.1em',
              }}
              className="text-[10.5px] uppercase mb-2"
            >
              Tag matched
            </div>
            <div
              style={{
                color: theme.ink,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
              }}
              className="text-2xl"
            >
              {scanActionTarget.brand || 'Unbranded'}
              {scanActionTarget.colorName
                ? ` · ${scanActionTarget.colorName}`
                : ''}
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[12.5px] mb-6 mt-1.5"
            >
              {Math.round(scanActionTarget.remainingWeight)}g remaining ·{' '}
              {scanActionTarget.material}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setScanAction(null);
                  openWeigh(scanActionTarget);
                }}
                style={{ background: theme.accent, color: theme.onAccent }}
                className="py-3.5 rounded-sm text-sm font-semibold flex items-center justify-center gap-2.5 uppercase"
              >
                <Scale size={15} /> Weigh spool now
              </button>
              <button
                onClick={markNeedsRefillFromScan}
                style={{
                  background: theme.panelAlt,
                  color: theme.danger,
                  border: `1px solid ${theme.danger}`,
                }}
                className="py-3.5 rounded-sm text-sm font-semibold flex items-center justify-center gap-2.5 uppercase"
              >
                <AlertTriangle size={15} /> Mark empty / needs refill
              </button>
              <button
                onClick={() => {
                  setScanAction(null);
                  openEdit(scanActionTarget);
                }}
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                }}
                className="py-3.5 rounded-sm text-sm font-semibold uppercase"
              >
                Edit details
              </button>
              <button
                onClick={closeScanAction}
                style={{ color: theme.faint }}
                className="py-2.5 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {form && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-end sm:items-center sm:justify-center z-20"
          onClick={closeForm}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitForm}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.lineBright}`,
            }}
            className="w-full sm:max-w-md sm:rounded-sm rounded-t-sm p-7 max-h-[90vh] overflow-y-auto"
          >
            <Rivets />
            <div className="flex items-center justify-between mb-6">
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  color: theme.ink,
                }}
                className="text-xl uppercase"
              >
                {form.id
                  ? 'Edit spool'
                  : form.uid
                  ? 'First scan — link this tag'
                  : 'Log a spool'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="p-1"
              >
                <X size={19} color={theme.faint} />
              </button>
            </div>

            <Field label="Scanned tag ID">
              <input
                value={form.uid}
                onChange={(e) => updateField('uid', e.target.value)}
                placeholder="Scan with reader, or paste manually"
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              />
            </Field>

            <Field label="Brand">
              <select
                value={form.brandOption || 'custom'}
                onChange={(e) => updateField('brandOption', e.target.value)}
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              >
                {BRAND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {form.brandOption === 'custom' && (
                <input
                  type="text"
                  value={form.customSpoolBrand || form.brand || ''}
                  onChange={(e) =>
                    updateField('customSpoolBrand', e.target.value)
                  }
                  placeholder="Enter brand name"
                  style={{ ...inputStyle, marginTop: '0.5rem' }}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                />
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Material">
                <select
                  value={form.material}
                  onChange={(e) => updateField('material', e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Color name">
                <input
                  value={form.colorName}
                  onChange={(e) => updateField('colorName', e.target.value)}
                  placeholder="Onyx Black"
                  style={inputStyle}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4">
              <Field label="Swatch">
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => updateField('colorHex', e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: '2px',
                    width: '48px',
                    height: '44px',
                  }}
                  className="rounded-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Total weight (g)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={form.totalWeight}
                  onChange={(e) => updateField('totalWeight', e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                />
              </Field>
              <Field label="Remaining (g)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  value={form.remainingWeight}
                  onChange={(e) =>
                    updateField('remainingWeight', e.target.value)
                  }
                  style={inputStyle}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Spool price (CAD)">
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.muted,
                      fontSize: 13,
                      pointerEvents: 'none',
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.spoolPrice}
                    onChange={(e) => updateField('spoolPrice', e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 24 }}
                    className="w-full px-4 py-3 text-sm rounded-sm"
                  />
                </div>
              </Field>
              <Field label="Cost / gram (auto)">
                <div
                  style={{ ...inputStyle, opacity: 0.75 }}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                >
                  {costPerGram({
                    totalWeight: form.totalWeight,
                    spoolPrice: form.spoolPrice,
                  }).toFixed(4)}
                  /g
                </div>
              </Field>
            </div>
            <div
              style={{ color: theme.faint, fontFamily: FONT_BODY }}
              className="text-[10px] -mt-2 mb-4"
            >
              price auto-fills from brand + material — overwrite freely
            </div>

            <Field label="AMS Slot">
              <select
                value={form.amsSlot || 'external'}
                onChange={(e) => updateField('amsSlot', e.target.value)}
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              >
                {AMS_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Spool Brand Preset">
              <select
                value={form.spoolPreset}
                onChange={(e) => updateField('spoolPreset', e.target.value)}
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              >
                {SPOOL_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} {p.id !== 'custom' ? `— ${p.tare}g` : ''}
                  </option>
                ))}
              </select>
            </Field>

            {form.spoolPreset === 'custom' && (
              <Field label="Custom Spool Brand Name">
                <input
                  value={form.customSpoolBrand}
                  onChange={(e) =>
                    updateField('customSpoolBrand', e.target.value)
                  }
                  placeholder="e.g. Generic"
                  style={inputStyle}
                  className="w-full px-4 py-3 text-sm rounded-sm"
                />
              </Field>
            )}

            <Field label="Tare weight (g) — empty spool + core">
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.tareWeight}
                onChange={(e) => updateField('tareWeight', e.target.value)}
                placeholder="e.g. 239"
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              />
              <div
                style={{ color: theme.faint, fontFamily: FONT_BODY }}
                className="text-[10px] mt-1.5 leading-relaxed"
              >
                The weight of the empty spool (including cardboard core). Used
                to calculate net filament from gross scale weight.
              </div>
            </Field>

            {/* ---- Dynamic checkbox label ---- */}
            {form.brand && (
              <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.saveTareForBrand || false}
                  onChange={(e) =>
                    setForm({ ...form, saveTareForBrand: e.target.checked })
                  }
                  style={{ accentColor: theme.accent }}
                />
                <span
                  style={{ color: theme.muted, fontFamily: FONT_BODY }}
                  className="text-[11px]"
                >
                  Remember this tare for all{' '}
                  <strong>
                    {form.customSpoolBrand || form.brand || 'Custom'}
                  </strong>{' '}
                  spools
                </span>
              </label>
            )}

            <Field
              label={`Scale weight (g) — gross, tare = ${
                Number(form.tareWeight) || 0
              }g`}
            >
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={form.scaleWeight}
                onChange={(e) => updateField('scaleWeight', e.target.value)}
                placeholder={`e.g. ${
                  (Number(form.tareWeight) || 0) + 600
                } → remaining 600g`}
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              />
              <div
                style={{ color: theme.faint, fontFamily: FONT_BODY }}
                className="text-[10px] mt-1.5 leading-relaxed"
              >
                Total weight of spool + filament on the scale. Net remaining is
                calculated automatically.
              </div>
            </Field>

            <Field label="Location (optional)">
              <input
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Dry box, shelf B"
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm"
              />
            </Field>
            <Field label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={2}
                style={inputStyle}
                className="w-full px-4 py-3 text-sm rounded-sm resize-none"
              />
            </Field>

            <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!form.needsRefill}
                onChange={(e) => updateField('needsRefill', e.target.checked)}
                style={{ accentColor: theme.danger }}
              />
              <span
                style={{ color: theme.muted, fontFamily: FONT_BODY }}
                className="text-[12.5px]"
              >
                Flag as empty / needs refill
              </span>
            </label>

            <div className="flex gap-3 mt-3">
              {form.id && (
                <button
                  type="button"
                  onClick={() => {
                    closeForm();
                    requestDelete(form.id);
                  }}
                  style={{
                    background: theme.panelAlt,
                    border: `1.5px solid ${theme.danger}`,
                    color: theme.danger,
                  }}
                  className="flex-shrink-0 p-3 rounded-sm"
                  aria-label="Delete spool"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                type="submit"
                style={{ background: theme.accent, color: theme.onAccent }}
                className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
              >
                {form.id ? 'Save changes' : 'Add to library'}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDeleteId && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-center justify-center z-30 px-8"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.danger}`,
            }}
            className="rounded-sm p-7 w-full max-w-sm"
          >
            <Rivets />
            <div
              style={{
                color: theme.ink,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
              }}
              className="text-lg uppercase"
            >
              Remove this spool?
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[12.5px] mb-6 mt-1.5"
            >
              This cannot be undone.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                }}
                className="flex-1 py-3 rounded-sm text-sm uppercase"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ background: theme.danger, color: '#fff' }}
                className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {purgeConfirmOpen && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-center justify-center z-30 px-8"
          onClick={() => setPurgeConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.danger}`,
            }}
            className="rounded-sm p-7 w-full max-w-sm"
          >
            <Rivets />
            <div
              style={{
                color: theme.ink,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
              }}
              className="text-lg uppercase"
            >
              Purge the captain's log?
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[12.5px] mb-6 mt-1.5 leading-relaxed"
            >
              This clears the recorded history on every spool, including the
              Global Ledger. Spools, weights, and prices are untouched.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPurgeConfirmOpen(false)}
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                }}
                className="flex-1 py-3 rounded-sm text-sm uppercase"
              >
                Cancel
              </button>
              <button
                onClick={purgeHistory}
                style={{ background: theme.danger, color: '#fff' }}
                className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
              >
                Purge log
              </button>
            </div>
          </div>
        </div>
      )}

      {logUsage &&
        (() => {
          const target = spools.find((s) => s.id === logUsage.id);
          if (!target) return null;
          const grams = Number(logUsage.grams) || 0;
          const estCost = grams * costPerGram(target);
          return (
            <div
              style={{ background: 'rgba(20,14,9,0.7)' }}
              className="fixed inset-0 flex items-center justify-center z-30 px-8"
              onClick={closeLogUsage}
            >
              <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={submitLogUsage}
                style={{
                  position: 'relative',
                  background: theme.panel,
                  border: `1px solid ${theme.lineBright}`,
                }}
                className="rounded-sm p-7 w-full max-w-sm"
              >
                <Rivets />
                <div
                  style={{
                    color: theme.ink,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                  }}
                  className="text-lg uppercase"
                >
                  Log print on {target.brand || 'Unbranded'}
                  {target.colorName ? ` · ${target.colorName}` : ''}
                </div>
                <div
                  style={{ color: theme.muted, fontFamily: FONT_BODY }}
                  className="text-[12.5px] mb-5 mt-1.5"
                >
                  {Math.round(target.remainingWeight)}g currently left
                </div>
                <Field label="Print name (optional)">
                  <input
                    type="text"
                    value={logUsage.printName}
                    onChange={(e) =>
                      setLogUsage((l) => ({ ...l, printName: e.target.value }))
                    }
                    placeholder="Benchy"
                    style={inputStyle}
                    className="w-full px-4 py-3 text-sm rounded-sm"
                  />
                </Field>
                <Field label="Grams used">
                  <input
                    type="text"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    autoFocus
                    value={logUsage.grams}
                    onChange={(e) =>
                      setLogUsage((l) => ({ ...l, grams: e.target.value }))
                    }
                    placeholder="25"
                    style={inputStyle}
                    className="w-full px-4 py-3 text-sm rounded-sm"
                  />
                </Field>
                <div className="flex items-center justify-between mb-6 px-0.5 mt-1">
                  <span
                    style={{ color: theme.faint, fontFamily: FONT_BODY }}
                    className="text-[10.5px] uppercase"
                  >
                    Estimated cost
                  </span>
                  <span
                    style={{
                      color: theme.accent,
                      fontWeight: 700,
                      fontFamily: FONT_DISPLAY,
                    }}
                    className="text-[15px]"
                  >
                    {formatMoney(estCost)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeLogUsage}
                    style={{
                      background: theme.panelAlt,
                      border: `1px solid ${theme.line}`,
                      color: theme.ink,
                    }}
                    className="flex-1 py-3 rounded-sm text-sm uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: theme.copper, color: '#fff' }}
                    className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
                  >
                    Subtract
                  </button>
                </div>
              </form>
            </div>
          );
        })()}

      {weighModal &&
        (() => {
          const target = spools.find((s) => s.id === weighModal.id);
          if (!target) return null;
          const tare = Number(target.tareWeight) || tareFor(target);
          const preset = getPreset(target.spoolPreset);
          const presetLabel =
            preset.id === 'custom'
              ? target.customSpoolBrand || 'Custom'
              : preset.label;
          return (
            <div
              style={{ background: 'rgba(20,14,9,0.7)' }}
              className="fixed inset-0 flex items-center justify-center z-30 px-8"
              onClick={closeWeigh}
            >
              <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={submitWeigh}
                style={{
                  position: 'relative',
                  background: theme.panel,
                  border: `1px solid ${theme.lineBright}`,
                }}
                className="rounded-sm p-7 w-full max-w-sm"
              >
                <Rivets />
                <div
                  style={{
                    color: theme.ink,
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                  }}
                  className="text-lg uppercase"
                >
                  Weigh {target.brand || 'Unbranded'}
                  {target.colorName ? ` · ${target.colorName}` : ''}
                </div>
                <div
                  style={{ color: theme.muted, fontFamily: FONT_BODY }}
                  className="text-[12.5px] mb-1.5 mt-1.5"
                >
                  Current remaining: {Math.round(target.remainingWeight)}g
                </div>
                <div
                  style={{ color: theme.faint, fontFamily: FONT_BODY }}
                  className="text-[10px] mb-5 leading-relaxed"
                >
                  Enter gross weight (spool + filament). Tare = {tare}g (
                  {presetLabel})
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  inputMode="decimal"
                  autoFocus
                  value={weighModal.scaleWeight}
                  onChange={(e) =>
                    setWeighModal((w) => ({
                      ...w,
                      scaleWeight: e.target.value,
                    }))
                  }
                  placeholder="e.g. 850"
                  style={inputStyle}
                  className="w-full px-4 py-3 text-sm rounded-sm mb-6"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeWeigh}
                    style={{
                      background: theme.panelAlt,
                      border: `1px solid ${theme.line}`,
                      color: theme.ink,
                    }}
                    className="flex-1 py-3 rounded-sm text-sm uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ background: theme.accent, color: theme.onAccent }}
                    className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
                  >
                    Update remaining
                  </button>
                </div>
              </form>
            </div>
          );
        })()}

      {updatingTagId && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-center justify-center z-30 px-8"
          onClick={closeUpdateTag}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdateTagSubmit}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.lineBright}`,
            }}
            className="rounded-sm p-7 w-full max-w-sm"
          >
            <Rivets />
            <div
              style={{
                color: theme.ink,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
              }}
              className="text-lg uppercase"
            >
              Update tag ID
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[12.5px] mb-5 mt-1.5 leading-relaxed"
            >
              Scan the new tag to replace the old one.
              <br />
              This resets remaining weight to <strong>1000g</strong> and clears
              the refill flag.
            </div>
            <input
              ref={updateTagInputRef}
              type="text"
              value={updateTagInput}
              onChange={(e) => setUpdateTagInput(e.target.value)}
              placeholder="Scan or type new UID"
              style={inputStyle}
              className="w-full px-4 py-3 text-sm rounded-sm mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeUpdateTag}
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                }}
                className="flex-1 py-3 rounded-sm text-sm uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ background: theme.copper, color: '#fff' }}
                className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
              >
                Update tag
              </button>
            </div>
          </form>
        </div>
      )}

      {exportOpen && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-end sm:items-center sm:justify-center z-20"
          onClick={() => setExportOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.lineBright}`,
            }}
            className="w-full sm:max-w-md sm:rounded-sm rounded-t-sm p-7 max-h-[80vh] flex flex-col"
          >
            <Rivets />
            <div className="flex items-center justify-between mb-3">
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  color: theme.ink,
                }}
                className="text-xl uppercase"
              >
                Export library
              </h2>
              <button
                onClick={() => setExportOpen(false)}
                aria-label="Close"
                className="p-1"
              >
                <X size={19} color={theme.faint} />
              </button>
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[12.5px] mb-4 leading-relaxed"
            >
              Raw JSON of everything logged here — useful if you move this into
              Spoolman later.
            </div>
            <textarea
              readOnly
              value={exportJson}
              style={{ ...inputStyle, fontSize: '11px' }}
              className="w-full px-4 py-3 rounded-sm flex-1 min-h-[180px] resize-none"
            />
            <button
              onClick={copyExport}
              style={{ background: theme.accent, color: theme.onAccent }}
              className="mt-4 py-3 rounded-sm text-sm font-semibold flex items-center justify-center gap-2.5 uppercase"
            >
              {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
        </div>
      )}

      {importOpen && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-end sm:items-center sm:justify-center z-20"
          onClick={() => {
            setImportOpen(false);
            setImportText('');
            setImportError('');
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.lineBright}`,
            }}
            className="w-full sm:max-w-md sm:rounded-sm rounded-t-sm p-7 max-h-[80vh] flex flex-col"
          >
            <Rivets />
            <div className="flex items-center justify-between mb-3">
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  color: theme.ink,
                }}
                className="text-xl uppercase"
              >
                Import Library
              </h2>
              <button
                onClick={() => {
                  setImportOpen(false);
                  setImportText('');
                  setImportError('');
                }}
                className="p-1"
              >
                <X size={19} color={theme.faint} />
              </button>
            </div>
            <div
              style={{ color: theme.muted, fontFamily: FONT_BODY }}
              className="text-[12.5px] mb-4 leading-relaxed"
            >
              Paste your exported JSON below. This will{' '}
              <strong style={{ color: theme.danger }}>replace</strong> your
              entire current library.
            </div>
            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportError('');
              }}
              placeholder='[{"id":"s_abc123", "brand":"Bambu Lab", ...}]'
              style={{
                ...{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                  outline: 'none',
                  fontFamily: FONT_BODY,
                },
                fontSize: '11px',
              }}
              className="w-full px-4 py-3 rounded-sm flex-1 min-h-[160px] resize-none"
            />
            {importError && (
              <div
                style={{ color: theme.danger, fontFamily: FONT_BODY }}
                className="text-[11px] mt-2"
              >
                {importError}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setImportOpen(false);
                  setImportText('');
                  setImportError('');
                }}
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                }}
                className="flex-1 py-3 rounded-sm text-sm uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                style={{
                  background: theme.copper,
                  color: '#fff',
                  opacity: importText.trim() ? 1 : 0.5,
                }}
                className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
              >
                Import & Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          style={{ background: 'rgba(20,14,9,0.7)' }}
          className="fixed inset-0 flex items-center justify-center z-30 px-8"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: theme.panel,
              border: `1px solid ${theme.lineBright}`,
            }}
            className="rounded-sm p-7 w-full max-w-sm overflow-y-auto max-h-[90vh]"
          >
            <Rivets />
            <div className="flex items-center justify-between mb-6">
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  color: theme.silver,
                }}
                className="text-lg uppercase"
              >
                Settings
              </h2>
              <button onClick={() => setSettingsOpen(false)} className="p-1">
                <X size={19} color={theme.faint} />
              </button>
            </div>
            <div className="mb-6">
              <label
                style={{
                  color: theme.muted,
                  letterSpacing: '0.04em',
                  fontFamily: FONT_BODY,
                }}
                className="text-[10px] uppercase block mb-1.5"
              >
                Low Filament Threshold
              </label>
              <div
                style={{ color: theme.faint, fontFamily: FONT_BODY }}
                className="text-[10.5px] mb-3 leading-relaxed"
              >
                Spools below this % of total weight show a Low warning and
                appear on the Shopping List. Currently{' '}
                <span style={{ color: theme.warn, fontWeight: 700 }}>
                  {lowThreshold}%
                </span>
                .
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={pendingThreshold}
                  onChange={(e) =>
                    setPendingThreshold(
                      Math.max(1, Math.min(50, Number(e.target.value) || 1))
                    )
                  }
                  style={{
                    background: theme.panelAlt,
                    border: `1px solid ${theme.line}`,
                    color: theme.ink,
                    outline: 'none',
                    fontFamily: FONT_BODY,
                  }}
                  className="w-24 px-4 py-3 text-sm rounded-sm"
                />
                <span
                  style={{ color: theme.muted, fontFamily: FONT_BODY }}
                  className="text-sm"
                >
                  %
                </span>
              </div>
              <div
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                }}
                className="mt-3 px-4 py-3 rounded-sm"
              >
                <div
                  style={{
                    color: theme.muted,
                    fontFamily: FONT_BODY,
                    letterSpacing: '0.04em',
                  }}
                  className="text-[9px] uppercase mb-2"
                >
                  Gram equivalents at {pendingThreshold}%
                </div>
                {[250, 500, 1000].map((totalG) => (
                  <div
                    key={totalG}
                    className="flex items-center justify-between py-0.5"
                  >
                    <span
                      style={{ color: theme.faint, fontFamily: FONT_BODY }}
                      className="text-[11px]"
                    >
                      {totalG}g spool
                    </span>
                    <span
                      style={{
                        color: theme.warn,
                        fontFamily: FONT_BODY,
                        fontWeight: 700,
                      }}
                      className="text-[12px]"
                    >
                      ≤ {Math.round((totalG * pendingThreshold) / 100)}g
                      remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <div
                style={{
                  color: theme.silver,
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
                className="text-[12px] uppercase mb-3"
              >
                Brand Tare Overrides
              </div>
              {Object.keys(brandOverrides).length === 0 ? (
                <div
                  style={{ color: theme.faint, fontFamily: FONT_BODY }}
                  className="text-[11px]"
                >
                  No custom tares saved yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(brandOverrides).map(([brand, tare]) => (
                    <li
                      key={brand}
                      className="flex items-center justify-between"
                      style={{
                        borderBottom: `1px dashed ${theme.line}`,
                        paddingBottom: 6,
                      }}
                    >
                      <span
                        style={{ color: theme.muted, fontFamily: FONT_BODY }}
                        className="text-[11px]"
                      >
                        {brand} –{' '}
                        <strong style={{ color: theme.ink }}>{tare}g</strong>
                      </span>
                      <button
                        onClick={() => deleteBrandOverride(brand)}
                        style={{ color: theme.danger }}
                        className="p-1 rounded-sm hover:bg-[#4A2A1A] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div
                style={{ color: theme.faint, fontFamily: FONT_BODY }}
                className="text-[9px] mt-2"
              >
                These overrides are applied automatically when you select a
                brand.
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  background: theme.panelAlt,
                  border: `1px solid ${theme.line}`,
                  color: theme.ink,
                }}
                className="flex-1 py-3 rounded-sm text-sm uppercase"
              >
                Close
              </button>
              <button
                onClick={() => saveLowThreshold(pendingThreshold)}
                style={{ background: theme.accent, color: theme.onAccent }}
                className="flex-1 py-3 rounded-sm text-sm font-semibold uppercase"
              >
                Save Threshold
              </button>
            </div>
          </div>
        </div>
      )}

      {loadError && (
        <div
          style={{
            background: theme.panel,
            border: `1px solid ${theme.danger}`,
            color: theme.danger,
            fontFamily: FONT_BODY,
          }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 text-[10.5px] px-4 py-2 rounded-sm"
        >
          Couldn't save — check your connection and try again.
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label
        style={{
          color: theme.muted,
          letterSpacing: '0.04em',
          fontFamily: FONT_BODY,
        }}
        className="text-[10px] uppercase block mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
