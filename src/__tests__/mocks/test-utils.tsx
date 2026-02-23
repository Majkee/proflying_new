import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { StudioContext } from "@/lib/hooks/use-studio";
import type { Studio } from "@/lib/types/database";
import { testStudio } from "./fixtures";
import { vi } from "vitest";

interface StudioContextOverrides {
  activeStudio?: Studio | null;
  studios?: Studio[];
  loading?: boolean;
  switchStudio?: (studioId: string) => void;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { studioContext?: StudioContextOverrides }
) {
  const { studioContext, ...renderOptions } = options ?? {};

  const studioValue = {
    activeStudio: studioContext?.activeStudio !== undefined ? studioContext.activeStudio : testStudio,
    studios: studioContext?.studios ?? [testStudio],
    loading: studioContext?.loading ?? false,
    switchStudio: studioContext?.switchStudio ?? vi.fn(),
  };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <StudioContext.Provider value={studioValue}>{children}</StudioContext.Provider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    studioValue,
  };
}
