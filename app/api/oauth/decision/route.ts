import { NextResponse } from "next/server";
import { oauthEnabled } from "@/core/oauth/config";
import { supabaseServer } from "@/core/oauth/supabase-server";
import { isOwner } from "@/core/oauth/verify";

export async function POST(req: Request) {
  if (!oauthEnabled()) return NextResponse.json({ error: "OAuth is not configured" }, { status: 404 });
  const form = await req.formData();
  const id = String(form.get("authorization_id") ?? "");
  const decision = form.get("decision");
  if (!id || (decision !== "approve" && decision !== "deny")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || !isOwner({ sub: claims.sub, email: claims.email as string | undefined })) {
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }

  const { data: result, error } =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(id)
      : await supabase.auth.oauth.denyAuthorization(id);
  if (error || !result) return NextResponse.json({ error: error?.message ?? "failed" }, { status: 400 });

  // Back to the MCP client (its redirect URI is validated by Supabase Auth).
  return NextResponse.redirect(result.redirect_url, 303);
}
