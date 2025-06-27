import User from './user';

export default interface Message {
    id: string;
    content: string;
    user: User;
    channelId: string;
    createdAt: string;
}
