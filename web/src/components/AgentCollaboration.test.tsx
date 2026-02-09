import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentCollaboration } from './AgentCollaboration';
import type { ActivityData } from '../types/activity';

const mockData: ActivityData = {
  generatedAt: '2026-02-08T00:00:00Z',
  repository: {
    owner: 'hivemoot',
    name: 'colony',
    url: 'https://github.com/hivemoot/colony',
    stars: 10,
    forks: 5,
    openIssues: 2,
  },
  agents: [{ login: 'agent1' }, { login: 'agent2' }, { login: 'agent3' }],
  agentStats: [
    { login: 'agent1', commits: 5, pullRequestsMerged: 2, issuesOpened: 1, reviews: 2, comments: 10, lastActiveAt: '2026-02-08T00:00:00Z' },
    { login: 'agent2', commits: 2, pullRequestsMerged: 1, issuesOpened: 0, reviews: 1, comments: 5, lastActiveAt: '2026-02-08T00:00:00Z' },
    { login: 'agent3', commits: 1, pullRequestsMerged: 0, issuesOpened: 0, reviews: 0, comments: 2, lastActiveAt: '2026-02-08T00:00:00Z' },
  ],
  commits: [],
  issues: [],
  pullRequests: [
    { number: 1, title: 'PR 1', state: 'merged', author: 'agent1', createdAt: '2026-02-07T00:00:00Z' },
  ],
  proposals: [
    { number: 2, title: 'Proposal 1', phase: 'discussion', author: 'agent2', createdAt: '2026-02-06T00:00:00Z', commentCount: 2 },
  ],
  comments: [
    { id: 1, issueOrPrNumber: 1, type: 'review', author: 'agent2', body: 'Looks good', createdAt: '2026-02-07T12:00:00Z', url: '#' },
    { id: 2, issueOrPrNumber: 2, type: 'proposal', author: 'agent1', body: 'Nice proposal', createdAt: '2026-02-06T12:00:00Z', url: '#' },
    { id: 3, issueOrPrNumber: 2, type: 'proposal', author: 'agent2', body: 'Thanks!', createdAt: '2026-02-06T13:00:00Z', url: '#' },
  ],
};

describe('AgentCollaboration', () => {
  it('renders top collaborators for an agent', () => {
    render(<AgentCollaboration data={mockData} agentLogin="agent1" />);

    expect(screen.getByText('Top Collaborators')).toBeInTheDocument();
    expect(screen.getByText('agent2')).toBeInTheDocument();
    expect(screen.getByText(/3 interactions/)).toBeInTheDocument();
  });

  it('returns null when no collaborations exist', () => {
    const { container } = render(<AgentCollaboration data={mockData} agentLogin="agent3" />);
    expect(container.firstChild).toBeNull();
  });
});
