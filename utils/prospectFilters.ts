import type { Prospect } from '../components/mockData';

export const filterProspectsByView = (prospects: Prospect[], currentView: string): Prospect[] => {
  return prospects.filter((prospect) => {
    switch (currentView) {
      case "cold":
        return prospect.group === 0 && prospect.status !== "cold";
      case "warming":
        return prospect.group === 1 || prospect.group === 2;
      case "interested":
        return prospect.group === 3;
      case "hot-lead":
        return prospect.group === 4;
      case "hand-off":
        // Hand-off status only visible when engagement score > 6
        const engagementScore = prospect.opens + prospect.clicks;
        return (
          (prospect.group >= 5 || prospect.status === "handoff") &&
          engagementScore > 6
        );
      case "main-sequence":
        return (
          prospect.status !== "cold" && prospect.status !== "handoff"
        );
      case "import":
      case "ai-optimization":
        return true;
      default:
        return true;
    }
  });
};