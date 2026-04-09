import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AutoCloseTimer } from './AutoCloseTimer';
import React from 'react';

describe('AutoCloseTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initially renders as hidden but structurally intact', () => {
    const handleComplete = vi.fn();
    const { container } = render(<AutoCloseTimer onComplete={handleComplete} durationMs={5000} />);

    const timerDiv = container.querySelector('.popup-auto-close-timer');
    expect(timerDiv).not.toBeNull();
    // It should have opacity 0 initially per the new changes
    expect(timerDiv).toHaveStyle({ opacity: 0 });
    // It should display '5' seconds initially
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('becomes visible and starts counting down when mouse leaves document body', () => {
    const handleComplete = vi.fn();
    const { container } = render(<AutoCloseTimer onComplete={handleComplete} durationMs={5000} />);

    const timerDiv = container.querySelector('.popup-auto-close-timer');
    expect(timerDiv).toHaveStyle({ opacity: 0 });

    act(() => {
      document.body.dispatchEvent(new Event('mouseleave'));
    });

    // Expect opacity 1
    expect(timerDiv).toHaveStyle({ opacity: 1 });

    act(() => {
      vi.advanceTimersByTime(1050); // Advance 1 second
    });

    // Should display '4' now
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(handleComplete).not.toHaveBeenCalled();
  });

  it('triggers onComplete when the timer reaches zero', () => {
    const handleComplete = vi.fn();
    render(<AutoCloseTimer onComplete={handleComplete} durationMs={3000} />);

    act(() => {
      document.body.dispatchEvent(new Event('mouseleave'));
    });

    act(() => {
      // 3000ms duration
      vi.advanceTimersByTime(3100);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('pauses and resets when mouse enters document body', () => {
    const handleComplete = vi.fn();
    const { container } = render(<AutoCloseTimer onComplete={handleComplete} durationMs={5000} />);

    // Leave to start timer
    act(() => {
      document.body.dispatchEvent(new Event('mouseleave'));
    });

    act(() => {
      vi.advanceTimersByTime(2000); // 2 seconds pass
    });

    expect(screen.getByText('3')).toBeInTheDocument();

    // Re-enter to reset
    act(() => {
      document.body.dispatchEvent(new Event('mouseenter'));
    });

    const timerDiv = container.querySelector('.popup-auto-close-timer');
    expect(timerDiv).toHaveStyle({ opacity: 0 });

    // Check reset to '5'
    expect(screen.getByText('5')).toBeInTheDocument();

    // Ensure it doesn't fire
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(handleComplete).not.toHaveBeenCalled();
  });
});
