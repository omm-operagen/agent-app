import { redirect } from "next/navigation";
import { oauthEnabled } from "@/core/oauth/config";
import { supabaseServer } from "@/core/oauth/supabase-server";
import { isOwner } from "@/core/oauth/verify";

export const dynamic = "force-dynamic";

const page = (children: React.ReactNode) => (
  <main style={{ padding: 32, fontFamily: "system-ui, sans-serif", maxWidth: 560 }}>{children}</main>
);

/** Where Supabase Auth sends the user to approve or deny an MCP client (?authorization_id=...). */
export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ authorization_id?: string }> }) {
  const { authorization_id: id } = await searchParams;
  if (!oauthEnabled()) return page(<p>OAuth is not configured.</p>);
  if (!id) return page(<p>Missing authorization_id.</p>);

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect(`/auth/login?next=${encodeURIComponent(`/oauth/consent?authorization_id=${id}`)}`);
  if (!isOwner({ sub: claims.sub, email: claims.email as string | undefined })) {
    return page(<p>This account is not allowed to authorize clients for this app.</p>);
  }

  const { data: details, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
  if (error || !details) return page(<p>Invalid authorization request: {error?.message}</p>);
  // Already consented earlier: Supabase hands back the redirect straight away.
  if (!("authorization_id" in details)) redirect(details.redirect_url);

  return page(
    <>
      <h1>Authorize {details.client.name}</h1>
      <p>This client wants to use the agent-app MCP tools as you (create, read and edit diagrams).</p>
      <p>
        <strong>Redirects to:</strong> {details.redirect_uri}
      </p>
      <form action="/api/oauth/decision" method="POST" style={{ display: "flex", gap: 12 }}>
        <input type="hidden" name="authorization_id" value={id} />
        <button name="decision" value="approve">Approve</button>
        <button name="decision" value="deny">Deny</button>
      </form>
    </>,
  );
}
