import { useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { events, teamMembers, currentUser } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Image,
  File,
  Download,
  Upload,
  Search,
  FolderOpen,
} from "lucide-react";

const fileIcons = {
  image: Image,
  pdf: FileText,
  document: File,
  other: File,
};

const fileColors = {
  image: "bg-primary/10 text-primary",
  pdf: "bg-risk/10 text-risk",
  document: "bg-warning/10 text-warning",
  other: "bg-muted text-muted-foreground",
};

export function EventFiles() {
  const { selectedEventId } = useEvent();
  const event = events.find((e) => e.id === selectedEventId);

  const [search, setSearch] = useState("");
  const [localFiles, setLocalFiles] = useState(event?.files ?? []);

  const filteredFiles = localFiles.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = () => {
    const mockFile = {
      id: `f-${Date.now()}`,
      name: `document-${Date.now()}.pdf`,
      type: "pdf",
      size: "1.2 MB",
      uploadedBy:
        teamMembers.find((m) => m.id === currentUser.id) ?? teamMembers[0],
      uploadedAt: new Date(),
    };

    setLocalFiles((prev) => [...prev, mockFile]);
  };

  return (
    <Card className="shadow-card border border-border/60 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Event Files
            <span className="text-[10px] text-muted-foreground font-normal">
              ({filteredFiles.length})
            </span>
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs w-[180px] rounded-xl"
              />
            </div>

            <Button
              size="sm"
              onClick={handleUpload}
              className="h-8 gap-1.5 gradient-primary text-primary-foreground text-xs rounded-xl"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredFiles.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40">
              <FolderOpen className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No files uploaded yet
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Upload files or share them in the event chat
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const FileIcon = fileIcons[file.type] || File;

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      fileColors[file.type] || fileColors.other
                    }`}
                  >
                    <FileIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {file.size} • Uploaded by {file.uploadedBy.name} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}