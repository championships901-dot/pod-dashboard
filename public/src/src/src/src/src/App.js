import { useState, useMemo, useEffect } from "react";
import { fetchDashboardData } from "./dataLoader";
import CONFIG from "./config";

const PODS = ["Platform","Foundation","O2C","I2P","RTR","FP&A","THR-TA","THR-ES","Banking","Insurance"];
const RELS = ["R1","R2","R3","R4"];
const SC = {"Completed":"#10b981","On Track":"#3b82f6","At Risk":"#f59e0b","Delayed":"#ef4444","Yet to Start":"#6b7280"};

const CAP_POD = [
  {n:"FP&A",t:143,f:120,lw:5},{n:"Foundation",t:100,f:85,lw:3},{n:"Platform",t:80,f:68,lw:2},
  {n:"THR",t:60,f:52,lw:1},{n:"Banking",t:52,f:45,lw:2},{n:"Insurance",t:35,f:30,lw:0},
  {n:"O2C",t:48,f:40,lw:3},{n:"I2P",t:42,f:35,lw:1},{n:"RTR",t:38,f:32,lw:2}
];
const CAP_ROLE = [
  {n:"Engg Exec Roles",t:95,f:55,lw:0},{n:"Engineering",t:588,f:315,lw:15},
  {n:"Domain/Functional",t:137,f:68,lw:0}
];

// Risk data
const RISK_ITEMS = {
  Overview: [],
  Platform: [
    {pr:"P1",title:"API Gateway Latency Spikes",age:12,impact:"8 Days delay · $120K",mit:"Load balancing, connection pooling",owner:"Sarah Kim"},
    {pr:"P2",title:"Microservices Dependency Chain",age:8,impact:"5 Days delay · $65K",mit:"Decouple services, circuit breakers",owner:"Sarah Kim"}
  ],
  Foundation: [
    {pr:"P1",title:"Master Data Quality Issues in Core Config",age:12,impact:"12 Days delay · $180K",mit:"Automated data quality checks, data stewardship team",owner:"Michael Chen"},
    {pr:"P1",title:"Work Planning Module Performance",age:14,impact:"10 Days delay · $75K",mit:"Redis caching, optimize DB indexes",owner:"Michael Chen"},
    {pr:"P2",title:"Data Migration Validation Gaps",age:9,impact:"6 Days delay · $45K",mit:"Automated reconciliation scripts",owner:"Michael Chen"}
  ],
  "FP&A": [
    {pr:"P1",title:"Forecasting Integration Failure",age:18,impact:"15 Days delay · $200K",mit:"Redesign integration layer",owner:"Raj Patel"},
    {pr:"P2",title:"Budget Consolidation Performance",age:6,impact:"4 Days delay · $35K",mit:"Optimize SQL queries",owner:"Raj Patel"}
  ],
  O2C: [{pr:"P2",title:"Invoice Processing Bottleneck",age:10,impact:"7 Days delay · $55K",mit:"Parallel processing pipeline",owner:"Lisa Wang"}],
  I2P: [{pr:"P3",title:"Vendor Portal Accessibility",age:5,impact:"3 Days delay · $20K",mit:"WCAG compliance audit",owner:"Tom Harris"}],
  RTR: [{pr:"P3",title:"Journal Entry Automation Gaps",age:7,impact:"4 Days delay · $30K",mit:"Expand rule engine",owner:"Anna Lee"}],
  Banking: [{pr:"P3",title:"Regulatory Compliance Scope",age:4,impact:"5 Days delay · $40K",mit:"Scope review with compliance",owner:"David Park"}],
  Insurance: [
    {pr:"P2",title:"Claims Processing Integration",age:11,impact:"8 Days delay · $90K",mit:"API versioning, backward compat",owner:"Maria Santos"},
    {pr:"P3",title:"Policy Engine Rule Conflicts",age:6,impact:"3 Days delay · $25K",mit:"Rule conflict detection",owner:"Maria Santos"}
  ]
};

// Milestone data
const MILES = {
  Foundation: {lead:"Michael Chen",color:"#ef4444",rels:[
    {name:"MVP Release 1",feat:8,lastWeek:[
      {task:"FDD",completed:"95%",notes:"Conditional sign off by PO done, Formal business sign-off pending"},
      {task:"Tech design of 8 features",completed:"95%",notes:"Sign off from Sid Mehta on the LLD"},
      {task:"UI/UX for 8 Features",completed:"95%",notes:"Conditional sign off by PO done"},
      {task:"UAT status",completed:"95%",notes:"E-2-E integrated testing with O2C scope"},
      {task:"APT",completed:"90%",notes:"Significant progress, 9/10 use cases passed, 1 WIP"}
    ],nextWeek:[
      {task:"FDD",activity:"Work with business on the sign off",risk:"Business Sign off",notes:"Conditional sign off by PO done, Formal pending"},
      {task:"Tech design",activity:"Sign off from Sid Mehta on the LLD",risk:"Rework of completed dev components",notes:"-"},
      {task:"UI/UX",activity:"Work with business on the sign off",risk:"Business Sign off",notes:"Conditional sign off pending"},
      {task:"UAT",activity:"E-2-E integrated testing with O2C scope",risk:"Business Sign off",notes:"Conditional sign off pending"},
      {task:"APT",activity:"APT Closure",risk:"-",notes:"9/10 use cases passed, 1 WIP"}
    ]},
    {name:"MVP Release 2",feat:34,lastWeek:[
      {task:"FDD",completed:"92%",notes:"Conditional sign off by PO done"},
      {task:"Tech design",completed:"50%",notes:"Pending LLD for Forecasting, Capacity planning, BAT"},
      {task:"UI/UX",completed:"95%",notes:"Conditional sign off by PO done"},
      {task:"Build/QA (168 User Stories)",completed:"Build-100% / QA-67%",notes:"77 Defects, 13 in re-test, 64 to fix"}
    ],nextWeek:[
      {task:"FDD",activity:"Complete pending FDDs",risk:"Business Sign off",notes:"Formal sign-off pending"},
      {task:"Tech design",activity:"Complete pending LLD \u2013 Forecasting, Capacity, BAT",risk:"Rework of dev components",notes:"-"},
      {task:"UI/UX",activity:"Work with business on the sign off",risk:"Business Sign off",notes:"Formal pending"},
      {task:"Build/QA",activity:"Test remaining 33% test cases",risk:"-",notes:"77 Defects, 13 in re-test"}
    ]},
    {name:"MVP Release 3",feat:136,lastWeek:[
      {task:"FDD",completed:"88%",notes:"Complete Productivity FDD"},
      {task:"Tech design of 136 features",completed:"Yet to Start",notes:"-"},
      {task:"UI/UX",completed:"-",notes:"Anticipated delay of 1 week for VD readiness due to FDD delay"},
      {task:"Design/Build/QA",completed:"-",notes:"Anticipated delay in dev cycle due to HTML delays"}
    ],nextWeek:[
      {task:"FDD",activity:"Complete Productivity FDD, work with business on sign off",risk:"Business Sign Off",notes:"Formal sign-off pending"},
      {task:"Tech design (136 features)",activity:"Begin architecture planning",risk:"-",notes:"-"},
      {task:"UI/UX",activity:"Complete pending UI/UX",risk:"1 week delay anticipated",notes:"-"},
      {task:"Design/Build/QA",activity:"Design/Build/QA for User Stories",risk:"HTML delays \u2013 to be assessed",notes:"-"}
    ]}
  ]},
  Platform: {lead:"Sarah Kim",color:"#10b981",rels:[
    {name:"MVP Release 1",feat:11,lastWeek:[
      {task:"FDD",completed:"100%",notes:"All features delivered and signed off"},
      {task:"Tech/Data/AI Arch",completed:"100%",notes:"Approved by CTO"},
      {task:"UI/UX",completed:"100%",notes:"Design system finalized, component library ready"},
      {task:"Build",completed:"100%",notes:"Code freeze complete, all stories closed"},
      {task:"QA Testing",completed:"85%",notes:"42/50 test cases passed, 8 remaining"}
    ],nextWeek:[
      {task:"QA Testing",activity:"Complete remaining 8 regression test cases",risk:"Timeline pressure",notes:"Target 100% by Friday"},
      {task:"UAT prep",activity:"Set up UAT environment, create test scripts",risk:"-",notes:"Env provisioning done"},
      {task:"Release notes",activity:"Draft release notes for stakeholder review",risk:"-",notes:"-"}
    ]},
    {name:"MVP Release 2",feat:22,lastWeek:[
      {task:"FDD",completed:"95%",notes:"Conditional sign off by PO"},
      {task:"Tech design",completed:"90%",notes:"2 components need redesign"},
      {task:"Build (168 stories)",completed:"78%",notes:"131/168 stories completed"},
      {task:"QA Testing",completed:"45%",notes:"Test environment stable"}
    ],nextWeek:[
      {task:"FDD",activity:"Final FDD sign-off meeting",risk:"Business Sign off",notes:"Conditional"},
      {task:"Tech design",activity:"Complete Notifications LLD",risk:"Rework needed",notes:"2 redesigns"},
      {task:"Build",activity:"Complete remaining 37 stories",risk:"Velocity concern",notes:"131/168 done"},
      {task:"QA Testing",activity:"Execute integration test suite",risk:"-",notes:"Env stable"}
    ]}
  ]},
  O2C: {lead:"Lisa Wang",color:"#f59e0b",rels:[
    {name:"MVP Release 1",feat:10,lastWeek:[
      {task:"FDD",completed:"100%",notes:"All signed off"},
      {task:"Build",completed:"100%",notes:"Code complete, all stories delivered"},
      {task:"QA Testing",completed:"75%",notes:"Environment stabilized, test data issues resolved"},
      {task:"UAT",completed:"20%",notes:"UAT cycle 1 complete, key users on leave"}
    ],nextWeek:[
      {task:"QA Testing",activity:"Complete functional testing backlog",risk:"Test data issues",notes:"New data set loaded"},
      {task:"UAT",activity:"Begin UAT cycle 2",risk:"Business availability",notes:"Key users back Monday"},
      {task:"Defect triage",activity:"Resolve 12 open P2 defects",risk:"-",notes:"Daily triage calls"}
    ]}
  ]},
  I2P: {lead:"Tom Harris",color:"#f59e0b",rels:[
    {name:"MVP Release 1",feat:8,lastWeek:[
      {task:"FDD / Tech Arch",completed:"100%",notes:"All signed off and reviewed"},
      {task:"Build",completed:"55%",notes:"Waiting for Platform API integration"},
      {task:"QA Testing",completed:"10%",notes:"Test environment provisioning in progress"}
    ],nextWeek:[
      {task:"Build",activity:"Complete remaining integration modules",risk:"Platform API dependency",notes:"API due Wednesday"},
      {task:"QA Testing",activity:"Complete test framework setup",risk:"Test environment",notes:"Provisioning ETA Tuesday"},
      {task:"Data setup",activity:"Load test data for integration testing",risk:"-",notes:"-"}
    ]}
  ]},
  RTR: {lead:"Anna Lee",color:"#10b981",rels:[
    {name:"MVP Release 1",feat:6,lastWeek:[
      {task:"BRD/FDD",completed:"100%",notes:"All signed off"},
      {task:"Tech Arch",completed:"80%",notes:"Data model review in progress"},
      {task:"Build",completed:"0%",notes:"Sprint 1 planned for next week"}
    ],nextWeek:[
      {task:"Tech Arch",activity:"Complete data model review",risk:"-",notes:"On track"},
      {task:"Build",activity:"Sprint 1 kickoff, 8 stories planned",risk:"-",notes:"Team onboarded"},
      {task:"QA",activity:"Test planning and strategy document",risk:"-",notes:"-"}
    ]}
  ]},
  "FP&A": {lead:"Raj Patel",color:"#f59e0b",rels:[
    {name:"MVP Release 1",feat:9,lastWeek:[
      {task:"BRD/FDD",completed:"85%",notes:"2 features descoped from initial plan"},
      {task:"Tech design",completed:"60%",notes:"New patterns needed for consolidation"},
      {task:"UI/UX",completed:"70%",notes:"Dashboard mockups in stakeholder review"}
    ],nextWeek:[
      {task:"BRD/FDD",activity:"Complete forecasting FDD",risk:"Scope creep",notes:"2 features descoped"},
      {task:"Tech design",activity:"Consolidation module LLD",risk:"Complexity",notes:"New patterns needed"},
      {task:"UI/UX",activity:"Finalize dashboard mockups, begin detail screens",risk:"-",notes:"Review feedback due"}
    ]}
  ]}
};


export default function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selR, setSelR] = useState("All");
  const [selP, setSelP] = useState("All");
  const [capTab, setCapTab] = useState("pod");
  const [riskTab, setRiskTab] = useState("Overview");
  const [mileTab, setMileTab] = useState("Foundation");
  const [mileWeek, setMileWeek] = useState("last");

  // Load data on mount and set up auto-refresh
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchDashboardData();
      setRawData(data);
      setLastRefresh(new Date());
      setLoading(false);
    }
    load();
    
    if (CONFIG.REFRESH_MINUTES > 0) {
      const interval = setInterval(load, CONFIG.REFRESH_MINUTES * 60000);
      return () => clearInterval(interval);
    }
  }, []);

  }, [selR, selP]);

  const stats = useMemo(() => {
    const t = filtered.length;
    const c = filtered.filter(x => x.s === "Completed").length;
    const ot = filtered.filter(x => x.s === "On Track").length;
    const ar = filtered.filter(x => x.s === "At Risk").length;
    const dl = filtered.filter(x => x.s === "Delayed").length;
    const ys = filtered.filter(x => x.s === "Yet to Start").length;
    return { t, c, ot, ar, dl, ys, pct: t ? Math.round(c / t * 100) : 0 };
  }, [filtered]);

  const podStats = useMemo(() => {
    return PODS.map(p => {
      const items = filtered.filter(x => x.p === p);
      if (!items.length) return null;
      return {
        p, t: items.length,
        c: items.filter(x => x.s === "Completed").length,
        ot: items.filter(x => x.s === "On Track").length,
        ar: items.filter(x => x.s === "At Risk").length,
        dl: items.filter(x => x.s === "Delayed").length,
        ys: items.filter(x => x.s === "Yet to Start").length
      };
    }).filter(Boolean);
  }, [filtered]);

  // Generate weeks
  const weeks = useMemo(() => {
    const result = [];
    let d = new Date(2025, 10, 3); // Nov 3, 2025
    const end = new Date(2027, 0, 11);
    while (d < end) {
      result.push(new Date(d));
      d = new Date(d.getTime() + 7 * 86400000);
    }
    return result;
  }, []);

  const getWeekIdx = (dateStr) => {
    if (!dateStr) return -1;
    const ts = new Date(dateStr).getTime();
    for (let i = 0; i < weeks.length; i++) {
      const wStart = weeks[i].getTime();
      const wEnd = i < weeks.length - 1 ? weeks[i + 1].getTime() : wStart + 7 * 86400000;
      if (ts >= wStart && ts < wEnd) return i;
    }
    return -1;
  };

  const allRisks = Object.values(RISK_ITEMS).flat();

  // Styles
  const font = "'DM Sans', sans-serif";
  const cardBg = "#1e293b";
  const pageBg = "#0f172a";

  const thStyle = {
    padding: "8px 6px", color: "#94a3b8", fontWeight: 600, textAlign: "left",
    borderBottom: "1px solid #334155", fontSize: 11, fontFamily: font, whiteSpace: "nowrap"
  };
  const tdStyle = {
    padding: "6px", color: "#cbd5e1", borderBottom: "1px solid rgba(51,65,85,0.5)",
    fontSize: 11, fontFamily: font
  };

  // Components
  const TabBtn = ({ label, active, onClick, activeColor = "#10b981" }) => (
    <button onClick={onClick} style={{
      padding: "7px 18px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600,
      cursor: "pointer", background: active ? activeColor : "transparent",
      color: active ? "#fff" : "#94a3b8", fontFamily: font, transition: "all .15s", whiteSpace: "nowrap"
    }}>{label}</button>
  );

  const FilterPill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: "6px 16px", borderRadius: 20,
      border: active ? "1.5px solid #3b82f6" : "1px solid #334155",
      background: active ? "rgba(59,130,246,0.1)" : "transparent",
      color: active ? "#3b82f6" : "#94a3b8",
      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
      transition: "all .15s"
    }}>{label}</button>
  );

  const KpiCard = ({ label, value, sub, color }) => (
    <div style={{
      background: cardBg, borderRadius: 12, padding: "18px 22px", flex: 1, minWidth: 140,
      borderLeft: color ? `3px solid ${color}` : "none"
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#64748b", textTransform: "uppercase", marginBottom: 6, fontFamily: font }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || "#e2e8f0", lineHeight: 1, fontFamily: font }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontFamily: font }}>{sub}</div>}
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 10,
      background: (SC[status] || "#475569") + "22", color: SC[status] || "#94a3b8",
      fontWeight: 700, fontSize: 10, fontFamily: font
    }}>{status}</span>
  );

  const ProgressBar = ({ pct }) => {
    const color = pct >= 90 ? "#10b981" : pct >= 60 ? "#8b5cf6" : pct >= 30 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 70, height: 6, borderRadius: 3, background: "#334155", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: font, minWidth: 32 }}>{pct}%</span>
      </div>
    );
  };

  const CapacityBar = ({ filled, total }) => (
    <div style={{ display: "flex", height: 30, borderRadius: 6, overflow: "hidden", background: "#334155" }}>
      <div style={{
        width: `${(filled / total) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
        display: "flex", alignItems: "center", paddingLeft: 10
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: font }}>{filled}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10 }}>
        <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13, fontFamily: font }}>{total - filled}</span>
      </div>
    </div>
  );

  // Donut
  const donutData = [
    { v: stats.c, c: SC.Completed, l: "Completed" },
    { v: stats.ot, c: SC["On Track"], l: "On Track" },
    { v: stats.ar, c: SC["At Risk"], l: "At Risk" },
    { v: stats.dl, c: SC.Delayed, l: "Delayed" },
    { v: stats.ys, c: SC["Yet to Start"], l: "Yet to Start" }
  ];
  const donutTotal = donutData.reduce((a, d) => a + d.v, 0);

  const renderDonut = () => {
    if (!donutTotal) return null;
    let cum = 0;
    const sz = 160, cx = 80, cy = 80, radius = 60, sw = 18;
    return (
      <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
        {donutData.map((d, i) => {
          if (d.v === 0) return null;
          const pct = d.v / donutTotal;
          const startAngle = cum * 2 * Math.PI - Math.PI / 2;
          cum += pct;
          const endAngle = cum * 2 * Math.PI - Math.PI / 2;
          const x1 = cx + radius * Math.cos(startAngle);
          const y1 = cy + radius * Math.sin(startAngle);
          const x2 = cx + radius * Math.cos(endAngle);
          const y2 = cy + radius * Math.sin(endAngle);
          const largeArc = pct > 0.5 ? 1 : 0;
          return (
            <path key={i}
              d={`M${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}`}
              fill="none" stroke={d.c} strokeWidth={sw}
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize="24" fontWeight="800" fontFamily={font}>{stats.pct}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily={font}>Complete</text>
      </svg>
    );
  };

  const StackedBar = ({ ps }) => {
    const segs = [
      { v: ps.c, c: SC.Completed }, { v: ps.ot, c: SC["On Track"] },
      { v: ps.ar, c: SC["At Risk"] }, { v: ps.dl, c: SC.Delayed }, { v: ps.ys, c: SC["Yet to Start"] }
    ];
    return (
      <div style={{ display: "flex", height: 18, borderRadius: 3, overflow: "hidden", flex: 1 }}>
        {segs.map((s, i) => s.v > 0 ? (
          <div key={i} style={{ width: `${(s.v / ps.t) * 100}%`, background: s.c, minWidth: 3 }} title={String(s.v)} />
        ) : null)}
      </div>
    );
  };

  const mainTabs = [
    { id: "overview", l: "Overview" }, { id: "gantt", l: "Gantt" },
    { id: "capacity", l: "Capacity" }, { id: "risks", l: "Risks" },
    { id: "milestones", l: "Milestones" }, { id: "table", l: "Table" }
  ];

  return (
    <div style={{ background: pageBg, minHeight: "100vh", color: "#e2e8f0", fontFamily: font, padding: "24px 28px" }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.9)", zIndex: 999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16
        }}>
          <div style={{ width: 40, height: 40, border: "3px solid #334155", borderTopColor: "#3b82f6", borderRadius: "50%",
            animation: "spin 0.8s linear infinite" }} />
          <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>Loading dashboard data...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}::-webkit-scrollbar{height:6px;width:6px}::-webkit-scrollbar-track{background:#1e293b}::-webkit-scrollbar-thumb{background:#475569;border-radius:3px}`}</style>

      {/* Header */}
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 2 }}>FY25\u201326</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>POD Timeline Dashboard</h1>
        <div style={{ display: "flex", gap: 3, background: cardBg, borderRadius: 10, padding: 3 }}>
          {mainTabs.map(t => <TabBtn key={t.id} label={t.l} active={tab === t.id} onClick={() => setTab(t.id)} activeColor="#3b82f6" />)}
        </div>
      </div>

      {/* Filters */}
      {(tab === "overview" || tab === "gantt" || tab === "table") && (
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>Release</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["All", ...RELS].map(r => <FilterPill key={r} label={r} active={selR === r} onClick={() => setSelR(r)} />)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#64748b", marginBottom: 5, textTransform: "uppercase" }}>POD</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["All", ...PODS].map(p => <FilterPill key={p} label={p} active={selP === p} onClick={() => setSelP(p)} />)}
            </div>
          </div>
        </div>
      )}

      {/* ════════════ OVERVIEW ════════════ */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            <KpiCard label="Total Tasks" value={stats.t} />
            <KpiCard label="Completed" value={`${stats.pct}%`} sub={`${stats.c} of ${stats.t}`} color="#10b981" />
            <KpiCard label="On Track" value={stats.ot} color="#3b82f6" />
            <KpiCard label="At Risk" value={stats.ar} color="#f59e0b" />
            <KpiCard label="Delayed" value={stats.dl} color="#ef4444" />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {/* Donut */}
            <div style={{ background: cardBg, borderRadius: 12, padding: 20, minWidth: 260, flex: "0 0 300px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Status Breakdown</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {renderDonut()}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {donutData.filter(d => d.v > 0).map(d => (
                    <div key={d.l} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 2, background: d.c }} />
                      <span style={{ color: "#94a3b8" }}>{d.l}</span>
                      <span style={{ color: "#e2e8f0", fontWeight: 700, marginLeft: "auto" }}>{d.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stacked bars */}
            <div style={{ background: cardBg, borderRadius: 12, padding: 20, flex: 1, minWidth: 380 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Status by POD</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {podStats.map(ps => (
                  <div key={ps.p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>{ps.p}</div>
                    <StackedBar ps={ps} />
                    <div style={{ width: 28, fontSize: 10, color: "#64748b", textAlign: "right" }}>{ps.t}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                {Object.entries(SC).map(([k, c]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
                    <div style={{ width: 7, height: 7, borderRadius: 2, background: c }} />{k}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Readiness */}
          <div style={{ background: cardBg, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Release Readiness</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>POD</th>
                    {RELS.map(r => <th key={r} style={{ ...thStyle, textAlign: "center" }}>{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PODS.map((pod, pi) => {
                    const podItems = filtered.filter(x => x.p === pod);
                    if (!podItems.length) return null;
                    return (
                      <tr key={pod} style={{ background: pi % 2 === 0 ? pageBg : cardBg }}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{pod}</td>
                        {RELS.map(rel => {
                          const items = podItems.filter(x => x.r === rel);
                          if (!items.length) return <td key={rel} style={{ ...tdStyle, textAlign: "center", color: "#334155" }}>\u2014</td>;
                          const comp = items.filter(x => x.s === "Completed").length;
                          const pct = Math.round(comp / items.length * 100);
                          const worst = items.some(x => x.s === "Delayed") ? "Delayed"
                            : items.some(x => x.s === "At Risk") ? "At Risk"
                            : items.some(x => x.s === "On Track") ? "On Track"
                            : comp === items.length ? "Completed" : "Yet to Start";
                          return (
                            <td key={rel} style={{ ...tdStyle, textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 55, height: 5, borderRadius: 3, background: "#334155", overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: SC[worst], borderRadius: 3 }} />
                                </div>
                                <span style={{ color: SC[worst], fontWeight: 700, fontSize: 10 }}>{pct}%</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ GANTT (Weekly) ════════════ */}
      {tab === "gantt" && (() => {
        // Group weeks by month for colspan headers
        const monthGroups = [];
        let curKey = "";
        weeks.forEach((w, i) => {
          const key = `${w.toLocaleDateString("en", { month: "short" })} ${w.getFullYear()}`;
          if (key !== curKey) {
            monthGroups.push({ label: key, start: i, count: 1 });
            curKey = key;
          } else {
            monthGroups[monthGroups.length - 1].count++;
          }
        });

        return (
          <div style={{ background: cardBg, borderRadius: 14, padding: 20, overflowX: "auto" }}>
            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Release Timeline</div>
              <div style={{ display: "flex", gap: 14 }}>
                {Object.entries(SC).map(([k, c]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#94a3b8" }}>
                    <div style={{ width: 12, height: 8, borderRadius: 3, background: c }} />{k}
                  </div>
                ))}
              </div>
            </div>

            <table style={{ borderCollapse: "collapse", minWidth: weeks.length * 52 + 180, fontSize: 10 }}>
              <thead>
                {/* Month + Year row */}
                <tr>
                  <th rowSpan={2} style={{
                    ...thStyle, width: 170, minWidth: 170, position: "sticky", left: 0,
                    background: cardBg, zIndex: 4, verticalAlign: "bottom", fontSize: 11,
                    borderBottom: "2px solid #475569"
                  }}>POD / Release</th>
                  {monthGroups.map((mg, i) => (
                    <th key={i} colSpan={mg.count} style={{
                      ...thStyle, textAlign: "center", padding: "8px 0", fontSize: 12,
                      color: "#e2e8f0", fontWeight: 700, borderLeft: "2px solid #475569",
                      borderBottom: "none", letterSpacing: 0.5
                    }}>{mg.label}</th>
                  ))}
                </tr>
                {/* Week day row */}
                <tr>
                  {weeks.map((w, i) => {
                    const isFirst = i === 0 || weeks[i - 1].getMonth() !== w.getMonth();
                    return (
                      <th key={i} style={{
                        ...thStyle, width: 50, minWidth: 50, textAlign: "center",
                        padding: "5px 2px", fontSize: 10, color: "#64748b", fontWeight: 500,
                        borderLeft: isFirst ? "2px solid #475569" : "1px solid rgba(51,65,85,0.2)",
                        borderBottom: "2px solid #475569"
                      }}>{w.getDate()}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {PODS.map(pod => {
                  const podRels = RELS.map(rel => {
                    const items = filtered.filter(x => x.p === pod && x.r === rel && x.s);
                    return items.length > 0 ? { rel, items } : null;
                  }).filter(Boolean);

                  if (!podRels.length) return null;

                  const rows = [];

                  // POD header row
                  rows.push(
                    <tr key={`${pod}-header`}>
                      <td style={{
                        position: "sticky", left: 0, background: "rgba(15,23,42,0.8)", zIndex: 1,
                        padding: "12px 10px 6px 12px", fontWeight: 800, color: "#f1f5f9", fontSize: 14,
                        borderTop: "2px solid #475569", fontFamily: font,
                        borderBottom: "1px solid #334155"
                      }}>{pod}</td>
                      {weeks.map((w, wi) => {
                        const isFirst = wi === 0 || weeks[wi - 1].getMonth() !== w.getMonth();
                        return (
                          <td key={wi} style={{
                            borderTop: "2px solid #475569",
                            borderBottom: "1px solid #334155",
                            borderLeft: isFirst ? "2px solid rgba(71,85,105,0.3)" : "none",
                            background: "rgba(15,23,42,0.4)"
                          }} />
                        );
                      })}
                    </tr>
                  );

                  // Release rows
                  podRels.forEach(({ rel, items }) => {
                    rows.push(
                      <tr key={`${pod}-${rel}`} style={{ height: 44 }}>
                        <td style={{
                          ...tdStyle, position: "sticky", left: 0, background: pageBg, zIndex: 1,
                          padding: "6px 8px 6px 24px", fontFamily: font,
                          borderBottom: "1px solid rgba(51,65,85,0.3)"
                        }}>
                          <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 12 }}>{rel}</span>
                        </td>
                        {weeks.map((w, wi) => {
                          const gates = items.filter(it => {
                            const dateStr = it.sd || it.pd;
                            return dateStr && getWeekIdx(dateStr) === wi;
                          });
                          const isFirst = wi === 0 || weeks[wi - 1].getMonth() !== w.getMonth();
                          return (
                            <td key={wi} style={{
                              ...tdStyle, textAlign: "center", padding: "3px 2px", verticalAlign: "middle",
                              borderLeft: isFirst ? "2px solid rgba(71,85,105,0.15)" : "none",
                              borderBottom: "1px solid rgba(51,65,85,0.3)"
                            }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                {gates.map((g, gi) => (
                                  <div key={gi} style={{
                                    padding: "4px 8px", borderRadius: 5,
                                    background: SC[g.s] || "#334155", color: "#fff", fontSize: 10,
                                    fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap",
                                    boxShadow: `0 1px 3px ${SC[g.s] || '#000'}33`
                                  }} title={`${g.g} - ${g.s}${g.sd ? '\nStart: ' + g.sd : ''}${g.pd ? '\nPlanned: ' + g.pd : ''}`}>{g.g}</div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });

                  return rows;
                })}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* ════════════ CAPACITY ════════════ */}
      {tab === "capacity" && (() => {
        const capItems = capTab === "pod" ? CAP_POD : CAP_ROLE;
        const totalStaffed = capItems.reduce((a, x) => a + x.f, 0);
        const totalRoles = capItems.reduce((a, x) => a + x.t, 0);
        const totalLw = capItems.reduce((a, x) => a + x.lw, 0);

        const GaugeCard = ({ item }) => {
          const pct = Math.round(item.f / item.t * 100);
          const open = item.t - item.f;
          const radius = 38;
          const circ = 2 * Math.PI * radius;
          const filled = circ * pct / 100;
          const gaugeColor = pct >= 85 ? "#10b981" : pct >= 65 ? "#8b5cf6" : pct >= 45 ? "#f59e0b" : "#ef4444";
          return (
            <div style={{
              background: pageBg, borderRadius: 12, padding: "18px 16px", flex: "1 1 200px", minWidth: 185,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              border: "1px solid #1e293b", transition: "border-color .2s"
            }}>
              <svg width={90} height={90} viewBox="0 0 90 90">
                <circle cx={45} cy={45} r={radius} fill="none" stroke="#334155" strokeWidth={7} />
                <circle cx={45} cy={45} r={radius} fill="none" stroke={gaugeColor} strokeWidth={7}
                  strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={circ * 0.25}
                  strokeLinecap="round" style={{ transition: "stroke-dasharray .6s ease" }} />
                <text x={45} y={42} textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="800" fontFamily={font}>{pct}%</text>
                <text x={45} y={56} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily={font}>filled</text>
              </svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 4 }}>{item.n}</div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", fontSize: 11 }}>
                  <span style={{ color: gaugeColor }}><b>{item.f}</b> filled</span>
                  <span style={{ color: "#64748b" }}><b>{open}</b> open</span>
                </div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>
                  +{item.lw} last week
                </div>
              </div>
            </div>
          );
        };

        return (
          <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>CAPACITY BY PODS</div>
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
              <KpiCard label="Total Staffed" value={totalStaffed.toLocaleString()} color="#8b5cf6" />
              <KpiCard label="Total Demand" value={totalRoles.toLocaleString()} color="#ef4444" />
              <KpiCard label="Open Roles" value={(totalRoles - totalStaffed).toLocaleString()} color="#f59e0b" />
              <KpiCard label="Filled Last Week" value={totalLw} color="#10b981" />
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: pageBg, borderRadius: 8, padding: 3, width: "fit-content" }}>
              <TabBtn label="POD Wise Fulfillment" active={capTab === "pod"} onClick={() => setCapTab("pod")} activeColor="#8b5cf6" />
              <TabBtn label="Role-Category Breakup" active={capTab === "role"} onClick={() => setCapTab("role")} activeColor="#8b5cf6" />
            </div>

            {/* Gauge Cards Grid */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
              {capItems.map(item => <GaugeCard key={item.n} item={item} />)}
            </div>

            {/* Summary Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>{capTab === "pod" ? "POD" : "Role Category"}</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Total Demand</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Fulfilled</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Open</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Fill Rate</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Last Week</th>
                  </tr>
                </thead>
                <tbody>
                  {capItems.map((item, i) => {
                    const pct = Math.round(item.f / item.t * 100);
                    const barColor = pct >= 85 ? "#10b981" : pct >= 65 ? "#8b5cf6" : pct >= 45 ? "#f59e0b" : "#ef4444";
                    return (
                      <tr key={item.n} style={{ background: i % 2 === 0 ? pageBg : cardBg }}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{item.n}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{item.t}</td>
                        <td style={{ ...tdStyle, textAlign: "center", color: "#8b5cf6", fontWeight: 700 }}>{item.f}</td>
                        <td style={{ ...tdStyle, textAlign: "center", color: "#f59e0b" }}>{item.t - item.f}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 50, height: 5, borderRadius: 3, background: "#334155", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3 }} />
                            </div>
                            <span style={{ color: barColor, fontWeight: 700, fontSize: 11 }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {item.lw > 0 ? <span style={{ color: "#10b981", fontWeight: 600 }}>+{item.lw}</span> : <span style={{ color: "#64748b" }}>0</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
      )}

      {/* ════════════ RISKS ════════════ */}
      {tab === "risks" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>TOP PRIORITY RISKS</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: pageBg, borderRadius: 8, padding: 3, overflowX: "auto" }}>
            {Object.keys(RISK_ITEMS).map(t => (
              <TabBtn key={t} label={t} active={riskTab === t} onClick={() => setRiskTab(t)} activeColor="#8b5cf6" />
            ))}
          </div>

          {riskTab === "Overview" ? (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <KpiCard label="P1 - CRITICAL" value={allRisks.filter(x => x.pr === "P1").length} color="#ef4444" />
                <KpiCard label="P2 - HIGH" value={allRisks.filter(x => x.pr === "P2").length} color="#f59e0b" />
                <KpiCard label="P3 - MEDIUM" value={allRisks.filter(x => x.pr === "P3").length} color="#3b82f6" />
                <KpiCard label="P4 - LOW" value={allRisks.filter(x => x.pr === "P4").length} color="#6b7280" />
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ background: pageBg, borderRadius: 12, padding: 20, flex: 1, minWidth: 250 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Risks by POD</div>
                  {Object.entries(RISK_ITEMS).filter(([k]) => k !== "Overview").map(([pod, risks]) => (
                    <div key={pod} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 80, textAlign: "right", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{pod}</div>
                      <div style={{ background: "#8b5cf6", borderRadius: 4, padding: "3px 10px", minWidth: 30, textAlign: "center" }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{risks.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: pageBg, borderRadius: 12, padding: 20, flex: 1, minWidth: 250 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#cbd5e1" }}>Risks by Aging</div>
                  {[["60+", allRisks.filter(x => x.age > 60).length, 1], ["31-60", allRisks.filter(x => x.age > 30 && x.age <= 60).length, 0.8],
                    ["15-30", allRisks.filter(x => x.age > 14 && x.age <= 30).length, 0.6], ["8-14", allRisks.filter(x => x.age > 7 && x.age <= 14).length, 0.4],
                    ["0-7", allRisks.filter(x => x.age <= 7).length, 0.2]
                  ].map(([label, count, opacity]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 60, textAlign: "right", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label} days</div>
                      <div style={{ background: `rgba(139,92,246,${opacity})`, borderRadius: 4, padding: "3px 10px", minWidth: Math.max(30, Number(count) * 12) }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                <thead>
                  <tr>
                    {["Priority", "Title", "Aging", "Impact", "Mitigation", "Owner"].map(h => (
                      <th key={h} style={{ ...thStyle, fontSize: 11, padding: "10px 8px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(RISK_ITEMS[riskTab] || []).map((risk, i) => (
                    <tr key={i} style={{
                      background: i % 2 === 0 ? pageBg : cardBg,
                      borderLeft: risk.pr === "P1" ? "3px solid #ef4444" : risk.pr === "P2" ? "3px solid #f59e0b" : "3px solid #3b82f6"
                    }}>
                      <td style={tdStyle}>
                        <span style={{
                          background: risk.pr === "P1" ? "#ef4444" : risk.pr === "P2" ? "#f59e0b" : "#3b82f6",
                          color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 10
                        }}>{risk.pr}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, maxWidth: 220 }}>{risk.title}</td>
                      <td style={tdStyle}><span style={{ color: "#ef4444", fontWeight: 700 }}>In {risk.age} Days</span></td>
                      <td style={tdStyle}><span style={{ color: "#f59e0b", fontWeight: 600 }}>{risk.impact}</span></td>
                      <td style={{ ...tdStyle, maxWidth: 240, lineHeight: 1.4 }}>{risk.mit}</td>
                      <td style={tdStyle}>{risk.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════ MILESTONES ════════════ */}
      {tab === "milestones" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 20 }}>MILESTONES TRACKER</div>
          {/* POD tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, background: pageBg, borderRadius: 8, padding: 3, overflowX: "auto" }}>
            {Object.keys(MILES).map(p => (
              <TabBtn key={p} label={p} active={mileTab === p} onClick={() => { setMileTab(p); setMileWeek("last"); }} />
            ))}
          </div>

          {MILES[mileTab] && (
            <div>
              {/* POD header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{mileTab}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Overall Status</span>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: MILES[mileTab].color }} />
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Lead: <b style={{ color: "#e2e8f0" }}>{MILES[mileTab].lead}</b></span>
              </div>

              {/* Last Week / Next Week toggle */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24, background: pageBg, borderRadius: 8, padding: 3, width: "fit-content" }}>
                <TabBtn label="Last Week Update (30th Mar - 3rd Apr)" active={mileWeek === "last"} onClick={() => setMileWeek("last")} activeColor="#8b5cf6" />
                <TabBtn label="Next Week Plan (6th Apr - 10th Apr)" active={mileWeek === "next"} onClick={() => setMileWeek("next")} activeColor="#8b5cf6" />
              </div>

              {/* Releases */}
              {MILES[mileTab].rels.map((rel, ri) => (
                <div key={ri} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #334155" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{rel.name}</div>
                    <div style={{ background: pageBg, padding: "3px 10px", borderRadius: 6, fontSize: 11, color: "#8b5cf6", fontWeight: 600 }}>{rel.feat} Features</div>
                  </div>

                  {mileWeek === "last" ? (
                    /* ── Last Week Table ── */
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, width: "30%" }}>Last Week Plan</th>
                          <th style={{ ...thStyle, width: "18%", textAlign: "center" }}>Completed</th>
                          <th style={{ ...thStyle, width: "52%" }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rel.lastWeek.map((item, ii) => {
                          const isComplete = item.completed === "100%";
                          const isYts = item.completed === "Yet to Start" || item.completed === "-";
                          const pctColor = isComplete ? "#10b981" : isYts ? "#ef4444" : "#f59e0b";
                          return (
                            <tr key={ii} style={{ background: ii % 2 === 0 ? pageBg : cardBg }}>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{item.task}</td>
                              <td style={{ ...tdStyle, textAlign: "center" }}>
                                <span style={{
                                  display: "inline-block", padding: "3px 12px", borderRadius: 6,
                                  background: isComplete ? "#10b98122" : isYts ? "#ef444422" : "#f59e0b22",
                                  color: pctColor, fontWeight: 700, fontSize: 12
                                }}>{item.completed}</span>
                              </td>
                              <td style={{ ...tdStyle, color: "#94a3b8", lineHeight: 1.5 }}>{item.notes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    /* ── Next Week Table ── */
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
                      <thead>
                        <tr>
                          <th style={{ ...thStyle, width: "18%" }}>Stage Gate</th>
                          <th style={{ ...thStyle, width: "34%", color: "#10b981" }}>Next Week Activities</th>
                          <th style={{ ...thStyle, width: "22%", color: "#f59e0b" }}>At Risk</th>
                          <th style={{ ...thStyle, width: "26%" }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rel.nextWeek.map((item, ii) => (
                          <tr key={ii} style={{ background: ii % 2 === 0 ? pageBg : cardBg }}>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{item.task}</td>
                            <td style={tdStyle}>{item.activity}</td>
                            <td style={{ ...tdStyle, color: item.risk && item.risk !== "-" ? "#f59e0b" : "#64748b", fontWeight: item.risk && item.risk !== "-" ? 600 : 400 }}>{item.risk || "\u2014"}</td>
                            <td style={{ ...tdStyle, color: "#94a3b8" }}>{item.notes || "\u2014"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════ TABLE ════════════ */}
      {tab === "table" && (
        <div style={{ background: cardBg, borderRadius: 12, padding: 16, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800, fontSize: 11 }}>
            <thead>
              <tr>
                {["Release", "POD", "Stage Gate", "Status", "Start", "Planned End", "Actual End", "Delay"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? pageBg : cardBg }}>
                  <td style={tdStyle}>{row.r}</td>
                  <td style={tdStyle}>{row.p}</td>
                  <td style={tdStyle}>{row.g}</td>
                  <td style={tdStyle}><StatusBadge status={row.s} /></td>
                  <td style={tdStyle}>{row.sd ? row.sd.substring(5) : "\u2014"}</td>
                  <td style={tdStyle}>{row.pd ? row.pd.substring(5) : "\u2014"}</td>
                  <td style={tdStyle}>{row.ad ? row.ad.substring(5) : "\u2014"}</td>
                  <td style={{
                    ...tdStyle, fontWeight: row.dd ? 700 : 400,
                    color: row.dd > 0 ? "#ef4444" : row.dd < 0 ? "#10b981" : "#cbd5e1"
                  }}>
                    {row.dd != null ? (row.dd > 0 ? "+" : "") + row.dd : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && (
            <div style={{ textAlign: "center", color: "#64748b", padding: 10, fontSize: 11 }}>
              Showing 100 of {filtered.length} rows
            </div>
          )}
        </div>
      )}
    </div>
  );
}
