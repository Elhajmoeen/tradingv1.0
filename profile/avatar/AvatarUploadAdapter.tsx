import * as React from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { 
  uploadAvatarSmart, 
  useConfirmAvatarMutation, 
  useGetAvatarUploadTicketMutation, 
  useUploadAvatarMultipartMutation 
} from "@/state/services/usersApi";

const MAX_MB = Number(import.meta.env.VITE_MAX_AVATAR_MB ?? 5);

type Props = {
  children: (opts: { onClick: () => void, uploading: boolean }) => React.ReactNode;
  onUpdated?: (url: string) => void; // optional callback after upload
};

export default function AvatarUploadAdapter({ children, onUpdated }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const [getTicket] = useGetAvatarUploadTicketMutation();
  const [confirm] = useConfirmAvatarMutation();
  const [uploadMultipart] = useUploadAvatarMultipartMutation();

  const onClick = React.useCallback(() => inputRef.current?.click(), []);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_MB}MB`);
      return;
    }
    
    if (!/^image\//.test(f.type)) {
      toast.error("Only image files are allowed");
      return;
    }
    
    setUploading(true);
    try {
      const url = await uploadAvatarSmart(f, { getTicket, confirm, uploadMultipart });
      onUpdated?.(url);
      toast.success("Avatar updated successfully!");
    } catch (err) {
      console.error("Avatar upload failed", err);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      {children({ onClick, uploading })}
    </>
  );
}