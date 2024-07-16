export class ProjectContext {
  private projectData: any;
  private config: any;
  private projectPath!: string;

  constructor() {
    this.projectData = {};
  }

  setConfig(config: any) {
    this.config = config;
  }

  setProjectPath(path: string) {
    this.projectPath = path;
  }

  updateContext(data: any) {
    this.projectData = { ...this.projectData, ...data };
  }

  getContext() {
    return this.projectData;
  }
}
