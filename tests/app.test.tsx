import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('page structure', () => {
  it('has one h1, a main landmark and a skip link', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });

  it('nav links point at sections that exist', () => {
    const { container } = render(<App />);
    const links = within(screen.getByRole('navigation', { name: 'Sections' })).getAllByRole('link');
    for (const link of links) {
      const id = link.getAttribute('href')!.slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(container.querySelector('#charter')).not.toBeNull();
  });
});

describe('route planner', () => {
  it('shows an empty state, then plots the default route', async () => {
    const user = userEvent.setup();
    render(<App />);
    const status = screen.getAllByRole('status')[0];
    expect(status).toHaveTextContent('Pick two stations and a thrust, then plot the route.');
    await user.click(screen.getByRole('button', { name: 'Plot route' }));
    expect(status).toHaveTextContent('Lagos Ring to Elysium Port at 0.6 g');
    expect(status).toHaveTextContent(/Transit\s*\d+ days? \d+ h/);
    expect(status).toHaveTextContent(/Distance\s*0\.\d\d AU/);
  });

  it('gets faster with more thrust', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('To'), 'titan');
    await user.click(screen.getByLabelText('Comfort 0.3 g'));
    await user.click(screen.getByRole('button', { name: 'Plot route' }));
    const slow = screen.getAllByRole('status')[0].textContent!;
    await user.click(screen.getByLabelText('Express 1 g'));
    await user.click(screen.getByRole('button', { name: 'Plot route' }));
    const fast = screen.getAllByRole('status')[0].textContent!;
    const days = (s: string) => Number(/Transit(\d+) days/.exec(s)![1]);
    expect(days(fast)).toBeLessThan(days(slow));
    expect(fast).toContain('Lagos Ring to Titan Lantern at 1 g');
  });

  it('swaps origin and destination', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Swap origin and destination' }));
    expect(screen.getByLabelText('From')).toHaveValue('elysium');
    expect(screen.getByLabelText('To')).toHaveValue('lagos');
  });

  it('refuses a jump to the same station and says how to fix it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('To'), 'lagos');
    await user.click(screen.getByRole('button', { name: 'Plot route' }));
    const to = screen.getByLabelText('To');
    expect(to).toHaveAttribute('aria-invalid', 'true');
    expect(to).toHaveAccessibleDescription('Choose a destination different from your origin.');
    expect(to).toHaveFocus();
  });

  it('station rows fill the destination and draw the route on the map', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Plot a jump to Ceres Hold' }));
    expect(screen.getByLabelText('To')).toHaveValue('ceres');
    expect(screen.getByLabelText('To')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Plot route' }));
    expect(screen.getByRole('img', { name: /route from Lagos Ring to Ceres Hold/ })).toBeInTheDocument();
  });

  it('picking the origin as destination swaps instead of making a zero jump', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Plot a jump to Lagos Ring' }));
    expect(screen.getByLabelText('From')).toHaveValue('elysium');
    expect(screen.getByLabelText('To')).toHaveValue('lagos');
  });
});

describe('charter form', () => {
  it('validates on submit and focuses the first invalid field', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Sign the charter' }));
    const name = screen.getByLabelText('Your name');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Enter your name, at least 2 characters.');
    expect(name).toHaveFocus();
    await user.type(name, 'Ada Okafor');
    await user.click(screen.getByRole('button', { name: 'Sign the charter' }));
    expect(screen.getByText('Choose the discipline you want to train in.')).toBeInTheDocument();
  });

  it('creates a charter and downloads it as an SVG file', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:charter');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const clicks: HTMLAnchorElement[] = [];
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this);
    });
    render(<App />);
    await user.type(screen.getByLabelText('Your name'), 'Ada Okafor');
    await user.selectOptions(screen.getByLabelText('Home station'), 'ceres');
    await user.click(screen.getByLabelText('Navigator'));
    await user.click(screen.getByRole('button', { name: 'Sign the charter' }));
    const heading = screen.getByRole('heading', { name: 'Welcome aboard, Ada Okafor' });
    expect(heading).toHaveFocus();
    expect(screen.getByText(/^ESG-\d{6}$/)).toBeInTheDocument();
    expect(within(heading.closest('.charter') as HTMLElement).getByText('Ceres Hold')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Download charter' }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe('image/svg+xml');
    expect(await blob.text()).toContain('Ada Okafor');
    expect(clicks[0].download).toBe('elysium-charter-ada-okafor.svg');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:charter');
    clickSpy.mockRestore();
  });
});
