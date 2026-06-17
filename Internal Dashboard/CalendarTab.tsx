import React, { useState, useMemo, useEffect, CSSProperties } from "react";
import {
  Plus, ChevronLeft, ChevronRight, Bell, Clock, MapPin,
  CalendarDays, X, Gift, GraduationCap, Baby, Cookie,
  Droplets, AlertTriangle, CheckCircle2, Sparkles,
} from "lucide-react";

// ── Palette (self-contained) ──────────────────────────────────────
const C = {
  red50:"#fef2f2",red100:"#fee2e2",red200:"#fecaca",red500:"#ef4444",
  red600:"#dc2626",red700:"#b91c1c",
  amber100:"#fef3c7",amber200:"#fde68a",amber500:"#f59e0b",amber600:"#d97706",amber700:"#b45309",
  emerald50:"#ecfdf5",emerald100:"#d1fae5",emerald200:"#a7f3d0",emerald500:"#10b981",emerald600:"#059669",
  blue50:"#eff6ff",blue100:"#dbeafe",blue200:"#bfdbfe",blue600:"#2563eb",
  violet50:"#f5f3ff",violet100:"#ede9fe",violet200:"#ddd6fe",violet600:"#7c3aed",violet700:"#6d28d9",
  orange100:"#ffedd5",orange200:"#fed7aa",orange600:"#ea580c",
  slate50:"#f8fafc",slate100:"#f1f5f9",slate200:"#e2e8f0",
  slate300:"#cbd5e1",slate400:"#94a3b8",slate500:"#64748b",
  slate600:"#475569",slate700:"#334155",slate800:"#1e293b",white:"#ffffff",
};
const FONT = "'sohne-var', system-ui, sans-serif";

// ── Types ─────────────────────────────────────────────────────────
export type EventHub = "all" | "stanford" | "ucsf" | "oakland";
export type EventStatus = "planning" | "active" | "at-risk" | "met" | "short" | "failed";

export interface DriveEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  location: EventHub;
  locationLabel: string;
  kitType: string;
  iconName: string;
  needed: number;
  pledged: number;
  status: EventStatus;
  planningLeadMonths: number;
  notes?: string;
  sponsorStatus?: string;
}

export interface AddEventForm {
  title: string;
  date: string;
  location: EventHub;
  kitType: string;
  needed: number;
  planningLeadMonths: number;
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const KIT_TYPES = [
  {label:"Father's Day Kits",icon:"gift"},
  {label:"Mother's Day Kits",icon:"gift"},
  {label:"Back-to-School Kits",icon:"grad"},
  {label:"Snack Kits",icon:"cookie"},
  {label:"Holiday Toys",icon:"gift"},
  {label:"Activity Kits",icon:"sparkles"},
  {label:"New Mom Kits",icon:"baby"},
  {label:"St. Patrick's Day Kits",icon:"droplets"},
  {label:"Toiletries",icon:"droplets"},
  {label:"Diapers",icon:"baby"},
  {label:"School Supplies",icon:"grad"},
  {label:"Food Bags",icon:"cookie"},
];

export const LOCATION_OPTS: {value:EventHub;label:string}[] = [
  {value:"all",label:"All Houses"},
  {value:"stanford",label:"Stanford"},
  {value:"ucsf",label:"UCSF"},
  {value:"oakland",label:"Oakland"},
];

const STATUS_STYLE: Record<EventStatus,{bg:string;fg:string;bd:string}> = {
  "at-risk": {bg:C.red100,  fg:C.red700,    bd:C.red200},
  "active":  {bg:C.amber100,fg:C.amber700,  bd:C.amber200},
  "planning":{bg:C.blue100, fg:C.blue600,   bd:C.blue200},
  "met":     {bg:C.emerald100,fg:C.emerald600,bd:C.emerald200},
  "short":   {bg:C.orange100,fg:C.orange600,bd:C.orange200},
  "failed":  {bg:C.slate100,fg:C.slate500,  bd:C.slate200},
};

// ── Helpers ───────────────────────────────────────────────────────
export function planningStartDate(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(1);
  d.setMonth(d.getMonth() - months);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
}

export function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function toDateStr(y:number, m:number, d:number): string {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

// ── Icon ──────────────────────────────────────────────────────────
function EIcon({name,size=12,color}:{name:string;size?:number;color:string}){
  const p={size,color,strokeWidth:2};
  if(name==="grad") return <GraduationCap {...p}/>;
  if(name==="baby") return <Baby {...p}/>;
  if(name==="cookie") return <Cookie {...p}/>;
  if(name==="droplets") return <Droplets {...p}/>;
  if(name==="sparkles") return <Sparkles {...p}/>;
  return <Gift {...p}/>;
}

// ── EventPill ─────────────────────────────────────────────────────
function EventPill({event,isPlan=false}:{event:DriveEvent;isPlan?:boolean}){
  const s = isPlan ? {bg:C.violet100,fg:C.violet700,bd:C.violet200} : STATUS_STYLE[event.status];
  return(
    <div style={{
      display:"flex",alignItems:"center",gap:3,
      background:s.bg,color:s.fg,
      border:`1px ${isPlan?"dashed":"solid"} ${s.bd}`,
      borderRadius:4,padding:"1.5px 5px",marginBottom:2,
      overflow:"hidden",whiteSpace:"nowrap",
      fontSize:9,fontFamily:FONT,fontWeight:600,
    }}>
      {isPlan ? <Bell size={7} color={s.fg}/> : <EIcon name={event.iconName} size={7} color={s.fg}/>}
      <span style={{overflow:"hidden",textOverflow:"ellipsis",maxWidth:92}}>
        {isPlan ? `Plan: ${event.title}` : event.title}
      </span>
    </div>
  );
}

// ── MonthGrid ─────────────────────────────────────────────────────
function MonthGrid({year,month,events,selectedDay,onDayClick}:{
  year:number;month:number;events:DriveEvent[];
  selectedDay:number|null;onDayClick:(d:number)=>void;
}){
  const firstDow = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const todayObj = new Date();
  const isThisMonth = todayObj.getFullYear()===year && todayObj.getMonth()===month;

  function dayEvents(day:number){ return events.filter(e=>e.date===toDateStr(year,month,day)); }
  function dayPlanReminders(day:number){
    if(day!==1) return [];
    const dayStr = toDateStr(year,month,day);
    return events.filter(e=>e.planningLeadMonths>0 && planningStartDate(e.date,e.planningLeadMonths)===dayStr);
  }

  const cells:(number|null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({length:daysInMonth},(_,i)=>i+1),
  ];
  while(cells.length%7!==0) cells.push(null);

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
        {DAYS_SHORT.map(d=>(
          <div key={d} style={{fontFamily:FONT,fontSize:10,fontWeight:700,
            color:C.slate400,textTransform:"uppercase",letterSpacing:".05em",
            textAlign:"center",padding:"3px 0"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((day,idx)=>{
          if(day===null) return(
            <div key={`b${idx}`} style={{height:88,background:C.slate50,borderRadius:6,opacity:.4}}/>
          );
          const evts = dayEvents(day);
          const plans = dayPlanReminders(day);
          const total = evts.length + plans.length;
          const isToday = isThisMonth && day===todayObj.getDate();
          const isSel = day===selectedDay;
          const hasRisk = evts.some(e=>e.status==="at-risk");

          return(
            <div key={day} onClick={()=>onDayClick(day)} style={{
              height:88,
              background:isSel?"#eff6ff":C.white,
              border:`1px solid ${isSel?"#2563eb":hasRisk?C.red200:C.slate200}`,
              borderRadius:6,padding:"5px 5px 4px",cursor:"pointer",overflow:"hidden",
              outline:isSel?"1.5px solid #2563eb":"none",
              transition:"background .1s",
            }}>
              <div style={{
                fontSize:11,fontFamily:FONT,fontWeight:isToday?700:400,
                color:isToday?C.white:C.slate700,
                width:20,height:20,borderRadius:"50%",
                background:isToday?C.red600:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                marginBottom:3,flexShrink:0,
              }}>{day}</div>
              {[...plans.map(e=>({e,isPlan:true})),...evts.map(e=>({e,isPlan:false}))]
                .slice(0,2).map(({e,isPlan},i)=>(
                  <EventPill key={e.id+i} event={e} isPlan={isPlan}/>
                ))}
              {total>2&&<div style={{fontSize:8,color:C.slate400,fontFamily:FONT}}>+{total-2} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── EventDetailCard ───────────────────────────────────────────────
function EventDetailCard({event,compact=false}:{event:DriveEvent;compact?:boolean}){
  const s = STATUS_STYLE[event.status];
  const pct = event.needed>0?Math.min(100,Math.round(event.pledged/event.needed*100)):0;
  const days = daysUntil(event.date);
  const barColor = pct>=90?C.emerald500:pct>=50?C.amber500:C.red500;
  return(
    <div style={{border:`1px solid ${s.bd}`,borderRadius:10,padding:compact?10:14,marginBottom:8,
      background:event.status==="at-risk"?C.red50:C.white}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
        <div style={{fontFamily:FONT,fontSize:compact?12:13,fontWeight:600,color:C.slate800,
          paddingRight:8,lineHeight:1.3}}>{event.title}</div>
        <span style={{fontSize:8,fontFamily:FONT,fontWeight:700,textTransform:"uppercase" as const,
          background:s.bg,color:s.fg,border:`1px solid ${s.bd}`,
          padding:"2px 6px",borderRadius:8,flexShrink:0,letterSpacing:".04em"}}>
          {event.status}
        </span>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:7,flexWrap:"wrap" as const}}>
        <span style={{fontSize:10,fontFamily:FONT,color:C.slate500,display:"flex",alignItems:"center",gap:3}}>
          <Clock size={9}/>{days>0?`${days}d away`:days===0?"Today":"Past"}
        </span>
        <span style={{fontSize:10,fontFamily:FONT,color:C.slate500,display:"flex",alignItems:"center",gap:3}}>
          <MapPin size={9}/>{event.locationLabel}
        </span>
        <span style={{fontSize:10,fontFamily:FONT,color:C.slate500}}>{formatDateShort(event.date)}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
        <div style={{flex:1,height:5,background:C.slate100,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:barColor,borderRadius:3,transition:"width .4s"}}/>
        </div>
        <span style={{fontSize:10,fontFamily:FONT,fontWeight:700,color:C.slate600,width:28,textAlign:"right" as const}}>{pct}%</span>
      </div>
      <div style={{fontSize:10,fontFamily:FONT,color:C.slate500}}>
        {event.pledged.toLocaleString()} pledged of {event.needed.toLocaleString()} needed
        {event.needed-event.pledged>0&&(
          <span style={{color:s.fg,fontWeight:600}}> · {(event.needed-event.pledged).toLocaleString()} gap</span>
        )}
      </div>
      {!compact&&event.notes&&(
        <div style={{marginTop:8,fontSize:10,fontFamily:FONT,color:C.slate500,lineHeight:1.5,
          borderTop:`1px solid ${C.slate100}`,paddingTop:8,fontStyle:"italic" as const}}>{event.notes}</div>
      )}
    </div>
  );
}

// ── SidePanel ─────────────────────────────────────────────────────
function SidePanel({events,selectedDay,year,month,onSwitchToAction}:{
  events:DriveEvent[];selectedDay:number|null;year:number;month:number;
  onSwitchToAction:(hub?:EventHub)=>void;
}){
  const todayStr = new Date().toISOString().split("T")[0];
  const selDate = selectedDay ? toDateStr(year,month,selectedDay) : null;
  const selEvents = selDate ? events.filter(e=>e.date===selDate) : [];

  // Planning reminders: events upcoming + planning overdue or starting within 60 days
  const planReminders = events.filter(e=>{
    if(e.planningLeadMonths===0) return false;
    const pStart = planningStartDate(e.date,e.planningLeadMonths);
    return e.date>todayStr && daysUntil(pStart)<=60;
  }).sort((a,b)=>{
    return daysUntil(planningStartDate(a.date,a.planningLeadMonths))
         - daysUntil(planningStartDate(b.date,b.planningLeadMonths));
  });

  const upcomingEvents = events
    .filter(e=>e.date>=todayStr)
    .sort((a,b)=>a.date.localeCompare(b.date))
    .slice(0,4);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Planning Reminders section */}
      {planReminders.length>0&&(
        <div style={{background:C.violet50,border:`1px solid ${C.violet200}`,borderRadius:14,padding:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:30,height:30,borderRadius:8,background:C.violet600,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Bell size={15} color={C.white}/>
            </div>
            <div>
              <div style={{fontFamily:FONT,fontSize:12,fontWeight:700,color:"#4c1d95"}}>Planning Reminders</div>
              <div style={{fontFamily:FONT,fontSize:10,color:C.violet600,marginTop:1}}>Act before the gap appears</div>
            </div>
          </div>
          {planReminders.slice(0,4).map(e=>{
            const pStart = planningStartDate(e.date,e.planningLeadMonths);
            const dPlan = daysUntil(pStart);
            const isOverdue = dPlan<0;
            const urgent = isOverdue && daysUntil(e.date)<30;
            return(
              <div key={e.id} style={{
                background:C.white,borderRadius:8,padding:"9px 10px",marginBottom:6,
                border:`1px solid ${urgent?C.red200:isOverdue?C.amber200:C.violet200}`,
                borderLeft:`3px solid ${urgent?C.red600:isOverdue?C.amber600:C.violet600}`,
              }}>
                <div style={{fontFamily:FONT,fontSize:11,fontWeight:600,color:C.slate800,marginBottom:2}}>
                  {e.title}
                </div>
                <div style={{fontFamily:FONT,fontSize:10,color:C.slate500,marginBottom:3}}>
                  {formatDateShort(e.date)} · {e.needed.toLocaleString()} {e.kitType}
                </div>
                <div style={{fontSize:10,fontFamily:FONT,fontWeight:700,
                  color:urgent?C.red600:isOverdue?C.amber700:C.violet700,
                  display:"flex",alignItems:"center",gap:4}}>
                  {(urgent||isOverdue)&&<AlertTriangle size={9}/>}
                  {isOverdue
                    ? `Planning overdue by ${Math.abs(dPlan)}d`
                    : dPlan===0?"Start planning today"
                    : `Start planning in ${dPlan}d`
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected day detail OR upcoming list */}
      {selDate&&selEvents.length>0 ? (
        <div>
          <div style={{fontFamily:FONT,fontSize:10,fontWeight:700,color:C.slate400,
            textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
            {MONTHS[month]} {selectedDay}
          </div>
          {selEvents.map(e=><EventDetailCard key={e.id} event={e}/>)}
          {selEvents.some(e=>e.status==="at-risk"||e.status==="planning")&&(
            <button onClick={()=>onSwitchToAction(selEvents.find(e=>e.status==="at-risk"||e.status==="planning")?.location)} style={{width:"100%",padding:"9px 14px",
              background:C.red50,border:`1px solid ${C.red200}`,borderRadius:10,cursor:"pointer",
              fontFamily:FONT,fontSize:12,fontWeight:600,color:C.red700,
              display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <CheckCircle2 size={13}/> View in Inventory Tracker
            </button>
          )}
        </div>
      ) : (
        <div>
          <div style={{fontFamily:FONT,fontSize:10,fontWeight:700,color:C.slate400,
            textTransform:"uppercase",letterSpacing:".07em",marginBottom:8}}>
            Upcoming Events
          </div>
          {upcomingEvents.map(e=><EventDetailCard key={e.id} event={e} compact/>)}
          {upcomingEvents.length===0&&(
            <div style={{fontFamily:FONT,fontSize:12,color:C.slate400,textAlign:"center",padding:20}}>
              No upcoming events
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Event Modal ───────────────────────────────────────────────
const EMPTY_FORM: AddEventForm = {
  title:"", date:new Date().toISOString().split("T")[0],
  location:"all", kitType:"Snack Kits", needed:100,
  planningLeadMonths:2, notes:"",
};

function AddEventModal({onClose,onAdd}:{onClose:()=>void;onAdd:(f:AddEventForm)=>void}){
  const [form,setForm]=useState<AddEventForm>(EMPTY_FORM);
  const upd=(k:keyof AddEventForm,v:any)=>setForm(f=>({...f,[k]:v}));

  const planStart = useMemo(()=>{
    if(!form.date) return "";
    const d=new Date(form.date+"T00:00:00");
    d.setDate(1); d.setMonth(d.getMonth()-form.planningLeadMonths);
    return d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  },[form.date,form.planningLeadMonths]);

  const inp:CSSProperties={
    width:"100%",padding:"8px 10px",borderRadius:8,boxSizing:"border-box",
    border:`1px solid ${C.slate200}`,fontFamily:FONT,fontSize:13,color:C.slate700,
    background:C.white,outline:"none",
  };
  const lbl:CSSProperties={
    fontFamily:FONT,fontSize:10,fontWeight:700,color:C.slate600,
    textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:4,
  };
  const canSubmit=form.title.trim().length>0&&form.date.length>0&&form.needed>0;

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{position:"absolute",inset:0,background:"rgba(15,23,42,.45)",backdropFilter:"blur(6px)"}}/>
      <div onClick={e=>e.stopPropagation()} style={{
        position:"relative",background:C.white,borderRadius:20,
        boxShadow:"0 24px 48px rgba(0,0,0,.18)",width:"100%",maxWidth:480,
        maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.slate200}`,
      }}>
        {/* Modal header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"18px 20px",borderBottom:`1px solid ${C.slate100}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:C.red600,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <CalendarDays size={18} color={C.white}/>
            </div>
            <div>
              <div style={{fontFamily:FONT,fontWeight:700,fontSize:15,color:C.slate800}}>Add Drive Event</div>
              <div style={{fontFamily:FONT,fontSize:11,color:C.slate500}}>Auto-creates need in Inventory Tracker</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",
            color:C.slate400,padding:6,borderRadius:8,display:"flex"}}>
            <X size={18}/>
          </button>
        </div>

        {/* Form body */}
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={lbl}>Event Title</label>
            <input value={form.title} onChange={e=>upd("title",e.target.value)}
              style={inp} placeholder="e.g. Thanksgiving Snack Drive – Oakland"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={lbl}>Event Date</label>
              <input type="date" value={form.date} onChange={e=>upd("date",e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Location</label>
              <select value={form.location} onChange={e=>upd("location",e.target.value as EventHub)} style={inp}>
                {LOCATION_OPTS.map(l=><option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={lbl}>Kit / Item Type</label>
              <select value={form.kitType} onChange={e=>upd("kitType",e.target.value)} style={inp}>
                {KIT_TYPES.map(k=><option key={k.label} value={k.label}>{k.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Quantity Needed</label>
              <input type="number" min={1} value={form.needed}
                onChange={e=>upd("needed",parseInt(e.target.value)||0)} style={inp}/>
            </div>
          </div>
          <div>
            <label style={lbl}>
              Planning Lead Time &nbsp;
              <span style={{fontWeight:400,fontSize:11,color:C.slate500,
                textTransform:"none" as const,letterSpacing:0}}>
                — {form.planningLeadMonths} month{form.planningLeadMonths!==1?"s":""} before event
              </span>
            </label>
            <input type="range" min={1} max={6} value={form.planningLeadMonths}
              onChange={e=>upd("planningLeadMonths",parseInt(e.target.value))}
              style={{width:"100%",accentColor:C.red600,margin:"4px 0 8px"}}/>
            {planStart&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontFamily:FONT,
                color:C.violet700,background:C.violet50,borderRadius:8,padding:"5px 10px",
                border:`1px dashed ${C.violet200}`}}>
                <Bell size={10} color={C.violet700}/>
                Planning reminder will appear in {planStart}
              </div>
            )}
          </div>
          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e=>upd("notes",e.target.value)}
              style={{...inp,height:68,resize:"vertical" as const}}
              placeholder="Sponsor info, special requirements, contacts..."/>
          </div>

          <button
            onClick={()=>{if(canSubmit){onAdd(form);onClose();}}}
            style={{
              width:"100%",padding:"13px 16px",borderRadius:12,border:"none",
              cursor:canSubmit?"pointer":"not-allowed",
              background:canSubmit
                ?`linear-gradient(90deg,${C.red700},${C.red500})`
                :`linear-gradient(90deg,${C.slate300},${C.slate300})`,
              color:C.white,fontFamily:FONT,fontWeight:600,fontSize:14,
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            }}>
            <Plus size={16}/> Add Event & Create Inventory Need
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CalendarTab (main export) ─────────────────────────────────────
export default function CalendarTab({events,onAddEvent,onSwitchToAction,hubFilter,focusDateStr}:{
  events:DriveEvent[];
  onAddEvent:(f:AddEventForm)=>void;
  onSwitchToAction:(hub?:EventHub)=>void;
  hubFilter?:EventHub;
  focusDateStr?:string|null;
}){
  const today = new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [selectedDay,setSelectedDay]=useState<number|null>(today.getDate());
  const [showModal,setShowModal]=useState(false);

  // Navigate to a date when triggered from outside (e.g. "View on Calendar" from a risk card)
  useEffect(()=>{
    if(!focusDateStr) return;
    const d=new Date(focusDateStr+"T00:00:00");
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelectedDay(d.getDate());
  },[focusDateStr]);

  // Filter events by selected hub (events scoped to "all" are always shown)
  const visibleEvents = (hubFilter && hubFilter!=="all")
    ? events.filter(e=>e.location===hubFilter||e.location==="all")
    : events;

  const prevMonth=()=>{ if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); setSelectedDay(null); };
  const nextMonth=()=>{ if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); setSelectedDay(null); };
  const goToday=()=>{ setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()); };

  const legend=[
    {color:C.red700,label:"At Risk"},
    {color:C.amber600,label:"Active"},
    {color:C.blue600,label:"Planning"},
    {color:C.emerald600,label:"Met"},
    {color:C.violet600,label:"Plan Reminder"},
  ];

  return(
    <div>
      {/* Calendar toolbar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={prevMonth} style={{background:C.white,border:`1px solid ${C.slate200}`,
            borderRadius:8,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",color:C.slate600}}>
            <ChevronLeft size={16}/>
          </button>
          <div style={{fontFamily:FONT,fontSize:20,fontWeight:700,color:C.slate800,minWidth:190,textAlign:"center"}}>
            {MONTHS[month]} {year}
          </div>
          <button onClick={nextMonth} style={{background:C.white,border:`1px solid ${C.slate200}`,
            borderRadius:8,padding:"7px 10px",cursor:"pointer",display:"flex",alignItems:"center",color:C.slate600}}>
            <ChevronRight size={16}/>
          </button>
          <button onClick={goToday} style={{background:C.slate100,border:`1px solid ${C.slate200}`,
            borderRadius:8,padding:"7px 12px",cursor:"pointer",fontFamily:FONT,
            fontSize:12,fontWeight:600,color:C.slate600}}>Today</button>
          {hubFilter&&hubFilter!=="all"&&(
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontFamily:FONT,
              fontWeight:600,color:C.red700,background:C.red50,
              padding:"5px 10px",borderRadius:8,border:`1px solid ${C.red200}`}}>
              <MapPin size={11}/>{LOCATION_OPTS.find(l=>l.value===hubFilter)?.label}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {/* Legend */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {legend.map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,borderRadius:2,background:l.color}}/>
                <span style={{fontFamily:FONT,fontSize:10,color:C.slate500}}>{l.label}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowModal(true)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"9px 16px",
            background:C.red600,color:C.white,border:"none",borderRadius:10,
            fontFamily:FONT,fontWeight:600,fontSize:13,cursor:"pointer",
            boxShadow:"0 2px 8px rgba(220,38,38,.28)",flexShrink:0,
          }}>
            <Plus size={15}/> Add Event
          </button>
        </div>
      </div>

      {/* Main two-column layout */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:20,alignItems:"start"}}>
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.slate200}`,
          padding:16,boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          <MonthGrid year={year} month={month} events={visibleEvents}
            selectedDay={selectedDay} onDayClick={setSelectedDay}/>
        </div>
        <SidePanel events={visibleEvents} selectedDay={selectedDay}
          year={year} month={month} onSwitchToAction={onSwitchToAction}/>
      </div>

      {showModal&&<AddEventModal onClose={()=>setShowModal(false)} onAdd={onAddEvent}/>}
    </div>
  );
}
