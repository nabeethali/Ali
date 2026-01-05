
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeProblemImage } from './services/geminiService';
import { ProblemAnalysis, DecisionNode, ActivityType, PredictionResult } from './types';
import DecisionTreeVisualizer from './components/DecisionTreeVisualizer';

// Hardcoded static tree structure based on typical classification logic for this problem
const DEFAULT_TREE: DecisionNode = {
  id: 'root',
  label: 'Is Temp > 30°C?',
  type: 'condition',
  left: {
    id: 'hot_indoor',
    label: 'Indoor (Too Hot)',
    type: 'result',
    value: 'Indoor'
  },
  right: {
    id: 'temp_check_2',
    label: 'Is Temp < 10°C?',
    type: 'condition',
    left: {
      id: 'cold_indoor',
      label: 'Indoor (Too Cold)',
      type: 'result',
      value: 'Indoor'
    },
    right: {
      id: 'humidity_check',
      label: 'Is Humidity > 75%?',
      type: 'condition',
      left: {
        id: 'humid_indoor',
        label: 'Indoor (Too Humid)',
        type: 'result',
        value: 'Indoor'
      },
      right: {
        id: 'pleasant_outdoor',
        label: 'Outdoor (Perfect!)',
        type: 'result',
        value: 'Outdoor'
      }
    }
  }
};

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [temp, setTemp] = useState<number>(22);
  const [humidity, setHumidity] = useState<number>(50);
  const [prediction, setPrediction] = useState<PredictionResult>({ activity: 'Outdoor', path: ['root', 'temp_check_2', 'humidity_check', 'pleasant_outdoor'] });

  const runPrediction = useCallback((t: number, h: number) => {
    const path: string[] = ['root'];
    let current: DecisionNode | undefined = DEFAULT_TREE;
    let finalActivity: ActivityType = 'Outdoor';

    while (current && current.type === 'condition') {
      if (current.id === 'root') {
        if (t > 30) {
          current = current.left;
        } else {
          current = current.right;
        }
      } else if (current.id === 'temp_check_2') {
        if (t < 10) {
          current = current.left;
        } else {
          current = current.right;
        }
      } else if (current.id === 'humidity_check') {
        if (h > 75) {
          current = current.left;
        } else {
          current = current.right;
        }
      } else {
        break;
      }
      
      if (current) {
        path.push(current.id);
        if (current.type === 'result' && current.value) {
          finalActivity = current.value as ActivityType;
        }
      }
    }

    setPrediction({ activity: finalActivity, path });
  }, []);

  useEffect(() => {
    runPrediction(temp, humidity);
  }, [temp, humidity, runPrediction]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeProblemImage(base64);
        setAnalysis(result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Analysis failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Weather Classifier</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Decision Tree Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {loading ? "Analyzing..." : "Analyze Problem Image"}
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={loading} />
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls & AI Analysis */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Input Parameters
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">Temperature (°C)</label>
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{temp}°C</span>
                </div>
                <input 
                  type="range" min="0" max="45" value={temp} 
                  onChange={(e) => setTemp(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">Humidity (%)</label>
                  <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">{humidity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={humidity} 
                  onChange={(e) => setHumidity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
          </section>

          {analysis ? (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                AI Problem Analysis
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Problem</h3>
                  <p className="text-sm text-slate-700 font-medium">{analysis.problem}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">ML Type</h3>
                    <p className="text-sm text-slate-700 font-medium">{analysis.mlType}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Algorithm</h3>
                    <p className="text-sm text-slate-700 font-medium">{analysis.algorithm}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Ruleset Generation</h3>
                  <ul className="mt-2 space-y-1">
                    {analysis.ruleset.map((rule, idx) => (
                      <li key={idx} className="text-[12px] py-1 px-2 bg-slate-50 border border-slate-100 rounded text-slate-600">
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Educational Context</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 italic">
                    "{analysis.explanation}"
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
              <div className="mx-auto w-12 h-12 text-slate-300 mb-3">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Upload the problem image to see AI analysis of the logic.</p>
            </div>
          )}
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Inference Engine</h2>
                <p className="text-slate-500 text-sm">Visualizing the Decision Tree path based on inputs</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">Current Prediction</span>
                <span className={`text-2xl font-black ${prediction.activity === 'Outdoor' ? 'text-green-600' : 'text-amber-600'}`}>
                  {prediction.activity}
                </span>
              </div>
            </div>

            <div className="w-full flex justify-center bg-slate-50 rounded-xl py-8">
              <svg width="800" height="450" viewBox="0 0 800 450" className="max-w-full h-auto overflow-visible">
                <DecisionTreeVisualizer node={DEFAULT_TREE} activePath={prediction.path} />
              </svg>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active Input</p>
                <p className="text-sm font-semibold">{temp}°C / {humidity}%</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tree Depth</p>
                <p className="text-sm font-semibold">3 Levels</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ML Task</p>
                <p className="text-sm font-semibold">Classification</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-sm font-semibold">Live Prediction</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-600 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.334-.398-1.817a1 1 0 00-1.514-.88c-.378.226-.666.591-.819 1.032a4.524 4.524 0 00-.034 2.737c.195.898.597 1.718 1.027 2.415.43.697.863 1.196 1.144 1.456a1 1 0 01.102 1.222 12.512 12.512 0 01-1.491 2.011 5.57 5.57 0 01-2.024 1.447 1 1 0 00.567 1.915c.741-.22 1.407-.614 1.974-1.076a12.727 12.727 0 002.358-2.51 8.03 8.03 0 01.925-1.092c.445-.423.953-.784 1.481-1.062a10.046 10.046 0 01-1.378 4.07 1 1 0 101.788.894 12.046 12.046 0 001.734-4.697 2.019 2.019 0 01.559-1.011c.106-.109.217-.22.332-.337a9.054 9.054 0 001.192-1.412c.499-.705.996-1.569 1.396-2.533.402-.966.675-1.933.821-2.822.145-.887.155-1.62.03-2.119a1 1 0 00-1.333-.747c-.442.14-.79.446-1.001.815a4.419 4.419 0 00-.496 1.352c-.07.402-.12.809-.16 1.207a23.313 23.313 0 01-.43 2.607c-.161.777-.346 1.531-.528 2.227-.182.696-.346 1.306-.462 1.75a1 1 0 01-1.79.467 6.29 6.29 0 00-1.166-1.15 25.824 25.824 0 01.696-3.85c.228-.975.494-1.92.839-2.751.346-.834.76-1.543 1.26-2.113a1 1 0 00-.271-1.548z" clipRule="evenodd"></path></svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2 tracking-tight">How it works</h3>
              <p className="opacity-90 leading-relaxed max-w-xl">
                The Decision Tree splits data into subsets based on the most significant features. 
                In this case, <strong>Temperature</strong> is our root node because it often dictates activity before humidity. 
                The algorithm follows the path of criteria until it reaches a leaf node—the final activity suggestion.
              </p>
              <div className="mt-6 flex gap-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Supervised Learning</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Classification</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Non-Linear Data</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-400 text-sm">
            © 2024 Weather Classifier AI. Built with Gemini 3 for ML Problem Solving.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors">Documentation</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors">Algorithm Guide</a>
            <a href="#" className="text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors">Source Code</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
