import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend
} from "recharts";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
                 "July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const LEAVE_TYPES = [
  { id:"earned",      name:"Earned Leave",       color:"#16a34a", total:18, unit:"Days" },
  { id:"sick",        name:"Sick Leave",          color:"#d97706", total:12, unit:"Days" },
  { id:"menstrual",   name:"Menstrual Leave",     color:"#db2777", total:12, unit:"Days" },
  { id:"maternity",   name:"Maternity Leave",     color:"#7c3aed", total:26, unit:"Weeks" },
  { id:"paternity",   name:"Paternity Leave",     color:"#2563eb", total:5,  unit:"Days" },
  { id:"bereavement", name:"Bereavement Leave",   color:"#475569", total:3,  unit:"Days" },
  { id:"lwp",         name:"Leave Without Pay",   color:"#dc2626", total:90, unit:"Days" },
];

const DEMO_USERS = [
  { id:1, name:"Akash Kumar",  role:"employee", dept:"Engineering", avatar:"AK" },
  { id:2, name:"Neha Sharma",  role:"manager",  dept:"Engineering", avatar:"NS" },
  { id:3, name:"Rajesh Mehta", role:"hr",       dept:"HR",          avatar:"RM" },
  { id:4, name:"Admin User",   role:"admin",    dept:"IT",          avatar:"AD" },
  { id:5, name:"Arvind Rao",   role:"reports",  dept:"Finance",     avatar:"AR" },
];

const ROLE_COLORS = {
  employee:"#2563eb", manager:"#16a34a", hr:"#d97706", admin:"#7c3aed", reports:"#dc2626"
};

const ROLE_DESC = {
  employee:"View balances, apply leave, track requests",
  manager:"Approve or reject team leave requests",
  hr:"Manage holidays, policies & analytics",
  admin:"System configuration & settings",
  reports:"View detailed analytics & reports",
};

const ROLE_TABS = {
  employee:[{id:"dashboard",label:"Dashboard"},{id:"my-leave",label:"My Leave"},{id:"my-team",label:"My Team"},{id:"reports",label:"Reports"}],
  manager: [{id:"dashboard",label:"Dashboard"},{id:"team-calendar",label:"Team Calendar"},{id:"requests",label:"All Requests"},{id:"reports",label:"Reports"}],
  hr:      [{id:"dashboard",label:"Dashboard"},{id:"leave-policies",label:"Leave Policies"},{id:"holiday-setup",label:"Holiday Setup"},{id:"reports",label:"Reports"}],
  admin:   [{id:"dashboard",label:"Dashboard"},{id:"leave-types",label:"Leave Types"},{id:"holiday-setup",label:"Holiday Setup"},{id:"settings",label:"Settings"}],
  reports: [{id:"dashboard",label:"Dashboard"},{id:"utilization",label:"Utilization"},{id:"dept-trends",label:"Dept Trends"},{id:"leave-analysis",label:"Leave Analysis"}],
};

const DASH_TITLE = {
  employee:"Employee Dashboard", manager:"Manager Dashboard",
  hr:"HR Dashboard", admin:"Admin Configuration Panel", reports:"Reports Dashboard"
};

const TEAM_MEMBERS = [
  {id:1,name:"Akash Kumar",  dept:"Engineering"},
  {id:3,name:"Priya M.",     dept:"Sales"},
  {id:4,name:"Rahul S.",     dept:"Engineering"},
  {id:5,name:"Anil K.",      dept:"HR"},
  {id:6,name:"Ravi K.",      dept:"Finance"},
  {id:7,name:"Amit D.",      dept:"Engineering"},
];

const INITIAL_HOLIDAYS = [
  {id:101, name:"New Year's Day",  date:"2026-01-01", type:"national"},
  {id:102, name:"Republic Day",    date:"2026-01-26", type:"national"},
  {id:103, name:"Maha Shivratri", date:"2026-02-17", type:"state"},
  {id:104, name:"Ugadi",           date:"2026-03-27", type:"state"},
  {id:105, name:"Ramzan",          date:"2026-04-17", type:"state", tentative:true},
  {id:106, name:"Gandhi Jayanti",  date:"2026-10-02", type:"national"},
];

const INITIAL_REQUESTS = [
  {id:1, empId:1, empName:"Akash Kumar",  dept:"Engineering", type:"sick",      start:"2026-01-10", end:"2026-01-12", days:3, status:"approved", reason:"Fever",         applied:"2026-01-09"},
  {id:2, empId:1, empName:"Akash Kumar",  dept:"Engineering", type:"earned",    start:"2025-12-22", end:"2025-12-24", days:3, status:"approved", reason:"Vacation",      applied:"2025-12-15"},
  {id:3, empId:1, empName:"Akash Kumar",  dept:"Engineering", type:"menstrual", start:"2025-12-05", end:"2025-12-07", days:3, status:"pending",  reason:"Medical",       applied:"2025-12-04"},
  {id:4, empId:4, empName:"Rahul S.",     dept:"Engineering", type:"earned",    start:"2026-01-18", end:"2026-01-22", days:5, status:"pending",  reason:"Family event",  applied:"2026-01-15"},
  {id:5, empId:3, empName:"Priya M.",     dept:"Sales",       type:"sick",      start:"2026-01-15", end:"2026-01-16", days:2, status:"pending",  reason:"Medical",       applied:"2026-01-14"},
  {id:6, empId:5, empName:"Anil K.",      dept:"HR",          type:"earned",    start:"2026-01-24", end:"2026-01-27", days:4, status:"pending",  reason:"Personal",      applied:"2026-01-20"},
  {id:7, empId:7, empName:"Amit D.",      dept:"Engineering", type:"earned",    start:"2026-01-18", end:"2026-01-22", days:5, status:"approved", reason:"Vacation",      applied:"2026-01-10"},
  {id:8, empId:6, empName:"Ravi K.",      dept:"Finance",     type:"sick",      start:"2026-01-20", end:"2026-01-25", days:6, status:"pending",  reason:"Illness",       applied:"2026-01-19"},
];

const BALANCES = {
  1:{earned:6, sick:4, menstrual:7, maternity:0, paternity:3, bereavement:2, lwp:0},
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  card:      {background:"#fff", borderRadius:12, padding:"1.25rem", boxShadow:"0 1px 4px rgba(0,0,0,0.08)", border:"1px solid #f1f5f9"},
  label:     {display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6},
  input:     {width:"100%", padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, color:"#111827", outline:"none", boxSizing:"border-box", fontFamily:"inherit"},
  textarea:  {width:"100%", padding:"8px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, color:"#111827", outline:"none", boxSizing:"border-box", fontFamily:"inherit", resize:"vertical"},
  btnBlue:   {padding:"9px 20px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit"},
  btnGray:   {padding:"9px 20px", background:"#f8fafc", color:"#374151", border:"1px solid #e2e8f0", borderRadius:8, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit"},
  btnGreen:  {padding:"6px 14px", background:"#16a34a", color:"#fff", border:"none", borderRadius:6, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit"},
  btnRed:    {padding:"6px 14px", background:"#dc2626", color:"#fff", border:"none", borderRadius:6, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit"},
  th:        {padding:"10px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.04em", background:"#f8fafc"},
  td:        {padding:"10px 12px", borderBottom:"1px solid #f1f5f9", fontSize:14, color:"#374151", verticalAlign:"middle"},
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "";
const fmtFull  = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "";
const initials = (name) => name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);

function LeaveTypeBadge({type}) {
  const lt = LEAVE_TYPES.find(l=>l.id===type)||{name:type,color:"#64748b"};
  return <span style={{fontSize:12,padding:"2px 10px",borderRadius:999,background:`${lt.color}18`,color:lt.color,fontWeight:700,whiteSpace:"nowrap"}}>{lt.name}</span>;
}
function StatusBadge({status}) {
  const m = {approved:{bg:"#dcfce7",c:"#15803d",icon:"✓"},pending:{bg:"#fef9c3",c:"#b45309",icon:"⏳"},rejected:{bg:"#fee2e2",c:"#b91c1c",icon:"✗"}};
  const s = m[status]||{bg:"#f1f5f9",c:"#64748b",icon:"?"};
  return <span style={{fontSize:12,padding:"2px 10px",borderRadius:999,background:s.bg,color:s.c,fontWeight:700}}>{s.icon} {status.charAt(0).toUpperCase()+status.slice(1)}</span>;
}
function Avatar({name,color="#2563eb",size=36}) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.33,fontWeight:700,flexShrink:0}}>{initials(name)}</div>;
}

// ─── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({title,onClose,children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>{title}</h2>
          <button onClick={onClose} style={{border:"none",background:"#f1f5f9",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,lineHeight:1,color:"#64748b"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── CALENDAR ──────────────────────────────────────────────────────────────────
function Calendar({year,month,setYear,setMonth,holidays,getLeaves}) {
  const daysInMonth = new Date(year,month+1,0).getDate();
  const firstDay    = new Date(year,month,1).getDay();
  const hDates = new Set(holidays.filter(h=>{ const d=new Date(h.date); return d.getFullYear()===year&&d.getMonth()===month; }).map(h=>new Date(h.date).getDate()));
  const hMap   = {};
  holidays.filter(h=>{ const d=new Date(h.date); return d.getFullYear()===year&&d.getMonth()===month; }).forEach(h=>{ hMap[new Date(h.date).getDate()] = h; });
  const today  = new Date();

  const prev = () => month===0 ? (setYear(y=>y-1),setMonth(11)) : setMonth(m=>m-1);
  const next = () => month===11 ? (setYear(y=>y+1),setMonth(0))  : setMonth(m=>m+1);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={prev} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:16,color:"#374151"}}>‹</button>
        <span style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={{border:"1px solid #e2e8f0",background:"#fff",borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:16,color:"#374151"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS_SHORT.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#94a3b8",padding:"4px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i}/>)}
        {Array.from({length:daysInMonth}).map((_,i)=>{
          const day = i+1;
          const dow = new Date(year,month,day).getDay();
          const isToday = today.getDate()===day&&today.getMonth()===month&&today.getFullYear()===year;
          const isHol   = hDates.has(day);
          const leaves  = getLeaves ? getLeaves(year,month,day) : [];
          const hasLeave= leaves.length>0;
          let bg="#fff", color="#374151", fw=400, border="1px solid #f1f5f9";
          if(isToday)       { bg="#2563eb"; color="#fff"; fw=700; }
          else if(isHol)    { bg="#fee2e2"; color="#dc2626"; fw=700; }
          else if(hasLeave) { bg="#d1fae5"; color="#15803d"; fw=600; }
          else if(dow===0)  { color="#94a3b8"; }
          return (
            <div key={day} title={isHol?hMap[day]?.name:hasLeave?leaves.map(l=>l.empName||"Leave").join(", "):""} style={{textAlign:"center",padding:"5px 2px",fontSize:13,borderRadius:6,background:bg,color,fontWeight:fw,border,minHeight:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:isHol||hasLeave?"default":"default"}}>
              {day}
            </div>
          );
        })}
      </div>
      {Object.keys(hMap).length>0&&(
        <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
          {Object.values(hMap).map((h,i)=>(
            <span key={i} style={{fontSize:11,padding:"2px 8px",borderRadius:999,background:h.tentative?"#fef9c3":"#fee2e2",color:h.tentative?"#92400e":"#dc2626",fontWeight:700}}>
              {h.tentative?"🟡":"🔴"} {h.name}{h.tentative?" (Tentative)":""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [selected,setSelected] = useState(null);
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#0f2c5c 0%,#1e4d99 50%,#2563eb 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:"100%",maxWidth:520}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:8}}>📅</div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#fff",margin:"0 0 8px",letterSpacing:-0.5}}>Leave Management System</h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:15,margin:0}}>Karnataka Region • 2026</p>
        </div>
        <div style={{background:"#fff",borderRadius:20,padding:32,boxShadow:"0 32px 80px rgba(0,0,0,0.3)"}}>
          <h2 style={{fontSize:17,fontWeight:800,color:"#0f172a",margin:"0 0 6px",textAlign:"center"}}>Select Your Role to Continue</h2>
          <p style={{fontSize:13,color:"#64748b",textAlign:"center",margin:"0 0 24px"}}>This is a demo — choose any role to explore the system</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
            {DEMO_USERS.map(u=>(
              <button key={u.id} onClick={()=>setSelected(u)} style={{padding:"14px 16px",border:selected?.id===u.id?`2px solid ${ROLE_COLORS[u.role]}`:"2px solid #e2e8f0",borderRadius:12,background:selected?.id===u.id?`${ROLE_COLORS[u.role]}08`:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",transition:"all 0.15s"}}>
                <Avatar name={u.name} color={ROLE_COLORS[u.role]} size={44}/>
                <div style={{flex:1}}>
                  <p style={{fontWeight:800,color:"#0f172a",fontSize:15,margin:0}}>{u.name}</p>
                  <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0"}}>{ROLE_DESC[u.role]}</p>
                </div>
                <span style={{fontSize:11,fontWeight:800,padding:"3px 10px",borderRadius:999,background:`${ROLE_COLORS[u.role]}15`,color:ROLE_COLORS[u.role],textTransform:"uppercase",letterSpacing:"0.06em",flexShrink:0}}>{u.role}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>selected&&onLogin(selected)} disabled={!selected} style={{width:"100%",padding:14,background:selected?"#2563eb":"#94a3b8",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:16,cursor:selected?"pointer":"not-allowed",transition:"background 0.15s",fontFamily:"inherit"}}>
            {selected?`Login as ${selected.name}`:"Select a role to continue →"}
          </button>
        </div>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:20}}>✦ All data is stored locally in your browser ✦</p>
      </div>
    </div>
  );
}

// ─── EMPLOYEE VIEW ─────────────────────────────────────────────────────────────
function EmployeeView({tab,user,requests,holidays,calYear,calMonth,setCalYear,setCalMonth,getLeaves,onApplyLeave}) {
  const myRequests = requests.filter(r=>r.empId===user.id);
  const getBalance = (type) => {
    const lt = LEAVE_TYPES.find(l=>l.id===type);
    const used = (BALANCES[user.id]||{})[type]||0;
    return {used, total:lt?.total||0, remaining:(lt?.total||0)-used, unit:lt?.unit};
  };

  if(tab==="dashboard") return (
    <div style={{display:"grid",gridTemplateColumns:"minmax(200px,1fr) minmax(300px,2fr) minmax(200px,1fr)",gap:16,alignItems:"start"}}>
      <div style={S.card}>
        <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Leave Balances</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {LEAVE_TYPES.map(lt=>{
            const b=getBalance(lt.id);
            return (
              <div key={lt.id} style={{padding:"8px 10px",borderRadius:8,background:"#f8fafc",border:`1px solid ${lt.color}20`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,color:"#374151",fontWeight:600}}>{lt.name}</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#0f172a"}}>{b.remaining}/{lt.total} {lt.unit==="Weeks"?"Wks":"Days"}</span>
                </div>
                {lt.unit!=="Weeks"&&<div style={{height:4,background:"#e2e8f0",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.round(b.used/b.total*100))}%`,background:lt.color,borderRadius:999}}/></div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={S.card}>
        <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Holiday Calendar 2026 (Karnataka)</h3>
        <Calendar year={calYear} month={calMonth} setYear={setCalYear} setMonth={setCalMonth} holidays={holidays} getLeaves={getLeaves}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Apply for Leave</h3>
          <button onClick={onApplyLeave} style={{...S.btnBlue,width:"100%",padding:12,fontSize:15}}>+ Apply Leave</button>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Recent Requests</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {myRequests.slice().reverse().slice(0,3).map(r=>(
              <div key={r.id} style={{borderLeft:`3px solid ${LEAVE_TYPES.find(l=>l.id===r.type)?.color||"#64748b"}`,paddingLeft:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                  <div>
                    <p style={{fontSize:12,fontWeight:700,color:"#0f172a",margin:"0 0 3px"}}>{fmtDate(r.start)} - {fmtDate(r.end)}</p>
                    <LeaveTypeBadge type={r.type}/>
                  </div>
                  <StatusBadge status={r.status}/>
                </div>
              </div>
            ))}
            {myRequests.length===0&&<p style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:"8px 0"}}>No requests yet</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if(tab==="my-leave") return (
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:0}}>My Leave Requests</h3>
        <button onClick={onApplyLeave} style={S.btnBlue}>+ Apply Leave</button>
      </div>
      {myRequests.length===0?(
        <div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>
          <div style={{fontSize:40,marginBottom:8}}>📋</div>
          <p style={{fontSize:15}}>No leave requests yet.</p>
          <button onClick={onApplyLeave} style={{...S.btnBlue,marginTop:8}}>Apply Your First Leave</button>
        </div>
      ):(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Type","Period","Days","Reason","Status","Applied On"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {myRequests.map(r=>(
                <tr key={r.id} style={{borderBottom:"1px solid #f1f5f9"}}>
                  <td style={S.td}><LeaveTypeBadge type={r.type}/></td>
                  <td style={{...S.td,fontWeight:600,color:"#0f172a"}}>{fmtDate(r.start)} – {fmtDate(r.end)}</td>
                  <td style={S.td}>{r.days}</td>
                  <td style={{...S.td,color:"#64748b",fontStyle:"italic"}}>{r.reason}</td>
                  <td style={S.td}><StatusBadge status={r.status}/></td>
                  <td style={{...S.td,color:"#94a3b8",fontSize:12}}>{fmtDate(r.applied)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if(tab==="my-team") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>My Team Members</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14}}>
        {TEAM_MEMBERS.map(m=>(
          <div key={m.id} style={{padding:16,border:"1px solid #e2e8f0",borderRadius:12,textAlign:"center",transition:"box-shadow 0.15s"}}>
            <Avatar name={m.name} color="#2563eb" size={48}/>
            <p style={{fontWeight:800,color:"#0f172a",fontSize:14,margin:"10px 0 4px"}}>{m.name}</p>
            <p style={{fontSize:12,color:"#64748b",margin:0}}>{m.dept}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="reports") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>My Leave Usage</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
        {LEAVE_TYPES.slice(0,4).map(lt=>{
          const b=getBalance(lt.id);
          const pct=lt.unit==="Weeks"?0:Math.round(b.used/b.total*100);
          return (
            <div key={lt.id} style={{padding:16,borderRadius:12,border:`1px solid ${lt.color}30`,background:`${lt.color}05`}}>
              <p style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:10}}>{lt.name}</p>
              <div style={{height:6,background:"#e2e8f0",borderRadius:999,marginBottom:8,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:lt.color,borderRadius:999}}/></div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:"#64748b"}}>Used: {b.used}</span>
                <span style={{fontSize:12,fontWeight:700,color:"#0f172a"}}>Total: {b.total} {lt.unit==="Weeks"?"Wks":"Days"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  return null;
}

// ─── MANAGER VIEW ──────────────────────────────────────────────────────────────
function ManagerView({tab,requests,onUpdate,holidays,calYear,calMonth,setCalYear,setCalMonth,getLeaves}) {
  const pending = requests.filter(r=>r.status==="pending");
  const approved= requests.filter(r=>r.status==="approved");
  const stats   = [{l:"Total Requests",v:requests.length,c:"#2563eb"},{l:"Approved",v:approved.length,c:"#16a34a"},{l:"Pending",v:pending.length,c:"#d97706"},{l:"Absentee Cases",v:pending.filter(r=>r.days>=5).length,c:"#dc2626"}];

  if(tab==="dashboard") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
        {stats.map(s=>(
          <div key={s.l} style={{...S.card,textAlign:"center",borderTop:`3px solid ${s.c}`}}>
            <p style={{fontSize:28,fontWeight:900,color:s.c,margin:0}}>{s.v}</p>
            <p style={{fontSize:12,color:"#64748b",margin:"4px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr 1fr",gap:14}}>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Pending Leave Requests</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {pending.length===0&&<p style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:16}}>No pending requests 🎉</p>}
            {pending.map(r=>(
              <div key={r.id} style={{padding:12,border:"1px solid #e2e8f0",borderRadius:10,background:"#fafafa"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <Avatar name={r.empName} color="#2563eb" size={36}/>
                  <div>
                    <p style={{fontSize:13,fontWeight:800,color:"#0f172a",margin:0}}>{r.empName}</p>
                    <p style={{fontSize:11,color:"#64748b",margin:"2px 0 0"}}>{fmtDate(r.start)} - {fmtDate(r.end)} ({r.days} days)</p>
                  </div>
                </div>
                <div style={{marginBottom:6}}><LeaveTypeBadge type={r.type}/></div>
                <p style={{fontSize:11,color:"#64748b",margin:"4px 0 10px",fontStyle:"italic"}}>"{r.reason}"</p>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>onUpdate(r.id,"approved")} style={{...S.btnGreen,flex:1}}>✓ Approve</button>
                  <button onClick={()=>onUpdate(r.id,"rejected")} style={{...S.btnRed,flex:1}}>✗ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Team Leave Calendar</h3>
          <Calendar year={calYear} month={calMonth} setYear={setCalYear} setMonth={setCalMonth} holidays={holidays} getLeaves={getLeaves}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={S.card}>
            <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Notifications & Alerts</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {pending.filter(r=>r.days>=5).map(r=>(
                <div key={r.id} style={{padding:10,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8}}>
                  <p style={{fontSize:12,fontWeight:800,color:"#c2410c",margin:"0 0 3px"}}>⚠️ Absconding Alert</p>
                  <p style={{fontSize:11,color:"#7c3aed",margin:0}}>{r.empName} – {r.days} Days Uninformed</p>
                </div>
              ))}
              <div style={{padding:10,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8}}>
                <p style={{fontSize:12,fontWeight:800,color:"#1d4ed8",margin:"0 0 3px"}}>📅 Upcoming Holiday</p>
                <p style={{fontSize:11,color:"#374151",margin:0}}>Republic Day – Jan 26</p>
              </div>
              {pending.length>=2&&(
                <div style={{padding:10,background:"#fef9c3",border:"1px solid #fde68a",borderRadius:8}}>
                  <p style={{fontSize:12,fontWeight:800,color:"#92400e",margin:"0 0 3px"}}>🔄 Overlapping Leaves</p>
                  <p style={{fontSize:11,color:"#374151",margin:0}}>Multiple members on same dates (Jan 18–22)</p>
                </div>
              )}
            </div>
          </div>
          <div style={S.card}>
            <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Leave Statistics</h3>
            {[["Total Leave Requests",requests.length],["Approved Leaves",approved.length],["Pending Requests",pending.length],["Absentee Cases",pending.filter(r=>r.days>=5).length]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f5f9"}}>
                <span style={{fontSize:12,color:"#374151"}}>{l}</span>
                <span style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if(tab==="requests") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>All Leave Requests</h3>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Employee","Dept","Type","Period","Days","Status","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {requests.map(r=>(
              <tr key={r.id}>
                <td style={{...S.td,fontWeight:700,color:"#0f172a"}}>{r.empName}</td>
                <td style={{...S.td,color:"#64748b"}}>{r.dept}</td>
                <td style={S.td}><LeaveTypeBadge type={r.type}/></td>
                <td style={S.td}>{fmtDate(r.start)} – {fmtDate(r.end)}</td>
                <td style={S.td}>{r.days}</td>
                <td style={S.td}><StatusBadge status={r.status}/></td>
                <td style={S.td}>
                  {r.status==="pending"&&<div style={{display:"flex",gap:6}}>
                    <button onClick={()=>onUpdate(r.id,"approved")} style={{...S.btnGreen,padding:"4px 10px",fontSize:12}}>Approve</button>
                    <button onClick={()=>onUpdate(r.id,"rejected")} style={{...S.btnRed,padding:"4px 10px",fontSize:12}}>Reject</button>
                  </div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if(tab==="team-calendar") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>Team Leave Calendar</h3>
      <Calendar year={calYear} month={calMonth} setYear={setCalYear} setMonth={setCalMonth} holidays={holidays} getLeaves={getLeaves}/>
    </div>
  );

  if(tab==="reports") {
    const deptData = ["Engineering","Sales","HR","Finance"].map(dept=>({
      dept, earned:requests.filter(r=>r.dept===dept&&r.type==="earned").length,
      sick:requests.filter(r=>r.dept===dept&&r.type==="sick").length,
      other:requests.filter(r=>r.dept===dept&&!["earned","sick"].includes(r.type)).length,
    }));
    return (
      <div style={S.card}>
        <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>Department Leave Report</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="dept" tick={{fontSize:13}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Legend/>
            <Bar dataKey="earned" name="Earned" fill="#2563eb"/><Bar dataKey="sick" name="Sick" fill="#d97706"/><Bar dataKey="other" name="Other" fill="#7c3aed"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
}

// ─── HR VIEW ───────────────────────────────────────────────────────────────────
function HRView({tab,requests,holidays,onAddHoliday,onDeleteHoliday}) {
  const ltData=[{name:"Earned",value:45,color:"#2563eb"},{name:"Sick",value:25,color:"#d97706"},{name:"Mat./Pat.",value:15,color:"#7c3aed"},{name:"LWP",value:15,color:"#dc2626"}];
  const monthlyData=["Jan","Feb","Mar","Apr","May","Jun"].map((m,i)=>({month:m,leaves:[124,110,115,98,105,120][i]}));

  if(tab==="dashboard") return (
    <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Analytics Overview</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <p style={{fontSize:12,fontWeight:700,color:"#64748b",margin:"0 0 8px"}}>Leave Type Distribution</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart><Pie data={ltData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value">
                  {ltData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie><Tooltip formatter={v=>`${v}%`}/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:8}}>
              <p style={{fontSize:12,fontWeight:700,color:"#64748b",margin:0}}>Absenteeism Rate</p>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:28,fontWeight:900,color:"#dc2626",margin:0}}>8.2%</p>
                <p style={{fontSize:11,color:"#64748b",margin:"2px 0 0"}}>This Month</p>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:20,fontWeight:700,color:"#d97706",margin:0}}>4.5%</p>
                <p style={{fontSize:11,color:"#64748b",margin:"2px 0 0"}}>Last Month</p>
              </div>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Leave Policy Settings</h3>
          {[["Carry Forward Limit","Up to 45 Days"],["Leave Encashment","Not Permitted"],["Maternity Leave","26 Weeks"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>{l}</span>
              <span style={{fontSize:13,color:"#64748b"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:0}}>Karnataka Holidays 2026</h3>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {holidays.map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,background:"#f8fafc"}}>
                <div>
                  <span style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{h.name}</span>
                  {h.tentative&&<span style={{fontSize:10,color:"#d97706",marginLeft:4}}>(Tentative)</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:"#64748b"}}>{fmtDate(h.date)}</span>
                  <button onClick={()=>onDeleteHoliday(h.id)} style={{border:"none",background:"none",color:"#dc2626",cursor:"pointer",fontSize:14,padding:2}}>🗑</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onAddHoliday} style={{...S.btnBlue,width:"100%",marginTop:12,fontSize:13,padding:"8px 0"}}>+ Add Holiday</button>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Alerts & Exceptions</h3>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{padding:10,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8}}><p style={{fontSize:12,fontWeight:800,color:"#c2410c",margin:0}}>⚠️ Absconding Alert</p><p style={{fontSize:11,color:"#374151",marginTop:3}}>5+ Days Uninformed Leave</p></div>
            <div style={{padding:10,background:"#fef9c3",border:"1px solid #fde68a",borderRadius:8}}><p style={{fontSize:12,fontWeight:800,color:"#92400e",margin:0}}>🗳️ Election/Bandh Holiday</p><p style={{fontSize:11,color:"#374151",marginTop:3}}>Handle as Special Cases</p></div>
          </div>
        </div>
      </div>
    </div>
  );

  if(tab==="holiday-setup") return (
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:0}}>Holiday Management – Karnataka 2026</h3>
        <button onClick={onAddHoliday} style={S.btnBlue}>+ Add Holiday</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Holiday Name","Date","Type","Status","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {holidays.map((h,i)=>(
            <tr key={i}>
              <td style={{...S.td,fontWeight:700,color:"#0f172a"}}>{h.name}</td>
              <td style={S.td}>{fmtFull(h.date)}</td>
              <td style={S.td}><span style={{fontSize:12,padding:"2px 10px",borderRadius:999,background:h.type==="national"?"#dbeafe":"#d1fae5",color:h.type==="national"?"#1d4ed8":"#065f46",fontWeight:700}}>{h.type.charAt(0).toUpperCase()+h.type.slice(1)}</span></td>
              <td style={S.td}>{h.tentative?<span style={{fontSize:12,color:"#d97706",fontWeight:700}}>🟡 Tentative</span>:<span style={{fontSize:12,color:"#15803d",fontWeight:700}}>✅ Confirmed</span>}</td>
              <td style={S.td}><button onClick={()=>onDeleteHoliday(h.id)} style={{...S.btnRed,padding:"4px 12px",fontSize:12}}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if(tab==="leave-policies") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>Leave Policy Settings</h3>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Leave Type","Entitlement","Carry Forward","Encashment"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>
          {[["Earned Leave","18 Days/Year","Up to 45 Days","No"],["Sick Leave","12 Days/Year","No","No"],["Menstrual Leave","12 Days/Year","No","No"],["Maternity Leave","26 Weeks","No","No"],["Paternity Leave","5 Days/Child","No","No"],["Bereavement Leave","3 Days","No","No"],["Leave Without Pay","Max 90 Days","No","No"]].map(([n,...v])=>(
            <tr key={n}>
              <td style={{...S.td,fontWeight:700,color:"#0f172a"}}>{n}</td>
              {v.map((val,i)=><td key={i} style={{...S.td,color:val!=="No"&&i===1?"#15803d":"#374151",fontWeight:val!=="No"&&i===1?700:400}}>{val}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if(tab==="reports") {
    const ltData2=[{name:"Earned",value:45,color:"#2563eb"},{name:"Sick",value:25,color:"#d97706"},{name:"Mat./Pat.",value:15,color:"#7c3aed"},{name:"LWP",value:15,color:"#dc2626"}];
    const monthly=["Jan","Feb","Mar","Apr","May","Jun"].map((m,i)=>({month:m,leaves:[124,110,115,98,105,120][i],rate:[8.4,7.2,7.8,6.5,7.0,8.1][i]}));
    return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Monthly Leave Summary</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="leaves" name="Total Leaves" fill="#2563eb"/></BarChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Leave Type Distribution</h3>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <ResponsiveContainer width="55%" height={180}>
              <PieChart><Pie data={ltData2} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value">{ltData2.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>`${v}%`}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ltData2.map(d=>(<div key={d.name} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:d.color}}/><span style={{fontSize:12,color:"#374151"}}>{d.name}</span><span style={{fontSize:12,fontWeight:700,color:"#0f172a",marginLeft:"auto"}}>{d.value}%</span></div>))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── ADMIN VIEW ────────────────────────────────────────────────────────────────
function AdminView({tab,holidays,onAddHoliday,onDeleteHoliday,showNotification}) {
  const [settings,setSettings] = useState({absconding:5,overlap:true,approvalLevels:"Single",state:"Karnataka"});

  if(tab==="dashboard"||tab==="leave-types") return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={S.card}>
        <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 14px"}}>Leave Type Settings</h3>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>{["Leave Type","Entitlement","Carry Fwd","Encashment"].map(h=><th key={h} style={{...S.th,fontSize:11}}>{h}</th>)}</tr></thead>
            <tbody>
              {[["Earned Leave","18 Days/Year","Up to 45 Days","No"],["Sick Leave","12 Days/Year","No","No"],["Maternity Leave","26 Weeks","No","No"],["Paternity Leave","5 Days/Child","No","No"],["Leave Without Pay","Max 90 Days","No","No"]].map(([n,...v])=>(
                <tr key={n}><td style={{...S.td,fontWeight:700,color:"#0f172a",fontSize:13}}>{n}</td>{v.map((val,i)=><td key={i} style={{...S.td,fontSize:13}}>{val}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={()=>showNotification("✅ Settings saved!")} style={{...S.btnBlue,marginTop:12,fontSize:13}}>Save Settings</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:0}}>Holiday Setup – Karnataka 2026</h3>
            <button onClick={onAddHoliday} style={{...S.btnBlue,padding:"5px 12px",fontSize:12}}>+ Add</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto"}}>
            {holidays.map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderRadius:8,background:"#f8fafc"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{h.name}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:"#64748b"}}>{fmtDate(h.date)}</span>
                  <button onClick={()=>onDeleteHoliday(h.id)} style={{border:"none",background:"none",color:"#dc2626",cursor:"pointer",fontSize:14}}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>System Settings</h3>
          {[["Absconding Alert","5 Days Uninformed Absence"],["Overlapping Leave Alert","Flag if 2+ Members on Same Dates"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <span style={{fontSize:13,fontWeight:700,color:"#374151"}}>{l}</span>
              <span style={{fontSize:12,color:"#64748b"}}>{v}</span>
            </div>
          ))}
          <button onClick={()=>showNotification("✅ Settings updated!")} style={{...S.btnBlue,marginTop:12,fontSize:13}}>Update Settings</button>
        </div>
      </div>
    </div>
  );

  if(tab==="holiday-setup") return (
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:0}}>Holiday Management</h3>
        <button onClick={onAddHoliday} style={S.btnBlue}>+ Add Holiday</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {holidays.map((h,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:14,border:"1px solid #e2e8f0",borderRadius:10}}>
            <div>
              <p style={{fontWeight:800,color:"#0f172a",margin:0}}>{h.name}</p>
              <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0"}}>{fmtFull(h.date)}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:12,padding:"2px 10px",borderRadius:999,background:h.type==="national"?"#dbeafe":"#d1fae5",color:h.type==="national"?"#1d4ed8":"#065f46",fontWeight:700}}>{h.type}</span>
              {h.tentative&&<span style={{fontSize:11,color:"#d97706",fontWeight:700}}>Tentative</span>}
              <button onClick={()=>onDeleteHoliday(h.id)} style={{...S.btnRed,padding:"5px 12px",fontSize:12}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if(tab==="settings") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>System Configuration</h3>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {[
          {l:"Absconding Alert Threshold",desc:"Days before alert is triggered",val:`${settings.absconding} Days`},
          {l:"Overlapping Leave Warning",desc:"Alert when 2+ members take leave on same dates",val:settings.overlap?"Enabled":"Disabled"},
          {l:"Leave Approval Flow",desc:"Number of approval levels required",val:settings.approvalLevels+" Level"},
          {l:"Holiday Calendar Region",desc:"State-specific holidays applied",val:settings.state},
        ].map(s=>(
          <div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:14,border:"1px solid #e2e8f0",borderRadius:10}}>
            <div>
              <p style={{fontWeight:700,color:"#0f172a",margin:0,fontSize:14}}>{s.l}</p>
              <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0"}}>{s.desc}</p>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:"#2563eb"}}>{s.val}</span>
          </div>
        ))}
        <button onClick={()=>showNotification("✅ All settings saved!")} style={{...S.btnBlue,alignSelf:"flex-start",marginTop:4}}>Save All Settings</button>
      </div>
    </div>
  );
  return null;
}

// ─── REPORTS VIEW ──────────────────────────────────────────────────────────────
function ReportsView({tab,requests}) {
  const monthly=[
    {m:"Jan",leaves:124,rate:8.4},{m:"Feb",leaves:110,rate:7.2},{m:"Mar",leaves:115,rate:7.8},
    {m:"Apr",leaves:98,rate:6.5},{m:"May",leaves:105,rate:7.0},{m:"Jun",leaves:120,rate:8.1},
  ];
  const ltData=[{name:"Earned Leave",value:45,color:"#2563eb"},{name:"Sick Leave",value:25,color:"#d97706"},{name:"Mat./Paternity",value:15,color:"#7c3aed"},{name:"Leave Without Pay",value:15,color:"#dc2626"}];
  const deptData=[{dept:"Engineering",earned:10,sick:5,maternity:8,lwp:5},{dept:"Sales",earned:8,sick:4,maternity:4,lwp:2},{dept:"HR",earned:6,sick:6,maternity:6,lwp:2},{dept:"Finance",earned:9,sick:3,maternity:5,lwp:3}];
  const yearlyData=[{year:"2024",avg:310,abs:9.5},{year:"2025",avg:298,abs:8.8},{year:"2026",avg:325,abs:9.2}];

  if(tab==="dashboard") return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Monthly Leave Summary – Jan 2026</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="leaves" name="Total Leave Days" fill="#2563eb" radius={[4,4,0,0]}/></BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:20,marginTop:10,justifyContent:"center"}}>
            <span style={{fontSize:12,color:"#374151"}}>📊 Total: <strong style={{color:"#2563eb"}}>124</strong></span>
            <span style={{fontSize:12,color:"#374151"}}>📉 Absentee: <strong style={{color:"#dc2626"}}>8.4%</strong></span>
            <span style={{fontSize:12,color:"#374151"}}>⚠️ Uninformed: <strong style={{color:"#d97706"}}>9</strong></span>
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Department-wise Leave Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="dept" type="category" tick={{fontSize:11}} width={75}/><Tooltip/><Legend/>
              <Bar dataKey="earned" name="Earned" stackId="a" fill="#2563eb"/><Bar dataKey="sick" name="Sick" stackId="a" fill="#d97706"/><Bar dataKey="maternity" name="Mat./Pat." stackId="a" fill="#7c3aed"/><Bar dataKey="lwp" name="LWP" stackId="a" fill="#dc2626"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Leave Type Breakdown</h3>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart><Pie data={ltData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">{ltData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>`${v}%`}/></PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexDirection:"column",gap:10,flex:1}}>
              {ltData.map(d=>(<div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:d.color}}/><span style={{fontSize:12,color:"#374151"}}>{d.name}</span></div><span style={{fontSize:13,fontWeight:800,color:"#0f172a"}}>{d.value}%</span></div>))}
            </div>
          </div>
        </div>
        <div style={S.card}>
          <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 12px"}}>Quick Stats – Jan 2026</h3>
          {[["Total Leave Requests",requests.length,"#2563eb"],["Approved Leaves",requests.filter(r=>r.status==="approved").length,"#16a34a"],["Pending Requests",requests.filter(r=>r.status==="pending").length,"#d97706"],["Absentee Cases",requests.filter(r=>r.status==="pending"&&r.days>=5).length,"#dc2626"],["Absenteeism Rate","8.2%","#dc2626"]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,marginBottom:4,background:"#f8fafc"}}>
              <span style={{fontSize:13,color:"#374151"}}>{l}</span>
              <span style={{fontSize:16,fontWeight:900,color:c}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if(tab==="leave-analysis") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>Annual Leave Analytics – 2027 Forecast</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <h4 style={{fontSize:13,fontWeight:700,color:"#64748b",margin:"0 0 12px"}}>Yearly Leave Trends (2024–2026)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yearlyData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="year" tick={{fontSize:12}}/><YAxis yAxisId="l" tick={{fontSize:12}}/><YAxis yAxisId="r" orientation="right" tick={{fontSize:11}}/><Tooltip/><Legend/>
              <Line yAxisId="l" type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2.5} dot={{r:5}} name="Avg Leave Days"/>
              <Line yAxisId="r" type="monotone" dataKey="abs" stroke="#dc2626" strokeWidth={2.5} dot={{r:5}} name="Absenteeism %"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 style={{fontSize:13,fontWeight:700,color:"#64748b",margin:"0 0 12px"}}>2027 Forecast</h4>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            <div style={{padding:14,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,textAlign:"center"}}>
              <p style={{fontSize:22,fontWeight:900,color:"#1d4ed8",margin:0}}>325</p>
              <p style={{fontSize:11,color:"#374151",margin:"3px 0 0"}}>Estimated Days</p>
              <p style={{fontSize:10,color:"#16a34a",margin:"2px 0 0",fontWeight:700}}>↑ 5% vs Last Year</p>
            </div>
            <div style={{padding:14,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,textAlign:"center"}}>
              <p style={{fontSize:14,fontWeight:900,color:"#15803d",margin:0}}>Jul–Aug</p>
              <p style={{fontSize:11,color:"#374151",margin:"3px 0 0"}}>Peak Period</p>
              <p style={{fontSize:10,color:"#64748b",margin:"2px 0 0",fontWeight:600}}>72 Projected</p>
            </div>
            <div style={{padding:14,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,textAlign:"center"}}>
              <p style={{fontSize:13,fontWeight:900,color:"#c2410c",margin:0}}>⚠️ High</p>
              <p style={{fontSize:11,color:"#374151",margin:"3px 0 0"}}>Overlap Risk</p>
              <p style={{fontSize:10,color:"#64748b",margin:"2px 0 0",fontWeight:600}}>Plan Staffing</p>
            </div>
          </div>
          <div style={{padding:14,border:"1px solid #e2e8f0",borderRadius:10}}>
            <h4 style={{fontSize:12,fontWeight:800,color:"#374151",margin:"0 0 10px"}}>Projected Leave Distribution 2027</h4>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart><Pie data={[{name:"Earned",value:42,color:"#2563eb"},{name:"Sick",value:20,color:"#d97706"},{name:"Mat./Pat.",value:18,color:"#7c3aed"},{name:"LWP",value:20,color:"#dc2626"}]} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">{[{color:"#2563eb"},{color:"#d97706"},{color:"#7c3aed"},{color:"#dc2626"}].map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>`${v}%`}/></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  if(tab==="utilization"||tab==="dept-trends") return (
    <div style={S.card}>
      <h3 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 16px"}}>{tab==="utilization"?"Leave Utilization Analysis":"Department-wise Trends"}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="dept" tick={{fontSize:13}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Legend/>
          <Bar dataKey="earned" name="Earned" fill="#2563eb" radius={[4,4,0,0]}/><Bar dataKey="sick" name="Sick" fill="#d97706" radius={[4,4,0,0]}/><Bar dataKey="maternity" name="Mat./Pat." fill="#7c3aed" radius={[4,4,0,0]}/><Bar dataKey="lwp" name="LWP" fill="#dc2626" radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
  return null;
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,    setUser]     = useState(null);
  const [tab,     setTab]      = useState("dashboard");
  const [requests,setRequests] = useState([]);
  const [holidays,setHolidays] = useState([]);
  const [calYear, setCalYear]  = useState(2026);
  const [calMonth,setCalMonth] = useState(0);
  const [modal,   setModal]    = useState(null);
  const [toast,   setToast]    = useState(null);
  const [loading, setLoading]  = useState(true);
  const [newLeave,   setNewLeave]   = useState({type:"earned",start:"",end:"",reason:""});
  const [newHoliday, setNewHoliday] = useState({name:"",date:"",type:"national"});

  // Safe localStorage getter
  const safeGet = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      return defaultValue;
    }
  };

  // Safe localStorage setter
  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error writing to localStorage:", e);
    }
  };

  // Load from storage
  useEffect(() => {
    setRequests(safeGet("lms_requests", INITIAL_REQUESTS));
    setHolidays(safeGet("lms_holidays", INITIAL_HOLIDAYS));
    const savedUser = safeGet("lms_user", null);
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  const persist = (key, val) => safeSet(key, val);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const login = (u) => {
    setUser(u);
    setTab("dashboard");
    persist("lms_user", u);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lms_user");
  };

  const submitLeave = () => {
    if (!newLeave.start || !newLeave.end || !newLeave.reason.trim()) {
      showToast("Please fill all fields", "error");
      return;
    }
    const s = new Date(newLeave.start);
    const e = new Date(newLeave.end);
    if (e < s) {
      showToast("End date must be after start date", "error");
      return;
    }
    const days = Math.ceil((e - s) / 86400000) + 1;
    const req = {
      id: Date.now(),
      empId: user.id,
      empName: user.name,
      dept: user.dept || "Engineering",
      type: newLeave.type,
      start: newLeave.start,
      end: newLeave.end,
      days,
      status: "pending",
      reason: newLeave.reason,
      applied: new Date().toISOString().split("T")[0],
    };
    const updated = [...requests, req];
    setRequests(updated);
    persist("lms_requests", updated);
    setModal(null);
    setNewLeave({ type: "earned", start: "", end: "", reason: "" });
    showToast("✅ Leave applied successfully!");
  };

  const updateStatus = (id, status) => {
    const updated = requests.map((r) => (r.id === id ? { ...r, status } : r));
    setRequests(updated);
    persist("lms_requests", updated);
    showToast(status === "approved" ? "✅ Leave Approved!" : "❌ Leave Rejected!");
  };

  const addHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      showToast("Please fill all fields", "error");
      return;
    }
    const updated = [...holidays, { ...newHoliday, id: Date.now() }];
    setHolidays(updated);
    persist("lms_holidays", updated);
    setModal(null);
    setNewHoliday({ name: "", date: "", type: "national" });
    showToast("✅ Holiday added!");
  };

  const deleteHoliday = (id) => {
    const updated = holidays.filter((h) => h.id !== id);
    setHolidays(updated);
    persist("lms_holidays", updated);
    showToast("Holiday deleted");
  };

  const getLeaves = (y, m, d) =>
    requests.filter((r) => {
      const s = new Date(r.start);
      const e = new Date(r.end);
      const check = new Date(y, m, d);
      return r.status === "approved" && check >= s && check <= e;
    });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "system-ui,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
          <p style={{ color: "#64748b", fontSize: 16, fontWeight: 600 }}>Loading Leave Management System...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={login} />;

  const tabs = ROLE_TABS[user.role] || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            padding: "12px 24px",
            borderRadius: 10,
            background: toast.type === "error" ? "#dc2626" : "#16a34a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            animation: "fadeIn 0.2s",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto" }}>
          <div>
            <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Leave Management System</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "2px 0 0" }}>{DASH_TITLE[user.role]}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>Welcome, {user.name}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0", textTransform: "capitalize" }}>
                {user.role} • {user.dept}
              </p>
            </div>
            <Avatar name={user.name} color={ROLE_COLORS[user.role]} size={40} />
            <button
              onClick={logout}
              style={{
                fontSize: 12,
                color: "#dc2626",
                fontWeight: 700,
                border: "1px solid #fca5a5",
                padding: "5px 14px",
                borderRadius: 8,
                background: "#fff5f5",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <div style={{ padding: "0 24px", maxWidth: 1200, margin: "0 auto", display: "flex", gap: 4, overflowX: "auto", borderTop: "1px solid #f1f5f9" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                border: "none",
                borderBottom: tab === t.id ? "2.5px solid #2563eb" : "2.5px solid transparent",
                color: tab === t.id ? "#2563eb" : "#64748b",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        {user.role === "employee" && (
          <EmployeeView
            tab={tab}
            user={user}
            requests={requests}
            holidays={holidays}
            calYear={calYear}
            calMonth={calMonth}
            setCalYear={setCalYear}
            setCalMonth={setCalMonth}
            getLeaves={getLeaves}
            onApplyLeave={() => setModal("apply-leave")}
          />
        )}
        {user.role === "manager" && (
          <ManagerView
            tab={tab}
            requests={requests}
            onUpdate={updateStatus}
            holidays={holidays}
            calYear={calYear}
            calMonth={calMonth}
            setCalYear={setCalYear}
            setCalMonth={setCalMonth}
            getLeaves={getLeaves}
          />
        )}
        {user.role === "hr" && (
          <HRView
            tab={tab}
            requests={requests}
            holidays={holidays}
            onAddHoliday={() => setModal("add-holiday")}
            onDeleteHoliday={deleteHoliday}
          />
        )}
        {user.role === "admin" && (
          <AdminView
            tab={tab}
            holidays={holidays}
            onAddHoliday={() => setModal("add-holiday")}
            onDeleteHoliday={deleteHoliday}
            showNotification={showToast}
          />
        )}
        {user.role === "reports" && <ReportsView tab={tab} requests={requests} />}
      </div>

      {/* Apply Leave Modal */}
      {modal === "apply-leave" && (
        <Modal title="Apply for Leave" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={S.label}>Leave Type</label>
              <select value={newLeave.type} onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })} style={S.input}>
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.total} {lt.unit})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={S.label}>Start Date</label>
                <input type="date" value={newLeave.start} onChange={(e) => setNewLeave({ ...newLeave, start: e.target.value })} style={S.input} />
              </div>
              <div>
                <label style={S.label}>End Date</label>
                <input type="date" value={newLeave.end} onChange={(e) => setNewLeave({ ...newLeave, end: e.target.value })} style={S.input} />
              </div>
            </div>
            <div>
              <label style={S.label}>Reason for Leave</label>
              <textarea value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} rows={3} placeholder="Please describe the reason..." style={S.textarea} />
            </div>
            {newLeave.start && newLeave.end && new Date(newLeave.end) >= new Date(newLeave.start) && (
              <div style={{ padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8 }}>
                <p style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 700, margin: 0 }}>
                  📋 {Math.ceil((new Date(newLeave.end) - new Date(newLeave.start)) / 86400000) + 1} days of leave requested
                </p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => setModal(null)} style={S.btnGray}>
                Cancel
              </button>
              <button onClick={submitLeave} style={S.btnBlue}>
                Submit Leave Request
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Holiday Modal */}
      {modal === "add-holiday" && (
        <Modal title="Add New Holiday" onClose={() => setModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={S.label}>Holiday Name</label>
              <input type="text" value={newHoliday.name} onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })} placeholder="e.g., Diwali" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Date</label>
              <input type="date" value={newHoliday.date} onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Type</label>
              <select value={newHoliday.type} onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })} style={S.input}>
                <option value="national">National Holiday</option>
                <option value="state">State Holiday</option>
                <option value="optional">Optional Holiday</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => setModal(null)} style={S.btnGray}>
                Cancel
              </button>
              <button onClick={addHoliday} style={S.btnBlue}>
                Add Holiday
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
