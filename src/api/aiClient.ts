import axios from "axios";

export class AIClient {
  private apiEndpoint: string;
  private apiToken: string;

  constructor(apiEndpoint: string, apiToken: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiToken = apiToken;
  }

  async askQuestion(question: string, projectData: any) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/ask`,
        {
          question,
          projectData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error asking question to AI:", error);
      return "There was an error processing your request.";
    }
  }

  async sendProjectData(projectData: any) {
    try {
      await axios.post(
        `${this.apiEndpoint}/data`,
        {
          projectData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );
    } catch (error) {
      console.error("Error sending project data to AI:", error);
    }
  }
}
