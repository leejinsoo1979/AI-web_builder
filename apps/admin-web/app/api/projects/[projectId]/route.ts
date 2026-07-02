import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const projectDir = path.join(process.cwd(), ".webable-projects");

export async function GET(
  _request: Request,
  context: {
    params: Promise<unknown>;
  }
) {
  const { projectId } = (await context.params) as { projectId: string };
  const safeProjectId = sanitize(projectId);

  try {
    const file = await readFile(path.join(projectDir, `${safeProjectId}.json`), "utf8");
    return NextResponse.json(JSON.parse(file));
  } catch {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  context: {
    params: Promise<unknown>;
  }
) {
  const { projectId } = (await context.params) as { projectId: string };
  const safeProjectId = sanitize(projectId);
  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid project payload" }, { status: 400 });
  }

  await mkdir(projectDir, { recursive: true });
  await writeFile(path.join(projectDir, `${safeProjectId}.json`), JSON.stringify({ ...(body as object), updatedAt: new Date().toISOString() }, null, 2), "utf8");

  return NextResponse.json({ projectId: safeProjectId, status: "saved" });
}

function sanitize(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-") || "project";
}
