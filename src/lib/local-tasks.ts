import type { Task } from '@/lib/data';

export const LOCAL_TASKS: Task[] = [
  { id: 'brief-research', title: 'Prepare a market research brief', field: 'Research', rewardCents: 8500, hours: 4, level: 'Intermediate', difficulty: 'Intermediate', deadline: '5 days', slots: 8, description: 'Compare a small group of products and summarize customer needs, market patterns, and practical opportunities.', format: 'PDF' },
  { id: 'content-audit', title: 'Audit a small business website', field: 'Writing', rewardCents: 6200, hours: 3, level: 'Beginner', difficulty: 'Beginner', deadline: '4 days', slots: 12, description: 'Review a website for clarity, accessibility, and useful content improvements. Provide concise, actionable findings.', format: 'PDF' },
  { id: 'data-cleanup', title: 'Review and clean a sample dataset', field: 'Data', rewardCents: 11000, hours: 5, level: 'Advanced', difficulty: 'Advanced', deadline: '7 days', slots: 5, description: 'Inspect a supplied dataset for consistency, document cleaning decisions, and explain patterns in a short report.', format: 'PDF' },
  { id: 'product-copy', title: 'Write product descriptions', field: 'Marketing', rewardCents: 4800, hours: 2, level: 'Beginner', difficulty: 'Beginner', deadline: '3 days', slots: 10, description: 'Create clear, accurate product descriptions for a general audience using the supplied product facts.', format: 'PDF' },
];
