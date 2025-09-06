/* @vitest-environment jsdom */
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

function PublishButton() {
  const [status, setStatus] = useState('');

  const handlePublish = async () => {
    const res = await fetch('/api/publish', { method: 'POST' });
    setStatus(res.ok ? 'Published!' : 'Failed');
  };

  return (
    <div>
      <button onClick={handlePublish}>Publish</button>
      {status && <span>{status}</span>}
    </div>
  );
}

describe('Publish flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles server success response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: true } as Response);
    render(<PublishButton />);
    fireEvent.click(screen.getByText('Publish'));
    await waitFor(() => expect(screen.getByText('Published!')).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith('/api/publish', { method: 'POST' });
  });
});
