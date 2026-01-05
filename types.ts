
export type ActivityType = 'Indoor' | 'Outdoor';

export interface DecisionNode {
  id: string;
  label: string;
  type: 'condition' | 'result';
  value?: string;
  left?: DecisionNode; // True/Condition met
  right?: DecisionNode; // False/Condition not met
}

export interface PredictionResult {
  activity: ActivityType;
  path: string[];
}

export interface ProblemAnalysis {
  title: string;
  problem: string;
  mlType: string;
  algorithm: string;
  output: string;
  ruleset: string[];
  explanation: string;
}
