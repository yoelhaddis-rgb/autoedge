import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ScanDigestParams = {
  to: string;
  profitableCount: number;
  topDeals: { title: string; profit: number }[];
  scansUrl: string;
};

function formatEur(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

function buildHtml(params: ScanDigestParams): string {
  const { profitableCount, topDeals, scansUrl } = params;

  const dealRows = topDeals
    .map(
      (d) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:14px;">${d.title}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#4ade80;font-size:14px;text-align:right;font-weight:600;">${formatEur(d.profit)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;overflow:hidden;">
        <tr>
          <td style="padding:32px 36px;border-bottom:1px solid #2a2a2a;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.14em;color:#666;text-transform:uppercase;">AutoEdge</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#f5f5f5;letter-spacing:0.04em;">
              ${profitableCount} profitable ${profitableCount === 1 ? "opportunity" : "opportunities"} found
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 36px;">
            <p style="margin:0 0 20px;font-size:14px;color:#999;">
              Your daily AutoEdge scan just completed. Here are the top results worth reviewing:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <th style="text-align:left;font-size:11px;font-weight:600;letter-spacing:0.1em;color:#555;text-transform:uppercase;padding-bottom:8px;">Vehicle</th>
                <th style="text-align:right;font-size:11px;font-weight:600;letter-spacing:0.1em;color:#555;text-transform:uppercase;padding-bottom:8px;">Est. Profit</th>
              </tr>
              ${dealRows}
            </table>
            ${
              profitableCount > topDeals.length
                ? `<p style="margin:16px 0 0;font-size:13px;color:#666;">+${profitableCount - topDeals.length} more opportunities in your dashboard.</p>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px;border-top:1px solid #2a2a2a;text-align:center;">
            <a href="${scansUrl}" style="display:inline-block;background:#f5f5f5;color:#0f0f0f;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;letter-spacing:0.02em;">
              View all results →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #1f1f1f;text-align:center;">
            <p style="margin:0;font-size:12px;color:#444;">AutoEdge · Automated deal intelligence for Dutch car dealers</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendScanDigest(params: ScanDigestParams): Promise<void> {
  const { to, profitableCount } = params;

  await resend.emails.send({
    from: "AutoEdge <onboarding@resend.dev>",
    to,
    subject: `AutoEdge — ${profitableCount} profitable ${profitableCount === 1 ? "opportunity" : "opportunities"} found`,
    html: buildHtml(params)
  });
}
