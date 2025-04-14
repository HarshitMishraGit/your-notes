"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface NoteVisibilityControlProps {
  noteId: string;
  isPublic: boolean;
  onVisibilityChange: (isPublic: boolean) => void;
}

export default function NoteVisibilityControl({
  noteId,
  isPublic,
  onVisibilityChange,
}: NoteVisibilityControlProps) {
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Generate shareable link for the note
  const shareableLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${noteId}`
      : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const handleVisibilityChange = (newValue: boolean) => {
    onVisibilityChange(newValue);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
        >
          <Share2 className="h-4 w-4" />
          Visibility
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Note Visibility</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Control who can access your note and get a shareable link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <Label className="text-base">Make note public</Label>
            <p className="text-sm text-neutral-400">
              {isPublic
                ? "Anyone with the link can view this note"
                : "Only you can view this note"}
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handleVisibilityChange}
            className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-neutral-700 h-6 w-11 transition-colors duration-200"
            
          />
        </div>

        {isPublic && (
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <Label htmlFor="link">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={shareableLink}
                readOnly
                className="bg-neutral-800 border-neutral-700"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white w-full mt-2"
            onClick={() => setDialogOpen(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
