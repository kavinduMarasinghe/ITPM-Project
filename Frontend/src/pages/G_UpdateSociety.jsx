import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/lib/api";
import { X, Search, ArrowLeft, Users, Palette, Tag, Sparkles } from "lucide-react";

const categoryOptions = [
  { label: "Sports", value: "sports" },
  { label: "Technology", value: "technology" },
  { label: "Cultural", value: "cultural" },
  { label: "Community", value: "community" },
  { label: "Music", value: "music" },
  { label: "Academic", value: "academic" },
  { label: "Other", value: "other" },
];

const iconOptions = ["🏆", "💻", "🎭", "🔬", "🤝", "🎵", "📊", "🎨", "⚡", "🌍"];

const colorOptions = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

function getCommunityId(community) {
  return community?._id || community?.id || "";
}

function getUserId(user) {
  return user?._id || user?.id || "";
}

function getUserInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UpdateSociety() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    icon: "🏆",
    color: "#6366f1",
  });

  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [communitiesRes, usersRes] = await Promise.all([
          API.get("/communities"),
          API.get("/auth/users"),
        ]);

        const allCommunities = Array.isArray(communitiesRes.data)
          ? communitiesRes.data
          : [];

        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

        const found = allCommunities.find(
          (community) => getCommunityId(community) === id
        );

        if (!found) {
          alert("Society not found");
          navigate("/communities");
          return;
        }

        setUsers(allUsers);

        setFormData({
          name: found.name || "",
          description: found.description || "",
          category: found.category || "other",
          icon: found.icon || "🏆",
          color: found.color || "#6366f1",
        });

        setSelectedMembers(Array.isArray(found.members) ? found.members : []);
      } catch (error) {
        console.error("Error loading community:", error);
        alert("Error loading society");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, navigate]);

  const filteredUsers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();

    return users.filter((user) => {
      const userId = getUserId(user);
      const alreadySelected = selectedMembers.some(
        (member) => getUserId(member) === userId
      );

      if (alreadySelected) return false;
      if (!q) return true;

      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q)
      );
    });
  }, [users, selectedMembers, memberSearch]);

  const addMember = (user) => {
    const userId = getUserId(user);
    if (!userId) return;

    const exists = selectedMembers.some(
      (member) => getUserId(member) === userId
    );

    if (exists) return;

    setSelectedMembers((prev) => [...prev, user]);
    setMemberSearch("");
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.filter((member) => getUserId(member) !== userId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await API.put(`/communities/${id}`, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        icon: formData.icon,
        color: formData.color,
        members: selectedMembers.map((member) => getUserId(member)),
      });

      alert("Society updated successfully");
      navigate("/");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update society");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-5 w-28 rounded bg-muted" />
              <div className="h-10 w-56 rounded bg-muted" />
              <div className="h-14 w-full rounded-2xl bg-muted" />
              <div className="h-32 w-full rounded-2xl bg-muted" />
              <div className="h-14 w-full rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Update Society
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit your society details, branding, and member list
                </p>
              </div>

              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.icon}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Society Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Society name"
                  required
                  className="h-14 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description..."
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Tag className="h-4 w-4" />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="h-14 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Palette className="h-4 w-4" />
                    Color
                  </label>
                  <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-background p-3">
                    {colorOptions.map((color) => {
                      const selected = formData.color === color;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, color }))
                          }
                          className={`h-11 w-11 rounded-full border-4 transition ${
                            selected
                              ? "border-white ring-2 ring-primary scale-105"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4" />
                  Icon
                </label>
                <div className="flex flex-wrap gap-3">
                  {iconOptions.map((icon) => {
                    const selected = formData.icon === icon;

                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, icon }))
                        }
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl transition ${
                          selected
                            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        {icon}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4" />
                    Members
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {selectedMembers.length} selected
                  </span>
                </div>

                {selectedMembers.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedMembers.map((member) => {
                      const memberId = getUserId(member);

                      return (
                        <div
                          key={memberId}
                          className="flex items-center gap-2 rounded-full border border-border bg-primary/10 px-3 py-1.5 text-sm"
                        >
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{
                              backgroundColor: member.avatar || formData.color,
                            }}
                          >
                            {getUserInitials(member.name)}
                          </div>
                          <span className="text-foreground">{member.name}</span>
                          <button
                            type="button"
                            onClick={() => removeMember(memberId)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members..."
                    className="h-14 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {memberSearch && filteredUsers.length > 0 && (
                  <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-border bg-card shadow-sm">
                    {filteredUsers.map((user) => {
                      const userId = getUserId(user);

                      return (
                        <button
                          key={userId}
                          type="button"
                          onClick={() => addMember(user)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{
                                backgroundColor: user.avatar || formData.color,
                              }}
                            >
                              {getUserInitials(user.name)}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-base font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Updating Society..." : "Update Society"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-4">
                Live Preview
              </p>

              <div className="rounded-3xl border border-border bg-background p-5">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  {formData.icon}
                </div>

                <h2 className="text-xl font-bold text-foreground">
                  {formData.name || "Society Name"}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {formData.description || "Your society description will appear here."}
                </p>

                <div className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium bg-muted text-foreground">
                  {
                    categoryOptions.find(
                      (category) => category.value === formData.category
                    )?.label
                  }
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-3">
                Selected Members
              </p>

              {selectedMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No members selected yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedMembers.map((member) => (
                    <div
                      key={getUserId(member)}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: member.avatar || formData.color }}
                      >
                        {getUserInitials(member.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}