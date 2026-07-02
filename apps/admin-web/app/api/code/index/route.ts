import { indexProject } from "@webable/code-model";
import { NextResponse } from "next/server";
import { resolve } from "node:path";

export const runtime = "nodejs";

type IndexRequest = {
  rootPath?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as IndexRequest;
    const rootPath = resolve(body.rootPath || process.env.WEBABLE_CODE_ROOT || resolve(process.cwd(), "../.."));
    const project = await indexProject(rootPath);

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to index project"
      },
      { status: 500 }
    );
  }
}
