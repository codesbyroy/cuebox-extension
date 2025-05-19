/**
* Sample bookmark data
*/
export interface Bookmark {
    id: string;
    text: string;
    icon: string;
}

export const sampleBookmarks: Bookmark[] = [
    {
    id: '1',
    text: 'This is a sample prompt being boxed!',
    icon: 'claude'
    },
    {
    id: '2',
    text: 'How to implement search functionality in React',
    icon: 'claude'
    },
    {
    id: '3',
    text: 'Create a responsive layout with Tailwind CSS',
    icon: 'claude'
    }
];