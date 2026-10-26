import { db, projects, users, WhiteboardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { projectName, projectId } = await req.json();
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: 'Unauthorized User' })
    }
    if (!projectId || !projectName) {
        return NextResponse.json({ error: 'Project Information missing' })
    }

    // Creating a board spends one starter credit, so verify the balance before inserting the project.
    const userCredits = await db.select().from(users).where(eq(users.email, user?.primaryEmailAddress?.emailAddress));
    if (Number(userCredits[0]?.credits ?? 0) <= 0) {
        return NextResponse.json({ error: 'Insufficient Credits' })
    }

    const result = await db.insert(projects).values({
        projectId: projectId,
        projectName: projectName ?? '',
        userEmail: user?.primaryEmailAddress?.emailAddress ?? ''
    }).returning();


    const updateUserCredits = await db.update(users).set({
        credits: Number(userCredits[0].credits) - 1
    }).where(eq(users.email, user?.primaryEmailAddress?.emailAddress));


    return NextResponse.json(result[0]);

}

export async function GET(req: NextRequest) {

    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId')
    const archived = searchParams.get('archived') === 'true'

    const user = await currentUser();

    if (!projectId && user) {
        // Listing uses the same endpoint for active and archived boards, controlled by ?archived=true.
        const projectList = await db.select({
            id: projects.id,
            projectId: projects.projectId,
            projectName: projects.projectName,
            userEmail: projects.userEmail,
            createdAt: projects.createdAt,
            isShareable: projects.isShareable,
            previewImage: WhiteboardData.previewImage,
            updatedAt: WhiteboardData.updatedAt,

        }).from(projects)
            .leftJoin(WhiteboardData, eq(projects.projectId, WhiteboardData.projectId))
            .where(
                and(
                    eq(projects.userEmail, user?.primaryEmailAddress?.emailAddress ?? ''),
                    eq(projects.isDeleted, archived)
                )
            ).orderBy(desc(WhiteboardData.updatedAt));
        return NextResponse.json(projectList);
    }

    if (!projectId && !user) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    if (!projectId) {
        return NextResponse.json("No projectId Found");
    }

    const project = await db.select().from(projects).where(
        and(
            eq(projects.projectId, projectId),
            eq(projects.isDeleted, false)
        )
    )

    if (project.length == 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';
    const isOwner = project[0].userEmail === userEmail;
    const isShareable = project[0].isShareable === true;

    // Owners can edit; shared boards are view-only for everyone else.
    const canView = isOwner || isShareable;

    if (!canView) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 403 })
    }

    const result = await db.select().from(WhiteboardData)
        .where(eq(WhiteboardData.projectId, projectId));

    return NextResponse.json({
        ...result[0],
        projectName: project[0].projectName,
        isShareable,
        isOwner,
        canView,
        canEdit: isOwner
    });
}


export async function DELETE(req: NextRequest) {

    const { projectId, permanent } = await req.json();
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    if (!projectId) {
        return NextResponse.json({ error: 'Project id missing' }, { status: 400 })
    }

    if (permanent) {
        // Permanent deletes are restricted to already-archived boards to prevent accidental hard deletes.
        const ownedArchivedProject = await db.select({ id: projects.id })
            .from(projects)
            .where(
                and(
                    eq(projects.projectId, projectId),
                    eq(projects.userEmail, user.primaryEmailAddress.emailAddress),
                    eq(projects.isDeleted, true)
                )
            );

        if (ownedArchivedProject.length === 0) {
            return NextResponse.json({ error: 'Archived project not found' }, { status: 404 })
        }

        await db.delete(WhiteboardData).where(eq(WhiteboardData.projectId, projectId));
        await db.delete(projects).where(
            and(
                eq(projects.projectId, projectId),
                eq(projects.userEmail, user.primaryEmailAddress.emailAddress)
            )
        );

        return NextResponse.json({ msg: 'permanently deleted' })
    }

    const result = await db.update(projects).set({
        isDeleted: true
    }).where(
        and(
            eq(projects.projectId, projectId),
            eq(projects.userEmail, user.primaryEmailAddress.emailAddress)
        )
    ).returning();

    if (result.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ msg: 'deleted' })

}

export async function PATCH(req: NextRequest) {

    const { projectId, restore, isShareable } = await req.json();
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    if (!projectId) {
        return NextResponse.json({ error: 'Project id or action missing' }, { status: 400 })
    }

    if (typeof isShareable === 'boolean') {
        // Share toggles only apply to live boards owned by the current user.
        const result = await db.update(projects).set({
            isShareable
        }).where(
            and(
                eq(projects.projectId, projectId),
                eq(projects.userEmail, user.primaryEmailAddress.emailAddress),
                eq(projects.isDeleted, false)
            )
        ).returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json({
            msg: isShareable ? 'share enabled' : 'share disabled',
            isShareable: result[0].isShareable
        })
    }

    if (!restore) {
        return NextResponse.json({ error: 'Project id or action missing' }, { status: 400 })
    }

    const result = await db.update(projects).set({
        isDeleted: false
    }).where(
        and(
            eq(projects.projectId, projectId),
            eq(projects.userEmail, user.primaryEmailAddress.emailAddress),
            eq(projects.isDeleted, true)
        )
    ).returning();

    if (result.length === 0) {
        return NextResponse.json({ error: 'Archived project not found' }, { status: 404 })
    }

    return NextResponse.json({ msg: 'restored' })
}
