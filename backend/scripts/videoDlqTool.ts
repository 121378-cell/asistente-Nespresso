import { listVideoDlqEntries, redriveVideoJobFromDlq } from '../src/services/videoJobService.js';

const command = process.argv[2];

const getArg = (name: string): string | undefined => {
  const index = process.argv.findIndex((arg) => arg === name);
  if (index < 0 || index + 1 >= process.argv.length) {
    return undefined;
  }
  return process.argv[index + 1];
};

const run = async () => {
  if (command === 'list') {
    const entries = await listVideoDlqEntries();
    console.log(JSON.stringify({ count: entries.length, entries }, null, 2));
    return;
  }

  if (command === 'redrive') {
    const jobId = getArg('--jobId');
    const requestId = getArg('--requestId') ?? `manual-redrive-${Date.now()}`;

    if (!jobId) {
      throw new Error('Missing --jobId');
    }

    const result = await redriveVideoJobFromDlq(jobId, requestId);
    if (!result) {
      throw new Error(`Job not found in DLQ: ${jobId}`);
    }

    console.log(
      JSON.stringify(
        {
          redriven: true,
          jobId: result.id,
          status: result.status,
          requestId: result.requestId,
        },
        null,
        2
      )
    );
    return;
  }

  throw new Error(
    'Usage: tsx scripts/videoDlqTool.ts <list|redrive> [--jobId <uuid>] [--requestId <id>]'
  );
};

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
