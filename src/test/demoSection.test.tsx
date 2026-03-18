import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import DemoSection from "../components/DemoSection";

describe("DemoSection EDI fix flow", () => {
  const parseResponse = {
    segments: [],
    errors: [{ row: 1, code: "E001", description: "Value invalid", segment_id: "ISA" }],
    metadata: [],
  };

  const fixResponse = {
    fixed_edi: "ISA*99~GS*99~",
    before_line: "ISA*00",
    after_line: "ISA*99",
  };

  let fetchMock: any;
  let lastFixBody: FormData | null = null;

  beforeEach(() => {
    lastFixBody = null;
    fetchMock = vi.fn(async (input: any, init: any) => {
      const url = String(input);
      if (url.includes("/parse-edi")) {
        return {
          ok: true,
          json: async () => parseResponse,
        };
      }
      if (url.includes("/fix-error")) {
        lastFixBody = init?.body;
        return {
          ok: true,
          json: async () => fixResponse,
        };
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({}),
      };
    });

    // @ts-ignore
    global.fetch = fetchMock;
  });

  it("sends /fix-error payload and opens fix modal", async () => {
    render(
      <DemoSection
        initialEdi="ISA*00~"
        initialErrors={[{ row: 1, code: "E001", description: "Value invalid", segment_id: "ISA" }]}
      />
    );

    fireEvent.click(screen.getByText("Errors (1)"));
    fireEvent.click(await screen.findByText("Fix"));

    await waitFor(() => expect(screen.getByText("Suggested Correction")).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/fix-error"), expect.anything());
    expect(lastFixBody).toBeInstanceOf(FormData);
    expect(lastFixBody?.get("code")).toBe("E001");
    expect(lastFixBody?.get("row")).toBe("1");
    expect(lastFixBody?.get("segment_id")).toBe("ISA");
    expect(lastFixBody?.get("file")).toBeTruthy();
  });

  it("accept button replaces EDI and triggers reparse", async () => {
    render(
      <DemoSection
        initialEdi="ISA*00~"
        initialErrors={[{ row: 1, code: "E001", description: "Value invalid", segment_id: "ISA" }]}
      />
    );

    fireEvent.click(screen.getByText("Errors (1)"));
    fireEvent.click(await screen.findByText("Fix"));

    await waitFor(() => expect(screen.getByText("Accept")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/parse-edi"), expect.anything());
      expect(screen.queryByText("Suggested Correction")).toBeNull();
    });
  });

  it("decline closes modal without changing EDI", async () => {
    render(
      <DemoSection
        initialEdi="ISA*00~"
        initialErrors={[{ row: 1, code: "E001", description: "Value invalid", segment_id: "ISA" }]}
      />
    );

    fireEvent.click(screen.getByText("Errors (1)"));
    fireEvent.click(await screen.findByText("Fix"));
    fireEvent.click(screen.getByText("Decline"));

    expect(screen.queryByText("Suggested Correction")).toBeNull();
  });

  it("manual fix update is applied", async () => {
    render(
      <DemoSection
        initialEdi="ISA*00~"
        initialErrors={[{ row: 1, code: "E001", description: "Value invalid", segment_id: "ISA" }]}
      />
    );

    fireEvent.click(screen.getByText("Errors (1)"));
    fireEvent.click(await screen.findByText("Fix"));

    fireEvent.click(screen.getByText("Fix Manually"));

    await waitFor(() => expect(screen.getByRole("textbox")).toBeInTheDocument());

    const manualArea = screen.getByRole("textbox");
    fireEvent.change(manualArea, { target: { value: "ISA*77" } });
    fireEvent.click(screen.getByText("Apply Manual Fix"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/parse-edi"), expect.anything());
      expect(screen.queryByText("Suggested Correction")).toBeNull();
    });
  });
});
