export interface Content {
  id: string;
  type: string;
  data: any;
}

export async function createContent(blockId: string, content: Content): Promise<Content> {
  throw new Error('Not implemented');
}

export async function updateContent(contentId: string, updates: Partial<Content>): Promise<Content> {
  throw new Error('Not implemented');
}

export async function deleteContent(contentId: string): Promise<void> {
  throw new Error('Not implemented');
}
