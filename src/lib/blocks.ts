export interface Question {
  id: string;
  body?: string;
  choices?: string[];
  correctIndex?: number;
  tags?: string[];
  deleted?: boolean;
}

export interface ContentUnit {
  id: string;
  deleted?: boolean;
}

export interface Assessment {
  id: string;
  questions: Question[];
  deleted?: boolean;
}

export type Block =
  | {
      id: string;
      order: number;
      type: "content_unit";
      contentUnits: ContentUnit[];
      deleted?: boolean;
    }
  | {
      id: string;
      order: number;
      type: "assessment";
      assessment: Assessment;
      deleted?: boolean;
    };

export interface DeleteOptions {
  hard?: boolean;
}

/**
 * Remove a block by id. When soft deleting, the block and any nested items are
 * marked as deleted. When hard deleting, the block is removed entirely. After
 * removal, remaining blocks are reordered sequentially.
 */
export function deleteBlock(
  blocks: Block[],
  blockId: string,
  options: DeleteOptions = {}
): Block[] {
  const { hard = false } = options;

  if (hard) {
    const remaining = blocks.filter((b) => b.id !== blockId);
    return reorderBlocks(remaining);
  }

  const updated = blocks.map((block) => {
    if (block.id !== blockId) return block;
    if (block.type === "content_unit") {
      return {
        ...block,
        deleted: true,
        contentUnits: block.contentUnits.map((cu) => ({ ...cu, deleted: true })),
      } as Block;
    }
    if (block.type === "assessment") {
      return {
        ...block,
        deleted: true,
        assessment: {
          ...block.assessment,
          deleted: true,
          questions: block.assessment.questions.map((q) => ({
            ...q,
            deleted: true,
          })),
        },
      } as Block;
    }
    return { ...block, deleted: true } as Block;
  });

  return reorderBlocks(updated);
}

/**
 * Reorder blocks sequentially, skipping any that have been soft deleted. Deleted
 * blocks receive an order of 0.
 */
export function reorderBlocks(blocks: Block[]): Block[] {
  let order = 1;
  return blocks.map((block) => {
    if (block.deleted) {
      return { ...block, order: 0 };
    }
    return { ...block, order: order++ };
  });
}
