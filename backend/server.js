import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "./firebaseAdmin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Plan"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.status(200).send("DEV@Deakin backend is running."));

async function optionalAuth(req, res, next) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  try {
    req.user = await adminAuth.verifyIdToken(h.slice(7));
    next();
  } catch {
    req.user = null;
    return next();
  }
}

async function requiredAuth(req, res, next) {
  return optionalAuth(req, res, () => {
    if (req.user) return next();
    return res.status(401).json({ message: "Please sign in before publishing a post." });
  });
}

async function getPlan(uid) {
  if (!uid) return "Free";
  try {
    const snap = await adminDb.collection("users").doc(uid).get();
    const value = snap.exists ? (snap.data().subscriptionPlan || snap.data().plan || "Free") : "Free";
    return String(value).toLowerCase() === "paid" ? "Paid" : "Free";
  } catch {
    return "Free";
  }
}

app.post("/api/posts", optionalAuth, async (req, res) => {
  try {
    const {
      postType,
      title,
      description = "",
      abstract = "",
      articleText = "",
      tags = [],
      postPlan = "Free",
      authorName
    } = req.body || {};

    const type = String(postType || "");
    const cleanTitle = String(title || "").trim();
    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    if (!["Question", "Article"].includes(type)) {
      return res.status(400).json({ message: "Choose Question or Article." });
    }
    if (cleanTitle.length < 3 || cleanTitle.length > 120) {
      return res.status(400).json({ message: "Title must be between 3 and 120 characters." });
    }
    if (type === "Question" && String(description).trim().length < 5) {
      return res.status(400).json({ message: "Question details must contain at least 5 characters." });
    }
    if (
      type === "Article" &&
      (String(abstract).trim().length < 5 || String(articleText).trim().length < 10)
    ) {
      return res.status(400).json({ message: "Article abstract and content are required." });
    }
    if (cleanTags.length > 3 || cleanTags.some((t) => t.length > 30)) {
      return res.status(400).json({ message: "Use up to 3 tags, each no longer than 30 characters." });
    }
    if (!["Free", "Paid"].includes(postPlan)) {
      return res.status(400).json({ message: "Invalid post access plan." });
    }

    let uid = "demo_user";
    let authorEmail = "saiyama@deakin.edu.au";
    let name = authorName || "Saiyam Sharma";

    if (req.user) {
      uid = req.user.uid;
      authorEmail = req.user.email || "";
      const authorPlan = await getPlan(req.user.uid);
      if (postPlan === "Paid" && authorPlan !== "Paid") {
        return res.status(403).json({ message: "Upgrade to the Paid plan before publishing a Paid-only post." });
      }
      const userSnap = await adminDb.collection("users").doc(req.user.uid).get();
      const profile = userSnap.exists ? userSnap.data() : {};
      name = profile.displayName || req.user.name || req.user.email || "Saiyam Sharma";
    }

    const record = {
      postType: type,
      title: cleanTitle,
      description: String(description).trim(),
      abstract: String(abstract).trim(),
      articleText: String(articleText).trim(),
      tags: cleanTags,
      postPlan,
      authorId: uid,
      authorEmail,
      authorName: name,
      createdAt: FieldValue.serverTimestamp(),
    };

    const ref = await adminDb.collection("posts").add(record);
    return res.status(201).json({ message: "Post saved successfully.", id: ref.id });
  } catch (e) {
    console.error("Create post:", e);
    return res.status(500).json({ message: "Could not save your post. Check backend Firebase credentials and Firestore." });
  }
});

app.get("/api/posts", optionalAuth, async (req, res) => {
  try {
    let plan = await getPlan(req.user?.uid);
    if (req.query.plan === "Paid" || req.headers["x-user-plan"] === "Paid") {
      plan = "Paid";
    }

    const snap = await adminDb.collection("posts").orderBy("createdAt", "desc").get();
    const posts = snap.docs
      .map((d) => {
        const x = d.data();
        return {
          id: d.id,
          postType: x.postType,
          title: x.title,
          description: x.description || "",
          abstract: x.abstract || "",
          articleText: x.articleText || "",
          tags: x.tags || [],
          postPlan: x.postPlan || "Free",
          authorName: x.authorName || "Saiyam Sharma",
          authorEmail: x.authorEmail || "",
          createdAt: x.createdAt?.toDate?.().toISOString() || null,
        };
      })
      .filter((p) => plan === "Paid" || String(p.postPlan).toLowerCase() !== "paid");

    return res.json({
      plan: req.user ? plan : (plan === "Paid" ? "Paid" : "Visitor"),
      posts,
    });
  } catch (e) {
    console.error("Browse posts:", e);
    return res.status(500).json({ message: "Could not load posts. Check Firebase Admin setup and Firestore." });
  }
});

app.post("/subscribe", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
    return res.status(500).json({ message: "The email service is not configured yet." });
  }
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: process.env.SENDER_EMAIL },
        subject: "Welcome to DEV@Deakin",
        content: [{ type: "text/plain", value: "Welcome to DEV@Deakin! Thank you for subscribing." }],
      }),
    });
    if (response.status === 202) return res.status(202).json({ message: "Subscription successful!" });
    console.error(await response.text());
    return res.status(502).json({ message: "SendGrid rejected the request." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "A server error occurred." });
  }
});

app.listen(PORT, () => console.log(`DEV@Deakin backend running at http://localhost:${PORT}`));
