import { describe, it, expect } from 'vitest';
import { buildShareGrid, buildShareText } from '../data/shareGrid.js';

describe('buildShareGrid', () => {
  it('renders one surface square per hop above ground level', () => {
    expect(buildShareGrid(3)).toBe('🟩🟩🟩🏁');
  });

  it('changes layer color as depth increases', () => {
    // depths 1-3 surface, 4-5 topsoil
    expect(buildShareGrid(5)).toBe('🟩🟩🟩🟫🟫🏁');
  });

  it('shows rock and magma layers on deep runs', () => {
    const grid = buildShareGrid(12);
    expect(grid.startsWith('🟩🟩🟩')).toBe(true);
    expect(grid.endsWith('🏁')).toBe(true);
  });

  it('caps at 12 squares and appends the remainder', () => {
    const grid = buildShareGrid(20);
    expect(grid).toContain('+8');
    expect(grid.endsWith('🏁')).toBe(true);
  });
});

describe('buildShareText', () => {
  it('is spoiler-free and contains all the key facts', () => {
    const text = buildShareText({ hole: 142, start: 'Octopus', hops: 5, par: 5, hopWord: 'hops' });
    const lines = text.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('Down The H⬤LE #142');
    expect(lines[1]).toBe('Octopus → 🎯');
    expect(lines[2]).toContain('5 hops · Par 5');
    expect(lines[3]).toBe('followthehole.com');
    expect(text).not.toContain('Philosophy'); // never leaks the target
  });
});
