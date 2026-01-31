import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        name: "Aniket De",
        regNo: "MES2026",
        email: "aniket@example.com",
        department: "CSE",
        year: "2",
    });
}
