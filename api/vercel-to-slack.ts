export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const vercelEvent = await req.json();

        // 1. Extrakce dat z Vercel webhooku
        const payload = vercelEvent.payload;
        const projectName = payload?.name || 'Unknown Project';
        const deploymentUrl = payload?.url || '';
        const status = vercelEvent.type; // např. deployment.succeeded
        const branch = payload?.deployment?.meta?.githubCommitRef || 'production';
        const commitMsg = payload?.deployment?.meta?.githubCommitMessage || '';

        // 2. Definice barvy a ikony podle stavu
        const isSuccess = status === 'deployment.succeeded';
        const statusEmoji = isSuccess ? '✅' : '❌';
        const statusText = isSuccess ? 'Succeeded' : (status === 'deployment.error' ? 'Failed' : 'Status: ' + status);

        // 3. Formátování zprávy pro Slack (Block Kit)
        const slackMessage = {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `${statusEmoji} *Vercel Deployment ${statusText}*`
                    }
                },
                {
                    type: "section",
                    fields: [
                        { type: "mrkdwn", text: `*Project:*\n${projectName}` },
                        { type: "mrkdwn", text: `*Environment/Branch:*\n${branch}` }
                    ]
                }
            ]
        };

        // Přidáme informaci o commitu, pokud existuje
        if (commitMsg) {
            (slackMessage.blocks as any).push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Commit Message:*\n${commitMsg}`
                }
            });
        }

        // Akční tlačítko
        if (deploymentUrl) {
            (slackMessage.blocks as any).push({
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: { type: "plain_text", text: "View Deployment" },
                        url: `https://${deploymentUrl}`,
                        style: isSuccess ? "primary" : "danger"
                    }
                ]
            });
        }

        // 4. Odeslání do tvého původního Slack Webhooku
        const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
        
        if (!slackWebhookUrl) {
            console.error('[Vercel-to-Slack] SLACK_WEBHOOK_URL is not defined');
            return new Response('SLACK_WEBHOOK_URL missing', { status: 500 });
        }

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
        console.error('[Vercel-to-Slack Error]', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
