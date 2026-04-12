import { checkRateLimit } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    expect(checkRateLimit("test-allow-first", 5, 60_000)).toBe(true);
  });

  it("allows requests up to the limit", () => {
    const id = "test-up-to-limit";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(id, 5, 60_000)).toBe(true);
    }
  });

  it("blocks requests that exceed the limit", () => {
    const id = "test-block-exceed";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(id, 5, 60_000);
    }
    expect(checkRateLimit(id, 5, 60_000)).toBe(false);
  });

  it("resets after the time window expires", () => {
    const id = "test-reset-window";
    // Fill up the limit with a 1ms window (already expired)
    checkRateLimit(id, 1, 1);
    // Wait for the window to expire then try again
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(checkRateLimit(id, 1, 60_000)).toBe(true);
        resolve();
      }, 10);
    });
  });

  it("tracks different identifiers independently", () => {
    const id1 = "test-independent-a";
    const id2 = "test-independent-b";
    for (let i = 0; i < 3; i++) checkRateLimit(id1, 3, 60_000);
    // id1 is now exhausted, id2 should still be allowed
    expect(checkRateLimit(id1, 3, 60_000)).toBe(false);
    expect(checkRateLimit(id2, 3, 60_000)).toBe(true);
  });
});
