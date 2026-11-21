import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/authContext.jsx";
import "../App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(dateVal) {
  if (!dateVal) return "4 Nov 2026";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "4 Nov 2026";
    const day = d.getDate();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "4 Nov 2026";
  }
}

export default function BrowsePosts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [userPlan, setUserPlan] = useState("Free");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [postTypeFilter, setPostTypeFilter] = useState("All");
  const [postPlanFilter, setPostPlanFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Interaction states
  const [hiddenIds, setHiddenIds] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);

  const loadPosts = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const headers = {};
      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          console.warn("Could not retrieve token:", e);
        }
      }

      // If user selected Paid filter or has Paid plan, fetch Paid posts as well
      const url =
        postPlanFilter === "Paid"
          ? `${API}/api/posts?plan=Paid`
          : `${API}/api/posts`;

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load posts.");
      }

      setPosts(data.posts || []);
      setUserPlan(data.plan || "Free");
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    } finally {
      setBusy(false);
    }
  }, [user, postPlanFilter]);

  useEffect(() => {
    if (!authLoading) {
      loadPosts();
    }
  }, [authLoading, loadPosts]);

  // Handle Hide
  const handleHide = (id) => {
    setHiddenIds((prev) => [...prev, id]);
  };

  // Handle Toggle Expand
  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Reset
  const handleReset = () => {
    setSearch("");
    setPostTypeFilter("All");
    setPostPlanFilter("All");
    setSortBy("newest");
    setHiddenIds([]);
    setExpandedIds([]);
  };

  // Filtering and Sorting
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Exclude hidden
        if (hiddenIds.includes(post.id)) return false;

        // Post Type Filter
        if (postTypeFilter !== "All" && post.postType !== postTypeFilter) {
          return false;
        }

        // Post Plan Filter
        if (
          postPlanFilter !== "All" &&
          String(post.postPlan).toLowerCase() !== postPlanFilter.toLowerCase()
        ) {
          return false;
        }

        // Search Filter (Title, Tags, Abstract, Description)
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = (post.title || "").toLowerCase().includes(q);
          const matchTags = (post.tags || []).some((tag) =>
            tag.toLowerCase().includes(q)
          );
          const matchDesc = (post.description || "").toLowerCase().includes(q);
          const matchAbstract = (post.abstract || "").toLowerCase().includes(q);
          if (!matchTitle && !matchTags && !matchDesc && !matchAbstract) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        // Default "newest"
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [posts, hiddenIds, postTypeFilter, postPlanFilter, search, sortBy]);

  return (
    <main className="browse-posts-page">
      <div className="browse-container">
        {/* Header Section */}
        <header className="browse-header-row">
          <div className="browse-header-text">
            <h1 className="browse-main-title">Browse Posts</h1>
            <p className="browse-sub-title">
              Explore questions and articles submitted by the DEV@Deakin
              community.
            </p>
          </div>
          <Link to="/post" className="btn-create-post">
            + Create New Post
          </Link>
        </header>

        {/* Access Banner */}
        <section className="browse-access-banner">
          <div className="access-banner-left">
            <div className="access-info-icon" aria-hidden="true">
              i
            </div>
            <div className="access-info-text">
              <strong className="access-title">
                {userPlan === "Paid" ? "Paid Member Access" : "Visitor / Guest Access"}
              </strong>
              <p className="access-desc">
                {userPlan === "Paid"
                  ? "Your current view includes both Free and exclusive Paid Questions/Articles."
                  : "Your current view is filtered by the backend to show only Free Questions/Articles. Paid posts are protected."}
              </p>
            </div>
          </div>
          {userPlan !== "Paid" && (
            <Link to="/pricing" className="btn-upgrade-plan">
              Upgrade to Paid Plan
            </Link>
          )}
        </section>

        {/* Filter Toolbar */}
        <section className="browse-filter-toolbar">
          {/* Search */}
          <div className="toolbar-column col-search">
            <label className="toolbar-label" htmlFor="filter-search-input">
              SEARCH TITLE OR TAG
            </label>
            <input
              id="filter-search-input"
              className="toolbar-input"
              type="text"
              placeholder="Search e.g. React, Java, CSS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Post Type */}
          <div className="toolbar-column">
            <label className="toolbar-label" htmlFor="filter-post-type">
              POST TYPE
            </label>
            <select
              id="filter-post-type"
              className="toolbar-select"
              value={postTypeFilter}
              onChange={(e) => setPostTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Question">Question</option>
              <option value="Article">Article</option>
            </select>
          </div>

          {/* Post Plan */}
          <div className="toolbar-column">
            <label className="toolbar-label" htmlFor="filter-post-plan">
              POST PLAN
            </label>
            <select
              id="filter-post-plan"
              className="toolbar-select"
              value={postPlanFilter}
              onChange={(e) => setPostPlanFilter(e.target.value)}
            >
              <option value="All">All Plans</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="toolbar-column">
            <label className="toolbar-label" htmlFor="filter-sort-by">
              SORT BY
            </label>
            <select
              id="filter-sort-by"
              className="toolbar-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="toolbar-column col-reset">
            <button
              type="button"
              className="btn-toolbar-reset"
              onClick={handleReset}
            >
              ↺ Reset
            </button>
          </div>
        </section>

        {/* Showing Count */}
        <div className="browse-showing-count">
          Showing {filteredPosts.length}{" "}
          {filteredPosts.length === 1 ? "post" : "posts"}
        </div>

        {/* Loading / Error States */}
        {error && (
          <div className="browse-error-box">
            <span>{error}</span>
            <button onClick={loadPosts} className="btn-retry">
              Try again
            </button>
          </div>
        )}

        {busy ? (
          <div className="browse-loading-box">Loading DEV@Deakin posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="browse-no-posts-box">
            <h3>No posts found</h3>
            <p>Try resetting filters or create a new post to get started.</p>
            <Link to="/post" className="btn-create-post-inline">
              + Create New Post
            </Link>
          </div>
        ) : (
          /* Cards List */
          <div className="browse-cards-stack">
            {filteredPosts.map((post) => {
              const isExpanded = expandedIds.includes(post.id);
              const isArticle = post.postType === "Article";
              const isPaid =
                String(post.postPlan).toLowerCase() === "paid";

              return (
                <article className="browse-card-item" key={post.id}>
                  {/* Card Header Row */}
                  <div className="card-top-row">
                    <div className="card-badges-container">
                      <span
                        className={`badge-type ${isArticle ? "badge-type-article" : "badge-type-question"}`}
                      >
                        {isArticle ? "📖 Article" : "? Question"}
                      </span>
                      <span
                        className={`badge-plan ${isPaid ? "badge-plan-paid" : "badge-plan-free"}`}
                      >
                        {isPaid ? "PAID" : "FREE"}
                      </span>
                    </div>

                    <div className="card-meta-actions">
                      <span className="card-date-label">
                        {formatDate(post.createdAt)}
                      </span>
                      <button
                        type="button"
                        className="btn-card-hide"
                        onClick={() => handleHide(post.id)}
                      >
                        ✕ Hide
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="card-post-title">{post.title}</h2>

                  {/* Author */}
                  <div className="card-author-name">
                    Posted by {post.authorName || "Saiyam Sharma"}
                  </div>

                  {/* Body / Snippet */}
                  <div className="card-post-body">
                    {isArticle ? (
                      <div>
                        <p className="card-abstract-text">
                          <strong>Abstract:</strong>{" "}
                          {post.abstract || post.articleText}
                        </p>
                        {isExpanded && post.articleText && (
                          <div className="card-full-article-content">
                            <strong className="content-label">
                              Article Content:
                            </strong>
                            <p className="article-body-text">
                              {post.articleText}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="card-question-text">
                        {isExpanded
                          ? post.description || post.title
                          : (post.description || post.title).length > 200
                          ? `${(post.description || post.title).slice(0, 195)}...`
                          : post.description || post.title}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="card-tags-list">
                      {post.tags.map((tag) => (
                        <span className="card-tag-badge" key={tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expand / Collapse Button */}
                  <div className="card-expand-row">
                    <button
                      type="button"
                      className="btn-toggle-expand"
                      onClick={() => toggleExpand(post.id)}
                    >
                      {isExpanded ? "▲ Collapse Post" : "▼ Expand Full Post"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
