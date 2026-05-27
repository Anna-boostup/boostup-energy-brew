export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const payload = await req.json();
        const event = req.headers.get('x-github-event');

        // Základní metadata
        const repoName = payload.repository?.full_name || 'Unknown Repo';
        const sender = payload.sender?.login || 'GitHub User';
        const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

        if (!slackWebhookUrl) {
            console.error('[GitHub-to-Slack] SLACK_WEBHOOK_URL is missing');
            return new Response('Webhook URL missing', { status: 500 });
        }

        let slackMessage: any = { blocks: [] };

        // 1. Zpracování PUSH eventu
        if (event === 'push') {
            const branch = payload.ref?.split('/').pop() || 'unknown';
            const commitCount = payload.commits?.length || 0;
            const compareUrl = payload.compare || '';
            
            slackMessage.blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `🚀 *New Push to \`${branch}\`* in *${repoName}*`
                }
            });

            const commitList = payload.commits
                ?.slice(0, 5)
                .map((c: any) => `• _${c.message.split('\n')[0]}_ (by ${c.author.name})`)
                .join('\n') || 'No commits';

            slackMessage.blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Author:* ${sender}\n*Commits (${commitCount}):*\n${commitList}${commitCount > 5 ? '\n...and more' : ''}`
                }
            });

            if (compareUrl) {
                slackMessage.blocks.push({
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: { type: "plain_text", text: "View Changes" },
                            url: compareUrl,
                            style: "primary"
                        }
                    ]
                });
            }
        } 
        // 2. Zpracování PULL REQUEST eventu
        else if (event === 'pull_request') {
            const action = payload.action;
            const pr = payload.pull_request;
            const statusEmoji = action === 'opened' ? '📂' : (action === 'closed' ? '🔒' : '📝');

            slackMessage.blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `${statusEmoji} *PR ${action.toUpperCase()}:* <${pr.html_url}|#${pr.number} ${pr.title}>`
                }
            });

            slackMessage.blocks.push({
                type: "section",
                fields: [
                    { type: "mrkdwn", text: `*Author:*\n${sender}` },
                    { type: "mrkdwn", text: `*Branch:*\n\`${pr.head.ref}\`` }
                ]
            });
        }
        // 3. Ostatní eventy (ping, atd.)
        else {
            slackMessage.blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `🔔 *GitHub Event:* \`${event}\` from *${repoName}*`
                }
            });
        }

        // 4. Odeslání do Slacku
        await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackMessage),
        });

        return new Response(JSON.stringify({ message: 'OK' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('[GitHub-to-Slack Error]', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
