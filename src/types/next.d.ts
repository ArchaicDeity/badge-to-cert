// Minimal Next.js type stubs to satisfy TypeScript when importing
// `NextApiRequest` and `NextApiResponse` without installing the full
// Next.js framework. These interfaces cover only the properties used in
// the project and can be extended if needed.

declare module 'next' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface NextApiRequest extends IncomingMessage {
    query: Record<string, string | string[] | undefined>;
    body?: unknown;
    [key: string]: unknown;
  }

  export interface NextApiResponse<T = unknown> extends ServerResponse {
    status: (statusCode: number) => NextApiResponse<T>;
    json: (body: T) => void;
    send: (body: unknown) => void;
  }
}

