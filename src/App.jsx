import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
 
// ─── MARKET DATA ──────────────────────────────────────────────────────────────
const MKT = {
  version:"2025-Q4", updated:"Marzo 2026",
  sources:"DANE IPVN Q2-2025 · La Lonja · Habi · Ciencuadras feb-2026 · Superfinanciera",
  cities:[
    {id:"itagui",    name:"Itagüí",              region:"Antioquia",      prom:5044000,arriendo:2618000,val24:0.140,flip:10,ticket:180000000},
    {id:"laureles",  name:"Medellín — Laureles",  region:"Antioquia",      prom:5200000,arriendo:3800000,val24:0.155,flip:9, ticket:320000000},
    {id:"sabaneta",  name:"Sabaneta",             region:"Antioquia",      prom:3925000,arriendo:3200000,val24:0.140,flip:9, ticket:280000000},
    {id:"bello",     name:"Bello",                region:"Antioquia",      prom:3926000,arriendo:1900000,val24:0.120,flip:9, ticket:130000000},
    {id:"suba",      name:"Bogotá — Suba",        region:"Cundinamarca",   prom:4200000,arriendo:2200000,val24:0.080,flip:9, ticket:230000000},
    {id:"kennedy",   name:"Bogotá — Kennedy",     region:"Cundinamarca",   prom:3400000,arriendo:1800000,val24:0.096,flip:9, ticket:160000000},
    {id:"baq_norte", name:"Barranquilla Norte",   region:"Atlántico",      prom:3729000,arriendo:2200000,val24:0.121,flip:9, ticket:200000000},
    {id:"pereira",   name:"Pereira",              region:"Risaralda",      prom:3200000,arriendo:2000000,val24:0.109,flip:9, ticket:170000000},
    {id:"teusaquillo",name:"Bogotá — Teusaquillo",region:"Cundinamarca",   prom:5100000,arriendo:2800000,val24:0.090,flip:9, ticket:280000000},
    {id:"laest",     name:"La Estrella",          region:"Antioquia",      prom:4913000,arriendo:2100000,val24:0.120,flip:8, ticket:260000000},
    {id:"envigado",  name:"Envigado",             region:"Antioquia",      prom:5227000,arriendo:4500000,val24:0.150,flip:8, ticket:380000000},
    {id:"rionegro",  name:"Rionegro",             region:"Antioquia",      prom:4500000,arriendo:3500000,val24:0.064,flip:7, ticket:350000000},
    {id:"cali_norte",name:"Cali Norte",           region:"Valle del Cauca",prom:4142000,arriendo:2500000,val24:0.125,flip:8, ticket:220000000},
    {id:"baq_sur",   name:"Barranquilla Sur",     region:"Atlántico",      prom:2500000,arriendo:1500000,val24:0.100,flip:9, ticket:110000000},
    {id:"chapinero", name:"Bogotá — Chapinero",   region:"Cundinamarca",   prom:7500000,arriendo:4500000,val24:0.097,flip:8, ticket:450000000},
    {id:"pasto",     name:"Pasto",                region:"Nariño",         prom:2500000,arriendo:1300000,val24:0.149,flip:7, ticket:100000000},
    {id:"cucuta",    name:"Cúcuta",               region:"Nte Santander",  prom:2200000,arriendo:1200000,val24:0.122,flip:7, ticket:90000000},
    {id:"bga_cab",   name:"Bucaramanga",          region:"Santander",      prom:4480000,arriendo:2500000,val24:0.080,flip:7, ticket:280000000},
    {id:"neiva",     name:"Neiva",                region:"Huila",          prom:2000000,arriendo:1100000,val24:-0.061,flip:2,ticket:80000000},
    {id:"manizales", name:"Manizales",            region:"Caldas",         prom:2600000,arriendo:1600000,val24:0.017,flip:5, ticket:130000000},
  ],
  bancos:[
    {n:"Privado",      tea:0.30,  plazo:12, nota:"2.5-3.5%/mes. Sin trámite bancario."},
    {n:"Bancolombia",  tea:0.1083,plazo:360,nota:"Nómina -1%. Vivienda usada: 11% EA."},
    {n:"AV Villas",    tea:0.102, plazo:360,nota:"Tasa más baja No VIS — ene-2025."},
    {n:"Davivienda",   tea:0.1185,plazo:360,nota:"Promedio ponderado mar-2025 = 11.29%."},
    {n:"FNA",          tea:0.093, plazo:360,nota:"Solo cesantías FNA. La más baja."},
    {n:"Capital Propio",tea:0,    plazo:999,nota:"Sin costo financiero. Máximo ROI."},
  ]
};
 
// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt  = (n,d=0) => n==null||isNaN(n)?"—":new Intl.NumberFormat("es-CO",{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const fmtM = (n) => { if(!n||isNaN(n))return"—"; const a=Math.abs(n),s=n<0?"-":""; return a>=1e9?`${s}$${(a/1e9).toFixed(1)}B`:a>=1e6?`${s}$${(a/1e6).toFixed(0)}M`:`${s}$${fmt(a)}`; };
const fmtP = (n) => n==null||isNaN(n)?"—":`${(n*100).toFixed(1)}%`;
const gc   = (r) => r>=0.20?"#059669":r>=0.12?"#D97706":"#DC2626";
 
// ─── COLORES ──────────────────────────────────────────────────────────────────
const COL = {
  blue:"#1D4ED8",  blueL:"#EFF6FF",  blueLT:"#DBEAFE",
  green:"#059669", greenL:"#ECFDF5", greenLT:"#D1FAE5",
  amber:"#D97706", amberL:"#FFFBEB", amberLT:"#FEF3C7",
  red:"#DC2626",   redL:"#FEF2F2",   redLT:"#FEE2E2",
  purple:"#7C3AED",purpleL:"#F5F3FF",purpleLT:"#EDE9FE",
  orange:"#EA580C",orangeL:"#FFF7ED",orangeLT:"#FFEDD5",
  teal:"#0891B2",  tealL:"#ECFEFF",  tealLT:"#CFFAFE",
  navy:"#1E3A5F",  gray:"#6B7280",
};
 
// ─── DEFAULT DEAL ─────────────────────────────────────────────────────────────
const dftDeal = () => ({
  id:Date.now(), nombre:"Nuevo Deal", direccion:"", ciudad:"itagui",
  estrato:3, area:68, habitaciones:3, banos:2,
  tipo:"Apartamento", estado:"Regular", estrategia:"Fix & Flip",
  precioCompra:150000000, gastosNotaria:2200000, honorariosAbogado:1800000,
  predialPendiente:0, deudasAdmin:0, comisionCaptador:3000000, otrosCostos:500000,
  precioM2:5044000, arvComp:220000000, descVenta:0.03, comVenta:0.035,
  diasBus:30, diasEsc:25, diasRemo:90, diasVenta:60,
  capitalPropio:80000000, tasaMes:0.025, plazoMes:6,
  tasaGO:0.15, plusvalia:0, tasaIC:0.005, retencion:0.01,
  partidas:[
    {n:"Demoliciones y preparación", q:1, p:1000000},
    {n:"Obra civil básica",          q:1, p:5500000},
    {n:"Eléctrico (RETIE)",          q:1, p:4500000},
    {n:"Hidráulica y sanitaria",     q:1, p:7800000},
    {n:"Acabados interiores",        q:1, p:10000000},
    {n:"Fachada y exteriores",       q:1, p:2000000},
    {n:"Indirectos y dirección",     q:1, p:5000000},
  ],
  imprevistos:0.12, status:"Analizando",
  sc_ub:7, sc_dd:5, sc_remo:7, sc_merc:7, sc_eq:6,
});
 
// ─── CÁLCULO DEAL ─────────────────────────────────────────────────────────────
const calcDeal = (d) => {
  const city  = MKT.cities.find(c=>c.id===d.ciudad) || MKT.cities[0];
  const arvM2 = (d.precioM2||city.prom) * d.area;
  const arvC  = Math.min(arvM2, d.arvComp);
  const pV    = arvC*(1-d.descVenta);
  const retF  = pV*d.retencion;
  const ingN  = pV*(1-d.comVenta)-retF;
  const adq   = d.gastosNotaria+d.honorariosAbogado+d.predialPendiente+d.deudasAdmin+d.comisionCaptador+d.otrosCostos;
  const rBase = d.partidas.reduce((s,p)=>s+p.q*p.p,0);
  const rTot  = rBase*(1+d.imprevistos);
  const finE  = Math.max(0,d.precioCompra-d.capitalPropio);
  const tm=d.tasaMes, pl=d.plazoMes;
  const cuota = (finE>0&&tm>0)?finE*tm*Math.pow(1+tm,pl)/(Math.pow(1+tm,pl)-1):0;
  const cDeuda= Math.max(0,cuota*pl-finE);
  const dias  = d.diasBus+d.diasEsc+d.diasRemo+d.diasVenta;
  const meses = dias/30;
  const hold  = meses*60000;
  const cTot  = d.precioCompra+adq+rTot+cDeuda+hold;
  const uB    = ingN-cTot;
  const bGO   = Math.max(0,uB);
  const iGO   = bGO*d.tasaGO;
  const iPV   = bGO*d.plusvalia;
  const iIC   = pV*d.tasaIC;
  const uN    = uB-iGO-iPV-iIC;
  const roiT  = cTot>0?uN/cTot:0;
  const roiC  = d.capitalPropio>0?uN/d.capitalPropio:0;
  const roiAn = meses>0?Math.pow(1+roiT,12/meses)-1:0;
  const moic  = d.capitalPropio>0?(uN+d.capitalPropio)/d.capitalPropio:0;
  const pmc   = arvC*0.7-rTot;
  const okPMC = d.precioCompra<=pmc;
  const s_pmc = d.precioCompra<=pmc*0.9?10:okPMC?7:3;
  const s_est = d.estado==="Malo"?3:d.estado==="Regular"?6:d.estado==="Bueno"?8:10;
  const s_mar = roiT>=0.15?10:roiT>=0.08?6:3;
  const s_fin = finE/d.precioCompra>=0.6?3:finE/d.precioCompra>=0.4?6:9;
  const s_vel = meses<=6?9:meses<=9?7:4;
  const score = s_pmc*0.20+d.sc_ub*0.15+s_est*0.10+s_mar*0.15+s_fin*0.10+d.sc_dd*0.10+s_vel*0.08+d.sc_remo*0.07+d.sc_merc*0.03+d.sc_eq*0.02;
  return {city,arvM2,arvC,pV,ingN,adq,rBase,rTot,finE,cuota,cDeuda,dias,meses,cTot,uB,iGO,iPV,iIC,uN,roiT,roiC,roiAn,moic,pmc,okPMC,score,hold,retF};
};
 
// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
 
// Encabezado de sección con color
const SH = ({icon,title,sub,bg=COL.blueL,bc=COL.blue,tc=COL.blue}) => (
  <div style={{background:bg,borderLeft:`3px solid ${bc}`,borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:12,marginTop:8}}>
    <div style={{fontSize:11,fontWeight:700,color:tc,letterSpacing:"0.06em",textTransform:"uppercase"}}>
      {icon&&<span style={{marginRight:5,fontSize:13}}>{icon}</span>}{title}
    </div>
    {sub&&<div style={{fontSize:10,color:tc,opacity:0.7,marginTop:1}}>{sub}</div>}
  </div>
);
 
// KPI card — borde superior de color
const KPI = ({label,value,sub,col,small}) => (
  <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"11px 12px",textAlign:"center",borderTop:col?`2.5px solid ${col}`:"none"}}>
    <div style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:3}}>{label}</div>
    <div style={{fontSize:small?16:20,fontWeight:700,color:col||"var(--color-text-primary)"}}>{value}</div>
    {sub&&<div style={{fontSize:9,color:"var(--color-text-tertiary)",marginTop:2,lineHeight:1.3}}>{sub}</div>}
  </div>
);
 
// Fila resultado P&L (label izquierda, valor derecha)
const Row = ({l,v,bold,bg,neg,indent}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:bg||"transparent",borderBottom:"0.5px solid var(--color-border-tertiary)",paddingLeft:indent?22:10}}>
    <span style={{fontSize:12,fontWeight:bold?600:400,color:"var(--color-text-secondary)",flex:1}}>{l}</span>
    <span style={{fontSize:12,fontWeight:bold?600:400,color:neg?"#DC2626":bold?"var(--color-text-primary)":"var(--color-text-primary)",marginLeft:8}}>{v}</span>
  </div>
);
 
// Input con formato de miles — usado en Costos y Escenarios
const FmtInput = ({v, onChange, decimals=0, center=false, borderColor=null}) => {
  const [focused, setFocused] = useState(false);
  const displayVal = focused
    ? (v===0?"":String(v))
    : new Intl.NumberFormat("es-CO",{minimumFractionDigits:0,maximumFractionDigits:decimals}).format(v);
  return (
    <input
      type="text" inputMode={decimals>0?"decimal":"numeric"}
      value={displayVal}
      onFocus={e=>{setFocused(true);setTimeout(()=>e.target.select(),10);}}
      onBlur={e=>{
        setFocused(false);
        const raw=parseFloat(e.target.value.replace(/\./g,"").replace(/,/g,"."))||0;
        onChange(Math.max(0,raw));
      }}
      onChange={e=>{
        if(focused){
          const raw=parseFloat(e.target.value.replace(/\./g,"").replace(/,/g,"."))||0;
          onChange(Math.max(0,raw));
        }
      }}
      style={{width:"100%",padding:"9px 10px",fontSize:15,borderRadius:7,
        textAlign:center?"center":"right",
        border:borderColor?`1.5px solid ${borderColor}`:"1.5px solid var(--color-border-secondary)",
        background:"var(--color-background-primary)",
        color:"var(--color-text-primary)",fontWeight:600,minHeight:42}}
    />
  );
};
 
// Input numérico con separador de miles (formato colombiano)
const NI = ({v,onChange,step=1000000,min=0,sfx,pfx,int=false}) => {
  const [focused, setFocused] = useState(false);
  // Cuando está enfocado muestra número plano para editar, cuando no muestra formato
  const displayVal = focused
    ? (v === 0 ? "" : String(v))
    : (v === 0 ? "0" : new Intl.NumberFormat("es-CO",{maximumFractionDigits:int?0:4}).format(v));
 
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
      {pfx&&<span style={{fontSize:13,color:"var(--color-text-secondary)",flexShrink:0,fontWeight:600}}>{pfx}</span>}
      <input
        type="text"
        inputMode={int?"numeric":"decimal"}
        value={displayVal}
        onFocus={e=>{setFocused(true);setTimeout(()=>e.target.select(),10);}}
        onBlur={e=>{
          setFocused(false);
          const raw = parseFloat(e.target.value.replace(/\./g,"").replace(/,/g,".")) || 0;
          onChange(Math.max(min, raw));
        }}
        onChange={e=>{
          if(focused){
            const raw = parseFloat(e.target.value.replace(/\./g,"").replace(/,/g,".")) || 0;
            onChange(Math.max(min, raw));
          }
        }}
        style={{flex:1,padding:"11px 12px",fontSize:16,borderRadius:8,textAlign:"right",
          border:"1.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",
          color:"var(--color-text-primary)",minHeight:46,fontWeight:600}}
      />
      {sfx&&<span style={{fontSize:13,color:"var(--color-text-secondary)",flexShrink:0,fontWeight:600}}>{sfx}</span>}
    </div>
  );
};
 
// Select táctil
const SI = ({v,onChange,opts}) => (
  <select value={v} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"11px 12px",fontSize:16,borderRadius:8,marginTop:2,minHeight:46,
      border:"1.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",
      color:"var(--color-text-primary)",fontWeight:500}}>
    {opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);
 
// Campo de formulario (label + input apilados)
const Field = ({label,note,children}) => (
  <div style={{padding:"10px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
      <span style={{fontSize:12,fontWeight:600,color:"var(--color-text-primary)"}}>{label}</span>
      {note&&<span style={{fontSize:10,color:"var(--color-text-tertiary)",fontStyle:"italic",maxWidth:"45%",textAlign:"right"}}>{note}</span>}
    </div>
    {children}
  </div>
);
 
// Valor calculado (no editable, mostrado como resultado)
const CalcVal = ({v,col,icon}) => (
  <div style={{padding:"10px 12px",background:col?"rgba(0,0,0,0.03)":"var(--color-background-secondary)",
    borderRadius:8,marginTop:2,fontSize:15,fontWeight:700,color:col||"var(--color-text-primary)",
    textAlign:"right",minHeight:42,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
    {icon&&<span>{icon}</span>}{v}
  </div>
);
 
// Badge score
const Badge = ({s,label}) => (
  <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,
    background:s>=8?COL.greenL:s>=6?COL.amberL:COL.redL,
    color:s>=8?COL.green:s>=6?COL.amber:COL.red}}>
    {label||s}
  </span>
);
 
// Tarjeta colapsable (para listas en mobile)
const Card = ({children,pad=true}) => (
  <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",
    borderRadius:12,padding:pad?"14px 14px":0,overflow:"hidden"}}>
    {children}
  </div>
);
 
// ─── STORAGE ──────────────────────────────────────────────────────────────────
const SKEY = "flipping_co_v4";
const load = () => { try{const s=localStorage.getItem(SKEY);return s?JSON.parse(s):null;}catch{return null;} };
const save = (st) => { try{localStorage.setItem(SKEY,JSON.stringify(st));}catch{} };
 
// ─── TABS CONFIG ──────────────────────────────────────────────────────────────
const TABS = [
  {id:"dash",   label:"Dashboard",  icon:"🏠", col:COL.blue},
  {id:"deal",   label:"Deal",       icon:"🏷️",  col:COL.orange},
  {id:"costos", label:"Costos",     icon:"🔨", col:COL.red},
  {id:"pl",     label:"P&L",        icon:"📈", col:COL.green},
  {id:"flujo",  label:"Flujo",      icon:"📅", col:COL.purple},
  {id:"score",  label:"Score",      icon:"🎯", col:COL.amber},
  {id:"estr",   label:"Estrategias",icon:"⚔️",  col:COL.teal},
  {id:"cred",   label:"Crédito",    icon:"🏦", col:"#DC2626"},
  {id:"radar",  label:"Radar",      icon:"🌎", col:COL.green},
  {id:"pipe",   label:"Pipeline",   icon:"📦", col:COL.purple},
  {id:"port",   label:"Portafolio", icon:"💼", col:COL.navy},
  {id:"esc",    label:"Escenarios", icon:"🎲", col:COL.amber},
];
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const TabDash = ({d,c,pl}) => {
  const closed = pl.filter(x=>x.status==="Cerrado");
  const active = pl.filter(x=>!["Cerrado","Descartado"].includes(x.status));
  const totU   = closed.reduce((s,x)=>s+calcDeal(x).uN,0);
  const roiP   = closed.length?closed.reduce((s,x)=>s+calcDeal(x).roiT,0)/closed.length:0;
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <SH icon="🏠" title={d.nombre||"Deal activo"} sub={d.direccion||"Sin dirección"}
        bg={COL.blueL} bc={COL.blue} tc={COL.blue}/>
 
      {/* KPIs principales — 2 col en mobile */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <KPI label="Utilidad Neta"   value={fmtM(c.uN)}            col={c.uN>0?COL.green:COL.red}/>
        <KPI label="ROI Total"       value={fmtP(c.roiT)}          col={gc(c.roiT)}/>
        <KPI label="ROI Anualizado"  value={fmtP(c.roiAn)}         col={gc(c.roiAn)}/>
        <KPI label="Score Riesgo"    value={c.score.toFixed(1)+"/10"} sub={c.score>=7?"Riesgo bajo":c.score>=5?"Riesgo medio":"Riesgo alto"} col={c.score>=7?COL.green:c.score>=5?COL.amber:COL.red}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        <KPI label="ARV"        value={fmtM(c.arvC)}    small/>
        <KPI label="PMC (70%)"  value={fmtM(c.pmc)}     col={c.okPMC?COL.green:COL.red} small sub={c.okPMC?"✅ OK":"❌ Alto"}/>
        <KPI label="Meses"      value={Math.round(c.meses)+"m"} sub={c.dias+"d"} small/>
      </div>
 
      {/* Semáforo compacto */}
      <Card>
        <SH icon="🚦" title="Semáforo de viabilidad" bg={COL.amberL} bc={COL.amber} tc={COL.amber}/>
        {[
          ["ROI Total",    fmtP(c.roiT),  c.roiT>=.2?"🟢 Excelente >20%":c.roiT>=.12?"🟡 Aceptable 12-20%":"🔴 Bajo <12%"],
          ["ROI Anual",    fmtP(c.roiAn), c.roiAn>=.3?"🟢 Excelente":c.roiAn>=.18?"🟡 Aceptable":"🔴 Bajo"],
          ["Regla 70%",    c.okPMC?"Sí":"No", c.okPMC?"🟢 Precio dentro del PMC":"🔴 Precio supera PMC"],
          ["Score",        c.score.toFixed(1), c.score>=7?"🟢 Riesgo bajo":c.score>=5?"🟡 Riesgo medio":"🔴 Riesgo alto"],
          ["Utilidad",     fmtM(c.uN),    c.uN>0?"🟢 Rentable":"🔴 Pérdida"],
        ].map(([l,v,s],i)=>(
          <div key={i} style={{padding:"9px 14px",borderBottom:i<4?"0.5px solid var(--color-border-tertiary)":"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600}}>{v}</span>
            </div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:2}}>{s}</div>
          </div>
        ))}
      </Card>
 
      {/* Regla 70% */}
      <Card>
        <SH icon="📐" title="Regla del 70%" bg={COL.greenL} bc={COL.green} tc={COL.green}/>
        {[
          ["ARV conservador",   fmtM(c.arvC),              false],
          ["× 70% del ARV",     fmtM(c.arvC*0.7),          false],
          ["− Remodelación",    fmtM(-c.rTot),             false],
          ["PMC máximo",        fmtM(c.pmc),               true],
          ["Precio de compra",  fmtM(d.precioCompra),      true],
          ["Margen vs PMC",     fmtM(c.pmc-d.precioCompra),true],
        ].map(([l,v,bold],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 14px",
            borderBottom:i<5?"0.5px solid var(--color-border-tertiary)":"none",
            background:i===5?(c.okPMC?COL.greenL:COL.redL):"transparent"}}>
            <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{l}</span>
            <span style={{fontSize:13,fontWeight:bold?700:400,color:i===5?(c.okPMC?COL.green:COL.red):"var(--color-text-primary)"}}>{v}</span>
          </div>
        ))}
      </Card>
 
      {/* Negocio */}
      <SH icon="💼" title="Negocio completo" bg={COL.purpleL} bc={COL.purple} tc={COL.purple}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <KPI label="Deals activos"  value={active.length}/>
        <KPI label="Deals cerrados" value={closed.length}/>
        <KPI label="Utilidad total" value={fmtM(totU)} col={totU>0?COL.green:COL.red}/>
        <KPI label="ROI promedio"   value={fmtP(roiP)} col={gc(roiP)}/>
      </div>
      <div style={{padding:"8px 10px",background:"var(--color-background-secondary)",borderRadius:8,fontSize:10,color:"var(--color-text-tertiary)"}}>
        {MKT.sources} · {MKT.updated}
      </div>
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: DEAL (inputs del inmueble)
// ══════════════════════════════════════════════════════════════════════════════
const TabDeal = ({d,setD,c}) => {
  const u = (k,v) => setD(x=>({...x,[k]:v}));
  const cities = MKT.cities.map(x=>({v:x.id,l:x.name}));
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {/* IDENTIFICACIÓN */}
      <SH icon="🏷️" title="Identificación" bg={COL.blueL} bc={COL.blue} tc={COL.blue}/>
      <Field label="Nombre del proyecto">
        <input value={d.nombre} onChange={e=>u("nombre",e.target.value)}
          style={{width:"100%",padding:"11px 12px",fontSize:16,borderRadius:8,marginTop:2,minHeight:46,
            border:"1.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}/>
      </Field>
      <Field label="Dirección / Barrio">
        <input value={d.direccion} onChange={e=>u("direccion",e.target.value)}
          style={{width:"100%",padding:"11px 12px",fontSize:16,borderRadius:8,marginTop:2,minHeight:46,
            border:"1.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}/>
      </Field>
      <Field label="Ciudad / Municipio" note="Ver Radar Nacional">
        <SI v={d.ciudad} onChange={v=>{u("ciudad",v);const cx=MKT.cities.find(x=>x.id===v);if(cx)u("precioM2",cx.prom);}} opts={cities}/>
      </Field>
      <Field label="Área construida" note="metros cuadrados escriturados">
        <NI v={d.area} onChange={v=>u("area",v)} step={1} sfx="m²" int/>
      </Field>
      <Field label="Estado actual del inmueble">
        <SI v={d.estado} onChange={v=>u("estado",v)} opts={["Excelente","Bueno","Regular","Malo","Ruina"]}/>
      </Field>
      <Field label="Estrategia principal">
        <SI v={d.estrategia} onChange={v=>u("estrategia",v)} opts={["Fix & Flip","BRRRR","Wholesale","Renta pura"]}/>
      </Field>
 
      {/* COMPRA */}
      <SH icon="💵" title="Datos de compra" bg={COL.orangeL} bc={COL.orange} tc={COL.orange}/>
      <Field label="Precio de compra negociado" note="precio escriturado">
        <NI v={d.precioCompra} onChange={v=>u("precioCompra",v)} pfx="$"/>
      </Field>
      <Field label="Gastos notaría" note="~1% del valor">
        <NI v={d.gastosNotaria} onChange={v=>u("gastosNotaria",v)} pfx="$"/>
      </Field>
      <Field label="Honorarios abogado / títulos" note="obligatorio">
        <NI v={d.honorariosAbogado} onChange={v=>u("honorariosAbogado",v)} pfx="$"/>
      </Field>
      <Field label="Comisión captador / corredor">
        <NI v={d.comisionCaptador} onChange={v=>u("comisionCaptador",v)} pfx="$"/>
      </Field>
      <Field label="Otros costos adquisición">
        <NI v={d.otrosCostos} onChange={v=>u("otrosCostos",v)} pfx="$"/>
      </Field>
      <div style={{background:COL.blueL,borderRadius:8,marginTop:4,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",borderBottom:`0.5px solid ${COL.blueLT}`}}>
          <span style={{fontSize:12,fontWeight:500,color:COL.blue}}>Precio de compra</span>
          <span style={{fontSize:13,fontWeight:500,color:COL.blue}}>${fmt(d.precioCompra)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",borderBottom:`0.5px solid ${COL.blueLT}`}}>
          <span style={{fontSize:12,fontWeight:500,color:COL.blue}}>+ Costos adicionales</span>
          <span style={{fontSize:13,fontWeight:500,color:COL.blue}}>${fmt(c.adq)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:COL.blueLT}}>
          <span style={{fontSize:13,fontWeight:700,color:COL.blue}}>= TOTAL INVERSIÓN COMPRA</span>
          <span style={{fontSize:15,fontWeight:700,color:COL.blue}}>${fmt(d.precioCompra+c.adq)}</span>
        </div>
      </div>
 
      {/* ARV */}
      <SH icon="📊" title="ARV — Valor post-remodelación" bg={COL.greenL} bc={COL.green} tc={COL.green}/>
      <Field label="Precio/m² referencia" note={`Mercado: $${fmt(c.city?.prom)}/m²`}>
        <NI v={d.precioM2} onChange={v=>u("precioM2",v)} step={100000} pfx="$"/>
      </Field>
      <Field label="ARV calculado por m² (auto)">
        <CalcVal v={`$${fmt(c.arvM2)}`} col={COL.blue} icon="📐"/>
      </Field>
      <Field label="ARV por comparables directos">
        <NI v={d.arvComp} onChange={v=>u("arvComp",v)} pfx="$"/>
      </Field>
      <Field label="ARV conservador (modelo usa el mínimo)">
        <CalcVal v={`$${fmt(c.arvC)}`} col={COL.green}/>
      </Field>
      <Field label="Descuento negociación al vender" note="2-5% típico">
        <NI v={d.descVenta*100} onChange={v=>u("descVenta",v/100)} step={0.5} min={0} sfx="%"/>
      </Field>
      <Field label="Comisión inmobiliaria venta" note="3-4% estándar">
        <NI v={d.comVenta*100} onChange={v=>u("comVenta",v/100)} step={0.5} min={0} sfx="%"/>
      </Field>
 
      {/* CRONOGRAMA */}
      <SH icon="📅" title="Cronograma" bg={COL.purpleL} bc={COL.purple} tc={COL.purple}/>
      <Field label="Días — búsqueda y due diligence">
        <NI v={d.diasBus} onChange={v=>u("diasBus",v)} step={5} sfx="días" int/>
      </Field>
      <Field label="Días — escrituración y legal">
        <NI v={d.diasEsc} onChange={v=>u("diasEsc",v)} step={5} sfx="días" int/>
      </Field>
      <Field label="Días — remodelación">
        <NI v={d.diasRemo} onChange={v=>u("diasRemo",v)} step={5} sfx="días" int/>
      </Field>
      <Field label="Días — mercadeo y venta" note="Valle Aburrá 45-90d / Bogotá 30-60d">
        <NI v={d.diasVenta} onChange={v=>u("diasVenta",v)} step={5} sfx="días" int/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
        <div style={{padding:"10px",background:COL.purpleL,borderRadius:8,textAlign:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:COL.purple,textTransform:"uppercase"}}>Total días</div>
          <div style={{fontSize:22,fontWeight:700,color:COL.purple}}>{Math.round(c.dias)}</div>
        </div>
        <div style={{padding:"10px",background:COL.purpleL,borderRadius:8,textAlign:"center"}}>
          <div style={{fontSize:10,fontWeight:700,color:COL.purple,textTransform:"uppercase"}}>Total meses</div>
          <div style={{fontSize:22,fontWeight:700,color:COL.purple}}>{c.meses.toFixed(1)}</div>
        </div>
      </div>
 
      {/* FINANCIACIÓN */}
      <SH icon="🏦" title="Financiación" bg={COL.redL} bc={COL.red} tc={COL.red}/>
      <Field label="Capital propio disponible">
        <NI v={d.capitalPropio} onChange={v=>u("capitalPropio",v)} pfx="$"/>
      </Field>
      <Field label="Financiación externa (auto)">
        <CalcVal v={`$${fmt(c.finE)}`} col={c.finE>0?COL.red:COL.green} icon={c.finE>0?"⚠️":"✅"}/>
      </Field>
      <Field label="Tasa mensual del crédito" note="privado: 2.5-3.5%">
        <NI v={d.tasaMes*100} onChange={v=>u("tasaMes",v/100)} step={0.1} min={0} sfx="%"/>
      </Field>
      <Field label="Plazo del crédito">
        <NI v={d.plazoMes} onChange={v=>u("plazoMes",v)} step={1} min={1} sfx="meses" int/>
      </Field>
      <Field label="Cuota mensual estimada (auto)">
        <CalcVal v={`$${fmt(c.cuota)}`} col={COL.red}/>
      </Field>
      <Field label="Costo total de la deuda (auto)">
        <CalcVal v={`$${fmt(c.cDeuda)}`} col={COL.red}/>
      </Field>
 
      {/* FISCAL */}
      <SH icon="📋" title="Fiscal — Colombia 2025" bg={COL.amberL} bc={COL.amber} tc={COL.amber}/>
      <Field label="Tasa ganancia ocasional" note="15% — Ley 2277/2022">
        <NI v={d.tasaGO*100} onChange={v=>u("tasaGO",v/100)} step={0.5} sfx="%"/>
      </Field>
      <Field label="Contribución por plusvalía" note="0-50% Ley 388/1997">
        <NI v={d.plusvalia*100} onChange={v=>u("plusvalia",v/100)} step={1} sfx="%"/>
      </Field>
      <Field label="Retención en la fuente" note="Decreto 0572 jun-2025">
        <NI v={d.retencion*100} onChange={v=>u("retencion",v/100)} step={0.5} sfx="%"/>
      </Field>
    </div>
  );
};
 
 
// ── REFERENCIA DE PRECIOS ─────────────────────────────────────────────────────
const REF_PRECIOS = [
  {cat:"🔨 Demoliciones",items:[
    {n:"Demolición muros no estructurales",u:"m²",p:90000,r:"70–110k"},
    {n:"Retiro pisos existentes",u:"m²",p:16000,r:"12–22k"},
    {n:"Retiro escombros (volco 4m³)",u:"viaje",p:300000,r:"250–380k"},
    {n:"Limpieza general de obra",u:"global",p:450000,r:"300–600k"},
  ]},
  {cat:"🏗️ Obra civil",items:[
    {n:"Resanes, pañetes y filos",u:"m²",p:48000,r:"38–60k"},
    {n:"Enchapes baño (cerámica E3)",u:"m²",p:90000,r:"70–130k"},
    {n:"Enchapes cocina",u:"m²",p:85000,r:"65–120k"},
    {n:"Muros en drywall",u:"m²",p:95000,r:"80–120k"},
    {n:"Repello y pañete exterior",u:"m²",p:55000,r:"42–70k"},
    {n:"Contrapiso en concreto",u:"m²",p:65000,r:"52–80k"},
  ]},
  {cat:"⚡ Eléctrico (RETIE)",items:[
    {n:"Tablero bifásico 220V 20 circuitos",u:"un",p:900000,r:"700k–1.2M"},
    {n:"Puntos eléctricos (incluye cable)",u:"pto",p:90000,r:"75–120k"},
    {n:"Luminarias LED (con instalación)",u:"un",p:48000,r:"35–65k"},
    {n:"Tomas e interruptores",u:"un",p:38000,r:"28–55k"},
    {n:"Tierra física (obligatorio RETIE)",u:"global",p:350000,r:"280–450k"},
    {n:"Certificado RETIE",u:"global",p:280000,r:"220–350k"},
    {n:"Red voz y datos CAT6",u:"pto",p:75000,r:"60–95k"},
  ]},
  {cat:"🚿 Hidráulica y sanitaria",items:[
    {n:"Red acueducto PVC presión",u:"global",p:1900000,r:"1.4–2.5M"},
    {n:"Red alcantarillado",u:"global",p:1300000,r:"950k–1.8M"},
    {n:"Sanitario (Corona/Grival)",u:"un",p:300000,r:"220–500k"},
    {n:"Lavamanos con grifería",u:"un",p:320000,r:"230–520k"},
    {n:"Ducha / regadera",u:"un",p:190000,r:"140–280k"},
    {n:"Grifería baño (juego completo)",u:"un",p:260000,r:"180–420k"},
    {n:"Poceta / lavadero",u:"un",p:340000,r:"260–480k"},
    {n:"Grifería cocina",u:"un",p:190000,r:"140–300k"},
    {n:"Calentador a gas (obligatorio)",u:"un",p:650000,r:"480k–950k"},
    {n:"Trampa de grasas",u:"un",p:380000,r:"280–500k"},
  ]},
  {cat:"🪟 Ventanas y fachada",items:[
    {n:"Ventanas aluminio + vidrio 4mm",u:"m²",p:340000,r:"270–450k"},
    {n:"Pintura fachada + sellador",u:"m²",p:38000,r:"28–55k"},
    {n:"Graniplast / revestimiento fachada",u:"m²",p:130000,r:"95–180k"},
    {n:"Impermeabilización cubierta",u:"m²",p:85000,r:"65–120k"},
    {n:"Pintura exterior + impermeabilizante",u:"m²",p:32000,r:"24–45k"},
  ]},
  {cat:"🎨 Acabados interiores",items:[
    {n:"Estuco + pintura interior 2 manos",u:"m²",p:25000,r:"18–35k"},
    {n:"Piso laminado / vinílico",u:"m²",p:70000,r:"52–95k"},
    {n:"Piso cerámica zonas húmedas",u:"m²",p:75000,r:"55–105k"},
    {n:"Piso porcelanato",u:"m²",p:110000,r:"85–160k"},
    {n:"Piso madera sólida",u:"m²",p:180000,r:"140–260k"},
    {n:"Puerta interior HDF (con marco)",u:"un",p:400000,r:"320–580k"},
    {n:"Puerta principal metálica/madera",u:"un",p:700000,r:"520k–1.1M"},
    {n:"Closet melamina (por alcoba)",u:"un",p:900000,r:"680k–1.4M"},
    {n:"Muebles cocina melamina",u:"ml",p:580000,r:"420–850k"},
    {n:"Mesón cocina (granito/mármol sint.)",u:"ml",p:320000,r:"240–520k"},
    {n:"Espejo baño",u:"un",p:120000,r:"80–200k"},
    {n:"Accesorios baño (jabonera, toallero)",u:"juego",p:95000,r:"65–160k"},
  ]},
  {cat:"🔧 Indirectos y gastos de obra",items:[
    {n:"Director de obra / arquitecto",u:"global",p:3800000,r:"2.5–6M"},
    {n:"Licencia de construcción Curaduría",u:"global",p:1600000,r:"800k–3.5M"},
    {n:"Póliza todo riesgo construcción",u:"global",p:480000,r:"350–700k"},
    {n:"Aseo final y entrega",u:"global",p:380000,r:"280–520k"},
    {n:"Celaduría durante obra",u:"mes",p:520000,r:"400–700k"},
    {n:"Servicios públicos en obra",u:"mes",p:180000,r:"120–260k"},
    {n:"Herramientas y consumibles",u:"global",p:350000,r:"200–600k"},
    {n:"Andamios (alquiler mensual)",u:"mes",p:280000,r:"180–420k"},
  ]},
  {cat:"🏠 Equipamiento opcional",items:[
    {n:"Estufa a gas 4 puestos",u:"un",p:520000,r:"380k–950k"},
    {n:"Horno empotrado",u:"un",p:680000,r:"480k–1.2M"},
    {n:"Campana extractora",u:"un",p:420000,r:"280–750k"},
    {n:"Aire acondicionado 9.000 BTU",u:"un",p:1800000,r:"1.4–2.8M"},
    {n:"Citófono digital",u:"un",p:350000,r:"250–600k"},
    {n:"Cámara de seguridad",u:"un",p:280000,r:"180–480k"},
  ]},
];
 
const RefPrecios = () => {
  const [open,setOpen] = useState(false);
  const [cats,setCats] = useState({});
  const tog = (c) => setCats(p=>({...p,[c]:!p[c]}));
  return (
    <div style={{marginTop:12}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%",padding:"12px 14px",borderRadius:10,
        border:`1.5px solid ${COL.amber}`,
        background:open?COL.amberL:"var(--color-background-primary)",
        color:COL.amber,fontWeight:700,fontSize:13,cursor:"pointer",
        display:"flex",justifyContent:"space-between",alignItems:"center"
      }}>
        <span>📋 Referencia de precios — Valle de Aburrá 2025</span>
        <span style={{fontSize:16}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
          <div style={{padding:"8px 12px",background:COL.amberL,borderRadius:8,fontSize:11,color:COL.amber,lineHeight:1.5}}>
            Precios incluyen mano de obra + materiales · Ajustes por ciudad: Bogotá +12% · Costa -5% · Ciudades intermedias -7%
          </div>
          {REF_PRECIOS.map(({cat,items})=>(
            <div key={cat} style={{border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,overflow:"hidden"}}>
              <button onClick={()=>tog(cat)} style={{
                width:"100%",padding:"10px 14px",
                background:"var(--color-background-secondary)",
                border:"none",cursor:"pointer",
                display:"flex",justifyContent:"space-between",alignItems:"center"
              }}>
                <span style={{fontSize:13,fontWeight:700,color:"var(--color-text-primary)"}}>{cat}</span>
                <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{cats[cat]?"▲":"▼"}</span>
              </button>
              {cats[cat]&&(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 50px 88px",padding:"5px 12px",background:"var(--color-background-secondary)",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
                    {["Ítem","Und.","Precio ref."].map((h,i)=>(
                      <span key={i} style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",textAlign:i>0?"right":"left"}}>{h}</span>
                    ))}
                  </div>
                  {items.map((item,i)=>(
                    <div key={i} style={{
                      display:"grid",gridTemplateColumns:"1fr 50px 88px",
                      padding:"8px 12px",
                      borderTop:"0.5px solid var(--color-border-tertiary)",
                      background:i%2===0?"var(--color-background-secondary)":"var(--color-background-primary)"
                    }}>
                      <div>
                        <div style={{fontSize:12,color:"var(--color-text-primary)"}}>{item.n}</div>
                        <div style={{fontSize:9,color:"var(--color-text-tertiary)",marginTop:1}}>Rango: ${item.r}</div>
                      </div>
                      <div style={{textAlign:"right",fontSize:10,color:"var(--color-text-secondary)",alignSelf:"center"}}>{item.u}</div>
                      <div style={{textAlign:"right",fontSize:12,fontWeight:700,color:COL.green,alignSelf:"center"}}>${new Intl.NumberFormat("es-CO").format(item.p)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: COSTOS
// ══════════════════════════════════════════════════════════════════════════════
const TabCostos = ({d,setD,c}) => {
  const updP = (i,k,v) => setD(x=>{const p=[...x.partidas];p[i]={...p[i],[k]:v};return{...x,partidas:p};});
  const addP = () => setD(x=>({...x,partidas:[...x.partidas,{n:"Nueva partida",q:1,p:1000000}]}));
  const delP = (i) => setD(x=>({...x,partidas:x.partidas.filter((_,j)=>j!==i)}));
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <SH icon="🔨" title="Presupuesto de remodelación" sub="Precios Valle de Aburrá 2025" bg={COL.redL} bc={COL.red} tc={COL.red}/>
      <div style={{padding:"6px 10px",background:COL.blueL,borderRadius:8,fontSize:11,color:COL.blue,marginBottom:4}}>
        Ajustes: Bogotá +12% · Costa -5% · Ciudades intermedias -7%
      </div>
 
      {/* Partidas como tarjetas apiladas (mobile-friendly) */}
      {d.partidas.map((p,i)=>(
        <div key={i} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"12px 12px",marginBottom:4}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <input value={p.n} onChange={e=>updP(i,"n",e.target.value)}
              style={{flex:1,fontSize:13,fontWeight:600,background:"transparent",border:"none",color:"var(--color-text-primary)",padding:0}}/>
            <button onClick={()=>delP(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:18,paddingLeft:8,minWidth:32,minHeight:32}}>×</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",marginBottom:3,textTransform:"uppercase"}}>Cantidad</div>
              <FmtInput v={p.q} onChange={v=>updP(i,"q",v)} decimals={1} center/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",marginBottom:3,textTransform:"uppercase"}}>Precio unit. COP</div>
              <FmtInput v={p.p} onChange={v=>updP(i,"p",v)} decimals={0}/>
            </div>
          </div>
          <div style={{marginTop:8,padding:"7px 10px",background:COL.greenL,borderRadius:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:COL.green,fontWeight:600}}>Subtotal</span>
            <span style={{fontSize:14,fontWeight:700,color:COL.green}}>${fmt(p.q*p.p)}</span>
          </div>
        </div>
      ))}
 
      <button onClick={addP} style={{padding:"12px",fontSize:14,cursor:"pointer",borderRadius:10,
        border:`1.5px dashed ${COL.blue}`,background:COL.blueL,color:COL.blue,fontWeight:600,marginTop:4}}>
        + Agregar partida
      </button>
 
      <Field label="Imprevistos (% sobre total obra)">
        <NI v={d.imprevistos*100} onChange={v=>setD(x=>({...x,imprevistos:v/100}))} step={1} min={0} sfx="%"/>
      </Field>
 
      {/* Resumen */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        <KPI label="Subtotal obra"   value={`$${fmt(c.rBase)}`} small/>
        <KPI label="Imprevistos"     value={`$${fmt(c.rBase*d.imprevistos)}`} small/>
      </div>
      <div style={{padding:"14px",background:COL.blueL,borderRadius:10,marginTop:4,textAlign:"center"}}>
        <div style={{fontSize:11,fontWeight:700,color:COL.blue,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Total remodelación</div>
        <div style={{fontSize:28,fontWeight:700,color:COL.blue}}>${fmt(c.rTot)}</div>
        <div style={{fontSize:11,color:COL.blue,opacity:0.7,marginTop:2}}>${fmt(c.rTot/d.area)}/m² · {fmtP(c.rTot/c.arvC)} del ARV</div>
      </div>
      <RefPrecios/>
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: P&L
// ══════════════════════════════════════════════════════════════════════════════
const TabPL = ({d,c}) => (
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
    <SH icon="📈" title="Estado de resultados" sub="Impacto fiscal Colombia 2025" bg={COL.greenL} bc={COL.green} tc={COL.green}/>
    <Card pad={false}>
      <div style={{background:"var(--color-background-secondary)",padding:"6px 12px",fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Ingresos</div>
      <Row l="Precio de venta"          v={`$${fmt(c.pV)}`}           indent/>
      <Row l="(−) Descuento negociación" v={`−$${fmt(c.pV*d.descVenta)}`} neg indent/>
      <Row l="(−) Comisión inmobiliaria" v={`−$${fmt(c.pV*d.comVenta)}`}  neg indent/>
      <Row l="(−) Retención fuente"      v={`−$${fmt(c.retF)}`}           neg indent/>
      <Row l="Ingreso neto de venta"     v={`$${fmt(c.ingN)}`}  bold bg={COL.greenLT}/>
      <div style={{background:"var(--color-background-secondary)",padding:"6px 12px",fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Costos</div>
      <Row l="(−) Precio de compra"      v={`−$${fmt(d.precioCompra)}`}   neg indent/>
      <Row l="(−) Costos adquisición"    v={`−$${fmt(c.adq)}`}            neg indent/>
      <Row l="(−) Remodelación"          v={`−$${fmt(c.rTot)}`}           neg indent/>
      <Row l="(−) Costo deuda"           v={`−$${fmt(c.cDeuda)}`}         neg indent/>
      <Row l="(−) Holding / admin"       v={`−$${fmt(c.hold)}`}           neg indent/>
      <Row l="Total costos"              v={`−$${fmt(c.cTot)}`} bold neg bg={COL.amberLT}/>
      <div style={{background:"var(--color-background-secondary)",padding:"6px 12px",fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Impuestos</div>
      <Row l="Utilidad bruta"              v={`$${fmt(c.uB)}`}    bold bg={COL.greenLT}/>
      <Row l="(−) Ganancia ocasional 15%"  v={`−$${fmt(c.iGO)}`}  neg indent/>
      <Row l="(−) Contribución plusvalía"  v={`−$${fmt(c.iPV)}`}  neg indent/>
      <Row l="(−) Industria y comercio"    v={`−$${fmt(c.iIC)}`}  neg indent/>
      <Row l="Utilidad NETA del deal"  v={`$${fmt(c.uN)}`} bold bg={c.uN>0?COL.greenLT:COL.redLT}/>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <KPI label="ROI Total"      value={fmtP(c.roiT)}  col={gc(c.roiT)}/>
      <KPI label="ROI Anualizado" value={fmtP(c.roiAn)} col={gc(c.roiAn)}/>
      <KPI label="ROI Cap. Propio" value={fmtP(c.roiC)} small/>
      <KPI label="MOIC"           value={(c.moic||0).toFixed(2)+"x"} small/>
      <KPI label="Margen bruto"   value={fmtP(c.uB/c.pV)}  small/>
      <KPI label="Margen neto"    value={fmtP(c.uN/c.pV)}  small/>
    </div>
  </div>
);
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: FLUJO DE CAJA
// ══════════════════════════════════════════════════════════════════════════════
const TabFlujo = ({d,c}) => {
  const meses = Array.from({length:12},(_,i)=>`M${i+1}`);
  const items = [
    {l:"Precio compra",   vs:[-d.precioCompra,...Array(11).fill(0)],  col:COL.red},
    {l:"Adquisición",     vs:[-c.adq,...Array(11).fill(0)],           col:COL.red},
    {l:"Remo M2-25%",     vs:[0,-c.rBase*.25,...Array(10).fill(0)],   col:COL.amber},
    {l:"Remo M3-40%",     vs:[0,0,-c.rBase*.40,...Array(9).fill(0)],  col:COL.amber},
    {l:"Remo M4-25%",     vs:[0,0,0,-c.rBase*.25,...Array(8).fill(0)],col:COL.amber},
    {l:"Remo M5-10%",     vs:[0,0,0,0,-c.rBase*.10,...Array(7).fill(0)],col:COL.amber},
    {l:"Cuota crédito",   vs:Array(12).fill(-c.cuota),                col:COL.red},
    {l:"Admin/predial",   vs:Array(12).fill(-60000-d.precioCompra*.01/12), col:"#94A3B8"},
    {l:"INGRESO VENTA",   vs:[...Array(10).fill(0),c.ingN,0],         col:COL.green},
    {l:"(−) Impuestos",   vs:[...Array(10).fill(0),-(c.iGO+c.iPV),0], col:COL.red},
  ];
  const netos = meses.map((_,j)=>items.reduce((s,r)=>s+r.vs[j],0));
  const acum  = netos.reduce((acc,v,i)=>{acc.push((acc[i-1]||0)+v);return acc;},[]);
  const capMax = Math.min(...acum);
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SH icon="📅" title="Flujo de caja mensual" sub="Cuándo necesitas el dinero" bg={COL.purpleL} bc={COL.purple} tc={COL.purple}/>
 
      {/* Capital máximo — destacado arriba */}
      <div style={{padding:"14px",background:COL.redL,borderRadius:10,textAlign:"center",border:`1.5px solid ${COL.red}`}}>
        <div style={{fontSize:11,fontWeight:700,color:COL.red,textTransform:"uppercase",letterSpacing:"0.05em"}}>Capital máximo requerido</div>
        <div style={{fontSize:26,fontWeight:700,color:COL.red,marginTop:2}}>{fmtM(capMax)}</div>
        <div style={{fontSize:10,color:COL.red,opacity:0.7,marginTop:2}}>Ten disponible este monto antes de iniciar</div>
      </div>
 
      {/* Tabla compacta — scroll horizontal */}
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:500}}>
          <thead>
            <tr>
              <th style={{padding:"5px 6px",textAlign:"left",color:"var(--color-text-secondary)",fontWeight:700,fontSize:9,textTransform:"uppercase",minWidth:80,position:"sticky",left:0,background:"var(--color-background-primary)"}}>Concepto</th>
              {meses.map(m=><th key={m} style={{padding:"5px 4px",textAlign:"right",color:"var(--color-text-secondary)",fontWeight:700,fontSize:9,minWidth:48}}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((r,ri)=>(
              <tr key={ri} style={{borderBottom:"0.5px solid var(--color-border-tertiary)",background:ri%2===0?"var(--color-background-secondary)":"transparent"}}>
                <td style={{padding:"4px 6px",color:r.col,fontWeight:600,fontSize:10,position:"sticky",left:0,background:ri%2===0?"var(--color-background-secondary)":"var(--color-background-primary)"}}>{r.l}</td>
                {r.vs.map((v,j)=><td key={j} style={{padding:"4px 4px",textAlign:"right",color:v===0?"var(--color-text-tertiary)":v>0?COL.green:COL.red,fontSize:10}}>{v===0?"—":fmtM(v)}</td>)}
              </tr>
            ))}
            <tr style={{borderTop:"1px solid var(--color-border-secondary)"}}>
              <td style={{padding:"5px 6px",fontWeight:700,fontSize:10,position:"sticky",left:0,background:"var(--color-background-primary)"}}>NETO</td>
              {netos.map((v,j)=><td key={j} style={{padding:"5px 4px",textAlign:"right",fontWeight:700,color:v>=0?COL.green:COL.red,fontSize:10}}>{fmtM(v)}</td>)}
            </tr>
            <tr style={{background:COL.blueL}}>
              <td style={{padding:"5px 6px",fontWeight:700,fontSize:10,color:COL.blue,position:"sticky",left:0,background:COL.blueL}}>ACUM.</td>
              {acum.map((v,j)=><td key={j} style={{padding:"5px 4px",textAlign:"right",fontWeight:700,color:v>=0?COL.green:COL.red,fontSize:10}}>{fmtM(v)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: SCORE RIESGO
// ══════════════════════════════════════════════════════════════════════════════
const TabScore = ({d,setD,c}) => {
  const u = (k,v) => setD(x=>({...x,[k]:v}));
  const s_pmc = d.precioCompra<=c.pmc*.9?10:c.okPMC?7:3;
  const s_est = d.estado==="Malo"?3:d.estado==="Regular"?6:d.estado==="Bueno"?8:10;
  const s_mar = c.roiT>=.15?10:c.roiT>=.08?6:3;
  const s_fin = c.finE/d.precioCompra>=.6?3:c.finE/d.precioCompra>=.4?6:9;
  const s_vel = c.meses<=6?9:c.meses<=9?7:4;
 
  const dims = [
    {l:"Precio vs PMC (70%)",  s:s_pmc, p:.20, auto:true, desc:`Precio $${fmt(d.precioCompra)} vs PMC $${fmt(c.pmc)}`},
    {l:"Potencial de la zona", s:d.sc_ub, p:.15, key:"sc_ub", desc:"Ver columna Potencial en Radar Nacional"},
    {l:"Estado del inmueble",  s:s_est, p:.10, auto:true, desc:`"${d.estado}" → score ${s_est}`},
    {l:"Margen de utilidad",   s:s_mar, p:.15, auto:true, desc:`ROI ${fmtP(c.roiT)} → score ${s_mar}`},
    {l:"Solidez financiación", s:s_fin, p:.10, auto:true, desc:`${fmtP(c.finE/d.precioCompra)} financiado → score ${s_fin}`},
    {l:"Due diligence legal",  s:d.sc_dd, p:.10, key:"sc_dd", desc:"10=todo verificado · 5=parcial · 1=sin verificar"},
    {l:"Velocidad proyecto",   s:s_vel, p:.08, auto:true, desc:`${c.meses.toFixed(1)} meses → score ${s_vel}`},
    {l:"Complejidad remo.",    s:d.sc_remo, p:.07, key:"sc_remo", desc:"10=cosmética · 7=media · 3=estructural"},
    {l:"Tendencia mercado",    s:d.sc_merc, p:.03, key:"sc_merc", desc:"Ver Valoriz.2024 en Radar Nacional"},
    {l:"Experiencia equipo",   s:d.sc_eq, p:.02, key:"sc_eq", desc:"10=5+ obras ref. · 5=conocido · 2=nuevo"},
  ];
  const total = dims.reduce((s,x)=>s+x.s*x.p,0);
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SH icon="🎯" title="Score de riesgo" sub="10 dimensiones ponderadas" bg={COL.amberL} bc={COL.amber} tc={COL.amber}/>
 
      {/* Score total grande */}
      <div style={{padding:"20px 16px",background:"var(--color-background-primary)",border:`2px solid ${total>=7?COL.green:total>=5?COL.amber:COL.red}`,borderRadius:14,textAlign:"center"}}>
        <div style={{fontSize:52,fontWeight:700,color:total>=7?COL.green:total>=5?COL.amber:COL.red,lineHeight:1}}>{total.toFixed(1)}</div>
        <div style={{fontSize:11,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>Score de riesgo /10</div>
        <div style={{fontSize:14,fontWeight:700,marginTop:8,color:total>=7?COL.green:total>=5?COL.amber:COL.red}}>
          {total>=7?"✅ Riesgo BAJO — proceder":total>=5?"⚠️ Riesgo MEDIO — analizar":"🚫 Riesgo ALTO — NO invertir"}
        </div>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>≥7 = Bajo · 5-7 = Medio · &lt;5 = Alto</div>
      </div>
 
      {/* Dimensiones como tarjetas */}
      {dims.map((dim,i)=>(
        <div key={i} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"12px 12px",borderLeft:`3px solid ${dim.auto?COL.blue:COL.purple}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)"}}>{dim.l}</div>
              <div style={{fontSize:10,color:"var(--color-text-tertiary)",marginTop:1}}>{dim.desc}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,marginLeft:8}}>
              <Badge s={dim.s} label={`${dim.s}/10`}/>
              <span style={{fontSize:9,color:"var(--color-text-tertiary)"}}>Peso {(dim.p*100).toFixed(0)}% = {(dim.s*dim.p).toFixed(2)}</span>
            </div>
          </div>
          {!dim.auto&&(
            <div style={{marginTop:6}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--color-text-secondary)",marginBottom:4}}>
                <span>1 (riesgo alto)</span><span>5 (medio)</span><span>10 (bajo)</span>
              </div>
              <input type="range" min={1} max={10} step={1} value={dim.s}
                onChange={e=>u(dim.key,parseInt(e.target.value))}
                style={{width:"100%",accentColor:COL.purple,height:24}}/>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: ESTRATEGIAS
// ══════════════════════════════════════════════════════════════════════════════
const ESTR_INFO = {
  "Fix & Flip": {
    como:"Compras una propiedad con descuento, la remodelás, y la vendés rápido a precio de mercado.",
    cuando:"Mercados con alta rotación (30-90 días). Máximo ROI en el menor tiempo.",
    riesgo:"Riesgo de sobrecosto en remodelación y de que el mercado se enfríe durante el proyecto.",
    ideal:"Deals donde el precio de compra sea ≤70% del ARV menos remodelación (Regla del 70%).",
    meta:"ROI total ≥15% y ROI anualizado ≥25%."
  },
  "BRRRR": {
    como:"Buy, Rehab, Rent, Refinance, Repeat. Comprás, remodeláis, arrendáis, refinanciáis al 70% del ARV y repetís con el mismo capital.",
    cuando:"Cuando querés construir un portafolio de rentas sin inmovilizar capital. Requiere flujo de caja positivo.",
    riesgo:"Si el refinanciamiento no cubre el capital invertido, necesitás capital adicional para el siguiente deal.",
    ideal:"ARV alto vs precio compra, mercados con arriendos sólidos (Cap Rate ≥6%).",
    meta:"Flujo mensual positivo después de cuota hipotecaria. Capital totalmente recuperado al refinanciar."
  },
  "Wholesale": {
    como:"Conseguís un inmueble bajo contrato con precio negociado y cedés ese contrato a otro comprador cobrando un fee (diferencia).",
    cuando:"No tenés capital para comprar pero tenés red de compradores o inversores. Cierre rápido 30-60 días.",
    riesgo:"Si no encontrás comprador a tiempo perdés el depósito de arras. Requiere habilidad de negociación.",
    ideal:"Propiedades muy por debajo del mercado donde el fee justifica el esfuerzo (mínimo 5% del valor).",
    meta:"Fee mínimo $5M-$15M por operación. Volumen alto = ingresos consistentes."
  },
  "Renta Pura": {
    como:"Comprás, remodeláis para aumentar el arriendo, y mantenéis el inmueble generando flujo mensual.",
    cuando:"Querés ingresos pasivos estables. Mercados con alta demanda de arriendo (universidades, zonas laborales).",
    riesgo:"Inmueble inmovilizado. Requiere gestión activa (arrendatarios, mantenimiento, vacancia).",
    ideal:"Cap Rate ≥7% neto. Zonas con valorización sostenida para ganancia a largo plazo.",
    meta:"Flujo mensual neto ≥0.5% del valor del inmueble. Tiempo retorno ≤12 años."
  }
};
 
const TabEstr = ({d,c}) => {
  const [tooltip, setTooltip] = useState(null);
  const arr     = c.city?.arriendo||2500000;
  const prest   = c.arvC*.70;
  const cuotaR  = prest>0?prest*(.11/12)*Math.pow(1+.11/12,240)/(Math.pow(1+.11/12,240)-1):0;
  const flujoM  = arr-cuotaR;
  const capRec  = prest-d.precioCompra-c.rTot;
 
  const ests = [
    {n:"Fix & Flip", col:COL.red, icon:"🔄", desc:"Comprar · Remodelar · Vender rápido",
      badge:c.roiT>=.20?"⭐ MÁXIMO ROI":null, highlight:true,
      rows:[["Utilidad proyectada",fmtM(c.uN)],["ROI Total",fmtP(c.roiT)],["ROI Anualizado",fmtP(c.roiAn)],["Capital requerido",fmtM(d.capitalPropio)],["Duración",Math.round(c.meses)+"m"],["Flujo mensual","$0"],["Escalabilidad","5/10"]]},
    {n:"BRRRR", col:COL.teal, icon:"🔁", desc:"Buy · Rehab · Rent · Refinance · Repeat",
      badge:capRec>0?"♻️ CAPITAL SE RECICLA":null,
      rows:[["Préstamo refinanciado 70%",fmtM(prest)],["Capital recuperado",fmtM(capRec)],["Flujo mensual",fmtM(flujoM)],["Flujo anual",fmtM(flujoM*12)],["Cap Rate",fmtP(arr*12/c.arvC)],["Cuota refi 20a",fmtM(cuotaR)],["Escalabilidad","9/10"]]},
    {n:"Wholesale", col:COL.amber, icon:"🤝", desc:"Ceder contrato sin comprar el inmueble",
      rows:[["Fee estimado (5%)",fmtM(d.precioCompra*.05)],["Capital requerido","$0"],["ROI sobre capital","∞"],["Tiempo cierre","30-60 días"],["Riesgo operativo","3/10"],["Complejidad","4/10"],["Escalabilidad","8/10"]]},
    {n:"Renta Pura", col:COL.green, icon:"🏘️", desc:"Comprar · Remodelar · Arrendar",
      rows:[["Flujo mensual bruto",fmtM(arr)],["Rent Yield anual",fmtP(arr*12/(d.precioCompra+c.rTot))],["Capital requerido",fmtM(d.precioCompra+c.rTot)],["ROI anual arriendo",fmtP(arr*12/(d.precioCompra+c.rTot))],["Tiempo retorno",((d.precioCompra+c.rTot)/(arr*12)).toFixed(1)+"a"],["Gestión","Continua"],["Escalabilidad","6/10"]]},
  ];
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <SH icon="⚔️" title="Comparador de estrategias" sub="Mismo inmueble — 4 rutas" bg={COL.tealL} bc={COL.teal} tc={COL.teal}/>
      {ests.map((e,i)=>(
        <div key={i} style={{background:"var(--color-background-primary)",border:`1.5px solid ${e.col}44`,borderRadius:12,overflow:"hidden"}}>
          <div style={{background:e.col,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:"white"}}>{e.icon} {e.n}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",marginTop:1}}>{e.desc}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {e.badge&&<div style={{background:"white",color:e.col,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20}}>{e.badge}</div>}
              <button onClick={()=>setTooltip(tooltip===e.n?null:e.n)}
                style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.25)",
                  border:"1.5px solid rgba(255,255,255,0.6)",color:"white",fontWeight:700,fontSize:14,
                  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                ℹ
              </button>
            </div>
          </div>
          {tooltip===e.n&&(
            <div style={{padding:"12px 14px",background:e.col+"18",borderBottom:`1.5px solid ${e.col}33`}}>
              {Object.entries(ESTR_INFO[e.n]||{}).map(([k,v])=>(
                <div key={k} style={{marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:e.col,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>
                    {k==="como"?"¿Cómo funciona?":k==="cuando"?"¿Cuándo usarla?":k==="riesgo"?"⚠️ Riesgo principal":k==="ideal"?"✅ Deal ideal":k==="meta"?"🎯 Meta de rentabilidad":""}
                  </div>
                  <div style={{fontSize:12,color:"var(--color-text-secondary)",lineHeight:1.5}}>{v}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{padding:"4px 0"}}>
            {e.rows.map(([l,v],j)=>(
              <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"7px 14px",borderBottom:j<e.rows.length-1?"0.5px solid var(--color-border-tertiary)":"none",fontSize:13}}>
                <span style={{color:"var(--color-text-secondary)"}}>{l}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {capRec>0&&(
        <div style={{padding:"12px 14px",background:COL.greenL,borderRadius:10,border:`1px solid ${COL.green}`,fontSize:12,fontWeight:600,color:COL.green}}>
          ✅ BRRRR: con refinanciación recuperas {fmtM(capRec)} — puedes hacer el siguiente deal con el mismo capital.
        </div>
      )}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: CRÉDITO
// ══════════════════════════════════════════════════════════════════════════════
const TabCred = ({d,c}) => {
  const monto = c.finE, pl = d.plazoMes;
  const res = MKT.bancos.map(b=>{
    const tm=b.tea>0?Math.pow(1+b.tea,1/12)-1:0;
    const n=Math.min(b.plazo,pl);
    const cuota=(monto>0&&tm>0)?monto*tm*Math.pow(1+tm,n)/(Math.pow(1+tm,n)-1):(monto>0&&n>0?monto/n:0);
    const costo=Math.max(0,cuota*n-monto);
    const utilE=c.uN+c.cDeuda-costo;
    const roi=(d.precioCompra+c.rTot)>0?utilE/(d.precioCompra+c.rTot):0;
    const roiAn=c.meses>0?Math.pow(1+roi,12/c.meses)-1:0;
    return{...b,tm,n,cuota,costo,utilE,roi,roiAn};
  });
  const best = Math.max(...res.map(r=>r.roiAn));
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SH icon="🏦" title="Calculadora de crédito" sub="Fuentes reales Colombia · Superfinanciera feb-2025" bg={COL.redL} bc={COL.red} tc={COL.red}/>
      <div style={{padding:"8px 10px",background:COL.blueL,borderRadius:8,fontSize:11,color:COL.blue}}>
        Monto a financiar: <strong>{fmtM(monto)}</strong> · Plazo deal: <strong>{pl} meses</strong>
      </div>
      {res.map((b,i)=>(
        <div key={i} style={{background:"var(--color-background-primary)",border:`1.5px solid ${b.roiAn===best?COL.green:"var(--color-border-tertiary)"}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:b.roiAn===best?COL.green:"var(--color-background-secondary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:b.roiAn===best?"white":"var(--color-text-primary)"}}>{b.n}</span>
            {b.roiAn===best&&<span style={{background:"white",color:COL.green,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>⭐ MEJOR ROI</span>}
          </div>
          <div style={{padding:"4px 0"}}>
            {[["TEA",b.tea>0?fmtP(b.tea):"Capital propio"],["Tasa mensual",b.tea>0?fmtP(b.tm):"0%"],["Cuota mensual",b.tea>0?fmtM(b.cuota):fmtM(monto/pl)],["Costo total deuda",fmtM(b.costo)],["Utilidad estimada",fmtM(b.utilE)],["ROI Total",fmtP(b.roi)],["ROI Anualizado",fmtP(b.roiAn)]].map(([l,v],j)=>(
              <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"7px 14px",borderBottom:j<6?"0.5px solid var(--color-border-tertiary)":"none",fontSize:13}}>
                <span style={{color:"var(--color-text-secondary)"}}>{l}</span>
                <span style={{fontWeight:j>=4?700:400}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{padding:"7px 14px",background:"var(--color-background-secondary)",fontSize:10,color:"var(--color-text-tertiary)",fontStyle:"italic"}}>{b.nota}</div>
        </div>
      ))}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: RADAR NACIONAL
// ══════════════════════════════════════════════════════════════════════════════
const TabRadar = ({setD}) => {
  const [minF,setMinF] = useState(0);
  const [srt,setSrt]   = useState("flip");
  const cities = [...MKT.cities].filter(c=>c.flip>=minF)
    .sort((a,b)=>srt==="flip"?b.flip-a.flip:srt==="val"?b.val24-a.val24:b.prom-a.prom);
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <SH icon="🌎" title="Radar nacional — 20 mercados" sub={MKT.sources} bg={COL.greenL} bc={COL.green} tc={COL.green}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <select value={minF} onChange={e=>setMinF(+e.target.value)}
          style={{flex:1,padding:"9px 10px",fontSize:14,borderRadius:8,minHeight:42,border:"1.5px solid var(--color-border-secondary)"}}>
          {[0,5,6,7,8,9].map(v=><option key={v} value={v}>{v===0?"Todos los mercados":v+"+/10 potencial"}</option>)}
        </select>
        <select value={srt} onChange={e=>setSrt(e.target.value)}
          style={{flex:1,padding:"9px 10px",fontSize:14,borderRadius:8,minHeight:42,border:"1.5px solid var(--color-border-secondary)"}}>
          {[["flip","Ordenar: Potencial"],["val","Ordenar: Valoriz."],["prom","Ordenar: Precio/m²"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
      </div>
 
      {/* Ciudades como tarjetas — no tabla */}
      {cities.map((c,i)=>(
        <div key={c.id} style={{background:"var(--color-background-primary)",border:`0.5px solid ${c.flip>=9?COL.green:c.flip>=7?COL.amber:COL.red}33`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:c.flip>=9?COL.greenL:c.flip>=7?COL.amberL:COL.redL,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--color-text-primary)"}}>{c.name}</div>
              <div style={{fontSize:10,color:"var(--color-text-secondary)"}}>{c.region}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <Badge s={c.flip} label={`${c.flip}/10`}/>
              <span style={{fontSize:10,color:c.val24>=.12?COL.green:c.val24>=.06?COL.amber:COL.red,fontWeight:700}}>
                {fmtP(c.val24)}/año
              </span>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"8px 0"}}>
            {[["Precio/m²",`$${fmt(c.prom)}`],["Arriendo",`$${fmt(c.arriendo)}`],["Ticket prom.",fmtM(c.ticket)]].map(([l,v])=>(
              <div key={l} style={{textAlign:"center",padding:"6px 4px",borderRight:"0.5px solid var(--color-border-tertiary)"}}>
                <div style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase"}}>{l}</div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--color-text-primary)",marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"8px 14px",borderTop:"0.5px solid var(--color-border-tertiary)",display:"flex",justifyContent:"flex-end"}}>
            <button onClick={()=>setD(dd=>({...dd,ciudad:c.id,precioM2:c.prom,arvComp:Math.round(c.ticket*1.3/1000000)*1000000}))}
              style={{padding:"8px 16px",fontSize:12,cursor:"pointer",borderRadius:8,background:COL.blue,color:"white",border:"none",fontWeight:600}}>
              Usar en deal →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: PIPELINE
// ══════════════════════════════════════════════════════════════════════════════
const TabPipe = ({pl,setPl,setId,setTab}) => {
  const STATS = ["Analizando","Contactado","Negociando","Due Diligence","Promesa firmada","En obra","En venta","Cerrado","Descartado"];
  const statusColor = {
    "Analizando":"#64748B","Contactado":COL.blue,"Negociando":COL.purple,
    "Due Diligence":COL.amber,"Promesa firmada":COL.orange,"En obra":COL.red,
    "En venta":COL.teal,"Cerrado":COL.green,"Descartado":"#94A3B8"
  };
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <SH icon="📦" title="Pipeline de deals" bg={COL.purpleL} bc={COL.purple} tc={COL.purple}/>
        <button onClick={()=>{const dd=dftDeal();setPl(p=>[...p,dd]);setId(dd.id);setTab("deal");}}
          style={{padding:"10px 16px",fontSize:13,cursor:"pointer",borderRadius:10,background:COL.navy,color:"white",border:"none",fontWeight:700,minHeight:44,whiteSpace:"nowrap",flexShrink:0,marginLeft:8}}>
          + Nuevo
        </button>
      </div>
 
      {pl.map((d,i)=>{
        const cv = calcDeal(d);
        const sc = statusColor[d.status]||"#64748B";
        return (
          <div key={d.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",background:"var(--color-background-secondary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700}}>{d.nombre}</div>
                <div style={{fontSize:10,color:"var(--color-text-secondary)"}}>{d.direccion||MKT.cities.find(x=>x.id===d.ciudad)?.name}</div>
              </div>
              <button onClick={()=>setPl(p=>p.filter(x=>x.id!==d.id))}
                style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:20,minWidth:36,minHeight:36}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"8px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
              {[["Compra",fmtM(d.precioCompra)],["ROI",fmtP(cv.roiT)],["Score",cv.score.toFixed(1)+"/10"]].map(([l,v],j)=>(
                <div key={j} style={{textAlign:"center",padding:"6px 4px",borderRight:j<2?"0.5px solid var(--color-border-tertiary)":"none"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:700,color:j===1?gc(cv.roiT):j===2?(cv.score>=7?COL.green:cv.score>=5?COL.amber:COL.red):"var(--color-text-primary)",marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"10px 14px",display:"flex",gap:8,alignItems:"center"}}>
              <select value={d.status}
                onChange={e=>setPl(p=>p.map(x=>x.id===d.id?{...x,status:e.target.value}:x))}
                style={{flex:1,padding:"8px 10px",fontSize:13,borderRadius:8,border:`1.5px solid ${sc}`,color:sc,fontWeight:600,minHeight:40,background:"var(--color-background-primary)"}}>
                {STATS.map(s=><option key={s}>{s}</option>)}
              </select>
              <button onClick={()=>{setId(d.id);setTab("dash");}}
                style={{padding:"8px 14px",fontSize:12,cursor:"pointer",borderRadius:8,background:COL.blue,color:"white",border:"none",fontWeight:600,minHeight:40,whiteSpace:"nowrap"}}>
                Ver →
              </button>
            </div>
          </div>
        );
      })}
      {pl.length===0&&(
        <div style={{padding:"40px 20px",textAlign:"center",color:"var(--color-text-tertiary)",fontSize:13}}>
          Sin deals en el pipeline.<br/>Toca "+ Nuevo" para agregar.
        </div>
      )}
      {pl.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4}}>
          <KPI label="Deals activos"       value={pl.filter(d=>!["Cerrado","Descartado"].includes(d.status)).length}/>
          <KPI label="Deals cerrados"      value={pl.filter(d=>d.status==="Cerrado").length}/>
          <KPI label="Capital comprometido" value={fmtM(pl.filter(d=>!["Cerrado","Descartado"].includes(d.status)).reduce((s,d)=>s+d.precioCompra,0))} small/>
          <KPI label="ROI promedio"         value={fmtP(pl.length?pl.reduce((s,d)=>s+calcDeal(d).roiT,0)/pl.length:0)} col={gc(pl.length?pl.reduce((s,d)=>s+calcDeal(d).roiT,0)/pl.length:0)} small/>
        </div>
      )}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: PORTAFOLIO
// ══════════════════════════════════════════════════════════════════════════════
const TabPort = ({pl}) => {
  const [cap,setCap] = useState(200000000);
  const [metaU,setMetaU] = useState(200000000);
  const [metaROI,setMetaROI] = useState(0.20);
  const closed = pl.filter(d=>d.status==="Cerrado");
  const active = pl.filter(d=>!["Cerrado","Descartado"].includes(d.status));
  const totU   = closed.reduce((s,d)=>s+calcDeal(d).uN,0);
  const roiP   = closed.length?closed.reduce((s,d)=>s+calcDeal(d).roiT,0)/closed.length:0;
  const roiAnP = closed.length?closed.reduce((s,d)=>s+calcDeal(d).roiAn,0)/closed.length:0;
  const inv    = active.reduce((s,d)=>s+d.precioCompra,0);
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <SH icon="💼" title="Salud del negocio" bg={COL.blueL} bc={COL.navy} tc={COL.navy}/>
      <Field label="Capital total disponible">
        <NI v={cap} onChange={setCap} pfx="$"/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <KPI label="Capital total"   value={fmtM(cap)}/>
        <KPI label="Invertido ahora" value={fmtM(inv)} col={inv>cap*.8?COL.amber:COL.blue}/>
        <KPI label="Capital libre"   value={fmtM(cap-inv)} col={cap-inv>0?COL.green:COL.red}/>
        <KPI label="Max deals"       value={Math.floor(cap/150000000)} sub="~$150M/deal"/>
      </div>
 
      <SH icon="📊" title="KPIs históricos" bg={COL.greenL} bc={COL.green} tc={COL.green}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <KPI label="Deals cerrados"  value={closed.length}/>
        <KPI label="Deals activos"   value={active.length}/>
        <KPI label="Utilidad total"  value={fmtM(totU)} col={totU>0?COL.green:COL.red}/>
        <KPI label="ROI promedio"    value={fmtP(roiP)} col={gc(roiP)}/>
        <KPI label="ROI anual prom." value={fmtP(roiAnP)} col={gc(roiAnP)} small/>
        <KPI label="Mejor deal"      value={fmtP(closed.length?Math.max(...closed.map(d=>calcDeal(d).roiT)):0)} col={COL.green} small/>
      </div>
 
      <SH icon="🏆" title="Metas del negocio" bg={COL.purpleL} bc={COL.purple} tc={COL.purple}/>
      <Field label="Meta utilidad anual">
        <NI v={metaU} onChange={setMetaU} pfx="$"/>
      </Field>
      <Field label="Meta ROI mínimo por deal">
        <NI v={metaROI*100} onChange={v=>setMetaROI(v/100)} step={1} sfx="%"/>
      </Field>
      {closed.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
          {[["Utilidad generada",fmtM(totU),fmtM(metaU),totU>=metaU],["ROI promedio",fmtP(roiP),fmtP(metaROI),roiP>=metaROI]].map(([l,v,goal,ok])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:ok?COL.greenL:COL.amberL,borderRadius:8}}>
              <span style={{fontSize:12,fontWeight:600,color:ok?COL.green:COL.amber}}>{l}</span>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:ok?COL.green:COL.amber}}>{ok?"✅":"⚠️"} {v}</div>
                <div style={{fontSize:10,color:"var(--color-text-tertiary)"}}>Meta: {goal}</div>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {closed.length>0&&(
        <>
          <SH icon="📋" title="Historial cerrados" bg={COL.blueL} bc={COL.blue} tc={COL.blue}/>
          {closed.map((d,i)=>{const cv=calcDeal(d);return(
            <div key={d.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>{d.nombre}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
                {[["Compra",fmtM(d.precioCompra)],["Utilidad",fmtM(cv.uN)],["ROI",fmtP(cv.roiT)]].map(([l,v],j)=>(
                  <div key={j} style={{textAlign:"center",padding:"6px",background:"var(--color-background-secondary)",borderRadius:7}}>
                    <div style={{fontSize:9,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase"}}>{l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:j===1?(cv.uN>0?COL.green:COL.red):j===2?gc(cv.roiT):"var(--color-text-primary)",marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );})}
        </>
      )}
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// TAB: ESCENARIOS
// ══════════════════════════════════════════════════════════════════════════════
const TabEsc = ({d}) => {
  const base = {compra:d.precioCompra,arv:d.arvComp,remo:d.partidas.reduce((s,p)=>s+p.q*p.p,0),dur:d.diasRemo+d.diasVenta+d.diasEsc,tasa:d.tasaMes,desc:d.descVenta,com:d.comVenta,acq:d.gastosNotaria+d.honorariosAbogado+d.comisionCaptador,tax:d.tasaGO,imp:d.imprevistos};
  const [P,sP] = useState({...base,compra:Math.round(base.compra*1.10/1e6)*1e6,arv:Math.round(base.arv*.90/1e6)*1e6,remo:Math.round(base.remo*1.20/1e6)*1e6,dur:Math.round(base.dur*1.30),tasa:base.tasa+.01,desc:.05,imp:.15});
  const [B,sB] = useState({...base});
  const [O,sO] = useState({...base,compra:Math.round(base.compra*.88/1e6)*1e6,arv:Math.round(base.arv*1.10/1e6)*1e6,remo:Math.round(base.remo*.88/1e6)*1e6,dur:Math.round(base.dur*.80),tasa:Math.max(.018,base.tasa-.005),desc:.015,imp:.08});
 
  const cs = (sc) => {
    const r=sc.remo*(1+sc.imp);const ig=sc.arv*(1-sc.desc)*(1-sc.com);
    const ct=sc.compra+r+sc.acq+sc.tasa*r*sc.dur/30+sc.compra*.008;
    const ub=ig-ct;const un=ub*(1-sc.tax);const roi=ct>0?un/ct:0;
    const ran=sc.dur>0?Math.pow(1+roi,365/sc.dur)-1:0;
    return{ig,ub,un,roi,ran};
  };
  const sp=cs(P),sb=cs(B),so=cs(O);
 
  const isP = (k) => ["tasa","desc","imp"].includes(k);
  const params = [
    ["Precio compra COP","compra",1e6],["ARV estimado COP","arv",1e6],
    ["Costo remodelación COP","remo",1e6],["Días duración","dur",5],
    ["Tasa mensual %","tasa",.001],["Descuento venta %","desc",.001],["Imprevistos %","imp",.001],
  ];
 
  const SCENS = [
    {label:"🔴 Pesimista",sc:P,set:sP,bg:COL.redL,col:COL.red,res:sp},
    {label:"🟡 Base",     sc:B,set:sB,bg:COL.amberL,col:COL.amber,res:sb},
    {label:"🟢 Optimista",sc:O,set:sO,bg:COL.greenL,col:COL.green,res:so},
  ];
 
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <SH icon="🎲" title="Análisis de escenarios" sub="Auto-contenido — no depende del deal activo" bg={COL.amberL} bc={COL.amber} tc={COL.amber}/>
 
      {/* Parámetros por escenario — cada uno en su tarjeta */}
      {SCENS.map(({label,sc,set,bg,col})=>(
        <div key={label} style={{background:"var(--color-background-primary)",border:`1.5px solid ${col}44`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"8px 14px",background:bg}}>
            <div style={{fontSize:13,fontWeight:700,color:col}}>{label}</div>
          </div>
          <div style={{padding:"8px 12px"}}>
            {params.map(([l,k,st])=>(
              <div key={k} style={{padding:"6px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <div style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",marginBottom:2}}>{l}</div>
                <FmtInput
                  v={isP(k)?+(sc[k]*100*10).toFixed(0)/10:sc[k]}
                  onChange={r=>set(prev=>({...prev,[k]:isP(k)?r/100:r}))}
                  decimals={isP(k)?1:0}
                  borderColor={col+"66"}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
 
      {/* Resultados comparados */}
      <SH icon="📊" title="Comparación de resultados" bg={COL.blueL} bc={COL.blue} tc={COL.blue}/>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:0,background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"8px 10px",background:"var(--color-background-secondary)",fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase"}}>Resultado</div>
        {SCENS.map(s=><div key={s.label} style={{padding:"8px 6px",background:s.bg,textAlign:"center",fontSize:10,fontWeight:700,color:s.col}}>{s.label.split(" ")[0]}</div>)}
        {[["Ingreso neto",(x)=>fmtM(x.ig),false],["Utilidad bruta",(x)=>fmtM(x.ub),false],["UTILIDAD NETA",(x)=>fmtM(x.un),true],["ROI Total",(x)=>fmtP(x.roi),true],["ROI Anualizado",(x)=>fmtP(x.ran),true]].map(([l,fn,bold],i)=>(
          <>
            <div key={l} style={{padding:"9px 10px",borderTop:"0.5px solid var(--color-border-tertiary)",fontSize:12,fontWeight:bold?700:400,color:"var(--color-text-secondary)"}}>{l}</div>
            {SCENS.map(s=>(
              <div key={s.label+l} style={{padding:"9px 6px",textAlign:"right",borderTop:"0.5px solid var(--color-border-tertiary)",fontSize:12,fontWeight:bold?700:400,color:bold?(fn(s.res).includes("-")||fn(s.res)==="—"?COL.red:s.col):"var(--color-text-primary)"}}>{fn(s.res)}</div>
            ))}
          </>
        ))}
        <div style={{padding:"9px 10px",borderTop:"1px solid var(--color-border-secondary)",fontSize:12,fontWeight:700,color:"var(--color-text-secondary)"}}>Veredicto</div>
        {SCENS.map(s=>(
          <div key={s.label+"v"} style={{padding:"9px 4px",textAlign:"center",borderTop:"1px solid var(--color-border-secondary)",fontSize:11,fontWeight:700,color:s.res.roi>=.20?COL.green:s.res.roi>=.12?COL.amber:COL.red}}>
            {s.res.roi>=.20?"🟢":s.res.roi>=.12?"🟡":"🔴"}
          </div>
        ))}
      </div>
    </div>
  );
};
 
// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,   setTab]   = useState("dash");
  const [pl,    setPl]    = useState(()=>{try{const s=load();return s?.pl?.length?s.pl:[dftDeal()];}catch{return[dftDeal()];}});
  const [actId, setActId] = useState(()=>{try{return load()?.actId||null;}catch{return null;}});
 
  const act  = pl.find(d=>d.id===actId)||pl[0];
  const setD = useCallback((up)=>setPl(p=>p.map(d=>d.id===act.id?(typeof up==="function"?up(d):up):d)),[act?.id]);
  const c    = useMemo(()=>calcDeal(act),[act]);
 
  useEffect(()=>{save({pl,actId:act?.id});},[pl,act?.id]);
 
  const body = () => {
    switch(tab){
      case"dash":  return <TabDash  d={act} c={c} pl={pl}/>;
      case"deal":  return <TabDeal  d={act} setD={setD} c={c}/>;
      case"costos":return <TabCostos d={act} setD={setD} c={c}/>;
      case"pl":    return <TabPL    d={act} c={c}/>;
      case"flujo": return <TabFlujo d={act} c={c}/>;
      case"score": return <TabScore d={act} setD={setD} c={c}/>;
      case"estr":  return <TabEstr  d={act} c={c}/>;
      case"cred":  return <TabCred  d={act} c={c}/>;
      case"radar": return <TabRadar setD={setD}/>;
      case"pipe":  return <TabPipe  pl={pl} setPl={setPl} setId={setActId} setTab={setTab}/>;
      case"port":  return <TabPort  pl={pl}/>;
      case"esc":   return <TabEsc   d={act}/>;
      default:     return null;
    }
  };
 
  const tabsRef = useRef(null);
  const scrollTabs = (dir) => {
    if(tabsRef.current) tabsRef.current.scrollBy({left:dir*140,behavior:"smooth"});
  };
  useEffect(()=>{
    if(!tabsRef.current) return;
    const active = tabsRef.current.querySelector(`[data-tabid="${tab}"]`);
    if(active) active.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  },[tab]);
 
  return (
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",background:"var(--color-background-tertiary)",minHeight:"100vh"}}>
 
      {/* HEADER — sticky fijo, ancho completo, nunca se encima */}
      <div style={{
        background:"var(--color-background-primary)",
        position:"sticky",top:0,zIndex:9999,
        boxShadow:"0 2px 10px rgba(0,0,0,0.12)",
        width:"100%",
      }}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        {/* Fila logo */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px 8px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:`linear-gradient(135deg,${COL.blue},${COL.teal})`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:"white",fontSize:17,fontWeight:800}}>F</span>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--color-text-primary)",letterSpacing:"-0.01em"}}>Flipping Colombia</div>
              <div style={{fontSize:10,color:"var(--color-text-secondary)"}}>v4.0 · {act?.nombre||"Sin deal"}</div>
            </div>
          </div>
          {pl.length>1&&(
            <select value={act?.id} onChange={e=>setActId(+e.target.value)}
              style={{fontSize:12,padding:"5px 8px",borderRadius:7,border:"1px solid var(--color-border-secondary)",background:"var(--color-background-primary)",maxWidth:130}}>
              {pl.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          )}
        </div>
 
        {/* Fila tabs con flechas */}
        <div style={{display:"flex",alignItems:"stretch",height:46}}>
          {/* Flecha ‹ */}
          <button onClick={()=>scrollTabs(-1)} style={{
            width:36,flexShrink:0,border:"none",cursor:"pointer",
            background:"var(--color-background-primary)",
            borderRight:"0.5px solid var(--color-border-tertiary)",
            color:"var(--color-text-secondary)",fontSize:20,fontWeight:300,
            display:"flex",alignItems:"center",justifyContent:"center",
            WebkitTapHighlightColor:"transparent"
          }}>‹</button>
 
          {/* Tabs scrollables */}
          <div ref={tabsRef} style={{
            flex:1,display:"flex",overflowX:"auto",
            scrollbarWidth:"none",WebkitOverflowScrolling:"touch"
          }}>
            {TABS.map(t=>(
              <button key={t.id} data-tabid={t.id} onClick={()=>setTab(t.id)} style={{
                flexShrink:0,padding:"0 12px",fontSize:11,fontWeight:600,
                border:"none",borderBottom:tab===t.id?`2.5px solid ${t.col}`:"2.5px solid transparent",
                background:tab===t.id?`${t.col}18`:"transparent",
                color:tab===t.id?t.col:"var(--color-text-secondary)",
                cursor:"pointer",whiteSpace:"nowrap",height:"100%",
                transition:"all 0.15s",WebkitTapHighlightColor:"transparent"
              }}>
                <span style={{marginRight:4}}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
 
          {/* Flecha › */}
          <button onClick={()=>scrollTabs(1)} style={{
            width:36,flexShrink:0,border:"none",cursor:"pointer",
            background:"var(--color-background-primary)",
            borderLeft:"0.5px solid var(--color-border-tertiary)",
            color:"var(--color-text-secondary)",fontSize:20,fontWeight:300,
            display:"flex",alignItems:"center",justifyContent:"center",
            WebkitTapHighlightColor:"transparent"
          }}>›</button>
        </div>
      </div>
      </div>{/* /maxWidth header */}
 
      {/* CONTENT */}
      <div style={{maxWidth:680,margin:"0 auto",padding:"14px 14px 80px",minHeight:"100vh"}}>
        {body()}
      </div>
 
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{display:none;}
        input,select{-webkit-tap-highlight-color:transparent;}
        input:focus,select:focus{outline:none;border-color:${COL.blue}!important;box-shadow:0 0 0 3px ${COL.blue}20!important;}
        input[type=range]{accent-color:${COL.purple};height:28px;}
        button{-webkit-tap-highlight-color:transparent;}
      `}</style>
    </div>
  );
}
