// Future backend: direct signed storage uploads only. Never post video bytes to Vercel.
export type ProcessingStage =
  | 'queued'
  | 'extracting-frames'
  | 'estimating-poses'
  | 'training'
  | 'exporting'
  | 'completed'
  | 'failed'
  | 'cancelled';
export interface ProcessingJob {
  id: string;
  stage: ProcessingStage;
  progress?: number;
  error?: { code: string; message: string; retryable: boolean };
  output?: { url: string; format: 'ply' | 'sog'; expiresAt?: string };
}
export interface ProcessingProvider {
  readonly connected: boolean;
  readonly supportsCancellation: boolean;
  createUpload(
    input: { name: string; size: number; mime: string },
    signal?: AbortSignal,
  ): Promise<{ uploadUrl: string; objectKey: string; headers: Record<string, string> }>;
  createJob(
    input: { projectId: string; videoObjectKey: string; idempotencyKey: string },
    signal?: AbortSignal,
  ): Promise<{ jobId: string }>;
  getJob(jobId: string, signal?: AbortSignal): Promise<ProcessingJob>;
  cancelJob(jobId: string, signal?: AbortSignal): Promise<void>;
  retryJob(jobId: string, idempotencyKey: string, signal?: AbortSignal): Promise<{ jobId: string }>;
}
const disconnected = async (): Promise<never> => {
  throw new Error('موتور پردازش متصل نیست. هیچ فایلی ارسال نشده است.');
};
export const processingProvider: ProcessingProvider = {
  connected: false,
  supportsCancellation: false,
  createUpload: disconnected,
  createJob: disconnected,
  getJob: disconnected,
  cancelJob: disconnected,
  retryJob: disconnected,
};
