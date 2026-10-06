"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LiveOrder } from "@/app/api/orders/route";

const Z = { red:"#E23744", bg:"#f8f8f8", white:"#fff", text:"#3d4152", muted:"#93959f", border:"#e9e9eb", green:"#60b246", orange:"#f37a20", blue:"#1a73e8" };
const card:React.CSSProperties = { background:Z.white, border:`1px solid ${Z.border}`, borderRadius:12, padding:16, marginBottom:12 };
const badge = (c:string):React.CSSProperties => ({ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:c+"18", color:c });
const btn = (c:string):React.CSSProperties => ({ padding:"12px 0", borderRadius:8, border:"none", background:c, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", width:"100%" });

export default function RiderPortalPage() {
  const [onDuty, setOnDuty] = useState(true);
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [earnings, setEarnings] = useState(285);
  const [trips, setTrips] = useState(8);
  const [updating, setUpdating] = useState<string|null>(null);
  const riderName = "Kiran S.";
  const zone = "Indiranagar";

  const load = async () => { try { const r=await fetch("/api/orders"); const d=await r.json(); if(d.orders)setOrders(d.orders); } catch{} };
  useEffect(()=>{ load(); const t=setInterval(load,2500); return ()=>clearInterval(t); },[]);

  const update = async(id:string, status:LiveOrder["status"], isPaid=false) => {
    setUpdating(id);
    try { const r=await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:id,status,riderId:"rider-blr-1",riderName})}); if(r.ok){if(isPaid){setEarnings(p=>p+35);setTrips(p=>p+1);} await load(); } } finally { setUpdating(null); }
  };

  const available = orders.filter(o=>o.status==="READY_FOR_PICKUP"&&(!o.riderId||o.riderId==="rider-blr-1"));
  const active = orders.filter(o=>o.status==="PICKED_UP"&&o.riderId==="rider-blr-1");
  const delivered = orders.filter(o=>o.status==="DELIVERED");

  return (
    <div style={{minHeight:"100vh",background:Z.bg,fontFamily:"'Inter','Segoe UI',sans-serif",color:Z.text}}>
      {/* TOPBAR */}
      <div style={{background:Z.green,padding:"0 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-1px"}}>flynk</span>
            <span style={{fontSize:11,background:"rgba(255,255,255,0.2)",color:"#fff",padding:"2px 8px",borderRadius:4,fontWeight:700}}>Rider App</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setOnDuty(!onDuty)} style={{borderRadius:20,padding:"5px 14px",border:"none",fontWeight:800,fontSize:12,cursor:"pointer",background:onDuty?"rgba(255,255,255,0.25)":"rgba(0,0,0,0.2)",color:"#fff"}}>
              {onDuty?"● On Duty":"○ Off Duty"}
            </button>
            <Link href="/" style={{fontSize:12,color:"rgba(255,255,255,0.8)",textDecoration:"none"}}>← Home</Link>
          </div>
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,borderTop:"1px solid rgba(255,255,255,0.2)",padding:"10px 0"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Rider</div>
            <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{riderName}</div>
          </div>
          <div style={{textAlign:"center",borderLeft:"1px solid rgba(255,255,255,0.2)",borderRight:"1px solid rgba(255,255,255,0.2)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Earnings</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>₹{earnings}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Trips</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{trips}</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"16px 12px"}}>
        {/* ACTIVE */}
        {active.length>0&&<>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:Z.orange,display:"inline-block",animation:"zpulse 1s infinite"}}/>
            <span style={{fontSize:12,fontWeight:800,color:Z.orange,textTransform:"uppercase",letterSpacing:"0.06em"}}>Active Delivery ({active.length})</span>
          </div>
          {active.map(o=>(
            <div key={o.id} style={{...card,border:`2px solid ${Z.orange}40`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:Z.orange}}>#{o.id}</div><div style={{fontSize:13,fontWeight:700,marginTop:2}}>{o.storeName}</div></div>
                <span style={badge(Z.orange)}>+₹35</span>
              </div>
              <div style={{background:Z.bg,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                <p style={{margin:"0 0 4px",fontSize:11,fontWeight:700,color:Z.muted,textTransform:"uppercase"}}>Drop Off</p>
                <p style={{margin:"0 0 3px",fontSize:13,fontWeight:700}}>{o.customerAddress}</p>
                <p style={{margin:0,fontSize:12,color:Z.muted}}>📞 {o.customerPhone}</p>
              </div>
              <p style={{margin:"0 0 12px",fontSize:12,color:Z.muted}}>Items: {o.items.map(i=>`${i.quantity}× ${i.name}`).join(", ")}</p>
              <button onClick={()=>update(o.id,"DELIVERED",true)} disabled={updating===o.id} style={{...btn(Z.green)}}>{updating===o.id?"Updating…":"✓ Delivered · Collect Cash"}</button>
            </div>
          ))}
        </>}

        {/* AVAILABLE */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"16px 0 8px"}}>
          <span style={{fontSize:12,fontWeight:800,color:Z.green,textTransform:"uppercase",letterSpacing:"0.06em"}}>⚡ Pickup Tasks ({available.length})</span>
          <span style={{fontSize:11,color:Z.muted}}>{zone} Hub</span>
        </div>

        {available.length===0?(
          <div style={{...card,textAlign:"center",padding:36}}>
            <div style={{fontSize:40,marginBottom:10}}>🚴</div>
            <p style={{margin:0,fontWeight:700}}>No tasks right now</p>
            <p style={{color:Z.muted,fontSize:12,marginTop:4}}>Store will push tasks here when orders are ready!</p>
          </div>
        ):available.map(o=>(
          <div key={o.id} style={{...card,borderLeft:`3px solid ${Z.green}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <div><div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:Z.green}}>#{o.id}</div><div style={{fontSize:14,fontWeight:800,marginTop:2}}>{o.storeName}</div><div style={{fontSize:11,color:Z.muted,marginTop:2}}>📍 {o.storeAddress}</div></div>
              <div style={{textAlign:"right"}}><span style={badge(Z.green)}>₹35</span><div style={{fontSize:11,color:Z.muted,marginTop:4}}>~1.2 km</div></div>
            </div>
            <div style={{background:Z.bg,borderRadius:8,padding:"8px 10px",marginBottom:12,fontSize:12}}>
              Drop: <strong>{o.customerAddress}</strong>
              <div style={{marginTop:3,color:Z.muted}}>{o.items.map(i=>`${i.quantity}× ${i.name}`).join(", ")}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
              <button onClick={()=>update(o.id,"PICKED_UP")} disabled={updating===o.id} style={{...btn(Z.green)}}>{updating===o.id?"Assigning…":"🚴 Accept & Pick Up"}</button>
              <button onClick={()=>update(o.id,"DELIVERED",true)} style={{padding:"12px 0",borderRadius:8,border:`1.5px solid ${Z.muted}`,background:"transparent",color:Z.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>Skip</button>
            </div>
          </div>
        ))}

        {delivered.length>0&&<>
          <p style={{fontSize:12,fontWeight:800,color:Z.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"16px 0 8px"}}>Completed ({delivered.length})</p>
          {delivered.slice(0,4).map(o=>(
            <div key={o.id} style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:0.65}}>
              <div><div style={{fontFamily:"monospace",fontSize:12}}>#{o.id}</div><div style={{fontSize:11,color:Z.muted}}>{o.storeName}</div></div>
              <span style={{fontWeight:800,color:Z.green}}>+₹35</span>
            </div>
          ))}
        </>}
      </div>
      <style>{`@keyframes zpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}`}</style>
    </div>
  );
}
