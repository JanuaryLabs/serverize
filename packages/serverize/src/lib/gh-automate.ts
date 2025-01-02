import yaml from 'js-yaml';

interface Step {
  action: {
    name?: string;
    uses: string;
    if?: string;
    run?: string;
    env?: Record<string, string>;
    with?: Record<string, any>;
  };
  vars?: string[];
}

export const ghAutomateWorkflow = (channel: string, notification?: Step) => {
  const env = {
    LOG_URL:
      '${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}',
    SUCCESS_TEMPLATE:
      '## Deployed with :page_facing_up: Serverize\n| **Commit:** | ${{ github.event.pull_request.head.sha }} |\n| **Status:** | ✅ Success |\n| **Url:** | [Open](${{ steps.read_output.outputs.serverize }}) |\n| **Deploy Log:** | [View Log](${{env.LOG_URL}}) |',
    FAILED_TEMPLATE:
      '## Deploy Failed with :page_facing_up: Serverize\n| **Commit:** | ${{ github.event.pull_request.head.sha }} |\n| **Status:** | ❌ Failure |\n| **Deploy Log:** | [View Log](${{env.LOG_URL}}) |',
    OUTPUT_FILE: '${{ runner.temp }}/serverize.json',
  };
  const workflow = {
    name: 'Deploy',
    on: {
      pull_request: {
        types: ['opened', 'reopened', 'synchronize', 'closed'],
      },
    },
    concurrency: {
      group: '${{ github.workflow }}-${{ github.ref }}',
      'cancel-in-progress': true,
    },
    jobs: {
      deploy: {
        'runs-on': 'ubuntu-latest',
        'continue-on-error': false,
        ...(notification
          ? {
              permissions: {
                contents: 'read',
              },
            }
          : {}),
        env: notification ? env : {},
        steps: [
          {
            uses: 'actions/checkout@v4',
          },
          {
            name: 'Deploy To Serverize',
            if: "${{ github.event.action != 'closed' }}",
            run: `npx serverize deploy -c ${channel} ${notification ? ' --output ${{env.OUTPUT_FILE}}' : ''}`,
            env: {
              SERVERIZE_API_TOKEN: `\${{ secrets.SERVERIZE_API_TOKEN }}`,
            },
          },
          notification
            ? {
                name: 'Set Deployment Output',
                id: 'read_output',
                run: 'echo "serverize=$(cat ${{env.OUTPUT_FILE}} | jq -r \'.url\')" >> $GITHUB_OUTPUT\n',
              }
            : null,
          notification?.action,
        ].filter(Boolean),
      },
    },
  };
  return {
    content: yaml.dump(workflow, {
      skipInvalid: false,
      noRefs: true,
      noCompatMode: true,
      schema: yaml.JSON_SCHEMA,
    }),
    vars: ['SERVERIZE_API_TOKEN', ...(notification?.vars ?? [])],
  };
};

export function discordNotification(): Step {
  return {
    action: {
      name: 'Discord Notification',
      uses: 'sarisia/actions-status-discord@v1',
      if: 'always()',
      with: {
        webhook: '${{ secrets.DISCORD_WEBHOOK }}',
        status: '${{ job.status }}',
        title: 'Deployment Status of ${{github.repository}}',
        url: '${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}',
        content:
          "${{ job.status == 'success' && ${{env.SUCCESS_TEMPLATE}} || ${{env.FAILED_TEMPLATE}} }}",
      },
    },
    vars: ['DISCORD_WEBHOOK'],
  };
}
export function slackNotification(): Step {
  return {
    action: {
      name: 'Slack Notification',
      if: 'always()',
      uses: 'rtCamp/action-slack-notify@v2',
      env: {
        SLACK_WEBHOOK: '${{ secrets.SLACK_WEBHOOK }}',
        SLACK_CHANNEL: 'general',
        SLACK_COLOR: '${{ job.status }}',
        SLACK_MESSAGE:
          "${{ job.status == 'success' && ${{env.SUCCESS_TEMPLATE}} || ${{env.FAILED_TEMPLATE}} }}",
        SLACK_TITLE: 'Deployment Status',
        SLACK_USERNAME: 'deployment',
      },
    },
    vars: ['SLACK_WEBHOOK'],
  };
}
