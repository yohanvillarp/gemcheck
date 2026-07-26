export interface ISourceHasher {
  hashDirectory(projectPath: string): Promise<string>;
}
