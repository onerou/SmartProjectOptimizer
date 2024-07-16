export function applyCustomRules(projectData: any, customRules: any): any {
  const rules = {
    detectLargeFiles: (fileContent: string) => {
      const lines = fileContent.split("\n").length;
      if (lines > 500 && customRules.detectLargeFiles) {
        return "File is too large, consider splitting into smaller modules.";
      }
      return null;
    },
    // Add more custom rules here...
  };

  const suggestions = [];
  for (const [filePath, fileContent] of Object.entries(projectData)) {
    for (const [ruleName, ruleFunction] of Object.entries(rules)) {
      const result = ruleFunction(fileContent as string);
      if (result) {
        suggestions.push({ filePath, ruleName, message: result });
      }
    }
  }

  return suggestions;
}
