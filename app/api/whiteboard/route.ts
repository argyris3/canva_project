import { db, projects, WhiteboardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { projectId, elements, files, appState, base64ImagePreview } = await req.json();
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json('Unauthorized User', { status: 401 });
    }

    if (projectId) {
        try {
            // Only the board owner can persist canvas edits; shared viewers remain read-only.
            const ownedProject = await db.select({ id: projects.id }).from(projects).where(
                and(
                    eq(projects.projectId, projectId),
                    eq(projects.userEmail, user.primaryEmailAddress.emailAddress),
                    eq(projects.isDeleted, false)
                )
            )

            if (ownedProject.length === 0) {
                return NextResponse.json('Unauthorized User', { status: 403 });
            }

            // Keep a single whiteboardData row per project and overwrite it on every autosave.
            const result = await db.insert(WhiteboardData).values({
                projectId: projectId,
                elements: elements,
                appState: appState,
                files: files,
                previewImage: base64ImagePreview
            }).onConflictDoUpdate({
                target: WhiteboardData.projectId,
                set: {
                    elements: elements,
                    appState: appState,
                    files: files,
                    previewImage: base64ImagePreview,
                    updatedAt: new Date()
                }
            })


            return NextResponse.json(result);
        }
        catch (e) {
            return NextResponse.json('Internal Server Error!')

        }
    }

    return NextResponse.json('Project information missing!')

}
