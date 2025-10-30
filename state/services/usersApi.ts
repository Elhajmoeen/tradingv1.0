import { baseApi } from "@/integration/baseApi";
// PATCH: begin usersApi (team leader scope)
import type { AgentDirectoryItem, AgentScopeResponse } from "@/features/users/types";
// PATCH: end usersApi (team leader scope)

type AvatarTicket = {
  uploadUrl: string;
  publicUrl: string;
  headers?: Record<string, string>; // e.g., {"Content-Type":"image/png"}
};

type AvatarResponse = { 
  avatarUrl: string 
};

const MODE = (import.meta.env.VITE_UPLOAD_MODE as "presigned" | "multipart") ?? "multipart";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Presigned ticket fetch (used only if MODE === 'presigned')
    getAvatarUploadTicket: build.mutation<AvatarTicket, void>({
      query: () => ({ 
        url: "/users/me/avatar/upload-ticket", 
        method: "POST" 
      }),
    }),

    // Confirm avatar after presigned upload
    confirmAvatar: build.mutation<AvatarResponse, { publicUrl: string }>({
      query: (body) => ({ 
        url: "/users/me/avatar", 
        method: "POST", 
        body 
      }),
      invalidatesTags: ["User"],
    }),

    // Multipart upload fallback (backend handles storage)
    uploadAvatarMultipart: build.mutation<AvatarResponse, File>({
      async queryFn(file, _api, _extraOptions, baseQuery) {
        try {
          const form = new FormData();
          form.append("file", file);
          
          // Use the baseQuery to make the request with proper auth headers
          const result = await baseQuery({
            url: "/users/me/avatar",
            method: "POST",
            body: form,
          });
          
          if (result.error) {
            return { error: result.error };
          }
          
          return { data: result.data as AvatarResponse };
        } catch (e: any) {
          return { 
            error: { 
              status: 500, 
              data: { message: e?.message || "Upload failed" } 
            } 
          };
        }
      },
      invalidatesTags: ["User"],
    }),

    // PATCH: begin usersApi (team leader scope)
    listAgentsDirectory: build.query<
      { items: AgentDirectoryItem[]; meta: { page: number; pageSize: number; total: number } },
      { query?: string; page?: number; pageSize?: number }
    >({
      query: ({ query = "", page = 1, pageSize = 50 } = {}) => ({
        url: "/users",
        params: { role: "agent", query, page, pageSize },
      }),
    }),

    getUserAgentScope: build.query<AgentScopeResponse, { userId: string }>({
      query: ({ userId }) => `/users/${userId}/agent-scope`,
      providesTags: (_r, _e, { userId }) => [{ type: "User" as const, id: `scope:${userId}` }],
    }),

    putUserAgentScope: build.mutation<AgentScopeResponse, { userId: string; agentIds: string[] }>({
      query: ({ userId, agentIds }) => ({
        url: `/users/${userId}/agent-scope`,
        method: "PUT",
        body: { agentIds },
      }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: "User" as const, id: `scope:${userId}` }],
    }),
    // PATCH: end usersApi (team leader scope)
  }),
  overrideExisting: false,
});

export const {
  useGetAvatarUploadTicketMutation,
  useConfirmAvatarMutation,
  useUploadAvatarMultipartMutation,
  // PATCH: begin usersApi exports (team leader scope)
  useListAgentsDirectoryQuery,
  useGetUserAgentScopeQuery,
  usePutUserAgentScopeMutation,
  // PATCH: end usersApi exports (team leader scope)
} = usersApi;

// Helper used by UI to pick correct flow
export async function uploadAvatarSmart(
  file: File, 
  fns: {
    getTicket: ReturnType<typeof useGetAvatarUploadTicketMutation>[0];
    confirm: ReturnType<typeof useConfirmAvatarMutation>[0];
    uploadMultipart: ReturnType<typeof useUploadAvatarMultipartMutation>[0];
  }
) {
  if (MODE === "presigned") {
    const ticket = await fns.getTicket().unwrap();
    await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { ...(ticket.headers ?? {}) },
      body: file,
    });
    const res = await fns.confirm({ publicUrl: ticket.publicUrl }).unwrap();
    return res.avatarUrl;
  } else {
    const res = await fns.uploadMultipart(file).unwrap();
    return res.avatarUrl;
  }
}