export interface Message { // move this to a separate file if needed
    id: string;
    content: string;
    userId: string;
    channelId: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
    };
}
