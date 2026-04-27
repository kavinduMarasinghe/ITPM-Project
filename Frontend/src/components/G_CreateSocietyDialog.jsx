import { useEffect, useMemo, useState } from "react";
import API from "@/lib/api";
import { societyCategoryLabels } from "@/lib/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users, Palette, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

const ICONS = ["🏆", "💻", "🎭", "🔬", "🤝", "🎵", "📚", "🎨", "⚡", "🌍"];

export function CreateSocietyDialog() {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [icon, setIcon] = useState("🏆");
  const [color, setColor] = useState(COLORS[0]);

  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await API.get("/auth/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();

    return users.filter((u) => {
      const notSelected = !selectedMembers.includes(u._id);

      if (!notSelected) return false;
      if (!q) return false;

      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
      );
    });
  }, [users, memberSearch, selectedMembers]);

  const reset = () => {
    setName("");
    setDescription("");
    setCategory("other");
    setIcon("🏆");
    setColor(COLORS[0]);
    setSelectedMembers([]);
    setMemberSearch("");
    setSubmitting(false);
  };

  const getInitials = (nameValue) => {
    if (!nameValue) return "NA";
    return nameValue
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Missing Name",
        description: "Society name is required.",
      });
      return;
    }

    if (name.trim().length < 2) {
      toast({
        title: "Name Too Short",
        description: "Society name must be at least 2 characters.",
      });
      return;
    }

    if (name.trim().length > 100) {
      toast({
        title: "Name Too Long",
        description: "Society name must be less than 100 characters.",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Missing Description",
        description: "Society description is required.",
      });
      return;
    }

    if (description.trim().length > 500) {
      toast({
        title: "Description Too Long",
        description: "Description must be less than 500 characters.",
      });
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/communities", {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        category,
        members: selectedMembers,
      });

      toast({
        title: "Society Created",
        description: `${name.trim()} has been created successfully.`,
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create society:", error.response?.data || error);

      toast({
        title: "Creation Failed",
        description:
          error?.response?.data?.message ||
          "Something went wrong while creating the society.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground rounded-xl">
          <Plus className="h-4 w-4" />
          New Society
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/5 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-heading">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                {icon}
              </div>
              Create New Society
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your society profile, appearance, and members.
          </p>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Society Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Society name"
                className="h-12 rounded-2xl"
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Description *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={4}
                className="rounded-2xl"
                maxLength={500}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(societyCategoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4" />
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition-all ${
                      icon === i
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Palette className="h-4 w-4" />
                Color
              </label>
              <div className="flex gap-3 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-9 w-9 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-primary scale-105"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Users className="h-4 w-4" />
                Members
              </label>
              <Input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members..."
                className="h-12 rounded-2xl"
              />

              {loadingUsers && (
                <p className="text-xs text-muted-foreground mt-1">
                  Loading users...
                </p>
              )}

              {!loadingUsers && memberSearch && filteredUsers.length > 0 && (
                <div className="border border-border rounded-2xl mt-2 max-h-40 overflow-y-auto bg-card">
                  {filteredUsers.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => {
                        setSelectedMembers((prev) => [...prev, u._id]);
                        setMemberSearch("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-left text-sm transition"
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: u.avatar || color }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-foreground">{u.name}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {u.email}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loadingUsers && memberSearch && filteredUsers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No matching users found.
                </p>
              )}

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedMembers.map((id) => {
                    const user = users.find((u) => u._id === id);
                    return user ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1.5 text-xs px-3 py-1.5 rounded-full"
                      >
                        {user.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setSelectedMembers((prev) =>
                              prev.filter((x) => x !== id)
                            )
                          }
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !description.trim() || submitting}
              className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground"
            >
              {submitting ? "Creating..." : "Create Society"}
            </Button>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-4">
                Live Preview
              </p>

              <div className="rounded-3xl border border-border bg-background p-5">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {icon}
                </div>

                <h2 className="text-xl font-bold text-foreground">
                  {name || "Society Name"}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {description || "Your society description will appear here."}
                </p>

                <div className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium bg-muted text-foreground">
                  {societyCategoryLabels[category] || "Other"}
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
                  {selectedMembers.map((id) => {
                    const user = users.find((u) => u._id === id);
                    if (!user) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
                      >
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: user.avatar || color }}
                        >
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}