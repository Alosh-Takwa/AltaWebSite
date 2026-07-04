export interface CampaignResult {
  slogan: string;
  conceptCore: string;
  storyboard: string;
  billboardIdea: string;
  strategy: string[];
  isFallback?: boolean;
}

export type ActiveSection = 'home' | 'generator' | 'services' | 'process' | 'calculator' | 'portfolio' | 'contact';
