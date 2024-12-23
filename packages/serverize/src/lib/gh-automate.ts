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
export const ghAutomateWorkflow = (notification?: Step) => {
  const workflow = {
    name: 'Deploy PR previews',
    on: {
      pull_request: {
        types: ['opened', 'reopened', 'synchronize', 'closed'],
      },
    },
    concurrency: {
      group: 'preview-${{ github.workflow }}-${{ github.ref }}',
      'cancel-in-progress': true,
    },
    jobs: {
      deploy_preview: {
        'runs-on': 'ubuntu-latest',
        'continue-on-error': false,
        permissions: {
          contents: 'read',
        },
        env: {
          LOG_URL:
            '${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}',
          OUTPUT_FILE: '${{ runner.temp }}/serverize.json',
          SUCCESS_TEMPLATE:
            '## Deployed with :page_facing_up: Serverize\n| **Commit:** | ${{ github.event.pull_request.head.sha }} |\n| **Status:** | ✅ Success |\n| **Url:** | [Open](${{ steps.read_output.outputs.serverize }}) |\n| **Deploy Log:** | [View Log](${{env.LOG_URL}}) |',
          FAILED_TEMPLATE:
            '## Deploy Failed with :page_facing_up: Serverize\n| **Commit:** | ${{ github.event.pull_request.head.sha }} |\n| **Status:** | ❌ Failure |\n| **Deploy Log:** | [View Log](${{env.LOG_URL}}) |',
        },
        steps: [
          {
            uses: 'actions/checkout@v3',
          },
          {
            name: 'Deploy To Serverize',
            if: "${{ github.event.action != 'closed' }}",
            run: 'npx serverize deploy -c qa -r pr-${{ github.event.pull_request.number }} --output ${{env.OUTPUT_FILE}}',
            env: {
              SERVERIZE_API_TOKEN: `\${{ secrets.SERVERIZE_API_TOKEN }}`,
            },
          },
          {
            name: 'Set Deployment Output',
            id: 'read_output',
            run: 'echo "serverize=$(cat ${{env.OUTPUT_FILE}} | jq -r \'.url\')" >> $GITHUB_OUTPUT\n',
          },
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
