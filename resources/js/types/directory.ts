export type DirectoryRecord = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string | null;
};

export type DirectoryPagination = {
    data: DirectoryRecord[];
    current_page: number;
    per_page: number;
    total: number;
};
