export interface Block {
  id: string;
  title: string;
  contents: any[];
}

export async function addBlock(courseId: string, block: Block): Promise<any> {
  throw new Error('Not implemented');
}

export async function reorderBlocks(courseId: string, orderedBlockIds: string[]): Promise<any> {
  throw new Error('Not implemented');
}
