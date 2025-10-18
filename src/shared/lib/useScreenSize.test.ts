import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScreenSize } from './useScreenSize';

describe('useScreenSize Hook', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    // Restore original window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  it('should return "small" for widths less than 768px', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBe('small');
  });

  it('should return "medium" for widths between 768px and 1024px', () => {
    setWindowWidth(800);
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBe('medium');
  });

  it('should return "large" for widths between 1024px and 1280px', () => {
    setWindowWidth(1100);
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBe('large');
  });

  it('should return "xlarge" for widths 1280px and above', () => {
    setWindowWidth(1920);
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBe('xlarge');
  });

  it('should handle exact breakpoint values correctly', () => {
    // Test at exactly 768px (medium)
    setWindowWidth(768);
    const { result: result1 } = renderHook(() => useScreenSize());
    expect(result1.current).toBe('medium');

    // Test at exactly 1024px (large)
    setWindowWidth(1024);
    const { result: result2 } = renderHook(() => useScreenSize());
    expect(result2.current).toBe('large');

    // Test at exactly 1280px (xlarge)
    setWindowWidth(1280);
    const { result: result3 } = renderHook(() => useScreenSize());
    expect(result3.current).toBe('xlarge');
  });

  it('should update screen size on window resize', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useScreenSize());

    expect(result.current).toBe('small');

    // Simulate window resize
    act(() => {
      setWindowWidth(1100);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('large');
  });

  it('should update screen size multiple times on multiple resizes', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useScreenSize());

    expect(result.current).toBe('small');

    // First resize
    act(() => {
      setWindowWidth(800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe('medium');

    // Second resize
    act(() => {
      setWindowWidth(1100);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe('large');

    // Third resize
    act(() => {
      setWindowWidth(1920);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe('xlarge');
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    setWindowWidth(800);
    const { unmount } = renderHook(() => useScreenSize());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
    removeEventListenerSpy.mockRestore();
  });

  it('should handle edge case of very small screen', () => {
    setWindowWidth(320);
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBe('small');
  });

  it('should handle edge case of very large screen', () => {
    setWindowWidth(3840);
    const { result } = renderHook(() => useScreenSize());
    expect(result.current).toBe('xlarge');
  });
});
