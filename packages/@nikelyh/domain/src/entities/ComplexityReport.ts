export interface FunctionComplexity {
  name: string;
  complexity: number;
  line: number;
}

export interface FileComplexity {
  filePath: string;
  functions: FunctionComplexity[];
  maxComplexity: number;
  averageComplexity: number;
}

export interface ComplexityReport {
  projectId: string;
  files: FileComplexity[];
  totalFunctions: number;
  averageComplexity: number;
  highestComplexityFile: string;
  highestComplexityFunction: {
    name: string;
    filePath: string;
    complexity: number;
  } | null;
}
