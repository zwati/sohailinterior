require("dotenv").config();
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { Readable } = require("stream");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer in-memory storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ── Google Drive Client Setup ───────────────────────────────────────────────
let _drive = null;
function getDriveClient() {
  if (_drive) return _drive;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  }

  const credentials = JSON.parse(raw.trim());
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  _drive = google.drive({
    version: "v3",
    auth,
    headers: { "Accept-Encoding": "identity" },
  });
  return _drive;
}

// Slugifier
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── In-Memory Categories Cache ───────────────────────────────────────────────
let categoriesCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 300000; // 5 minutes in ms

function clearCache() {
  categoriesCache = null;
  lastCacheTime = 0;
}

// ── Category scan logic ──────────────────────────────────────────────────────
async function scanGoogleDriveFolders() {
  const drive = getDriveClient();
  const rootFolderId =
    process.env.PORTFOLIO_ROOT_FOLDER_ID ||
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

  if (!rootFolderId) {
    console.warn("PORTFOLIO_ROOT_FOLDER_ID or GOOGLE_DRIVE_ROOT_FOLDER_ID is not set.");
    return [];
  }

  // 1. Get all category subfolders
  const folderResponse = await drive.files.list({
    q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 100,
  });

  const folders = folderResponse.data.files || [];
  const categories = [];

  // 2. Fetch items for each subfolder in parallel
  const categoryPromises = folders.map(async (folder) => {
    if (!folder.id || !folder.name) return null;

    const filesResponse = await drive.files.list({
      q: `'${folder.id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
      fields: "files(id, name, mimeType)",
      orderBy: "name",
      pageSize: 200,
    });

    const files = filesResponse.data.files || [];
    const items = files.map((file) => {
      const isVideo = file.mimeType ? file.mimeType.startsWith("video/") : false;
      return {
        id: file.id || "",
        name: file.name || "",
        mimeType: file.mimeType || "",
        type: isVideo ? "video" : "image",
        src: isVideo
          ? `/api/stream/${file.id}`
          : `https://lh3.googleusercontent.com/d/${file.id}=w1000`,
      };
    });

    const slug = slugify(folder.name);

    return {
      id: folder.id,
      name: folder.name,
      slug,
      items,
    };
  });

  const results = await Promise.all(categoryPromises);
  for (const r of results) {
    if (r && r.items.length > 0) {
      categories.push(r);
    }
  }

  // Sort "Random" folder first if present
  const random = categories.filter((c) => c.name.toLowerCase() === "random");
  const others = categories.filter((c) => c.name.toLowerCase() !== "random");
  return [...random, ...others];
}

// ── Express Endpoints ────────────────────────────────────────────────────────

// GET Categories & items
app.get("/api/categories", async (req, res) => {
  try {
    const now = Date.now();
    if (categoriesCache && now - lastCacheTime < CACHE_TTL) {
      return res.json({ ok: true, categories: categoriesCache });
    }

    const categories = await scanGoogleDriveFolders();
    categoriesCache = categories;
    lastCacheTime = now;

    res.json({ ok: true, categories });
  } catch (err) {
    console.error("[GET /api/categories] Error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST Newsletter subscriptions
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }

    const recipient = process.env.SUBSCRIBE_RECIPIENT || "abdullahramzan8942@gmail.com";
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 465);

    if (!smtpUser || !smtpPass) {
      console.error("Email transport is not configured. Set EMAIL_USER and EMAIL_PASS in .env.");
      return res.status(500).json({ ok: false, error: "Email service is not configured." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpUser,
      to: recipient,
      subject: "New newsletter signup - Sohail Interior",
      text: `New subscriber: ${email}`,
      html: `<p>New subscriber: <strong>${email}</strong></p>`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/subscribe] Error:", err.message);
    res.status(500).json({ ok: false, error: "Failed to send subscription notification." });
  }
});

// GET Media streaming
app.get("/api/stream/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const drive = getDriveClient();

    // Fetch file metadata to get Content-Type
    const metadata = await drive.files.get({
      fileId,
      fields: "mimeType, size",
    });

    const mimeType = metadata.data.mimeType || "application/octet-stream";
    const fileSize = parseInt(metadata.data.size || "0", 10);

    const range = req.headers.range;
    if (range && fileSize > 0) {
      // Handle HTML5 video range streaming requests
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": mimeType,
      });

      const response = await drive.files.get(
        { fileId, alt: "media" },
        {
          responseType: "stream",
          headers: { Range: `bytes=${start}-${end}` },
        }
      );
      response.data.pipe(res);
    } else {
      // Normal direct download stream
      res.setHeader("Content-Type", mimeType);
      if (fileSize > 0) {
        res.setHeader("Content-Length", fileSize);
      }
      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );
      response.data.pipe(res);
    }
  } catch (err) {
    console.error("[GET /api/stream] Error:", err.message);
    if (!res.headersSent) {
      res.status(500).send("Error streaming file.");
    }
  }
});

// POST Design uploads
app.post("/api/designs", upload.array("images", 5), async (req, res) => {
  try {
    const drive = getDriveClient();
    const rootFolderId =
      process.env.PORTFOLIO_ROOT_FOLDER_ID ||
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!rootFolderId) {
      return res.status(500).json({ ok: false, error: "Root folder ID is not configured." });
    }

    const { category, title } = req.body;
    if (!category || !title) {
      return res.status(400).json({ ok: false, error: "Category and Title are required." });
    }

    // 1. Get or create category subfolder
    const escapedName = category.replace(/'/g, "\\'");
    const folderSearch = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${escapedName}' and trashed = false`,
      fields: "files(id, name)",
      pageSize: 1,
    });

    let folderId = folderSearch.data.files?.[0]?.id;
    if (!folderId) {
      const createFolder = await drive.files.create({
        requestBody: {
          name: category,
          mimeType: "application/vnd.google-apps.folder",
          parents: [rootFolderId],
        },
        fields: "id",
      });
      folderId = createFolder.data.id;
    }

    if (!folderId) {
      return res.status(500).json({ ok: false, error: "Failed to locate/create category folder." });
    }

    // 2. Upload images to this folder
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ ok: false, error: "At least one photo must be provided." });
    }

    const uploadPromises = files.map(async (file) => {
      const uploadResponse = await drive.files.create({
        requestBody: {
          name: `${Date.now()}_${file.originalname}`,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: Readable.from(file.buffer),
        },
        fields: "id",
      });

      const fileId = uploadResponse.data.id;
      if (fileId) {
        // Set public permissions
        try {
          await drive.permissions.create({
            fileId,
            requestBody: { role: "reader", type: "anyone" },
          });
        } catch (_) {}
      }
      return fileId;
    });

    const fileIds = await Promise.all(uploadPromises);

    // Clear memory categories cache to reflect new files immediately
    clearCache();

    res.json({ ok: true, fileIds });
  } catch (err) {
    console.error("[POST /api/designs] Error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Route specific pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/materials", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "materials.html"));
});
app.get("/portfolio", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "portfolio.html"));
});
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Fallback all other routes to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`[Server] Sohail Interior v2 listening on http://localhost:${PORT}`);
});
