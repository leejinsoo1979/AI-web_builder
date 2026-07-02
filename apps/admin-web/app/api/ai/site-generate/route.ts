import { createSiteSpec, type BrandVoice } from "@webable/builder-schema";
import { NextResponse } from "next/server";

type RequestBody = {
  prompt?: string;
  industry?: string;
  tone?: BrandVoice;
  targetAudience?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const siteSpec = createSiteSpec({
    prompt,
    industry: body.industry?.trim() || "service business",
    tone: body.tone || "professional",
    targetAudience: body.targetAudience?.trim() || "first-time customers"
  });

  return NextResponse.json(
    {
      id: crypto.randomUUID(),
      type: "site_generate",
      status: "needs_approval",
      inputScope: {
        prompt,
        industry: body.industry,
        targetAudience: body.targetAudience
      },
      outputDiff: {
        siteSpec
      },
      cost: siteSpec.aiMetadata.estimatedCost
    },
    { status: 202 }
  );
}
