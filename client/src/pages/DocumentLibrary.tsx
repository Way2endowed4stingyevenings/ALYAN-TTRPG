import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { appRouter } from "@server/routers";
import { Button } from "@client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@client/components/ui/card";
import { Input } from "@client/components/ui/input";
import { Label } from "@client/components/ui/label";
import { Upload, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Document } from "@server/drizzle/schema";

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function DocumentLibrary() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: () => appRouter.document.list.query(),
  });

  const getUploadUrlMutation = useMutation({
    mutationFn: appRouter.document.getUploadUrl.mutate,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: appRouter.document.delete.mutate,
    onSuccess: () => {
      toast.success("Document deleted successfully.");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete document.", { description: error.message });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get a pre-signed URL from the server
      const { uploadUrl, documentId } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      // 2. Upload the file directly to S3 using the pre-signed URL
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      toast.success("File uploaded successfully!", {
        description: \`\${file.name} is now available in your library.\`,
      });

      // 3. Clean up and refresh the list
      setFile(null);
      refetch();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed.", {
        description: "Could not upload file to storage. Check console for details.",
      });
      // TODO: If S3 upload fails, we should also delete the placeholder DB record
    } finally {
      setIsUploading(false);
    }
  }, [file, getUploadUrlMutation, refetch]);

  const handleDelete = (documentId: number) => {
    deleteDocumentMutation.mutate({ documentId });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-primary">Document Library</h1>

      {/* Upload Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload New Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="document-upload">Document File</Label>
            <Input
              id="document-upload"
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-4"
            >
              {isUploading ? "Uploading..." : "Upload to Library"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents ({documents?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc: Document) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="w-6 h-6 text-primary" />
                    <div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {doc.name}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {doc.mimeType} - {formatFileSize(doc.fileSize || 0)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteDocumentMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No documents found. Upload your first rulebook or lore document!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
