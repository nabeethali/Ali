
import React from 'react';
import { DecisionNode } from '../types';

interface Props {
  node: DecisionNode;
  activePath: string[];
  level?: number;
  x?: number;
  y?: number;
  spacing?: number;
}

const DecisionTreeVisualizer: React.FC<Props> = ({ 
  node, 
  activePath, 
  level = 0, 
  x = 400, 
  y = 50, 
  spacing = 200 
}) => {
  const isActive = activePath.includes(node.id);
  const nodeRadius = node.type === 'result' ? 40 : 50;
  
  return (
    <g className="transition-all duration-500">
      {/* Draw edges to children */}
      {node.left && (
        <>
          <line 
            x1={x} y1={y} 
            x2={x - spacing / (level + 1)} y2={y + 120} 
            stroke={isActive && activePath.includes(node.left.id) ? "#3b82f6" : "#cbd5e1"}
            strokeWidth={isActive && activePath.includes(node.left.id) ? "4" : "2"}
          />
          <text x={x - spacing / (level + 2.5)} y={y + 60} className="text-[10px] fill-slate-400 font-bold" textAnchor="end">YES</text>
          <DecisionTreeVisualizer 
            node={node.left} 
            activePath={activePath} 
            level={level + 1} 
            x={x - spacing / (level + 1)} 
            y={y + 120} 
            spacing={spacing} 
          />
        </>
      )}
      {node.right && (
        <>
          <line 
            x1={x} y1={y} 
            x2={x + spacing / (level + 1)} y2={y + 120} 
            stroke={isActive && activePath.includes(node.right.id) ? "#3b82f6" : "#cbd5e1"}
            strokeWidth={isActive && activePath.includes(node.right.id) ? "4" : "2"}
          />
          <text x={x + spacing / (level + 2.5)} y={y + 60} className="text-[10px] fill-slate-400 font-bold" textAnchor="start">NO</text>
          <DecisionTreeVisualizer 
            node={node.right} 
            activePath={activePath} 
            level={level + 1} 
            x={x + spacing / (level + 1)} 
            y={y + 120} 
            spacing={spacing} 
          />
        </>
      )}

      {/* Draw node */}
      <circle 
        cx={x} cy={y} r={nodeRadius} 
        className={`${isActive ? 'fill-blue-500 stroke-blue-600' : 'fill-white stroke-slate-300'} stroke-2 transition-colors`}
      />
      <foreignObject x={x - nodeRadius} y={y - nodeRadius} width={nodeRadius * 2} height={nodeRadius * 2}>
        <div className="flex items-center justify-center h-full w-full p-2 text-center pointer-events-none">
          <span className={`text-[10px] leading-tight font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>
            {node.label}
          </span>
        </div>
      </foreignObject>
    </g>
  );
};

export default DecisionTreeVisualizer;
