/**
* Search Context
* 
* Provides search functionality across components.
*/
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
        {children}
    </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};