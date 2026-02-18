'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';

interface Address {
    id: string;
    street: string;
    city: string;
    district: string;
    country: string;
    latitude: number;
    longitude: number;
}

interface AddressAutocompleteProps {
    onSelect: (address: Address) => void;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
    city?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    onSelect,
    placeholder = "Entrez une adresse...",
    defaultValue = "",
    className,
    city
}) => {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const searchAddresses = async (searchTerm: string) => {
        if (searchTerm.length < 3) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            let url = `/api/addresses/search?query=${encodeURIComponent(searchTerm)}`;
            if (city) {
                url += `&city=${encodeURIComponent(city)}`;
            }
            const response = await axiosInstance.get(url);
            setSuggestions(response.data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query && query !== defaultValue) {
                searchAddresses(query);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (address: Address) => {
        setQuery(address.street);
        setSuggestions([]);
        setShowSuggestions(false);
        onSelect(address);
    };

    return (
        <div className={cn("relative group", className)} ref={wrapperRef}>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 rounded-lg transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-400/20 focus:bg-white dark:focus:bg-gray-800 shadow-sm hover:shadow-md outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto backdrop-blur-md">
                    {suggestions.map((address) => (
                        <button
                            key={address.id}
                            onClick={() => handleSelect(address)}
                            className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 flex flex-col gap-0.5 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                        >
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {address.street}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {address.district}, {address.city}, {address.country}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {showSuggestions && query.length >= 3 && !loading && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucune adresse trouvée
                </div>
            )}
        </div>
    );
};
