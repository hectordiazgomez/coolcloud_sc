import React, { useState, useEffect } from 'react';
import { Search, Github, Send } from 'lucide-react';

const GithubConnect = ({ repos, searchTerm, setSearchTerm, repoSelected }) => {
    
    const [filteredRepos, setFilteredRepos] = useState(repos);

    useEffect(() => {
        setFilteredRepos(
            repos.filter(repo =>
                repo.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, repos]);

    function formatRelativeTime(dateString) {
        const currentDate = new Date();
        const updatedDate = new Date(dateString);
        const timeDiff = currentDate - updatedDate;

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const month = 30 * day;
        const year = 365 * day;

        if (timeDiff < minute) {
            return 'less than a minute ago';
        } else if (timeDiff < 2 * minute) {
            return '1 minute ago';
        } else if (timeDiff < hour) {
            const minutes = Math.floor(timeDiff / minute);
            return `${minutes} minutes ago`;
        } else if (timeDiff < 2 * hour) {
            return '1 hour ago';
        } else if (timeDiff < day) {
            const hours = Math.floor(timeDiff / hour);
            return `${hours} hours ago`;
        } else if (timeDiff < 2 * day) {
            return '1 day ago';
        } else if (timeDiff < month) {
            const days = Math.floor(timeDiff / day);
            return `${days} days ago`;
        } else if (timeDiff < 2 * month) {
            return '1 month ago';
        } else if (timeDiff < year) {
            const months = Math.floor(timeDiff / month);
            return `${months} months ago`;
        } else if (timeDiff < 2 * year) {
            return '1 year ago';
        } else {
            const years = Math.floor(timeDiff / year);
            return `${years} years ago`;
        }
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">GitHub Repositories</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Select a repository to deploy</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <div className="py-3 sm:px-6">
                    <div className="max-w-lg w-full lg:max-w-xs">
                        <label htmlFor="search" className="sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                id="search"
                                name="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search repositories"
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <ul className="divide-y divide-gray-200">
                    {filteredRepos.map((repo) => (
                        <li key={repo.id} className="hover:bg-gray-50">
                            <div
                                onClick={() => repoSelected(repo)}
                                className="px-4 py-4 sm:px-6 cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <Github className="mr-4 h-6 w-6 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-indigo-600 truncate">{repo.name}</p>
                                        <p className="mt-1 text-sm text-gray-500">{repo.language || 'No language specified'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-500 mr-4">{formatRelativeTime(repo.updated_at)}</p>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {repo.visibility}
                                    </span>
                                    <button
                                        className="ml-4 text-indigo-600 hover:text-indigo-900"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            repoSelected(repo);
                                        }}
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GithubConnect;