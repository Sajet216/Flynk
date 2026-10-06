"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import storesData from "@/lib/mock-data/stores.json";
import { LiveOrder } from "@/app/api/orders/route";
import { mockDataService } from "@/lib/services/mockDataService";

const Z = { red:"#E23744", bg:"#f8f8f8", white:"#fff", text:"#3d4152", muted:"#93959f", border:"#e9e9eb", green:"#60b246", orange:"#f37a20", blue:"#1a73e8" };
const card:React.CSSProperties = { background:Z.white, border:`1px solid ${Z.border}`, borderRadius:12, padding:16, marginBottom:12 };
const badge = (c:string):React.CSSProperties => ({ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:c+"18", color:c, border:`1px solid ${c}30` });
const btn = (c:string,outline=false):React.CSSProperties => ({ padding:"10px 0", borderRadius:8, border:outline?`1.5px solid ${c}`:"none", background:outline?"transparent":c, color:outline?c:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", width:"100%" });

export default function StorePortalPage() {
  const [storeId, setStoreId] = useState("store-1");
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [tab, setTab] = useState<"orders"|"catalog"|"analytics">("orders");
  const [sound, setSound] = useState(true);
  const [prevCount, setPrevCount] = useState(0);
  const [updating, setUpdating] = useState<string|null>(null);
  const store = useMemo(()=>storesData.find(s=>s.id===storeId)||storesData[0],[storeId]);
  const products = useMemo(()=>mockDataService.getProductsByStore(store.id),[store]);

  const chime = () => {
    if(!sound||typeof window==="undefined") return;
    try { const c=new ((window as any).AudioContext||(window as any).webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(880,c.currentTime);g.gain.setValueAtTime(0.2,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.4);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+0.4); } catch{}
  };

  const load = async () => {
    try { const r=await fetch(`/api/orders?storeId=${storeId}`); const d=await r.json(); if(d.orders){if(d.orders.length>prevCount&&prevCount>0)chime();setPrevCount(d.orders.length);setOrders(d.orders); } } catch{}
  };

  useEffect(()=>{ load(); const t=setInterval(load,2500); return ()=>clearInterval(t); },[storeId]);

  const update = async(id:string, status:LiveOrder["status"]) => {
    setUpdating(id);
    try { await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:id,status})}); await load(); } finally { setUpdating(null); }
  };

  const pending=orders.filter(o=>o.status==="PENDING");
  const prep=orders.filter(o=>o.status==="ACCEPTED"||o.status==="PREPARING");
  const ready=orders.filter(o=>o.status==="READY_FOR_PICKUP");
  const done=orders.filter(o=>o.status==="PICKED_UP"||o.status==="DELIVERED");

  return (
    <div style={{minHeight:"100vh",background:Z.bg,fontFamily:"'Inter','Segoe UI',sans-serif",color:Z.text}}>
      {/* TOPBAR */}
      <div style={{background:Z.white,borderBottom:`1px solid ${Z.border}`,padding:"0 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22,fontWeight:900,color:Z.red,letterSpacing:"-1px"}}>flynk</span>
            <span style={{fontSize:11,background:Z.red+"15",color:Z.red,padding:"2px 8px",borderRadius:4,fontWeight:700}}>Store Partner</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setSound(!sound)} style={{background:"none",border:`1px solid ${Z.border}`,borderRadius:6,padding:"4px 10px",fontSize:12,cursor:"pointer",color:Z.muted}}>{sound?"🔔":"🔕"}</button>
            <Link href="/" style={{background:"none",border:`1px solid ${Z.border}`,borderRadius:6,padding:"4px 10px",fontSize:12,color:Z.text,textDecoration:"none"}}>← Home</Link>
          </div>
        </div>
        {/* Store picker */}
        <div style={{borderTop:`1px solid ${Z.border}`,padding:"8px 0",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,color:Z.muted}}>Store:</span>
          <select value={storeId} onChange={e=>setStoreId(e.target.value)} style={{fontSize:13,fontWeight:700,color:Z.text,border:"none",background:"transparent",cursor:"pointer",outline:"none"}}>
            {storesData.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderTop:`1px solid ${Z.border}`}}>
          {(["orders","catalog","analytics"] as const).map(t2=>(
            <button key={t2} onClick={()=>setTab(t2)} style={{flex:1,padding:"10px 0",border:"none",background:"transparent",fontSize:12,fontWeight:700,cursor:"pointer",color:tab===t2?Z.red:Z.muted,borderBottom:`2px solid ${tab===t2?Z.red:"transparent"}`,textTransform:"capitalize"}}>
              {t2==="orders"?`Orders (${orders.length})`:t2==="catalog"?"Menu":("Analytics")}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"16px 12px"}}>
        {/* ORDERS */}
        {tab==="orders"&&(<>
          {pending.length>0&&<>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:Z.red,display:"inline-block",animation:"zpulse 1s infinite"}}/>
              <span style={{fontSize:12,fontWeight:800,color:Z.red,textTransform:"uppercase",letterSpacing:"0.06em"}}>New Orders ({pending.length})</span>
            </div>
            {pending.map(o=>(
              <div key={o.id} style={{...card,border:`2px solid ${Z.red}40`,boxShadow:`0 2px 12px ${Z.red}10`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div><div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:Z.red}}>#{o.id}</div><div style={{fontSize:11,color:Z.muted,marginTop:2}}>{o.items.length} items · Just now</div></div>
                  <div style={{fontSize:18,fontWeight:900,color:Z.text}}>₹{o.totalAmount}</div>
                </div>
                {o.items.map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0",borderBottom:`1px solid ${Z.border}`}}><span>{item.quantity}× {item.name}</span><span style={{color:Z.muted}}>₹{item.price*item.quantity}</span></div>)}
                <div style={{background:Z.bg,borderRadius:8,padding:"8px 10px",fontSize:12,color:Z.muted,margin:"10px 0"}}>📍 {o.customerAddress} &nbsp;·&nbsp; 📞 {o.customerPhone}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <button onClick={()=>update(o.id,"ACCEPTED")} disabled={updating===o.id} style={{...btn(Z.green)}}>{updating===o.id?"Updating…":"✓ Accept & Prepare"}</button>
                  <button onClick={()=>update(o.id,"DELIVERED")} style={{...btn(Z.muted,true)}}>Decline</button>
                </div>
              </div>
            ))}
          </>}

          {prep.length>0&&<>
            <p style={{fontSize:12,fontWeight:800,color:Z.orange,textTransform:"uppercase",letterSpacing:"0.06em",margin:"16px 0 8px"}}>🍳 Preparing ({prep.length})</p>
            {prep.map(o=>(
              <div key={o.id} style={{...card,borderLeft:`3px solid ${Z.orange}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:Z.orange}}>#{o.id}</span><span style={{fontWeight:700}}>₹{o.totalAmount}</span></div>
                <p style={{fontSize:12,color:Z.muted,margin:"0 0 10px"}}>{o.items.map(i=>`${i.quantity}× ${i.name}`).join(" · ")}</p>
                <button onClick={()=>update(o.id,"READY_FOR_PICKUP")} disabled={updating===o.id} style={{...btn(Z.orange)}}>📦 Mark Ready for Pickup</button>
              </div>
            ))}
          </>}

          {ready.length>0&&<>
            <p style={{fontSize:12,fontWeight:800,color:Z.blue,textTransform:"uppercase",letterSpacing:"0.06em",margin:"16px 0 8px"}}>📦 Ready — Awaiting Rider ({ready.length})</p>
            {ready.map(o=>(
              <div key={o.id} style={{...card,borderLeft:`3px solid ${Z.blue}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:Z.blue}}>#{o.id}</span><span style={badge(Z.blue)}>Awaiting Rider</span></div>
                <p style={{fontSize:12,color:Z.muted,margin:"6px 0 0"}}>{o.items.map(i=>`${i.quantity}× ${i.name}`).join(", ")}</p>
              </div>
            ))}
          </>}

          {done.length>0&&<>
            <p style={{fontSize:12,fontWeight:800,color:Z.muted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"16px 0 8px"}}>✓ Delivered ({done.length})</p>
            {done.map(o=><div key={o.id} style={{...card,opacity:0.6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"monospace",fontSize:12}}>#{o.id}</span><span style={{fontWeight:700}}>₹{o.totalAmount}</span></div>)}
          </>}

          {orders.length===0&&<div style={{...card,textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:12}}>🏬</div><p style={{fontWeight:700,color:Z.text,margin:0}}>No active orders</p><p style={{color:Z.muted,fontSize:13,marginTop:6}}>Place an order from the customer app!</p></div>}
        </>)}

        {/* CATALOG */}
        {tab==="catalog"&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><p style={{margin:0,fontWeight:800,fontSize:15}}>Menu Catalog</p><p style={{margin:0,fontSize:12,color:Z.muted}}>{products.length} items · {store.name}</p></div>
          </div>
          {products.map(p=>(
            <div key={p.id} style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><p style={{margin:0,fontWeight:700,fontSize:13}}>{p.name}</p><p style={{margin:"2px 0 0",fontSize:11,color:Z.muted}}>{p.category}</p></div>
              <div style={{textAlign:"right"}}><p style={{margin:0,fontWeight:800,fontSize:15}}>₹{p.price}</p><span style={badge(Z.green)}>In Stock</span></div>
            </div>
          ))}
        </>)}

        {/* ANALYTICS */}
        {tab==="analytics"&&(<>
          <div style={{...card,borderLeft:`4px solid ${Z.red}`,background:`${Z.red}08`}}>
            <p style={{margin:"0 0 4px",fontWeight:800,fontSize:14,color:Z.red}}>📊 Apriori Basket Analysis</p>
            <p style={{margin:0,fontSize:12,color:Z.text}}>Frequently Bought Together at <strong>{store.name}</strong></p>
          </div>
          {[{items:"Masala Dosa + Filter Coffee",conf:"82%",lift:"2.3×",color:Z.red},{items:"Idli Sambar + Medu Vada + Filter Coffee",conf:"76%",lift:"2.1×",color:Z.orange},{items:"Poori Bhaji + Lassi",conf:"68%",lift:"1.9×",color:Z.blue}].map((r,i)=>(
            <div key={i} style={{...card}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontWeight:700,fontSize:13}}>{r.items}</span>
                <span style={badge(Z.green)}>{r.conf}</span>
              </div>
              <div style={{height:6,background:Z.border,borderRadius:99,overflow:"hidden",marginBottom:6}}>
                <div style={{height:"100%",background:r.color,borderRadius:99,width:r.conf}}/>
              </div>
              <p style={{margin:0,fontSize:11,color:Z.muted}}>Lift: <strong>{r.lift}</strong> · If customer buys LHS, they will also buy RHS with {r.conf} confidence</p>
            </div>
          ))}
        </>)}
      </div>
      <style>{`@keyframes zpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}`}</style>
    </div>
  );
}
