import { NextRequest, NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server";

export async function POST(request: NextRequest) {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "";
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";
  const configuredFolder = (process.env.IMAGEKIT_JOB_FOLDER ?? "/JOBS").trim();
  const folder = configuredFolder === "/" ? "/JOBS" : configuredFolder.startsWith("/") ? configuredFolder : `/${configuredFolder}`;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json(
      { error: "ImageKit publicKey, privateKey or urlEndpoint are not configured." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Only video files are allowed for the JOBS upload flow." }, { status: 400 });
  }

  try {
    const auth = getUploadAuthParams({ publicKey, privateKey });
    const uploadData = new FormData();
    uploadData.append("file", file, file.name);
    uploadData.append("fileName", file.name);
    uploadData.append("useUniqueFileName", "true");
    uploadData.append("folder", folder);
    uploadData.append("publicKey", publicKey);
    uploadData.append("signature", auth.signature);
    uploadData.append("token", auth.token);
    uploadData.append("expire", String(auth.expire));

    const imagekitResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: uploadData,
    });

    if (!imagekitResponse.ok) {
      const raw = await imagekitResponse.text();
      return NextResponse.json({
        error: raw || "ImageKit upload failed.",
        folder,
        note: "ImageKit rejected the upload before the JOBS folder write completed.",
      }, { status: 400 });
    }

    const result = await imagekitResponse.json();
    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      folder: result.folder,
      imagekitUrl: `${urlEndpoint}${result.filePath}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
