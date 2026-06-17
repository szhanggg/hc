import React, {
  useState, useCallback, useEffect, useLayoutEffect, useRef, useMemo, CSSProperties
} from "react";
import {
  AlertTriangle, Package, Heart, Moon, Calendar,
  Mail, CreditCard, X, Sparkles, Clock, Users,
  CheckCircle2, ShieldAlert, TrendingDown, Send, ExternalLink,
  GraduationCap, Baby, Cookie, Gift, Droplets, Building2, MapPin
} from "lucide-react";
import CalendarTab, { DriveEvent, AddEventForm, KIT_TYPES, LOCATION_OPTS, daysUntil } from "./CalendarTab";

/* ================================================================
   RMHC Bay Area – In-Kind Action Center
   ================================================================ */

// ── Palette ───────────────────────────────────────────────────────
const C = {
  red50:"#fef2f2",red100:"#fee2e2",red200:"#fecaca",red400:"#f87171",
  red500:"#ef4444",red600:"#dc2626",red700:"#b91c1c",
  amber50:"#fffbeb",amber100:"#fef3c7",amber200:"#fde68a",
  amber500:"#f59e0b",amber600:"#d97706",amber700:"#b45309",
  emerald50:"#ecfdf5",emerald100:"#d1fae5",emerald200:"#a7f3d0",
  emerald300:"#6ee7b7",emerald400:"#34d399",emerald500:"#10b981",
  emerald600:"#059669",emerald800:"#065f46",
  blue50:"#eff6ff",blue100:"#dbeafe",blue200:"#bfdbfe",
  blue600:"#2563eb",blue700:"#1d4ed8",
  violet600:"#7c3aed",indigo600:"#4f46e5",
  yellow300:"#fde047",yellow100:"#fef9c3",
  slate50:"#f8fafc",slate100:"#f1f5f9",slate200:"#e2e8f0",
  slate300:"#cbd5e1",slate400:"#94a3b8",slate500:"#64748b",
  slate600:"#475569",slate700:"#334155",slate800:"#1e293b",
  slate900:"#0f172a",white:"#ffffff",
};
const FONT = "'sohne-var', system-ui, sans-serif";

// ── Hub & Inventory Data ──────────────────────────────────────────
type Hub = "all" | "stanford" | "ucsf" | "oakland";

interface HubMeta {
  lat: number; lng: number; label: string; families: number;
  photo: string; address: string;
}
const HUB_META: Record<Exclude<Hub,"all">, HubMeta> = {
  stanford: {
    lat:37.4249, lng:-122.1751,
    label:"Stanford", families:42,
    photo:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=160&h=160&fit=crop&auto=format&q=80",
    address:"520 Sand Hill Rd, Palo Alto",
  },
  ucsf: {
    lat:37.7495, lng:-122.4768,
    label:"UCSF", families:68,
    photo:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=160&h=160&fit=crop&auto=format&q=80",
    address:"4502 19th Ave, San Francisco",
  },
  oakland: {
    lat:37.8368, lng:-122.2520,
    label:"Oakland", families:35,
    photo:"https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=160&h=160&fit=crop&auto=format&q=80",
    address:"Near UCSF Benioff, Oakland",
  },
};

interface InventoryItem {
  id:string; category:string; iconName:string;
  location:Hub; locationLabel:string;
  needed:number; pledged:number; atRisk:boolean;
}
interface RiskCard {
  id:string; title:string; severity:"critical"|"warning"|"watch";
  location:Hub; locationLabel:string; dueDate:string;
  needed:number; covered:number; sponsorStatus:string; description:string;
  eventId?:string; eventDate?:string;
}
const INVENTORY: InventoryItem[] = [
  {id:"t1",category:"Toiletries",iconName:"droplets",location:"stanford",locationLabel:"Stanford",needed:500,pledged:420,atRisk:false},
  {id:"t2",category:"Toiletries",iconName:"droplets",location:"ucsf",locationLabel:"UCSF",needed:600,pledged:310,atRisk:true},
  {id:"t3",category:"Toiletries",iconName:"droplets",location:"oakland",locationLabel:"Oakland",needed:350,pledged:340,atRisk:false},
  {id:"s1",category:"School Supplies",iconName:"grad",location:"stanford",locationLabel:"Stanford",needed:200,pledged:195,atRisk:false},
  {id:"s2",category:"School Supplies",iconName:"grad",location:"ucsf",locationLabel:"UCSF",needed:250,pledged:130,atRisk:true},
  {id:"s3",category:"School Supplies",iconName:"grad",location:"oakland",locationLabel:"Oakland",needed:180,pledged:170,atRisk:false},
  {id:"d1",category:"Diapers",iconName:"baby",location:"stanford",locationLabel:"Stanford",needed:1200,pledged:1100,atRisk:false},
  {id:"d2",category:"Diapers",iconName:"baby",location:"ucsf",locationLabel:"UCSF",needed:900,pledged:450,atRisk:true},
  {id:"d3",category:"Diapers",iconName:"baby",location:"oakland",locationLabel:"Oakland",needed:800,pledged:780,atRisk:false},
  {id:"k1",category:"Snack Kits",iconName:"cookie",location:"stanford",locationLabel:"Stanford",needed:300,pledged:290,atRisk:false},
  {id:"k2",category:"Snack Kits",iconName:"cookie",location:"ucsf",locationLabel:"UCSF",needed:400,pledged:200,atRisk:true},
  {id:"k3",category:"Snack Kits",iconName:"cookie",location:"oakland",locationLabel:"Oakland",needed:250,pledged:240,atRisk:false},
  {id:"y1",category:"Toys",iconName:"gift",location:"stanford",locationLabel:"Stanford",needed:150,pledged:145,atRisk:false},
  {id:"y2",category:"Toys",iconName:"gift",location:"ucsf",locationLabel:"UCSF",needed:200,pledged:80,atRisk:true},
  {id:"y3",category:"Toys",iconName:"gift",location:"oakland",locationLabel:"Oakland",needed:120,pledged:115,atRisk:false},
];
function deriveRisks(evts: DriveEvent[]): RiskCard[] {
  return evts
    .filter(e=>{
      if(e.needed===0) return false;
      const d=daysUntil(e.date);
      if(d<0) return false;
      const pct=e.pledged/e.needed;
      if(e.status==="at-risk") return true;
      if(d<=60&&pct<0.5) return true;
      if(d<=90&&pct<0.8) return true;
      return false;
    })
    .sort((a,b)=>{
      const rank=(e:DriveEvent)=>{
        if(e.status==="at-risk") return 0;
        const pct=e.pledged/e.needed;
        if(daysUntil(e.date)<=60&&pct<0.5) return 1;
        return 2;
      };
      return rank(a)-rank(b);
    })
    .map(e=>{
      const d=daysUntil(e.date);
      const pct=e.needed>0?e.pledged/e.needed:0;
      const severity:RiskCard["severity"]=
        e.status==="at-risk"?"critical":
        (d<=60&&pct<0.5)?"warning":"watch";
      return {
        id:`risk-${e.id}`,
        title:e.title,
        severity,
        location:e.location as Hub,
        locationLabel:e.locationLabel,
        dueDate:new Date(e.date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}),
        needed:e.needed,
        covered:e.pledged,
        sponsorStatus:e.sponsorStatus||(e.status==="at-risk"?"Gone Quiet / At-Risk":e.pledged>0?"Partial Coverage":"In Progress"),
        description:e.notes||`${(e.needed-e.pledged).toLocaleString()} ${e.kitType} still needed.`,
        eventId:e.id,
        eventDate:e.date,
      };
    });
}

// ── Seed Drive Events ──────────────────────────────────────────────
const INITIAL_EVENTS: DriveEvent[] = [
  // June 2026 – current month
  {id:"ev-fday26",title:"Father's Day Kits",date:"2026-06-21",location:"all",locationLabel:"All Houses",kitType:"Father's Day Kits",iconName:"gift",needed:400,pledged:0,status:"at-risk",planningLeadMonths:3,sponsorStatus:"Gone Quiet / At-Risk",notes:"Primary sponsor unresponsive after 3 outreach attempts since May. Staff may need to purchase and assemble by Thursday."},
  {id:"ev-snackjun26",title:"Monthly Snack Kits – Jun",date:"2026-06-30",location:"all",locationLabel:"All Houses",kitType:"Snack Kits",iconName:"cookie",needed:500,pledged:480,status:"active",planningLeadMonths:0},
  // July 2026 – Comfort & Joy planning reminder surfaces here (Jul 1)
  {id:"ev-snackjul26",title:"Monthly Snack Kits – Jul",date:"2026-07-31",location:"all",locationLabel:"All Houses",kitType:"Snack Kits",iconName:"cookie",needed:500,pledged:0,status:"planning",planningLeadMonths:0},
  // August 2026
  {id:"ev-diaper26",title:"Diaper Supply Gap – UCSF",date:"2026-06-30",location:"ucsf",locationLabel:"UCSF",kitType:"Diapers",iconName:"baby",needed:900,pledged:450,status:"at-risk",planningLeadMonths:0,sponsorStatus:"Partial Coverage",notes:"Monthly diaper allotment 50% short. Backup distributor delayed citing logistics issues."},
  {id:"ev-bts26",title:"Back to School 2026",date:"2026-08-10",location:"oakland",locationLabel:"Oakland",kitType:"Back-to-School Kits",iconName:"grad",needed:500,pledged:320,status:"planning",planningLeadMonths:3,notes:"Annual school supply drive on track but 36% gap remains. Two corporate pledges awaiting final approval."},
  {id:"ev-snackaug26",title:"Monthly Snack Kits – Aug",date:"2026-08-31",location:"all",locationLabel:"All Houses",kitType:"Snack Kits",iconName:"cookie",needed:500,pledged:0,status:"planning",planningLeadMonths:0},
  // September 2026
  {id:"ev-snacksep26",title:"Monthly Snack Kits – Sep",date:"2026-09-30",location:"all",locationLabel:"All Houses",kitType:"Snack Kits",iconName:"cookie",needed:500,pledged:0,status:"planning",planningLeadMonths:0},
  // November 2026
  {id:"ev-thanksgiving26",title:"Thanksgiving 2026",date:"2026-11-19",location:"all",locationLabel:"All Houses",kitType:"Snack Kits",iconName:"cookie",needed:300,pledged:0,status:"planning",planningLeadMonths:2,notes:"Full coverage in 2025. Start corporate partnerships by September."},
  // December 2026
  {id:"ev-joy26",title:"Comfort & Joy 2026",date:"2026-12-01",location:"all",locationLabel:"All Houses",kitType:"Holiday Toys",iconName:"gift",needed:10000,pledged:0,status:"planning",planningLeadMonths:5,notes:"Largest drive of the year — 10,000 toys across all 3 houses. Teen gifts hardest to source. Corporate toy drives must be confirmed by October. Planning window opens July 1."},
  {id:"ev-corptoydead26",title:"Corp Toy Drive Deadline",date:"2026-12-15",location:"all",locationLabel:"All Houses",kitType:"Holiday Toys",iconName:"gift",needed:500,pledged:0,status:"planning",planningLeadMonths:3,notes:"All corporate toy drives must deliver by this date. Reserve staff for sorting and condition checks."},
];

// ── Shared Styles ─────────────────────────────────────────────────
const card: CSSProperties = {
  background:C.white, borderRadius:16, border:`1px solid ${C.slate200}`,
  boxShadow:"0 1px 4px rgba(0,0,0,.05)", overflow:"hidden",
};

// ── Small utility components ──────────────────────────────────────
function ItemIcon({name,color}:{name:string;color:string}){
  const p={size:15,color,strokeWidth:1.8};
  if(name==="droplets")return<Droplets {...p}/>;
  if(name==="grad")return<GraduationCap {...p}/>;
  if(name==="baby")return<Baby {...p}/>;
  if(name==="cookie")return<Cookie {...p}/>;
  return<Gift {...p}/>;
}
function StatBadge({icon,value,label}:{icon:React.ReactNode;value:string;label:string}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.12)",
      backdropFilter:"blur(8px)",borderRadius:10,padding:"9px 14px",border:"1px solid rgba(255,255,255,.12)"}}>
      <span style={{color:C.yellow300,display:"flex"}}>{icon}</span>
      <div>
        <div style={{fontFamily:FONT,color:C.white,fontWeight:600,fontSize:14,lineHeight:1.2}}>{value}</div>
        <div style={{fontFamily:FONT,color:"#fecaca",fontSize:11}}>{label}</div>
      </div>
    </div>
  );
}
function ProgressBar({current,total,atRisk}:{current:number;total:number;atRisk:boolean}){
  const pct=Math.min(100,Math.round((current/total)*100));
  const bar=atRisk?`linear-gradient(90deg,${C.red400},${C.red500})`
    :pct>=90?`linear-gradient(90deg,${C.emerald400},${C.emerald500})`
    :`linear-gradient(90deg,${C.amber500},${C.amber600})`;
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:7,background:C.slate100,borderRadius:10,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:bar,borderRadius:10}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,fontFamily:FONT,
        color:atRisk?C.red600:pct>=90?C.emerald600:C.amber600,
        width:36,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{pct}%</span>
    </div>
  );
}
function SeverityBadge({severity}:{severity:RiskCard["severity"]}){
  const m={
    critical:{bg:C.red100,fg:C.red700,bd:C.red200,label:"Critical",icon:<ShieldAlert size={10}/>},
    warning:{bg:C.amber100,fg:C.amber700,bd:C.amber200,label:"Warning",icon:<AlertTriangle size={10}/>},
    watch:{bg:C.blue100,fg:C.blue700,bd:C.blue200,label:"Watch",icon:<Clock size={10}/>},
  }[severity];
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:9,fontFamily:FONT,
      fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",padding:"3px 8px",
      borderRadius:10,background:m.bg,color:m.fg,border:`1px solid ${m.bd}`}}>
      {m.icon} {m.label}
    </span>
  );
}

// ── OSM Tile Map (no external lib needed) ─────────────────────────
const ZOOM = 8;
const TILE_SZ = 256;
const MAP_H = 290;
// Center chosen to frame all 3 Bay Area hubs
const CTR_LAT = 37.62;
const CTR_LNG = -122.28;

/** Lat/lng → fractional OSM tile coordinates at given zoom */
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = (lng + 180) / 360 * n;
  const latRad = lat * Math.PI / 180;
  const y = (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n;
  return { x, y };
}

function TileMap({selected, onSelect, highlightHub}: {
  selected:Hub; onSelect:(h:Hub)=>void; highlightHub:Hub|null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mapW, setMapW] = useState(460);

  useLayoutEffect(() => {
    if (wrapRef.current) setMapW(wrapRef.current.offsetWidth);
  }, []);

  // Center tile (fractional)
  const ctr = latLngToTile(CTR_LAT, CTR_LNG, ZOOM);

  // How many tiles to cover the container
  const cols = Math.ceil(mapW / TILE_SZ) + 3;
  const rows = Math.ceil(MAP_H / TILE_SZ) + 3;
  const startX = Math.floor(ctr.x) - Math.floor(cols / 2);
  const startY = Math.floor(ctr.y) - Math.floor(rows / 2);

  // Pixel origin of the tile grid within the container
  const orgX = mapW / 2 - (ctr.x - startX) * TILE_SZ;
  const orgY = MAP_H / 2 - (ctr.y - startY) * TILE_SZ;

  /** Convert a lat/lng to a pixel position in the container */
  function toPx(lat: number, lng: number) {
    const t = latLngToTile(lat, lng, ZOOM);
    return {
      x: (t.x - startX) * TILE_SZ + orgX,
      y: (t.y - startY) * TILE_SZ + orgY,
    };
  }

  // Build tile list (only those inside or near the viewport)
  const tiles: {tx:number;ty:number;left:number;top:number}[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * TILE_SZ + orgX;
      const top  = r * TILE_SZ + orgY;
      if (left > -TILE_SZ && left < mapW + TILE_SZ && top > -TILE_SZ && top < MAP_H + TILE_SZ) {
        tiles.push({ tx: startX + c, ty: startY + r, left, top });
      }
    }
  }

  const MARKER_W  = 60;
  const MARKER_H  = 78; // photo(50) + pointer(7) + label(~21)

  return (
    <div ref={wrapRef} style={{
      position:"relative", height:MAP_H,
      borderRadius:12, overflow:"hidden",
      background:"#b3d1e8",               // OSM ocean colour
      boxShadow:"0 2px 8px rgba(0,0,0,.1)",
    }}>
      <style>{`
        @keyframes mapPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.05;transform:scale(1.65)}}
      `}</style>

      {/* OSM tiles */}
      {tiles.map(({tx,ty,left,top})=>(
        <img key={`${tx}-${ty}`}
          src={`https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`}
          width={TILE_SZ} height={TILE_SZ}
          style={{position:"absolute",left,top,display:"block",pointerEvents:"none"}}
          alt="" draggable={false}
        />
      ))}

      {/* Hub markers with real office photos */}
      {(Object.keys(HUB_META) as Exclude<Hub,"all">[]).map(key=>{
        const hub = HUB_META[key];
        const {x,y} = toPx(hub.lat, hub.lng);
        const isActive  = selected === key || selected === "all";
        const isPulsing = highlightHub === key;
        const ring   = isActive ? "#dc2626" : "#ffffff";
        const chipBg = isActive ? "#dc2626" : "#ffffff";
        const chipFg = isActive ? "#ffffff" : "#1e293b";

        return (
          <button key={key} onClick={()=>onSelect(key)} style={{
            position:"absolute",
            left: x - MARKER_W / 2,
            top:  y - MARKER_H,
            width: MARKER_W,
            background:"none", border:"none", cursor:"pointer", padding:0,
            display:"flex", flexDirection:"column", alignItems:"center",
            zIndex: isActive ? 20 : 10,
          }}>
            {isPulsing && (
              <div style={{position:"absolute",top:-10,left:-10,
                width:80,height:80,borderRadius:"50%",
                background:"rgba(239,68,68,.2)",pointerEvents:"none",
                animation:"mapPulse 1.4s ease-in-out infinite"}}/>
            )}
            {/* Circular office photo */}
            <div style={{
              position:"relative",width:50,height:50,borderRadius:"50%",
              overflow:"hidden",flexShrink:0,
              border:`3px solid ${ring}`,
              boxShadow: isActive
                ? "0 4px 18px rgba(220,38,38,.55),0 2px 6px rgba(0,0,0,.2)"
                : "0 3px 14px rgba(0,0,0,.35)",
              background:"#fef2f2",
            }}>
              {/* Fallback initial (behind photo) */}
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:18,fontWeight:800,
                color:"#dc2626",fontFamily:"system-ui",zIndex:0}}>
                {hub.label[0]}
              </div>
              {/* Office photo (on top) */}
              <img src={hub.photo} alt={hub.label} style={{
                position:"absolute",inset:0,width:"100%",height:"100%",
                objectFit:"cover",zIndex:1,
              }} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
            {/* Pointer triangle */}
            <div style={{width:0,height:0,
              borderLeft:"5px solid transparent",borderRight:"5px solid transparent",
              borderTop:`7px solid ${ring}`,
              filter:"drop-shadow(0 2px 2px rgba(0,0,0,.2))"}}/>
            {/* Label chip */}
            <div style={{
              background:chipBg, color:chipFg,
              fontFamily:"system-ui,sans-serif",fontSize:10,fontWeight:700,
              padding:"2px 8px",borderRadius:8,marginTop:1,
              border:`1.5px solid ${isActive?"#dc2626":"#e2e8f0"}`,
              boxShadow:"0 1px 5px rgba(0,0,0,.15)",whiteSpace:"nowrap",
            }}>{hub.label}</div>
          </button>
        );
      })}

      {/* "All Hubs" filter button */}
      <div style={{position:"absolute",top:10,left:10,zIndex:30}}>
        <button onClick={()=>onSelect("all")} style={{
          fontSize:11,fontFamily:FONT,fontWeight:600,
          padding:"5px 12px",borderRadius:20,cursor:"pointer",
          background:selected==="all"?C.red600:C.white,
          color:selected==="all"?C.white:C.slate600,
          border:`1px solid ${selected==="all"?C.red600:C.slate200}`,
          boxShadow:"0 2px 8px rgba(0,0,0,.2)",
        }}>All Hubs</button>
      </div>

      {/* OSM attribution (required) */}
      <div style={{position:"absolute",bottom:4,right:8,zIndex:30,
        fontSize:9,color:"#444",background:"rgba(255,255,255,.8)",
        padding:"1px 5px",borderRadius:3,fontFamily:"system-ui"}}>
        &copy; OpenStreetMap contributors
      </div>
    </div>
  );
}

// ── Inventory Table ───────────────────────────────────────────────
function InventoryTable({items}:{items:InventoryItem[]}){
  return(
    <div>
      {items.map((item,i)=>(
        <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",
          borderTop:i>0?`1px solid ${C.slate100}`:"none",
          background:item.atRisk?"rgba(254,226,226,.35)":"transparent"}}>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",
            width:32,height:32,borderRadius:8,background:item.atRisk?C.red100:C.slate100}}>
            <ItemIcon name={item.iconName} color={item.atRisk?C.red500:C.slate500}/>
          </span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontFamily:FONT,fontSize:13,fontWeight:500,color:C.slate800}}>{item.category}</span>
              {item.atRisk&&(
                <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontFamily:FONT,
                  fontWeight:700,color:C.red600,background:C.red100,padding:"2px 6px",
                  borderRadius:10,textTransform:"uppercase",letterSpacing:".04em"}}>
                  <AlertTriangle size={9}/> AT RISK
                </span>
              )}
            </div>
            <div style={{fontSize:11,fontFamily:FONT,color:C.slate500,marginTop:1}}>{item.locationLabel}</div>
          </div>
          <div style={{width:130}}><ProgressBar current={item.pledged} total={item.needed} atRisk={item.atRisk}/></div>
          <div style={{textAlign:"right",width:85,fontFamily:FONT,fontVariantNumeric:"tabular-nums"}}>
            <span style={{fontSize:13,fontWeight:600,color:C.slate700}}>{item.pledged.toLocaleString()}</span>
            <span style={{fontSize:11,color:C.slate400}}> / {item.needed.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI Resolution Modal ───────────────────────────────────────────
function AIDrawer({risk,onClose}:{risk:RiskCard;onClose:()=>void}){
  const [approved,setApproved]=useState(false);
  const shortfall=risk.needed-risk.covered;
  const btn:CSSProperties={display:"flex",alignItems:"center",justifyContent:"center",gap:8,
    fontFamily:FONT,fontWeight:600,fontSize:14,color:C.white,
    padding:"13px 18px",borderRadius:12,border:"none",cursor:"pointer"};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{position:"absolute",inset:0,background:"rgba(15,23,42,.45)",backdropFilter:"blur(6px)"}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",background:C.white,
        borderRadius:20,boxShadow:"0 24px 48px rgba(0,0,0,.18)",width:"100%",maxWidth:500,
        maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.slate200}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"18px 20px",borderBottom:`1px solid ${C.slate100}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,
              background:`linear-gradient(135deg,${C.violet600},${C.indigo600})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 4px 12px rgba(124,58,237,.3)"}}>
              <Sparkles size={20} color={C.white}/>
            </div>
            <div>
              <div style={{fontFamily:FONT,fontWeight:600,fontSize:15,color:C.slate800}}>AI Resolution Assistant</div>
              <div style={{fontFamily:FONT,fontSize:11,color:C.slate500}}>Draft outreach for {risk.title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
            padding:6,borderRadius:8,display:"flex",color:C.slate400}}>
            <X size={18}/>
          </button>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:C.red50,border:`1px solid ${C.red100}`,borderRadius:14,padding:16}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <ShieldAlert size={15} color={C.red500}/>
              <span style={{fontFamily:FONT,fontSize:13,fontWeight:600,color:C.red700}}>Gap Analysis</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
              {[{v:risk.needed,l:"Needed"},{v:risk.covered,l:"Covered"},{v:shortfall,l:"Shortfall"}].map(d=>(
                <div key={d.l}>
                  <div style={{fontFamily:FONT,fontSize:20,fontWeight:700,color:C.red700}}>{d.v}</div>
                  <div style={{fontFamily:FONT,fontSize:9,color:C.red500,textTransform:"uppercase",letterSpacing:".06em"}}>{d.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <Mail size={13} color={C.slate400}/>
              <span style={{fontFamily:FONT,fontSize:10,fontWeight:700,color:C.slate600,
                textTransform:"uppercase",letterSpacing:".06em"}}>AI-Drafted Outreach Email</span>
            </div>
            <div style={{background:C.slate50,border:`1px solid ${C.slate200}`,borderRadius:14,
              padding:16,fontFamily:FONT,fontSize:13,color:C.slate700,lineHeight:1.65}}>
              <p style={{fontSize:11,color:C.slate400,margin:"0 0 8px"}}>
                To: <span style={{color:C.slate600}}>[Sponsor Name]</span> &nbsp;|&nbsp;
                Subject: <span style={{color:C.slate600}}>Urgent: Father's Day Kit Partnership</span>
              </p>
              <hr style={{border:"none",borderTop:`1px solid ${C.slate200}`,margin:"10px 0"}}/>
              <p style={{margin:"0 0 10px"}}>
                Hi <span style={{background:C.yellow100,padding:"1px 4px",borderRadius:4,fontWeight:600}}>[Sponsor Name]</span>,
              </p>
              <p style={{margin:"0 0 10px"}}>
                We noticed a critical gap for <strong>400 Father's Day kits</strong> due next week at our {risk.locationLabel} House.
                Since you stepped up so amazingly last year and made such a meaningful impact for our families,
                we immediately thought of you.
              </p>
              <p style={{margin:"0 0 10px"}}>
                Right now, <strong>{shortfall} families</strong> are counting on these kits to celebrate together during an incredibly
                challenging time. Each kit includes a handwritten card, snacks, and a small gift — simple things that
                mean the world when you're far from home.
              </p>
              <p style={{margin:0,color:C.slate500}}>
                With gratitude,<br/><strong>RMHC Bay Area Team</strong>
              </p>
            </div>
          </div>
          {!approved?(
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setApproved(true)} style={{...btn,flex:1,
                background:`linear-gradient(90deg,${C.red600},${C.red500})`,
                boxShadow:"0 4px 14px rgba(220,38,38,.3)"}}>
                <Send size={15}/> Approve & Send Email
              </button>
              <button style={{...btn,background:`linear-gradient(90deg,${C.indigo600},${C.violet600})`,
                boxShadow:"0 4px 14px rgba(79,70,229,.3)"}}>
                <CreditCard size={15}/> Fund via Stripe
              </button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:12,background:C.emerald50,
              border:`1px solid ${C.emerald200}`,borderRadius:14,padding:16}}>
              <CheckCircle2 size={24} color={C.emerald500} style={{flexShrink:0}}/>
              <div>
                <div style={{fontFamily:FONT,fontWeight:600,fontSize:13,color:C.emerald800}}>Email queued for review</div>
                <div style={{fontFamily:FONT,fontSize:11,color:C.emerald600,marginTop:2}}>Confirm sponsor contact in CRM. Estimated response: 24-48 hrs.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Risk Card ─────────────────────────────────────────────────────
function RiskCardUI({risk,onResolve,onHover,onViewCalendar}:{
  risk:RiskCard; onResolve:()=>void; onHover:(loc:Hub|null)=>void; onViewCalendar?:()=>void;
}){
  const shortfall=risk.needed-risk.covered;
  const bdColor=risk.severity==="critical"?C.red200:risk.severity==="warning"?C.amber200:C.slate200;
  const spBg=risk.sponsorStatus.includes("At-Risk")?C.red50:risk.sponsorStatus==="Partial Coverage"?C.amber50:C.blue50;
  const spFg=risk.sponsorStatus.includes("At-Risk")?C.red700:risk.sponsorStatus==="Partial Coverage"?C.amber700:C.blue700;
  const spBd=risk.sponsorStatus.includes("At-Risk")?C.red100:risk.sponsorStatus==="Partial Coverage"?C.amber100:C.blue100;
  return(
    <div onMouseEnter={()=>onHover(risk.location)} onMouseLeave={()=>onHover(null)}
      style={{...card,border:`1px solid ${bdColor}`,
        ...(risk.severity==="critical"?{boxShadow:`0 0 0 1px ${C.red100},0 2px 8px rgba(220,38,38,.1)`}:{})}}>
      <div style={{padding:16}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <SeverityBadge severity={risk.severity}/>
              <span style={{fontSize:10,fontFamily:FONT,color:C.slate400,display:"flex",alignItems:"center",gap:3}}>
                <MapPin size={10}/> {risk.locationLabel}
              </span>
            </div>
            <div style={{fontFamily:FONT,fontWeight:600,fontSize:15,color:C.slate800}}>{risk.title}</div>
          </div>
          <span style={{fontSize:11,fontFamily:FONT,fontWeight:500,color:C.slate500,
            background:C.slate100,padding:"4px 8px",borderRadius:8,
            display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <Clock size={11}/> Due {risk.dueDate}
          </span>
        </div>
        <p style={{fontFamily:FONT,fontSize:12,color:C.slate600,lineHeight:1.55,margin:"0 0 12px"}}>{risk.description}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{v:risk.needed,l:"Needed",c:C.slate800},{v:risk.covered,l:"Covered",c:risk.covered===0?C.red600:C.amber600},{v:shortfall,l:"Shortfall",c:C.red600}].map(d=>(
            <div key={d.l} style={{background:C.slate50,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontFamily:FONT,fontSize:15,fontWeight:700,color:d.c}}>{d.v}</div>
              <div style={{fontFamily:FONT,fontSize:9,color:C.slate500,textTransform:"uppercase",letterSpacing:".04em"}}>{d.l}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:7,fontSize:12,
          fontFamily:FONT,fontWeight:500,color:spFg,background:spBg,
          border:`1px solid ${spBd}`,padding:"7px 12px",borderRadius:10}}>
          <Users size={13}/> Sponsor: {risk.sponsorStatus}
        </div>
      </div>
      <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:8}}>
        {risk.severity==="critical"&&(
          <button onClick={onResolve} style={{width:"100%",display:"flex",alignItems:"center",
            justifyContent:"center",gap:8,
            background:`linear-gradient(90deg,${C.violet600},${C.indigo600})`,
            color:C.white,fontFamily:FONT,fontWeight:600,fontSize:14,
            padding:"13px 16px",borderRadius:12,border:"none",cursor:"pointer",
            boxShadow:"0 4px 14px rgba(124,58,237,.3)"}}>
            <Sparkles size={16}/> Resolve Risk with AI
          </button>
        )}
        {risk.severity==="warning"&&(
          <button style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",
            gap:8,background:C.amber500,color:C.white,fontFamily:FONT,fontWeight:600,
            fontSize:13,padding:"11px 16px",borderRadius:12,border:"none",cursor:"pointer"}}>
            <TrendingDown size={14}/> Escalate & Find Backup Supplier
          </button>
        )}
        {risk.severity==="watch"&&(
          <button style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",
            gap:8,background:C.slate100,color:C.slate700,fontFamily:FONT,fontWeight:500,
            fontSize:13,padding:"11px 16px",borderRadius:12,border:`1px solid ${C.slate200}`,cursor:"pointer"}}>
            <ExternalLink size={13}/> View Pledge Details
          </button>
        )}
        {onViewCalendar&&(
          <button onClick={onViewCalendar} style={{width:"100%",display:"flex",alignItems:"center",
            justifyContent:"center",gap:6,background:"none",
            border:`1px solid ${C.slate200}`,color:C.slate500,
            fontFamily:FONT,fontWeight:500,fontSize:12,
            padding:"8px 16px",borderRadius:10,cursor:"pointer"}}>
            <Calendar size={12}/> View on Calendar
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function RMHCDashboard(){
  const [selectedHub,setSelectedHub]=useState<Hub>("all");
  const [highlightHub,setHighlightHub]=useState<Hub|null>(null);
  const [aiDrawerRisk,setAiDrawerRisk]=useState<RiskCard|null>(null);
  const [activeTab,setActiveTab]=useState<"dashboard"|"calendar">("dashboard");
  const [inventoryItems,setInventoryItems]=useState<InventoryItem[]>(INVENTORY);
  const [events,setEvents]=useState<DriveEvent[]>(INITIAL_EVENTS);
  const [toast,setToast]=useState<string|null>(null);
  const [focusDate,setFocusDate]=useState<string|null>(null);
  const risks=useMemo(()=>deriveRisks(events),[events]);
  const filtered=selectedHub==="all"?inventoryItems:inventoryItems.filter(i=>i.location===selectedHub);
  const atRiskCount=inventoryItems.filter(i=>i.atRisk).length;
  const handleRiskHover=useCallback((loc:Hub|null)=>setHighlightHub(loc),[]);
  const handleViewOnCalendar=useCallback((dateStr:string)=>{ setFocusDate(dateStr); setActiveTab("calendar"); },[]);
  const handleAddEvent=useCallback((form:AddEventForm)=>{
    const kitInfo=KIT_TYPES.find(k=>k.label===form.kitType)||{label:form.kitType,icon:"gift"};
    const locInfo=LOCATION_OPTS.find(l=>l.value===form.location)||{value:"all" as const,label:"All Houses"};
    const newEvt:DriveEvent={
      id:`ev-${Date.now()}`,title:form.title,date:form.date,
      location:form.location as Hub,locationLabel:locInfo.label,
      kitType:form.kitType,iconName:kitInfo.icon,
      needed:form.needed,pledged:0,status:"planning",
      planningLeadMonths:form.planningLeadMonths,
      notes:form.notes||undefined,
    };
    const newItem:InventoryItem={
      id:`inv-${Date.now()}`,category:form.kitType,iconName:kitInfo.icon,
      location:form.location as Hub,locationLabel:locInfo.label,
      needed:form.needed,pledged:0,atRisk:true,
    };
    setEvents(prev=>[...prev,newEvt]);
    setInventoryItems(prev=>[...prev,newItem]);
    setToast(`"${form.title}" added — need created in Inventory Tracker`);
    setTimeout(()=>setToast(null),4000);
  },[]);

  return(
    <div style={{minHeight:"100vh",background:C.slate50,fontFamily:FONT}}>
      <style>{`@keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:0;transform:scale(1.6)}}`}</style>

      {/* Header */}
      <header style={{background:`linear-gradient(90deg,${C.red700},${C.red600},${C.red700})`,
        boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
        <div style={{maxWidth:1440,margin:"0 auto",padding:"14px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,background:"rgba(255,255,255,.14)",borderRadius:12,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:"1px solid rgba(255,255,255,.1)"}}>
                <Heart size={22} color={C.yellow300} fill={C.yellow300}/>
              </div>
              <div>
                <h1 style={{margin:0,color:C.white,fontWeight:700,fontSize:18,lineHeight:1.2,letterSpacing:"-.02em"}}>
                  RMHC Bay Area
                </h1>
                <p style={{margin:0,color:"#fecaca",fontSize:12,fontWeight:500}}>In-Kind Action Center</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <StatBadge icon={<Package size={15}/>} value="145,000" label="Free Meals"/>
              <StatBadge icon={<Moon size={15}/>} value="40,000+" label="Overnight Stays"/>
              <StatBadge icon={<Calendar size={15}/>} value="33 days" label="Avg. Stay"/>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.slate200}`,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{maxWidth:1440,margin:"0 auto",padding:"0 24px",display:"flex"}}>
          <button onClick={()=>setActiveTab("dashboard")} style={{
            display:"flex",alignItems:"center",gap:6,padding:"12px 20px",
            fontFamily:FONT,fontSize:13,fontWeight:600,background:"none",border:"none",cursor:"pointer",
            borderBottom:`2px solid ${activeTab==="dashboard"?C.red600:"transparent"}`,
            color:activeTab==="dashboard"?C.red600:C.slate500,marginBottom:-1,
          }}><ShieldAlert size={14}/>Action Center</button>
          <button onClick={()=>setActiveTab("calendar")} style={{
            display:"flex",alignItems:"center",gap:6,padding:"12px 20px",
            fontFamily:FONT,fontSize:13,fontWeight:600,background:"none",border:"none",cursor:"pointer",
            borderBottom:`2px solid ${activeTab==="calendar"?C.red600:"transparent"}`,
            color:activeTab==="calendar"?C.red600:C.slate500,marginBottom:-1,
          }}><Calendar size={14}/>Calendar & Planning</button>
        </div>
      </div>

      {/* Main content */}
      <main style={{maxWidth:1440,margin:"0 auto",padding:"24px"}}>
        {activeTab==="calendar"?(
          <CalendarTab
            events={events}
            onAddEvent={handleAddEvent}
            hubFilter={selectedHub}
            focusDateStr={focusDate}
            onSwitchToAction={(hub)=>{ setActiveTab("dashboard"); if(hub&&hub!=="all") setSelectedHub(hub as Hub); }}
          />
        ):(
        <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:24}}>

          {/* Left column */}
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Map card */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"14px 18px",borderBottom:`1px solid ${C.slate100}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Building2 size={17} color={C.red500}/>
                  <span style={{fontFamily:FONT,fontWeight:600,fontSize:15,color:C.slate800}}>Regional Hub Map</span>
                </div>
                <span style={{fontSize:11,fontFamily:FONT,color:C.slate500}}>
                  Click a pin to filter inventory
                </span>
              </div>
              <div style={{padding:14}}>
                <TileMap selected={selectedHub} onSelect={setSelectedHub} highlightHub={highlightHub}/>
              </div>
            </div>

            {/* Inventory card */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"14px 18px",borderBottom:`1px solid ${C.slate100}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Package size={17} color={C.red500}/>
                  <span style={{fontFamily:FONT,fontWeight:600,fontSize:15,color:C.slate800}}>
                    Inventory Tracker
                    {selectedHub!=="all"&&(
                      <span style={{marginLeft:8,fontWeight:400,fontSize:12,color:C.slate500}}>
                        Filtered: {HUB_META[selectedHub as Exclude<Hub,"all">]?.label}
                      </span>
                    )}
                  </span>
                </div>
                {atRiskCount>0&&(
                  <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,
                    fontFamily:FONT,fontWeight:600,color:C.red600,background:C.red50,
                    padding:"5px 10px",borderRadius:20,border:`1px solid ${C.red100}`}}>
                    <AlertTriangle size={12}/> {atRiskCount} at risk
                  </span>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 16px",
                background:C.slate50,borderBottom:`1px solid ${C.slate100}`,
                fontSize:9,fontFamily:FONT,fontWeight:700,color:C.slate500,
                textTransform:"uppercase",letterSpacing:".06em"}}>
                <span style={{width:32}}/>
                <span style={{flex:1}}>Item / Location</span>
                <span style={{width:130,textAlign:"center"}}>Coverage</span>
                <span style={{width:85,textAlign:"right"}}>Pledged / Need</span>
              </div>
              <InventoryTable items={filtered}/>
            </div>
          </div>

          {/* Right column */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:C.red500,
                animation:"pulse 1.5s ease-in-out infinite"}}/>
              <span style={{fontFamily:FONT,fontWeight:700,fontSize:15,color:C.slate800}}>Next-Action Feed</span>
              <span style={{marginLeft:"auto",fontSize:11,fontFamily:FONT,color:C.slate500}}>{risks.length} active risks</span>
            </div>
            {risks.map(risk=>(
              <RiskCardUI key={risk.id} risk={risk}
                onResolve={()=>setAiDrawerRisk(risk)}
                onHover={handleRiskHover}
                onViewCalendar={risk.eventDate ? ()=>handleViewOnCalendar(risk.eventDate!) : undefined}/>
            ))}
            <div style={{background:`linear-gradient(135deg,${C.slate800},${C.slate900})`,
              borderRadius:16,padding:18,color:C.white,boxShadow:"0 8px 24px rgba(0,0,0,.15)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <Heart size={15} color={C.red400} fill={C.red400}/>
                <span style={{fontFamily:FONT,fontWeight:600,fontSize:13}}>Impact This Quarter</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,textAlign:"center"}}>
                <div style={{background:"rgba(255,255,255,.1)",borderRadius:12,padding:14}}>
                  <div style={{fontFamily:FONT,fontSize:22,fontWeight:700,color:C.yellow300}}>2,340</div>
                  <div style={{fontFamily:FONT,fontSize:9,color:C.slate400,textTransform:"uppercase",letterSpacing:".06em"}}>Families Served</div>
                </div>
                <div style={{background:"rgba(255,255,255,.1)",borderRadius:12,padding:14}}>
                  <div style={{fontFamily:FONT,fontSize:22,fontWeight:700,color:C.emerald300}}>$1.2M</div>
                  <div style={{fontFamily:FONT,fontSize:9,color:C.slate400,textTransform:"uppercase",letterSpacing:".06em"}}>In-Kind Value</div>
                </div>
              </div>
            </div>
          </div>

        </div>
        )}
      </main>

      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
          zIndex:500,background:C.emerald600,color:C.white,
          fontFamily:FONT,fontSize:13,fontWeight:500,
          padding:"12px 20px",borderRadius:14,
          boxShadow:"0 8px 24px rgba(5,150,105,.4)",
          display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
          <CheckCircle2 size={16}/>{toast}
        </div>
      )}
      {aiDrawerRisk&&<AIDrawer risk={aiDrawerRisk} onClose={()=>setAiDrawerRisk(null)}/>}
    </div>
  );
}