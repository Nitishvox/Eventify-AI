import { Milestone } from '../types';

export const MILESTONES_DATA: Omit<Milestone, 'achieved'>[] = [
  { id: 'linkedin', title: 'Social Spark', description: 'First LinkedIn post with 500+ likes', threshold: 25, prize: 2500 },
  { id: 'x', title: 'Viral Velocity', description: 'First post on X with 400k+ views', threshold: 50, prize: 2500 },
  { id: 'reach', title: 'Content Champion', description: 'Post with most reach', threshold: 100, prize: 2500 },
  { id: 'youtube', title: 'Influencer Impact', description: 'First tech YouTuber with 100k+ subscribers to feature you', threshold: 250, prize: 2500 },
  { id: 'arr', title: 'Revenue Rocket', description: 'First to reach $1,000 ARR', threshold: 500, prize: 5000 },
  { id: 'customers', title: 'Market Leader', description: 'Person to get the most customers', threshold: 1000, prize: 5000 },
  { id: 'tba', title: 'Mystery Milestone', description: 'To be announced...', threshold: 2000, prize: 5000 },
];
