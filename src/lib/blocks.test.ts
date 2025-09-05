import { describe, expect, it } from "vitest";
import { deleteBlock, reorderBlocks, Block } from "./blocks";

const makeBlocks = (): Block[] => [
  {
    id: "b1",
    order: 1,
    type: "content_unit",
    contentUnits: [
      { id: "cu1" },
      { id: "cu2" },
    ],
  },
  {
    id: "b2",
    order: 2,
    type: "assessment",
    assessment: {
      id: "a1",
      questions: [
        { id: "q1" },
        { id: "q2" },
      ],
    },
  },
  {
    id: "b3",
    order: 3,
    type: "content_unit",
    contentUnits: [],
  },
];

describe("deleteBlock", () => {
  it("hard deletes a block and reorders remaining blocks", () => {
    const result = deleteBlock(makeBlocks(), "b2", { hard: true });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("b1");
    expect(result[0].order).toBe(1);
    expect(result[1].id).toBe("b3");
    expect(result[1].order).toBe(2);
  });

  it("soft deletes a content unit block and reorders others", () => {
    const result = deleteBlock(makeBlocks(), "b1");
    expect(result).toHaveLength(3);
    const deleted = result.find((b) => b.id === "b1");
    expect(deleted?.deleted).toBe(true);
    expect(deleted?.order).toBe(0);
    if (deleted && deleted.type === "content_unit") {
      expect(deleted.contentUnits.every((cu) => cu.deleted)).toBe(true);
    }
    const remaining = result.filter((b) => !b.deleted);
    expect(remaining.map((b) => b.order)).toEqual([1, 2]);
  });

  it("soft deletes an assessment block including its questions", () => {
    const result = deleteBlock(makeBlocks(), "b2");
    const deleted = result.find((b) => b.id === "b2");
    expect(deleted?.deleted).toBe(true);
    if (deleted && deleted.type === "assessment") {
      expect(deleted.assessment.deleted).toBe(true);
      expect(deleted.assessment.questions.every((q) => q.deleted)).toBe(true);
    }
  });
});

// Ensure reorderBlocks works independently
it("reorders blocks sequentially", () => {
  const blocks = makeBlocks();
  blocks[1].deleted = true;
  const reordered = reorderBlocks(blocks);
  expect(reordered.find((b) => b.id === "b2")?.order).toBe(0);
  expect(reordered.filter((b) => !b.deleted).map((b) => b.order)).toEqual([1, 2]);
});
