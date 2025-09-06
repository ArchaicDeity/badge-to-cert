/* @vitest-environment jsdom */
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { arrayMove } from '@dnd-kit/sortable';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

function BlockEditor() {
  const [blocks, setBlocks] = useState<string[]>([]);
  const addBlock = () => setBlocks((prev) => [...prev, `Block ${prev.length + 1}`]);
  const reorderBlocks = (from: number, to: number) =>
    setBlocks((prev) => arrayMove(prev, from, to));

  return (
    <div>
      <button onClick={addBlock}>Add Block</button>
      <button onClick={() => reorderBlocks(0, 1)} data-testid="swap" disabled={blocks.length < 2}>
        Swap First Two
      </button>
      <ul>
        {blocks.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

describe('BlockEditor', () => {
  it('creates and reorders blocks', () => {
    render(<BlockEditor />);
    const add = screen.getByText('Add Block');
    fireEvent.click(add);
    fireEvent.click(add);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Block 1',
      'Block 2',
    ]);

    fireEvent.click(screen.getByTestId('swap'));
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Block 2',
      'Block 1',
    ]);
  });
});
