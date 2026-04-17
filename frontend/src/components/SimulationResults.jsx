import React, { useState, useRef } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Zap } from "lucide-react";
import Chatbot from "./Chatbot";

const SimulationResults = ({ data }) => {
  const [showReal, setShowReal] = useState(false);
  const printRef = useRef(null);

  if (!data || !data.timeline) return null;

  const { careerName, compareCareerName, timeline, insightSummary } = data;
  const isCompare = !!compareCareerName;

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;
    element.style.backgroundColor = "#FFFFFF";
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    element.style.backgroundColor = "";
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("BRUTAL_REPORT.pdf");
  };

  const salaryKey = showReal ? "realSalary" : "salary";
  const compareSalaryKey = showReal ? "compareRealSalary" : "compareSalary";

  const finalStateContext = JSON.stringify(timeline[timeline.length - 1]);

  return (
    <div className="space-y-8 font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-brand-black pb-4 gap-4">
        <h2 className="text-4xl md:text-5xl font-black text-brand-black uppercase leading-none tracking-tighter">
          {careerName} <br className="hidden md:block" />{" "}
          {isCompare && (
            <span className="text-brand-accent bg-brand-black px-2 mt-2 inline-block">
              VS {compareCareerName}
            </span>
          )}
        </h2>
        <button
          onClick={handleDownloadPdf}
          className="brutal-btn flex items-center gap-2 px-6 py-3 text-lg whitespace-nowrap"
        >
          <Download size={20} strokeWidth={3} /> DOWNLOAD PDF
        </button>
      </div>

      {insightSummary && (
        <div className="brutal-box p-6 bg-brand-accent text-black flex flex-col md:flex-row gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <Zap size={200} fill="black" />
          </div>
          <div className="shrink-0 pt-2 z-10">
            <span className="bg-black text-brand-light px-2 py-1 font-black uppercase text-xl">
              AI DIRECTIVE
            </span>
          </div>
          <div className="z-10">
            {insightSummary.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-3 text-lg font-medium leading-tight">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-2">
        <label className="brutal-box flex items-center gap-3 cursor-pointer p-3 bg-brand-light hover:bg-brand-accent transition-colors">
          <input
            type="checkbox"
            checked={showReal}
            onChange={(e) => setShowReal(e.target.checked)}
            className="w-6 h-6 outline-none accent-black"
          />
          <span className="font-black uppercase text-lg select-none text-black">
            TOGGLE REAL SALARY (INFLATION DEDUCT)
          </span>
        </label>
      </div>

      <div
        ref={printRef}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4 bg-black p-4 border-4 border-brand-light/20"
      >
        {/* Charts */}
        <div className="brutal-box p-4 bg-brand-light">
          <h3 className="text-2xl font-black text-brand-black uppercase mb-4 bg-brand-accent text-black inline-block px-2">
            SALARY ARC
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeline}
                margin={{ top: 10, right: 20, bottom: 5, left: 20 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="#725752" strokeOpacity={0.2} />
                <XAxis
                  dataKey="year"
                  stroke="#000000"
                  tick={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <YAxis
                  stroke="#000000"
                  tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                  tick={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "4px solid black",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <Line
                  type="step"
                  dataKey={salaryKey}
                  name={careerName}
                  stroke="#0BF46C"
                  strokeWidth={5}
                  dot={false}
                />
                {isCompare && (
                  <Line
                    type="step"
                    dataKey={compareSalaryKey}
                    name={compareCareerName}
                    stroke="#000000"
                    strokeWidth={5}
                    strokeDasharray="10 10"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="brutal-box p-4 bg-brand-light">
          <h3 className="text-2xl font-black text-brand-black uppercase mb-4 bg-brand-danger text-brand-light inline-block px-2">
            LIQUIDITY vs DEBT
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeline}
                margin={{ top: 10, right: 20, bottom: 5, left: 20 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="#725752" strokeOpacity={0.2} />
                <XAxis
                  dataKey="year"
                  stroke="#000000"
                  tick={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <YAxis
                  stroke="#000000"
                  tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                  tick={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "4px solid black",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <Area
                  type="step"
                  dataKey="netWorth"
                  name={`${careerName} NET`}
                  fill="#0BF46C"
                  stroke="#000000"
                  strokeWidth={3}
                  fillOpacity={0.2}
                />
                <Line
                  type="step"
                  dataKey="remainingDebt"
                  name={`${careerName} DEBT`}
                  stroke="#FF0000"
                  strokeWidth={5}
                  dot={false}
                />
                {isCompare && (
                  <Area
                    type="step"
                    dataKey="compareNetWorth"
                    name={`${compareCareerName} NET`}
                    fill="#000000"
                    stroke="#000000"
                    fillOpacity={0.1}
                    strokeWidth={3}
                    strokeDasharray="6 6"
                  />
                )}
                {isCompare && (
                  <Line
                    type="step"
                    dataKey="compareRemainingDebt"
                    name={`${compareCareerName} DEBT`}
                    stroke="#FF0000"
                    strokeWidth={5}
                    strokeDasharray="6 6"
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="brutal-box p-4 bg-brand-light lg:col-span-1">
          <h3 className="text-2xl font-black text-brand-black uppercase mb-4 border-b-4 border-black inline-block">
            MARKET DEMAND
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeline}
                margin={{ top: 10, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="0" stroke="#E5E5E5" />
                <XAxis
                  dataKey="year"
                  stroke="#000000"
                  tick={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <YAxis
                  stroke="#000000"
                  domain={[0, 100]}
                  tick={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "4px solid black",
                    fontWeight: "bold",
                    backgroundColor: "#E8DBC5"
                  }}
                  cursor={{ fill: "#725752", fillOpacity: 0.1 }}
                />
                <Legend
                  wrapperStyle={{ fontWeight: "bold", fontFamily: "monospace" }}
                />
                <Bar
                  dataKey="jobDemandScore"
                  name={careerName}
                  fill="#0BF46C"
                  stroke="#000000"
                  strokeWidth={3}
                />
                {isCompare && (
                  <Bar
                    dataKey="compareJobDemandScore"
                    name={compareCareerName}
                    fill="#000000"
                    stroke="#000000"
                    strokeWidth={3}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chatbot Component integrated into grid */}
        <div className="lg:col-span-1 border-brand-black h-[350px]">
          <Chatbot
            careerName={careerName}
            timelineSummary={finalStateContext}
          />
        </div>
      </div>
    </div>
  );
};
export default SimulationResults;
