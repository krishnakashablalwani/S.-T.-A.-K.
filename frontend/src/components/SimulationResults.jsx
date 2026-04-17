import React, { useState } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  Legend, ReferenceLine, RadialBarChart, RadialBar,
} from "recharts";
import { jsPDF } from "jspdf";

import { Download, Zap, Flame } from "lucide-react";
import Chatbot from "./Chatbot";

// Burnout Gauge Component
const BurnoutGauge = ({ score }) => {
  const color = score < 40 ? '#0BF46C' : score < 70 ? '#FFD700' : '#FF0000';
  const label = score < 40 ? 'LOW' : score < 70 ? 'MODERATE' : 'CRITICAL';
  const data = [{ name: 'burnout', value: score, fill: color }];
  return (
    <div className="brutal-box p-4 bg-brand-black col-span-1">
      <h3 className="text-2xl font-black uppercase mb-2 inline-block px-2 text-brand-light border-b-4 border-brand-danger">
        <Flame size={18} className="inline mr-1 text-brand-danger" /> BURNOUT METER
      </h3>
      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="60%" outerRadius="100%"
              startAngle={180} endAngle={-180}
              data={data}
              barSize={14}
            >
              <RadialBar dataKey="value" background={{ fill: '#e5e5d0' }} cornerRadius={0} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black" style={{ color }}>{score}</span>
            <span className="text-[10px] font-black uppercase" style={{ color }}>{label}</span>
          </div>
        </div>
        <div className="text-xs font-black uppercase space-y-2 text-brand-light">
          <div>Score is based on <br/>automation risk × <br/>years elapsed.</div>
          {score >= 70 && <div className="text-brand-danger animate-pulse">⚠ CONSIDER PIVOTING</div>}
          {score >= 40 && score < 70 && <div className="text-yellow-600">⚡ Pace yourself</div>}
          {score < 40 && <div className="text-brand-accent">✅ Sustainable</div>}
        </div>
      </div>
    </div>
  );
};

// Milestone detection
const getMilestones = (timeline, startingDebt) => {
  const milestones = [];
  let debtFreeDone = false;
  let fiftyLDone = false;
  let fireDone = false;
  for (const pt of timeline) {
    if (!debtFreeDone && startingDebt > 0 && pt.remainingDebt <= 0) {
      milestones.push({ year: pt.year, label: '🎉 DEBT FREE', color: '#0BF46C' });
      debtFreeDone = true;
    }
    if (!fiftyLDone && pt.netWorth >= 5000000) {
      milestones.push({ year: pt.year, label: '💰 ₹50L SAVED', color: '#FFD700' });
      fiftyLDone = true;
    }
    if (!fireDone && pt.netWorth >= 30000000) {
      milestones.push({ year: pt.year, label: '🔥 FIRE GOAL', color: '#FF0000' });
      fireDone = true;
    }
  }
  return milestones;
};

const SimulationResults = ({ data, darkMode = false, chartAxisColor = '#1A1A1A', chartGridColor = '#725752' }) => {
  const [showReal, setShowReal] = useState(false);

  if (!data || !data.timeline) return null;

  const { careerName, compareCareerName, timeline, insightSummary } = data;
  const isCompare = !!compareCareerName;

  const finalYear = timeline[timeline.length - 1];
  const burnoutScore = finalYear.burnoutScore ?? Math.min(100, Math.round((finalYear.automationRisk * timeline.length) / 10));
  const milestones = getMilestones(timeline, data.startingDebt || 0);

  const salaryKey = showReal ? "realSalary" : "salary";
  const compareSalaryKey = showReal ? "compareRealSalary" : "compareSalary";
  const finalStateContext = JSON.stringify(finalYear);

  const handleDownloadPdf = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    const PAD = 18;
    const FULL = W - PAD * 2;
    let y = 0;

    // ── COVER HEADER ────────────────────────────────────────────
    pdf.setFillColor(26, 26, 26);
    pdf.rect(0, 0, W, 48, 'F');
    pdf.setFillColor(11, 244, 108);
    pdf.rect(0, 48, W, 4, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(11, 244, 108);
    pdf.text('CAREER DECISION SIMULATOR  ·  CONFIDENTIAL REPORT', PAD, 16);

    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 240);
    pdf.text(careerName.toUpperCase(), PAD, 32);

    if (isCompare) {
      pdf.setFontSize(11);
      pdf.setTextColor(114, 87, 82);
      pdf.text(`vs. ${compareCareerName}`, PAD, 42);
    }

    pdf.setFontSize(7);
    pdf.setTextColor(114, 87, 82);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, W - PAD, 42, { align: 'right' });

    y = 62;

    // ── Helper fns ─────────────────────────────────────────────
    const sectionTitle = (title, color = [26, 26, 26]) => {
      pdf.setFillColor(...color);
      pdf.rect(PAD, y, FULL, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 240);
      pdf.text(title, PAD + 3, y + 5.5);
      y += 12;
    };

    const bodyText = (text, indent = 0) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(40, 40, 40);
      const lines = pdf.splitTextToSize(text, FULL - indent);
      pdf.text(lines, PAD + indent, y);
      y += lines.length * 5 + 2;
    };

    const kv = (label, value, valueColor = [26, 26, 26]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(114, 87, 82);
      pdf.text(label.toUpperCase(), PAD, y);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...valueColor);
      pdf.text(String(value), PAD + 72, y);
      y += 6;
    };

    const divider = () => {
      pdf.setDrawColor(220, 210, 195);
      pdf.setLineWidth(0.3);
      pdf.line(PAD, y, W - PAD, y);
      y += 5;
    };

    const fmt = (n) => `₹${(n / 100000).toFixed(1)}L`;

    // ── 1. EXECUTIVE SUMMARY ────────────────────────────────────
    sectionTitle('01  EXECUTIVE SUMMARY', [26, 26, 26]);
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    const totalGrowth = (((last.salary - first.salary) / first.salary) * 100).toFixed(0);
    const wealthBuilt = last.netWorth > 0 ? fmt(last.netWorth) : '₹0';
    bodyText(`This report analyses the projected ${timeline.length}-year financial trajectory for a career in ${careerName}. Based on simulation data, the candidate is projected to grow their gross compensation from ${fmt(first.salary)} to ${fmt(last.salary)} — a ${totalGrowth}% increase — while accumulating a net worth of ${wealthBuilt}.`);
    y += 2;
    divider();

    // ── 2. KEY METRICS ──────────────────────────────────────────
    sectionTitle('02  KEY FINANCIAL METRICS', [50, 50, 50]);
    kv('Starting Gross Salary', fmt(first.salary));
    kv('Final Gross Salary', fmt(last.salary));
    kv('Net Salary (After Tax, Final Year)', fmt(last.netSalary));
    kv('Total Wealth Accumulated', wealthBuilt, last.netWorth > 0 ? [11, 150, 70] : [200, 50, 50]);
    kv('Remaining Debt', last.remainingDebt > 0 ? fmt(last.remainingDebt) : 'FULLY CLEARED ✓', last.remainingDebt === 0 ? [11, 150, 70] : [200, 50, 50]);
    kv('Total Gross Growth', `${totalGrowth}%`);
    divider();

    // ── 3. RISK ASSESSMENT ──────────────────────────────────────
    sectionTitle('03  RISK ASSESSMENT', [114, 87, 82]);
    const avgAutoRisk = Math.round(timeline.reduce((s, t) => s + t.automationRisk, 0) / timeline.length);
    const layoffYears = timeline.filter(t => t.layoffDetected).length;
    const finalBurnout = last.burnoutScore || 0;
    const burnoutRating = finalBurnout < 40 ? 'LOW' : finalBurnout < 70 ? 'MODERATE' : 'CRITICAL';
    const burnoutColor = finalBurnout < 40 ? [11, 150, 70] : finalBurnout < 70 ? [180, 140, 0] : [200, 50, 50];
    kv('Avg. Automation Risk', `${avgAutoRisk}/100`);
    kv('Layoff Events Simulated', `${layoffYears} year(s)`);
    kv('Final Burnout Score', `${finalBurnout}/100 — ${burnoutRating}`, burnoutColor);
    divider();

    // ── 4. SKILL TRAJECTORY ─────────────────────────────────────
    if (last.skillLevel !== undefined) {
      sectionTitle('04  SKILL TRAJECTORY', [30, 30, 80]);
      const firstSkill = timeline[0].skillLevel;
      const lastSkill = last.skillLevel;
      const direction = lastSkill >= firstSkill ? '▲ GROWING' : '▼ DECAYING';
      const dirColor = lastSkill >= firstSkill ? [11, 150, 70] : [200, 50, 50];
      kv('Starting Skill Level', `${firstSkill}/100`);
      kv('Final Skill Level', `${lastSkill}/100`, dirColor);
      kv('Trajectory', direction, dirColor);
      bodyText('Note: Enabling "Learning Investment" (5% salary reinvestment) reverses decay and compounds growth over time.');
      divider();
    }

    // ── 5. MILESTONES ───────────────────────────────────────────
    sectionTitle('05  WEALTH MILESTONES', [20, 80, 40]);
    const milestoneHits = [];
    let debtCleared = false;
    for (const pt of timeline) {
      if (!debtCleared && first.remainingDebt > 0 && pt.remainingDebt === 0) {
        milestoneHits.push(`${pt.year}: Debt Fully Cleared 🎉`);
        debtCleared = true;
      }
      if (pt.netWorth >= 5000000 && !milestoneHits.some(m => m.includes('50L'))) {
        milestoneHits.push(`${pt.year}: ₹50 Lakh Net Worth Milestone 💰`);
      }
      if (pt.netWorth >= 30000000 && !milestoneHits.some(m => m.includes('FIRE'))) {
        milestoneHits.push(`${pt.year}: FIRE Goal Reached 🔥 (₹3 Crore)`);
      }
    }
    if (milestoneHits.length === 0) {
      bodyText('No major wealth milestones reached within the simulation period. Consider extending the timeline or enabling Learning Investment.');
    } else {
      milestoneHits.forEach(m => bodyText(`• ${m}`, 4));
    }
    divider();

    // ── 6. AI DIRECTIVE ─────────────────────────────────────────
    if (insightSummary) {
      // New page if needed
      if (y > 230) { pdf.addPage(); y = 20; }
      sectionTitle('06  AI DIRECTIVE', [11, 100, 60]);
      bodyText(insightSummary.replace(/<[^>]+>/g, ''));
      divider();
    }

    // ── FOOTER ──────────────────────────────────────────────────
    if (y > 250) { pdf.addPage(); y = 20; }
    pdf.setFillColor(26, 26, 26);
    pdf.rect(0, 280, W, 17, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(114, 87, 82);
    pdf.text('CAREER DECISION SIMULATOR  ·  This is a simulation. Not financial advice.', PAD, 290);
    pdf.setTextColor(11, 244, 108);
    pdf.text('CONFIDENTIAL', W - PAD, 290, { align: 'right' });

    pdf.save(`${careerName.replace(/\s+/g, '_')}_CAREER_REPORT.pdf`);
  };

  const CHART_AXIS_COLOR = chartAxisColor;
  const CHART_GRID_COLOR = chartGridColor;

  return (
    <div className="space-y-8 font-mono">
      {/* Header row */}
      <div className="slide-in-left flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-brand-light pb-4 gap-4">
        <h2 className="text-4xl md:text-5xl font-black text-brand-light uppercase leading-none tracking-tighter">
          {careerName} <br className="hidden md:block" />{" "}
          {isCompare && (
            <span className="text-brand-accent bg-brand-light px-2 mt-2 inline-block">
              VS {compareCareerName}
            </span>
          )}
        </h2>
        <button onClick={handleDownloadPdf} className="brutal-btn flex items-center gap-2 px-6 py-3 text-lg whitespace-nowrap">
          <Download size={20} strokeWidth={3} /> DOWNLOAD PDF
        </button>
      </div>

      {insightSummary && (
        <div className="chart-card-animate brutal-box p-6 bg-brand-accent text-brand-light flex flex-col md:flex-row gap-6 relative overflow-hidden" style={{ animationDelay: '0.05s' }}>
          <div className="absolute -right-10 -top-10 opacity-10">
            <Zap size={200} fill="#1A1A1A" />
          </div>
          <div className="shrink-0 pt-2 z-10">
            <span className="bg-brand-light text-brand-black px-2 py-1 font-black uppercase text-xl">AI DIRECTIVE</span>
          </div>
          <div className="z-10 text-brand-light">
            {insightSummary.split("\n").map((p, i) => (
              <p key={i} className="mb-3 text-lg font-medium leading-tight">{p}</p>
            ))}
          </div>
        </div>
      )}

      <div className="chart-card-animate flex gap-4 mb-2" style={{ animationDelay: '0.1s' }}>
        <button
          type="button"
          onClick={() => setShowReal(r => !r)}
          className="brutal-box flex items-center gap-3 cursor-pointer p-3 transition-colors border-brand-light"
          style={{ backgroundColor: showReal ? 'var(--color-brand-accent)' : 'var(--color-brand-light)' }}
        >
          {/* Custom checkbox square */}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24,
              border: '3px solid #1A1A1A',
              backgroundColor: showReal ? '#1A1A1A' : 'transparent',
              flexShrink: 0,
            }}
          >
            {showReal && <span style={{ color: 'var(--color-brand-accent)', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>✓</span>}
          </span>
          <span className="font-black uppercase text-lg select-none text-brand-black">
            TOGGLE REAL SALARY (INFLATION DEDUCT)
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4 bg-brand-black p-4 border-4 border-brand-light/20">

        {/* SALARY ARC */}
        <div className="chart-card-animate brutal-box p-4" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-2xl font-black text-brand-light uppercase mb-4 bg-brand-accent text-brand-light inline-block px-2">
            SALARY ARC
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke={CHART_GRID_COLOR} strokeOpacity={0.3} />
                <XAxis dataKey="year" stroke={CHART_AXIS_COLOR} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} />
                <YAxis stroke={CHART_AXIS_COLOR} tickFormatter={(v) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${Math.round(v/1000)}k`} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} width={62} />
                <Tooltip contentStyle={{ borderRadius: 0, border: "4px solid #1A1A1A", fontWeight: "bold", backgroundColor: '#fffff0' }} />
                <Legend wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace", color: '#1A1A1A' }} />
                <Line type="step" dataKey="netSalary" name={`${careerName} (NET)`} stroke="#FFD700" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                {timeline.map((entry, index) =>
                  entry.layoffDetected && (
                    <ReferenceLine key={`layoff-${index}`} x={entry.year} stroke="#FF0000" strokeWidth={2}
                      label={{ position: 'top', value: 'LAYOFF', fill: '#FF0000', fontSize: 10, fontWeight: 'bold' }}
                    />
                  )
                )}
                {milestones.map((m, i) => (
                  <ReferenceLine key={`ms-${i}`} x={m.year} stroke={m.color} strokeWidth={2} strokeDasharray="8 4"
                    label={{ position: 'insideTopLeft', value: m.label, fill: m.color, fontSize: 9, fontWeight: 'bold' }}
                  />
                ))}
                <Line type="step" dataKey={salaryKey} name={`${careerName} (GROSS)`} stroke="#0BF46C" strokeWidth={5} dot={false} />
                {isCompare && (
                  <Line type="step" dataKey={compareSalaryKey} name={compareCareerName} stroke="#725752" strokeWidth={5} strokeDasharray="10 10" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIQUIDITY vs DEBT */}
        <div className="chart-card-animate brutal-box p-4" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-2xl font-black uppercase mb-4 bg-brand-danger text-white inline-block px-2">
            LIQUIDITY vs DEBT
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke={CHART_GRID_COLOR} strokeOpacity={0.3} />
                <XAxis dataKey="year" stroke={CHART_AXIS_COLOR} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} />
                <YAxis stroke={CHART_AXIS_COLOR} tickFormatter={(v) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${Math.round(v/1000)}k`} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} width={62} />
                <Tooltip contentStyle={{ borderRadius: 0, border: "4px solid #1A1A1A", fontWeight: "bold", backgroundColor: '#fffff0' }} />
                <Legend wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace", color: '#1A1A1A' }} />
                {milestones.map((m, i) => (
                  <ReferenceLine key={`ms2-${i}`} x={m.year} stroke={m.color} strokeWidth={2} strokeDasharray="8 4"
                    label={{ position: 'top', value: m.label, fill: m.color, fontSize: 9, fontWeight: 'bold' }}
                  />
                ))}
                <Area type="step" dataKey="netWorth" name={`${careerName} NET`} fill="#0BF46C" stroke="#1A1A1A" strokeWidth={3} fillOpacity={0.2} />
                <Line type="step" dataKey="remainingDebt" name={`${careerName} DEBT`} stroke="#FF0000" strokeWidth={5} dot={false} />
                {isCompare && (
                  <Area type="step" dataKey="compareNetWorth" name={`${compareCareerName} NET`} fill="#725752" stroke="#725752" fillOpacity={0.1} strokeWidth={3} strokeDasharray="6 6" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MARKET DEMAND */}
        <div className="chart-card-animate brutal-box p-4" style={{ animationDelay: '0.45s' }}>
          <h3 className="text-2xl font-black text-brand-light uppercase mb-4 border-b-4 border-brand-light inline-block">
            MARKET DEMAND
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="year" stroke={CHART_AXIS_COLOR} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} />
                <YAxis stroke={CHART_AXIS_COLOR} domain={[0, 100]} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} />
                <Tooltip contentStyle={{ borderRadius: 0, border: "4px solid #1A1A1A", fontWeight: "bold", backgroundColor: '#fffff0' }} cursor={{ fill: "#725752", fillOpacity: 0.1 }} />
                <Legend wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace", color: '#1A1A1A' }} />
                <Bar dataKey="jobDemandScore" name={careerName} fill="#0BF46C" stroke="#1A1A1A" strokeWidth={2} />
                {isCompare && (
                  <Bar dataKey="compareJobDemandScore" name={compareCareerName} fill="#725752" stroke="#1A1A1A" strokeWidth={2} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SKILL TRAJECTORY */}
        <div className="chart-card-animate brutal-box p-4" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-2xl font-black uppercase mb-4 inline-block px-2 border-b-4 border-[#3030a0] text-brand-light">
            📚 SKILL TRAJECTORY
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={CHART_GRID_COLOR} strokeOpacity={0.3} />
                <XAxis dataKey="year" stroke={CHART_AXIS_COLOR} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} />
                <YAxis stroke={CHART_AXIS_COLOR} domain={[0, 100]} tick={{ fontWeight: "bold", fontFamily: "monospace", fill: CHART_AXIS_COLOR }} />
                <Tooltip contentStyle={{ borderRadius: 0, border: "4px solid #1A1A1A", fontWeight: "bold", backgroundColor: '#fffff0' }} />
                <Legend wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace", color: '#1A1A1A' }} />
                <Line type="monotone" dataKey="skillLevel" name="Skill Level" stroke="#3030a0" strokeWidth={4} dot={false} />
                <Line type="monotone" dataKey="automationRisk" name="Automation Risk" stroke="#FF0000" strokeWidth={3} strokeDasharray="6 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] font-black uppercase text-brand-gray">
            {timeline[timeline.length - 1]?.skillLevel > timeline[0]?.skillLevel
              ? '✅ Skill growing — outpacing automation risk'
              : '⚠️ Skill decaying — enable Learning Investment to reverse'}
          </div>
        </div>

        {/* BURNOUT METER */}
        <div className="chart-card-animate" style={{ animationDelay: '0.75s' }}>
          <BurnoutGauge score={burnoutScore} />
        </div>

        {/* Chatbot */}
        <div className="chart-card-animate lg:col-span-2 border-brand-light h-[350px]" style={{ animationDelay: '0.9s' }}>
          <Chatbot careerName={careerName} timelineSummary={finalStateContext} />
        </div>
      </div>
    </div>
  );
};

export default SimulationResults;
