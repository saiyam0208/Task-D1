import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/authContext.jsx";
import "../App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NewPost() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [postType, setPostType] = useState("Question");
  const [postPlan, setPostPlan] = useState("Free");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [abstract, setAbstract] = useState("");
  const [articleText, setArticleText] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [published, setPublished] = useState(false);

  async function handlePost(event) {
    event.preventDefault();
    setMessage("");
    setError(false);
    setPublished(false);

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (title.trim().length < 3) {
      setError(true);
      setMessage("Your title must contain at least 3 characters.");
      return;
    }

    if (postType === "Question" && description.trim().length < 5) {
      setError(true);
      setMessage("Please describe your problem in at least 5 characters.");
      return;
    }

    if (
      postType === "Article" &&
      (abstract.trim().length < 5 || articleText.trim().length < 10)
    ) {
      setError(true);
      setMessage("Please provide an abstract and article content.");
      return;
    }

    if (tagList.length > 3 || tagList.some((tag) => tag.length > 30)) {
      setError(true);
      setMessage("Add up to 3 tags. Each tag can contain up to 30 characters.");
      return;
    }

    setBusy(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (tokenErr) {
          console.warn("Could not retrieve user ID token:", tokenErr);
        }
      }

      const response = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          postType,
          title: title.trim(),
          description: description.trim(),
          abstract: abstract.trim(),
          articleText: articleText.trim(),
          tags: tagList,
          postPlan,
          authorName: user?.displayName || user?.email || "Saiyam Sharma",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to publish your post.");
      }

      setMessage("Your post has been published successfully!");
      setPublished(true);
      setTitle("");
      setDescription("");
      setAbstract("");
      setArticleText("");
      setTags("");

      // Automatically navigate to browse posts after a short delay, or user can click the banner
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(true);
      setMessage(err.message || "A server error occurred.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="new-post-page-wrapper">
      <div className="new-post-container">
        {/* Top Header Bar */}
        <div className="new-post-header-bar">New Post</div>

        {/* Message Alert */}
        {message && (
          <div
            className={`new-post-alert ${error ? "alert-error" : "alert-success"}`}
            role="alert"
          >
            <span>{message}</span>
            {published && (
              <Link to="/" className="alert-link">
                View on Browse Posts →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handlePost}>
          {/* Post Type Selector */}
          <div className="new-post-selection-row">
            <span className="selection-row-label">Select Post Type:</span>
            <div className="selection-radio-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="postType"
                  value="Question"
                  checked={postType === "Question"}
                  onChange={() => setPostType("Question")}
                />
                Question
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="postType"
                  value="Article"
                  checked={postType === "Article"}
                  onChange={() => setPostType("Article")}
                />
                Article
              </label>
            </div>
          </div>

          {/* Dotted Divider Line */}
          <div className="new-post-divider" />

          {/* Post Plan Selector */}
          <div className="new-post-selection-row">
            <span className="selection-row-label">Select Post Plan:</span>
            <div className="selection-radio-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="postPlan"
                  value="Free"
                  checked={postPlan === "Free"}
                  onChange={() => setPostPlan("Free")}
                />
                Free
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="postPlan"
                  value="Paid"
                  checked={postPlan === "Paid"}
                  onChange={() => setPostPlan("Paid")}
                />
                Paid
              </label>
            </div>
          </div>

          {/* Sub Header Bar */}
          <div className="new-post-header-bar sub-bar">
            What do you want to ask or share
          </div>

          {/* Conditional Note */}
          <p className="conditional-rendering-note">
            {postType === "Question"
              ? "This section is designed based on the type of the post. It could be developed by conditional rendering. For question, the following section is appeared."
              : "This section is designed based on the type of the post. It could be developed by conditional rendering. For article, the following section is appeared."}
          </p>

          {/* Question Fields */}
          {postType === "Question" ? (
            <>
              {/* Title Field */}
              <div className="form-inline-field">
                <label className="inline-field-label" htmlFor="question-title">
                  Title
                </label>
                <input
                  id="question-title"
                  className="form-text-input"
                  type="text"
                  placeholder="Start your question with how, what, why, etc."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              {/* Describe your problem */}
              <div className="form-stacked-field">
                <label
                  className="stacked-field-label"
                  htmlFor="question-description"
                >
                  Describe your problem
                </label>
                <textarea
                  id="question-description"
                  className="form-textarea"
                  placeholder="Describe your problem in detail..."
                  rows={9}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={5000}
                  required
                />
              </div>

              {/* Tags Field */}
              <div className="form-inline-field">
                <label className="inline-field-label" htmlFor="question-tags">
                  Tags
                </label>
                <input
                  id="question-tags"
                  className="form-text-input"
                  type="text"
                  placeholder="Please add up to 3 tags to describe what your question is about e.g., Java"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Article Title Field */}
              <div className="form-inline-field">
                <label className="inline-field-label" htmlFor="article-title">
                  Title
                </label>
                <input
                  id="article-title"
                  className="form-text-input"
                  type="text"
                  placeholder="Start your article with a clear title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              {/* Article Abstract */}
              <div className="form-stacked-field">
                <label
                  className="stacked-field-label"
                  htmlFor="article-abstract"
                >
                  Abstract
                </label>
                <textarea
                  id="article-abstract"
                  className="form-textarea"
                  placeholder="Enter a 1-paragraph abstract..."
                  rows={3}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  maxLength={1000}
                  required
                />
              </div>

              {/* Article Text */}
              <div className="form-stacked-field">
                <label
                  className="stacked-field-label"
                  htmlFor="article-text-content"
                >
                  Article Text
                </label>
                <textarea
                  id="article-text-content"
                  className="form-textarea"
                  placeholder="Write your article here..."
                  rows={9}
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  maxLength={10000}
                  required
                />
              </div>

              {/* Article Tags */}
              <div className="form-inline-field">
                <label className="inline-field-label" htmlFor="article-tags">
                  Tags
                </label>
                <input
                  id="article-tags"
                  className="form-text-input"
                  type="text"
                  placeholder="Please add up to 3 tags to describe what your article is about e.g., Java"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Post Button */}
          <div className="form-action-row">
            <button className="post-submit-btn" type="submit" disabled={busy}>
              {busy ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
