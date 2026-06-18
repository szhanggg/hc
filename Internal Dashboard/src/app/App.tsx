import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import {
  AlertTriangle, Package, CreditCard, X,
  CheckCircle, Clock, Bell, ChevronRight, TrendingDown, Home,
  Utensils, Baby, BookOpen, Gift, Send, Sparkles, RefreshCw,
  Users, ShieldCheck, MapPin, Mail, ArrowUpRight, Calendar,
} from "lucide-react";
import CalendarTab, { DriveEvent, AddEventForm, KIT_TYPES, LOCATION_OPTS } from "./components/CalendarTab";

const INTAKE_API = "http://localhost:3000/api/needs";
const EVENTS_API = "http://localhost:3000/api/events";

const CATEGORY_MAP: Record<string, string> = {
  "Gift Kits": "other",
  "Diapers": "hygiene",
  "School Supplies": "school",
  "Snack Kits": "food",
  "Toiletries": "hygiene",
  "Toys": "toy",
};

const UNIT_COST_MAP: Record<string, number> = {
  "Gift Kits": 15,
  "Diapers": 22,
  "School Supplies": 25,
  "Snack Kits": 12,
  "Toiletries": 8,
  "Toys": 15,
};

const HUB_NAME_MAP: Record<string, string> = {
  stanford: "Stanford",
  ucsf: "UCSF",
  oakland: "Oakland",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type HubId = "stanford" | "ucsf" | "oakland";
type ItemStatus = "safe" | "low" | "critical";
type Urgency = "critical" | "warning" | "watch";

interface Hub {
  id: HubId;
  name: string;
  city: string;
  rooms: number;
  avgGuests: number;
  lat: number;
  lng: number;
}

interface InventoryRow {
  category: string;
  Icon: React.FC<{ className?: string }>;
  hub: HubId;
  needed: number;
  pledged: number;
  status: ItemStatus;
}

interface RiskCard {
  id: string;
  title: string;
  urgency: Urgency;
  kitsNeeded: number;
  daysUntilDue: number;
  sponsorStatus: string;
  coveragePct: number;
  affectedHub: HubId;
  category: string;
  eventDate?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HUBS: Hub[] = [
  { id: "stanford", name: "Stanford", city: "Palo Alto, CA", rooms: 14, avgGuests: 250, lat: 37.4354, lng: -122.1751 },
  { id: "ucsf",     name: "UCSF",     city: "San Francisco, CA", rooms: 30, avgGuests: 180, lat: 37.7627, lng: -122.3910 },
  { id: "oakland",  name: "Oakland",  city: "Oakland, CA", rooms: 20, avgGuests: 130, lat: 37.8066, lng: -122.2588 },
];

const INVENTORY: InventoryRow[] = [
  // Stanford
  { category: "Toiletries",      Icon: Package,  hub: "stanford", needed: 500, pledged: 420, status: "safe" },
  { category: "School Supplies", Icon: BookOpen,  hub: "stanford", needed: 200, pledged:  85, status: "low" },
  { category: "Diapers",         Icon: Baby,      hub: "stanford", needed: 300, pledged: 280, status: "safe" },
  { category: "Snack Kits",      Icon: Utensils,  hub: "stanford", needed: 150, pledged:  30, status: "critical" },
  { category: "Toys",            Icon: Gift,      hub: "stanford", needed:  80, pledged:  60, status: "safe" },
  // UCSF
  { category: "Toiletries",      Icon: Package,  hub: "ucsf", needed: 600, pledged: 550, status: "safe" },
  { category: "School Supplies", Icon: BookOpen,  hub: "ucsf", needed: 180, pledged: 140, status: "safe" },
  { category: "Diapers",         Icon: Baby,      hub: "ucsf", needed: 400, pledged: 120, status: "critical" },
  { category: "Snack Kits",      Icon: Utensils,  hub: "ucsf", needed: 200, pledged: 165, status: "low" },
  { category: "Toys",            Icon: Gift,      hub: "ucsf", needed: 100, pledged:  90, status: "safe" },
  // Oakland
  { category: "Toiletries",      Icon: Package,  hub: "oakland", needed: 350, pledged: 310, status: "safe" },
  { category: "School Supplies", Icon: BookOpen,  hub: "oakland", needed: 150, pledged:  50, status: "critical" },
  { category: "Diapers",         Icon: Baby,      hub: "oakland", needed: 250, pledged: 230, status: "safe" },
  { category: "Snack Kits",      Icon: Utensils,  hub: "oakland", needed: 180, pledged: 170, status: "safe" },
  { category: "Toys",            Icon: Gift,      hub: "oakland", needed:  70, pledged:  40, status: "low" },
];

const RISK_ITEMS: RiskCard[] = [
  {
    id: "fathers-day",
    title: "Father's Day Kits Drive",
    urgency: "critical",
    kitsNeeded: 400,
    daysUntilDue: 7,
    sponsorStatus: "Gone Quiet / At-Risk",
    coveragePct: 0,
    affectedHub: "stanford",
    category: "Gift Kits",
    eventDate: "2026-06-21",
  },
  {
    id: "diaper-ucsf",
    title: "UCSF Diaper Shortage",
    urgency: "critical",
    kitsNeeded: 280,
    daysUntilDue: 12,
    sponsorStatus: "No Sponsor Assigned",
    coveragePct: 30,
    affectedHub: "ucsf",
    category: "Diapers",
    eventDate: "2026-06-30",
  },
  {
    id: "school-oakland",
    title: "Oakland Back-to-School Kits",
    urgency: "warning",
    kitsNeeded: 100,
    daysUntilDue: 21,
    sponsorStatus: "Partial Commitment",
    coveragePct: 33,
    affectedHub: "oakland",
    category: "School Supplies",
    eventDate: "2026-08-21",
  },
  {
    id: "snack-stanford",
    title: "Stanford Snack Kit Restock",
    urgency: "warning",
    kitsNeeded: 120,
    daysUntilDue: 14,
    sponsorStatus: "Under Review",
    coveragePct: 20,
    affectedHub: "stanford",
    category: "Snack Kits",
    eventDate: "2026-07-01",
  },
];

const INITIAL_EVENTS: DriveEvent[] = [
  { id:"ev-fathers-day", title:"Father's Day Kits Drive", date:"2026-06-21", location:"stanford", locationLabel:"Stanford", kitType:"Father's Day Kits", iconName:"gift", needed:400, pledged:0, status:"at-risk", planningLeadMonths:3, sponsorStatus:"Gone Quiet / At-Risk", notes:"Primary sponsor unresponsive after 3 outreach attempts since May." },
  { id:"ev-diaper-ucsf", title:"UCSF Diaper Shortage", date:"2026-06-30", location:"ucsf", locationLabel:"UCSF", kitType:"Diapers", iconName:"baby", needed:280, pledged:84, status:"at-risk", planningLeadMonths:0, sponsorStatus:"No Sponsor Assigned", notes:"Monthly diaper allotment short. No backup assigned." },
  { id:"ev-snack-stanford", title:"Stanford Snack Kit Restock", date:"2026-07-01", location:"stanford", locationLabel:"Stanford", kitType:"Snack Kits", iconName:"cookie", needed:120, pledged:24, status:"planning", planningLeadMonths:0, sponsorStatus:"Under Review" },
  { id:"ev-school-oakland", title:"Oakland Back-to-School Kits", date:"2026-08-21", location:"oakland", locationLabel:"Oakland", kitType:"School Supplies", iconName:"grad", needed:100, pledged:33, status:"planning", planningLeadMonths:2, sponsorStatus:"Partial Commitment", notes:"Annual school supply drive. 36% gap remains." },
  { id:"ev-thanksgiving", title:"Thanksgiving 2026", date:"2026-11-19", location:"all", locationLabel:"All Houses", kitType:"Snack Kits", iconName:"cookie", needed:300, pledged:0, status:"planning", planningLeadMonths:2, notes:"Full coverage in 2025. Start corporate partnerships by September." },
  { id:"ev-comfort-joy", title:"Comfort & Joy 2026", date:"2026-12-01", location:"all", locationLabel:"All Houses", kitType:"Holiday Toys", iconName:"gift", needed:10000, pledged:0, status:"planning", planningLeadMonths:5, notes:"Largest drive of the year — 10,000 toys across all 3 houses. Corporate toy drives must be confirmed by October." },
];

const AI_EMAIL_DRAFT = `Hi Sarah,

I hope this message finds you well! I'm writing with some urgency about a critical gap we're facing for our Father's Day Kits Drive at RMHC Bay Area – Stanford.

We need 400 Father's Day kits by next Saturday, June 21st, and our primary sponsor has unexpectedly gone quiet. Since you and the team at Meridian Group stepped up so amazingly last year with the Holiday Drive — providing 350 kits that made a real difference for the families staying with us — you were the first person I thought to reach out to.

Each kit includes a heartfelt card, a small personal care item, and a $10 restaurant gift card — put together for dads who are sleeping by their child's bedside during treatment. These small gestures mean everything to families in crisis.

Would your team be able to step in as our sponsor this week? I can arrange pickup, delivery, or direct fulfillment — whatever works best for you.

Thank you so much for everything you do for our families. You make the impossible feel possible for us every time.

With deep gratitude,
[Your Name]
RMHC Bay Area · In-Kind Donations Coordinator`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(pledged: number, needed: number) {
  return Math.min(100, Math.round((pledged / needed) * 100));
}

function statusColors(status: ItemStatus) {
  if (status === "critical") return { bar: "bg-red-400", text: "text-red-500", bg: "bg-red-100", badge: "bg-red-100 text-red-600" };
  if (status === "low")      return { bar: "bg-amber-400", text: "text-amber-500", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-600" };
  return { bar: "bg-emerald-400", text: "text-emerald-500", bg: "bg-blue-50", badge: "bg-emerald-50 text-emerald-600" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ pct: p, status }: { pct: number; status: ItemStatus }) {
  const { bar } = statusColors(status);
  return (
    <div className="h-1.5 w-full rounded-full bg-[#EDE6DA] overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${p}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const { badge } = statusColors(status);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
      {status === "critical" && <AlertTriangle className="w-2.5 h-2.5" />}
      {status === "low"      && <TrendingDown  className="w-2.5 h-2.5" />}
      {status === "safe"     && <CheckCircle   className="w-2.5 h-2.5" />}
      {status === "critical" ? "Critical" : status === "low" ? "Low" : "OK"}
    </span>
  );
}

// ─── Bay Area Map — vanilla Leaflet via useEffect ─────────────────────────────

function BayMap({
  selectedHub,
  highlightedHub,
  onSelectHub,
  onHoverHub,
}: {
  selectedHub: HubId | null;
  highlightedHub: HubId | null;
  onSelectHub: (id: HubId | null) => void;
  onHoverHub: (id: HubId | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markersRef   = useRef<Record<HubId, L.CircleMarker>>({} as Record<HubId, L.CircleMarker>);

  const criticalHubs = new Set(
    RISK_ITEMS.filter(r => r.urgency === "critical").map(r => r.affectedHub)
  );

  // ── Mount map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.62, -122.08],
      zoom: 10,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    // Force Leaflet to recalculate container size after paint
    setTimeout(() => map.invalidateSize(), 0);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>' }
    ).addTo(map);

    HUBS.forEach(hub => {
      const isCritical = criticalHubs.has(hub.id);
      const marker = L.circleMarker([hub.lat, hub.lng], {
        radius: 14,
        color: isCritical ? "#DA291C" : "#003087",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 0.95,
      }).addTo(map);

      const label = `<div class="rmhc-hub-label">${hub.name}${isCritical ? " ⚠" : ""}</div>`;
      marker.bindTooltip(label, { permanent: true, direction: "top", offset: [0, -18], className: "rmhc-tip-wrap" });

      marker.on("click",     () => onSelectHub(hub.id));
      marker.on("mouseover", () => onHoverHub(hub.id));
      marker.on("mouseout",  () => onHoverHub(null));

      markersRef.current[hub.id] = marker;
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync marker styles when selection / highlight changes ───────────────────
  useEffect(() => {
    HUBS.forEach(hub => {
      const marker = markersRef.current[hub.id];
      if (!marker) return;
      const isCritical  = criticalHubs.has(hub.id);
      const isActive    = selectedHub === hub.id || highlightedHub === hub.id;
      const strokeColor = isCritical ? "#DA291C" : "#003087";
      marker.setStyle({
        radius:      isActive ? 18 : 14,
        color:       strokeColor,
        weight:      isActive ? 3 : 2,
        fillColor:   isActive ? strokeColor : "#ffffff",
        fillOpacity: isActive ? 0.92 : 0.95,
      } as L.CircleMarkerOptions);
    });
  }, [selectedHub, highlightedHub]);

  // ── Fly to selected hub ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Guard: skip if the container has no real pixel size yet
    const size = map.getSize();
    if (!size || size.x === 0 || size.y === 0) return;

    try {
      if (selectedHub) {
        const hub = HUBS.find(h => h.id === selectedHub);
        if (hub) map.flyTo([hub.lat, hub.lng], 13, { duration: 0.9 });
      } else {
        map.flyTo([37.62, -122.08], 10, { duration: 0.9 });
      }
    } catch {
      // fallback to instant setView if flyTo projection fails
      if (selectedHub) {
        const hub = HUBS.find(h => h.id === selectedHub);
        if (hub) map.setView([hub.lat, hub.lng], 13);
      } else {
        map.setView([37.62, -122.08], 10);
      }
    }
  }, [selectedHub]);

  // ── Re-wire click handlers when callbacks change ────────────────────────────
  useEffect(() => {
    HUBS.forEach(hub => {
      const marker = markersRef.current[hub.id];
      if (!marker) return;
      marker.off("click").on("click", () => onSelectHub(selectedHub === hub.id ? null : hub.id));
      marker.off("mouseover").on("mouseover", () => onHoverHub(hub.id));
      marker.off("mouseout").on("mouseout",  () => onHoverHub(null));
    });
  }, [selectedHub, onSelectHub, onHoverHub]);

  return <div ref={containerRef} style={{ height: 300, width: "100%" }} />;
}

// ─── AI Modal ─────────────────────────────────────────────────────────────────

function AIModal({ onClose }: { onClose: () => void }) {
  const [sent, setSent] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto scrollbar-hide border border-[#E5DDD0]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5DDD0] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1C1C2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                AI Outreach Draft
              </h3>
              <p className="text-xs text-[#6B6B80]">Father's Day Kits · 400 needed · 7 days left</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F4F1EB] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6B6B80]" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Matched donor */}
          <div>
            <p className="text-[10px] font-semibold text-[#6B6B80] uppercase tracking-wider mb-2">Best Sponsor Match</p>
            <div className="bg-[#F4F1EB] rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#003087] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                MG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1C2E]">Meridian Group · Sarah Chen</p>
                <p className="text-xs text-[#6B6B80]">
                  Donated 350 kits · Holiday Drive 2023 · Reliability score: 94%
                </p>
              </div>
              <span className="flex-shrink-0 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
                Top Match
              </span>
            </div>
          </div>

          {/* Risk summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Kits Needed", value: "400", accent: true },
              { label: "Days Left", value: "7", accent: true },
              { label: "Current Coverage", value: "0%", accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-[#FFF5F4] border border-red-100 rounded-xl px-3 py-2.5 text-center">
                <p className="text-lg font-bold text-red-500 font-['DM_Mono',monospace]">{value}</p>
                <p className="text-[10px] text-[#6B6B80]">{label}</p>
              </div>
            ))}
          </div>

          {/* Email draft */}
          <div className="border border-[#E5DDD0] rounded-xl overflow-hidden">
            <div className="bg-[#F8F6F1] px-4 py-2.5 border-b border-[#E5DDD0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#6B6B80]" />
                <span className="text-xs font-semibold text-[#6B6B80]">Draft to: sarah.chen@meridiangroup.com</span>
              </div>
              <span className="text-[10px] text-[#003087] bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <Sparkles className="w-2.5 h-2.5" />
                AI Generated
              </span>
            </div>
            <div className="px-4 py-4 bg-white">
              <pre
                className="text-xs text-[#1C1C2E] whitespace-pre-wrap leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {AI_EMAIL_DRAFT}
              </pre>
            </div>
          </div>

          {/* Actions */}
          {!sent ? (
            <div className="flex gap-3">
              <button
                onClick={() => setSent(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#001F5B] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Approve &amp; Send Email
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#DA291C] hover:bg-[#B8201A] text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                <CreditCard className="w-4 h-4" />
                Fund via Stripe
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Email sent to Sarah Chen · Meridian Group</p>
                <p className="text-xs text-emerald-600 mt-0.5">Outreach logged · follow-up auto-scheduled in 48h</p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-[#6B6B80]">
            Edit draft before sending · donor responses tracked automatically
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedHub, setSelectedHub]     = useState<HubId | null>(null);
  const [hoveredHub, setHoveredHub]       = useState<HubId | null>(null);
  const [hoveredRiskHub, setHoveredRiskHub] = useState<HubId | null>(null);
  const [showAIModal, setShowAIModal]     = useState(false);
  const [pushedIds, setPushedIds]         = useState<Set<string>>(new Set());
  const [pushingId, setPushingId]         = useState<string | null>(null);
  const [activeTab, setActiveTab]         = useState<"action" | "calendar">("action");
  const [events, setEvents]               = useState<DriveEvent[]>(INITIAL_EVENTS);
  const [focusDate, setFocusDate]         = useState<string | null>(null);
  const [toast, setToast]                 = useState<string | null>(null);

  useEffect(() => {
    fetch(EVENTS_API)
      .then(r => r.json())
      .then((data: DriveEvent[]) => { if (data?.length) setEvents(data); })
      .catch(() => {});
  }, []);

  async function pushToIntake(risk: RiskCard) {
    setPushingId(risk.id);
    try {
      await fetch(INTAKE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `risk_${risk.id}`,
          name: risk.title,
          house: HUB_NAME_MAP[risk.affectedHub],
          quantityNeeded: risk.kitsNeeded,
          unitCost: UNIT_COST_MAP[risk.category] ?? 15,
          daysOpen: 0,
          category: CATEGORY_MAP[risk.category] ?? "other",
          description: `${risk.kitsNeeded} units needed by ${risk.daysUntilDue} days · Sponsor: ${risk.sponsorStatus}`,
        }),
      });
      setPushedIds(prev => new Set([...prev, risk.id]));
    } catch (err) {
      console.error("Failed to push to intake:", err);
    } finally {
      setPushingId(null);
    }
  }

  const handleAddEvent = useCallback((form: AddEventForm) => {
    const kitInfo = KIT_TYPES.find(k => k.label === form.kitType) || { label: form.kitType, icon: "gift" };
    const locInfo = LOCATION_OPTS.find(l => l.value === form.location) || { value: "all" as const, label: "All Houses" };
    const newEvt: DriveEvent = {
      id: `ev-${Date.now()}`, title: form.title, date: form.date,
      location: form.location, locationLabel: locInfo.label,
      kitType: form.kitType, iconName: kitInfo.icon,
      needed: form.needed, pledged: 0, status: "planning",
      planningLeadMonths: form.planningLeadMonths,
      notes: form.notes || undefined,
    };
    setEvents(prev => [...prev, newEvt]);
    setToast(`"${form.title}" added to the calendar`);
    setTimeout(() => setToast(null), 4000);
    fetch(EVENTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvt),
    }).catch(err => console.error("Failed to save event:", err));
  }, []);

  const handleViewOnCalendar = useCallback((dateStr: string) => {
    setFocusDate(dateStr);
    setActiveTab("calendar");
  }, []);

  // The hub glow on the map = whichever is most recently hovered (risk card or direct)
  const highlightedHub: HubId | null = hoveredHub ?? hoveredRiskHub;

  // Inventory display ─ aggregate when "all", filter when a hub is selected
  const categories = ["Toiletries", "School Supplies", "Diapers", "Snack Kits", "Toys"];

  const inventoryRows = categories.map(cat => {
    const allRows = INVENTORY.filter(r => r.category === cat);
    const rows = selectedHub ? allRows.filter(r => r.hub === selectedHub) : allRows;
    const needed  = rows.reduce((s, r) => s + r.needed,  0);
    const pledged = rows.reduce((s, r) => s + r.pledged, 0);
    const worst   = rows.some(r => r.status === "critical") ? "critical"
                  : rows.some(r => r.status === "low")      ? "low"
                  : "safe";
    return { category: cat, Icon: allRows[0].Icon, needed, pledged, status: worst as ItemStatus };
  });

  const activeHubMeta = selectedHub ? HUBS.find(h => h.id === selectedHub) : null;

  return (
    <div
      className="min-h-screen bg-[#F4F1EB] text-[#1C1C2E]"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="bg-[#001F5B] text-white px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DA291C] flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-semibold leading-tight tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                RMHC Bay Area
              </h1>
              <p className="text-[11px] text-blue-200 tracking-widest uppercase">Action Center</p>
            </div>
          </div>

          {/* Impact badges + bell */}
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              { icon: Utensils, value: "145,000",  label: "Free Meals" },
              { icon: Home,     value: "40,000+",  label: "Overnight Stays" },
              { icon: Clock,    value: "33 days",  label: "Avg Stay" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors rounded-full px-4 py-1.5 backdrop-blur-sm"
              >
                <Icon className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="text-sm font-semibold">{value}</span>
                <span className="text-[11px] text-blue-200">{label}</span>
              </div>
            ))}

            <div className="relative ml-1">
              <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
                <Bell className="w-4 h-4 text-blue-200" />
              </button>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#DA291C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── TAB NAV ────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E5DDD0]">
        <div className="max-w-[1440px] mx-auto px-6 flex">
          <button
            onClick={() => setActiveTab("action")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "action"
                ? "border-[#DA291C] text-[#DA291C]"
                : "border-transparent text-[#6B6B80] hover:text-[#1C1C2E]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Action Center
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === "calendar"
                ? "border-[#DA291C] text-[#DA291C]"
                : "border-transparent text-[#6B6B80] hover:text-[#1C1C2E]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar &amp; Planning
          </button>
        </div>
      </div>

      {/* ── CALENDAR TAB ───────────────────────────────────── */}
      {activeTab === "calendar" && (
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <CalendarTab
            events={events}
            onAddEvent={handleAddEvent}
            hubFilter={selectedHub ?? "all"}
            focusDateStr={focusDate}
            onSwitchToAction={(hub) => {
              setActiveTab("action");
              if (hub && hub !== "all") setSelectedHub(hub as HubId);
            }}
          />
        </div>
      )}

      {/* ── MAIN ───────────────────────────────────────────── */}
      {activeTab === "action" && <main className="max-w-[1440px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ════ LEFT COLUMN (60% = 3/5) ═══════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Map card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5DDD0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5DDD0] flex items-center justify-between">
              <div>
                <h2
                  className="text-[15px] font-semibold text-[#1C1C2E]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Regional Hub Map
                </h2>
                <p className="text-xs text-[#6B6B80] mt-0.5">Click a hub to filter inventory · red indicator = critical need</p>
              </div>
              {selectedHub && (
                <button
                  onClick={() => setSelectedHub(null)}
                  className="text-xs text-[#003087] hover:text-[#DA291C] transition-colors font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filter
                </button>
              )}
            </div>

            <div className="relative bg-[#EAE2CC]">
              <BayMap
                selectedHub={selectedHub}
                highlightedHub={highlightedHub}
                onSelectHub={setSelectedHub}
                onHoverHub={setHoveredHub}
              />

              {/* Hub info banner */}
              {activeHubMeta && (
                <div className="absolute bottom-3 left-3 right-3 bg-[#001F5B]/90 backdrop-blur-sm text-white rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span className="text-sm font-semibold">{activeHubMeta.name} House</span>
                    <span className="text-xs text-blue-200">· {activeHubMeta.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-blue-200">
                    <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {activeHubMeta.rooms} rooms</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {activeHubMeta.avgGuests}+ guests/mo</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inventory card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5DDD0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5DDD0] flex items-center justify-between">
              <div>
                <h2
                  className="text-[15px] font-semibold text-[#1C1C2E]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {selectedHub ? `${activeHubMeta?.name} Inventory` : "All Locations · Inventory"}
                </h2>
                <p className="text-xs text-[#6B6B80] mt-0.5">Critical supply categories · refreshed today</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6B6B80]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Safe</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Low</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Critical</span>
              </div>
            </div>

            {/* Table header */}
            <div className="px-5 py-2 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center bg-[#FAF8F5] border-b border-[#F0EAE0]">
              <span className="text-[10px] font-semibold text-[#6B6B80] uppercase tracking-wider">Category</span>
              <span className="text-[10px] font-semibold text-[#6B6B80] uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-semibold text-[#6B6B80] uppercase tracking-wider text-right">Pledged / Needed</span>
              <span className="text-[10px] font-semibold text-[#6B6B80] uppercase tracking-wider text-right">Status</span>
            </div>

            <div className="divide-y divide-[#F0EAE0]">
              {inventoryRows.map((row) => {
                const p = pct(row.pledged, row.needed);
                const { bg } = statusColors(row.status);
                return (
                  <div
                    key={row.category}
                    className={`px-5 py-3.5 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-[#FAF8F5] transition-colors ${row.status === "critical" ? "bg-red-50/30" : ""}`}
                  >
                    {/* Label */}
                    <div className="flex items-center gap-2.5 min-w-[130px]">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <row.Icon className={`w-4 h-4 ${statusColors(row.status).text}`} />
                      </div>
                      <span className="text-sm font-medium text-[#1C1C2E] whitespace-nowrap">{row.category}</span>
                    </div>

                    {/* Bar */}
                    <ProgressBar pct={p} status={row.status} />

                    {/* Numbers */}
                    <span
                      className="text-xs text-[#6B6B80] whitespace-nowrap text-right"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {row.pledged.toLocaleString()} / {row.needed.toLocaleString()}
                    </span>

                    {/* Status badge */}
                    <div className="text-right">
                      <StatusBadge status={row.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN (40% = 2/5) ═══════════════════ */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-[15px] font-semibold text-[#1C1C2E]"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                At-Risk Action Center
              </h2>
              <p className="text-xs text-[#6B6B80] mt-0.5">Forward-looking · sorted by urgency</p>
            </div>
            <span className="flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {RISK_ITEMS.filter(r => r.urgency === "critical").length} Critical
            </span>
          </div>

          {/* Risk cards */}
          {RISK_ITEMS.map((risk) => {
            const isCritical    = risk.urgency === "critical";
            const isFathersDay  = risk.id === "fathers-day";
            const isHubSelected = selectedHub === risk.affectedHub;
            const hubMeta = HUBS.find(h => h.id === risk.affectedHub)!;

            return (
              <div
                key={risk.id}
                className={`rounded-2xl border bg-white transition-all duration-200 ${
                  isCritical
                    ? "border-red-200 shadow-[0_0_0_1px_rgba(218,41,28,0.12),0_4px_20px_rgba(218,41,28,0.07)]"
                    : "border-[#E5DDD0] shadow-sm"
                } ${isHubSelected ? "ring-2 ring-[#003087]/25" : ""}`}
                onMouseEnter={() => setHoveredRiskHub(risk.affectedHub)}
                onMouseLeave={() => setHoveredRiskHub(null)}
              >
                <div className="p-4 flex flex-col gap-3">
                  {/* Card header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCritical ? "bg-red-100" : "bg-amber-50"}`}>
                        {isCritical
                          ? <AlertTriangle className="w-4 h-4 text-red-500" />
                          : <TrendingDown  className="w-4 h-4 text-amber-500" />
                        }
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#1C1C2E] leading-snug">{risk.title}</h3>
                        <p className="text-xs text-[#6B6B80] mt-0.5">
                          {hubMeta.name} · {risk.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isCritical ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                        {risk.daysUntilDue}d left
                      </span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#F8F6F2] rounded-xl px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-[#1C1C2E]" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {risk.kitsNeeded}
                      </p>
                      <p className="text-[10px] text-[#6B6B80] mt-0.5">Units Needed</p>
                    </div>
                    <div className="bg-[#F8F6F2] rounded-xl px-2 py-2.5 text-center">
                      <p
                        className="text-base font-bold"
                        style={{ fontFamily: "'DM Mono', monospace", color: risk.coveragePct === 0 ? "#DA291C" : "#D97706" }}
                      >
                        {risk.coveragePct}%
                      </p>
                      <p className="text-[10px] text-[#6B6B80] mt-0.5">Coverage</p>
                    </div>
                    <div className="bg-[#F8F6F2] rounded-xl px-2 py-2.5 text-center flex flex-col justify-center">
                      <p className="text-[10px] font-semibold text-red-500 leading-snug">{risk.sponsorStatus}</p>
                      <p className="text-[10px] text-[#6B6B80] mt-0.5">Sponsor</p>
                    </div>
                  </div>

                  {/* Coverage bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-[#6B6B80]">Sponsor coverage</span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ fontFamily: "'DM Mono', monospace", color: risk.coveragePct < 40 ? "#DA291C" : "#D97706" }}
                      >
                        {risk.coveragePct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#EDE6DA] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${risk.coveragePct === 0 ? "w-0" : risk.coveragePct < 40 ? "bg-red-400" : "bg-amber-400"}`}
                        style={{ width: `${risk.coveragePct}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col gap-2">
                    {isFathersDay ? (
                      <button
                        onClick={() => setShowAIModal(true)}
                        className="w-full flex items-center justify-center gap-2 bg-[#DA291C] hover:bg-[#B8201A] text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" />
                        Resolve Risk with AI
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedHub(risk.affectedHub)}
                        className="w-full flex items-center justify-center gap-2 bg-[#F4F1EB] hover:bg-[#EDE6DA] text-[#003087] text-sm font-semibold py-2 rounded-xl transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                        View {hubMeta.name} Inventory
                      </button>
                    )}
                    {pushedIds.has(risk.id) ? (
                      <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold py-2 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Added to Donation Intake
                      </div>
                    ) : (
                      <button
                        onClick={() => pushToIntake(risk)}
                        disabled={pushingId === risk.id}
                        className="w-full flex items-center justify-center gap-2 bg-[#F4F1EB] hover:bg-[#EDE6DA] text-[#1C1C2E] text-xs font-semibold py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {pushingId === risk.id ? "Adding…" : "Push to Donation Intake"}
                      </button>
                    )}
                    {risk.eventDate && (
                      <button
                        onClick={() => handleViewOnCalendar(risk.eventDate!)}
                        className="w-full flex items-center justify-center gap-2 bg-[#F4F1EB] hover:bg-[#EDE6DA] text-[#6B6B80] text-xs font-medium py-2 rounded-xl transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        View on Calendar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* All-clear row */}
          <div className="rounded-2xl border border-[#E5DDD0] bg-white p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1C1C2E]">8 other categories on track</p>
              <p className="text-xs text-[#6B6B80]">No action needed this week</p>
            </div>
            <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">All Clear</span>
          </div>

          {/* Last refresh */}
          <p className="text-center text-xs text-[#A09272] flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Data synced today at 9:14 AM · next sync in 6 hrs
          </p>
        </div>
      </main>}

      {/* ── AI Modal ──────────────────────────────────────── */}
      {showAIModal && <AIModal onClose={() => setShowAIModal(false)} />}

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 whitespace-nowrap">
          <CheckCircle className="w-4 h-4" />{toast}
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Leaflet hub labels */
        .rmhc-tip-wrap {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .rmhc-tip-wrap::before { display: none !important; }
        .rmhc-hub-label {
          background: #001F5B;
          border-radius: 6px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.28);
          pointer-events: none;
        }

        /* Keep Leaflet controls above map tiles */
        .leaflet-top, .leaflet-bottom { z-index: 400 !important; }
      `}</style>
    </div>
  );
}
