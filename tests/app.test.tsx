import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';

describe('the station view', () => {
  it('contains only the requested visible words and describes the artwork accessibly', () => {
    const { container } = render(<App />);
    expect(container.textContent).toBe('elysium guild');
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getByRole('main')).toHaveAccessibleName('elysium guild');
    expect(screen.getByRole('img')).toHaveAccessibleName(/ring-shaped space station/);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('moves closer and restores the overview without changing the words', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const control = screen.getByRole('button', { name: 'View station closer' });
    expect(control).toHaveAttribute('aria-pressed', 'false');
    await user.click(control);
    expect(control).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('main')).toHaveAttribute('data-closer', 'true');
    expect(container.textContent).toBe('elysium guild');
    await user.click(control);
    expect(control).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('main')).toHaveAttribute('data-closer', 'false');
  });

  it('supports Tab, Enter, Space, and Escape and retains keyboard focus', async () => {
    const user = userEvent.setup();
    render(<App />);
    const control = screen.getByRole('button', { name: 'View station closer' });
    await user.tab();
    expect(control).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(control).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Escape}');
    expect(control).toHaveAttribute('aria-pressed', 'false');
    expect(control).toHaveFocus();
    await user.keyboard(' ');
    expect(control).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(control).toHaveAttribute('aria-pressed', 'false');
  });
});
