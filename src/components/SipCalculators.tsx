import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, Target, ArrowRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SipCalculators: React.FC = () => {
  const [calcType, setCalcType] = useState<'sip' | 'stepup' | 'goal'>('sip');

  // Standard SIP State
  const [monthlySip, setMonthlySip] = useState(15000);
  const [returnRate, setReturnRate] = useState(14);
  const [years, setYears] = useState(10);

  // Step-up SIP State
  const [stepUpPercent, setStepUpPercent] = useState(10);

  // Goal Planner State
  const [targetGoalAmount, setTargetGoalAmount] = useState(10000000); // 1 Crore
  const [goalYears, setGoalYears] = useState(15);
  const [goalReturnRate, setGoalReturnRate] = useState(13);

  // Standard SIP Calculation
  const calculateStandardSip = () => {
    const monthlyRate = returnRate / 12 / 100;
    const months = years * 12;
    const totalInvested = monthlySip * months;
    const totalValue =
      monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estimatedReturns = Math.round(totalValue - totalInvested);

    // Chart trajectory data
    const chartData = [];
    let currentInvested = 0;
    let currentValue = 0;
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      currentInvested = monthlySip * m;
      currentValue =
        monthlySip * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
      chartData.push({
        year: `Yr ${y}`,
        Invested: Math.round(currentInvested),
        Wealth: Math.round(currentValue),
      });
    }

    return { totalInvested, estimatedReturns, totalValue: Math.round(totalValue), chartData };
  };

  // Step-Up SIP Calculation
  const calculateStepUpSip = () => {
    const monthlyRate = returnRate / 12 / 100;
    let currentSip = monthlySip;
    let totalInvested = 0;
    let accumulatedValue = 0;
    const chartData = [];

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentSip;
        accumulatedValue = (accumulatedValue + currentSip) * (1 + monthlyRate);
      }
      chartData.push({
        year: `Yr ${y}`,
        Invested: Math.round(totalInvested),
        Wealth: Math.round(accumulatedValue),
      });
      currentSip = currentSip * (1 + stepUpPercent / 100);
    }

    return {
      totalInvested: Math.round(totalInvested),
      totalValue: Math.round(accumulatedValue),
      estimatedReturns: Math.round(accumulatedValue - totalInvested),
      chartData,
    };
  };

  // Goal Planner Calculation
  const calculateRequiredSipForGoal = () => {
    const monthlyRate = goalReturnRate / 12 / 100;
    const months = goalYears * 12;
    const requiredMonthly =
      (targetGoalAmount * monthlyRate) /
      ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
    return Math.round(requiredMonthly);
  };

  const sipResult = calculateStandardSip();
  const stepUpResult = calculateStepUpSip();
  const requiredSip = calculateRequiredSipForGoal();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-3.5 h-3.5" /> Distributor Financial Engineering Suite
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Mutual Fund Wealth Creation &amp; SIP Calculators
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Institutional-grade compounding engines to demonstrate power of SIP, Step-Up SIP, and goal planning to your clients.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
          <button
            onClick={() => setCalcType('sip')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              calcType === 'sip' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            Standard SIP
          </button>
          <button
            onClick={() => setCalcType('stepup')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              calcType === 'stepup' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            Step-Up SIP (+10%/yr)
          </button>
          <button
            onClick={() => setCalcType('goal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              calcType === 'goal' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            Goal Planner
          </button>
        </div>
      </div>

      {/* Standard / Step-up SIP Calculator UI */}
      {(calcType === 'sip' || calcType === 'stepup') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Monthly SIP Amount</span>
                <span className="text-blue-600 font-mono text-sm font-extrabold">
                  ₹{monthlySip.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={200000}
                step={1000}
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>₹1,000</span>
                <span>₹1,00,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Expected Return Rate (p.a.)</span>
                <span className="text-blue-600 font-mono text-sm font-extrabold">{returnRate}%</span>
              </div>
              <input
                type="range"
                min={8}
                max={22}
                step={0.5}
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>8% (Conservative)</span>
                <span>14% (Equity Avg)</span>
                <span>20% (Aggressive)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Time Period (Years)</span>
                <span className="text-amber-600 font-mono text-sm font-extrabold">{years} Years</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {calcType === 'stepup' && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Annual Step-up Percentage</span>
                  <span className="text-purple-600 font-mono text-sm font-extrabold">
                    +{stepUpPercent}% / year
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={5}
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <span className="text-[10px] text-gray-500 block mt-1">
                  Matches annual salary increments to dramatically accelerate corpus creation.
                </span>
              </div>
            )}
          </div>

          {/* Results & Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <span className="text-gray-500 text-xs block font-medium">Total Amount Invested</span>
                <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">
                  ₹{(calcType === 'sip' ? sipResult.totalInvested : stepUpResult.totalInvested).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <span className="text-gray-500 text-xs block font-medium">Estimated Wealth Gain</span>
                <span className="text-lg font-bold text-emerald-600 font-mono mt-1 block">
                  +₹{(calcType === 'sip' ? sipResult.estimatedReturns : stepUpResult.estimatedReturns).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <span className="text-gray-500 text-xs block font-medium">Total Future Corpus</span>
                <span className="text-lg font-bold text-blue-600 font-mono mt-1 block">
                  ₹{(calcType === 'sip' ? sipResult.totalValue : stepUpResult.totalValue).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Growth Curve Chart */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-900">Compounding Trajectory Over {years} Years</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Invested
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Total Wealth
                  </span>
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calcType === 'sip' ? sipResult.chartData : stepUpResult.chartData}>
                    <defs>
                      <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="Invested" stroke="#94a3b8" fill="#e2e8f0" />
                    <Area type="monotone" dataKey="Wealth" stroke="#2563eb" fillOpacity={1} fill="url(#colorWealth)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Planner UI */}
      {calcType === 'goal' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" /> Goal-Based Financial Planner
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Calculate exact monthly SIP required to achieve milestones like Child Education, Dream Home, or Retirement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Corpus Goal (₹)
              </label>
              <input
                type="number"
                value={targetGoalAmount}
                onChange={(e) => setTargetGoalAmount(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-blue-600 font-medium mt-1 block">
                ₹{(targetGoalAmount / 10000000).toFixed(2)} Crore
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Time Remaining (Years)
              </label>
              <input
                type="number"
                min={1}
                max={35}
                value={goalYears}
                onChange={(e) => setGoalYears(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Expected Annualized Return (%)
              </label>
              <input
                type="number"
                min={6}
                max={20}
                value={goalReturnRate}
                onChange={(e) => setGoalReturnRate(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Goal Output Box */}
          <div className="bg-blue-50/60 rounded-2xl p-6 border border-blue-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                Required Monthly SIP to Achieve ₹{(targetGoalAmount / 10000000).toFixed(2)} Cr in {goalYears} Years:
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-blue-700 font-mono mt-1">
                ₹{requiredSip.toLocaleString('en-IN')} / month
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Assuming a diversified basket of Flexi Cap &amp; Mid Cap mutual funds at {goalReturnRate}% CAGR.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
