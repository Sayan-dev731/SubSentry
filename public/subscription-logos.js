// Subscription Logos and Metadata Database
const SUBSCRIPTION_DATABASE = {
    // Streaming Services
    'netflix': {
        name: 'Netflix',
        icon: '🎬',
        color: '#E50914',
        defaultUrl: 'https://www.netflix.com',
        category: 'Streaming'
    },
    'amazon-prime': {
        name: 'Amazon Prime Video',
        icon: '📺',
        color: '#00A8E1',
        defaultUrl: 'https://www.primevideo.com',
        category: 'Streaming'
    },
    'disney-plus': {
        name: 'Disney+',
        icon: '🏰',
        color: '#113CCF',
        defaultUrl: 'https://www.disneyplus.com',
        category: 'Streaming'
    },
    'hulu': {
        name: 'Hulu',
        icon: '📡',
        color: '#1CE783',
        defaultUrl: 'https://www.hulu.com',
        category: 'Streaming'
    },
    'hbo-max': {
        name: 'HBO Max',
        icon: '🎭',
        color: '#B000FF',
        defaultUrl: 'https://www.max.com',
        category: 'Streaming'
    },
    'youtube-premium': {
        name: 'YouTube Premium',
        icon: '▶️',
        color: '#FF0000',
        defaultUrl: 'https://www.youtube.com/premium',
        category: 'Streaming'
    },
    'apple-tv': {
        name: 'Apple TV+',
        icon: '📱',
        color: '#000000',
        defaultUrl: 'https://tv.apple.com',
        category: 'Streaming'
    },
    'paramount-plus': {
        name: 'Paramount+',
        icon: '⛰️',
        color: '#0064FF',
        defaultUrl: 'https://www.paramountplus.com',
        category: 'Streaming'
    },

    // Music Streaming
    'spotify': {
        name: 'Spotify',
        icon: '🎵',
        color: '#1DB954',
        defaultUrl: 'https://www.spotify.com',
        category: 'Music'
    },
    'apple-music': {
        name: 'Apple Music',
        icon: '🎶',
        color: '#FA243C',
        defaultUrl: 'https://music.apple.com',
        category: 'Music'
    },
    'youtube-music': {
        name: 'YouTube Music',
        icon: '🎤',
        color: '#FF0000',
        defaultUrl: 'https://music.youtube.com',
        category: 'Music'
    },
    'tidal': {
        name: 'Tidal',
        icon: '🌊',
        color: '#000000',
        defaultUrl: 'https://tidal.com',
        category: 'Music'
    },
    'amazon-music': {
        name: 'Amazon Music',
        icon: '🎧',
        color: '#00A8E1',
        defaultUrl: 'https://music.amazon.com',
        category: 'Music'
    },

    // Cloud Storage
    'google-drive': {
        name: 'Google Drive',
        icon: '💾',
        color: '#4285F4',
        defaultUrl: 'https://drive.google.com',
        category: 'Cloud Storage'
    },
    'dropbox': {
        name: 'Dropbox',
        icon: '📦',
        color: '#0061FF',
        defaultUrl: 'https://www.dropbox.com',
        category: 'Cloud Storage'
    },
    'onedrive': {
        name: 'OneDrive',
        icon: '☁️',
        color: '#0078D4',
        defaultUrl: 'https://onedrive.live.com',
        category: 'Cloud Storage'
    },
    'icloud': {
        name: 'iCloud',
        icon: '☁️',
        color: '#3693F3',
        defaultUrl: 'https://www.icloud.com',
        category: 'Cloud Storage'
    },

    // Productivity & Office
    'microsoft-365': {
        name: 'Microsoft 365',
        icon: '📊',
        color: '#D83B01',
        defaultUrl: 'https://www.office.com',
        category: 'Productivity'
    },
    'google-workspace': {
        name: 'Google Workspace',
        icon: '🔧',
        color: '#4285F4',
        defaultUrl: 'https://workspace.google.com',
        category: 'Productivity'
    },
    'adobe-creative-cloud': {
        name: 'Adobe Creative Cloud',
        icon: '🎨',
        color: '#FF0000',
        defaultUrl: 'https://www.adobe.com/creativecloud.html',
        category: 'Productivity'
    },
    'notion': {
        name: 'Notion',
        icon: '📝',
        color: '#000000',
        defaultUrl: 'https://www.notion.so',
        category: 'Productivity'
    },
    'evernote': {
        name: 'Evernote',
        icon: '🐘',
        color: '#00A82D',
        defaultUrl: 'https://evernote.com',
        category: 'Productivity'
    },

    // Gaming
    'xbox-game-pass': {
        name: 'Xbox Game Pass',
        icon: '🎮',
        color: '#107C10',
        defaultUrl: 'https://www.xbox.com/xbox-game-pass',
        category: 'Gaming'
    },
    'playstation-plus': {
        name: 'PlayStation Plus',
        icon: '🎮',
        color: '#003791',
        defaultUrl: 'https://www.playstation.com/ps-plus',
        category: 'Gaming'
    },
    'nintendo-online': {
        name: 'Nintendo Switch Online',
        icon: '🎮',
        color: '#E60012',
        defaultUrl: 'https://www.nintendo.com/switch/online',
        category: 'Gaming'
    },
    'ea-play': {
        name: 'EA Play',
        icon: '🎮',
        color: '#000000',
        defaultUrl: 'https://www.ea.com/ea-play',
        category: 'Gaming'
    },

    // VPN & Security
    'nordvpn': {
        name: 'NordVPN',
        icon: '🔒',
        color: '#4687FF',
        defaultUrl: 'https://nordvpn.com',
        category: 'Security'
    },
    'expressvpn': {
        name: 'ExpressVPN',
        icon: '🛡️',
        color: '#DA3940',
        defaultUrl: 'https://www.expressvpn.com',
        category: 'Security'
    },
    'lastpass': {
        name: 'LastPass',
        icon: '🔑',
        color: '#D32D27',
        defaultUrl: 'https://www.lastpass.com',
        category: 'Security'
    },
    '1password': {
        name: '1Password',
        icon: '🔐',
        color: '#0094F5',
        defaultUrl: 'https://1password.com',
        category: 'Security'
    },

    // Fitness & Health
    'peloton': {
        name: 'Peloton',
        icon: '🚴',
        color: '#000000',
        defaultUrl: 'https://www.onepeloton.com',
        category: 'Fitness'
    },
    'headspace': {
        name: 'Headspace',
        icon: '🧘',
        color: '#FF6B37',
        defaultUrl: 'https://www.headspace.com',
        category: 'Health'
    },
    'calm': {
        name: 'Calm',
        icon: '😌',
        color: '#2F4858',
        defaultUrl: 'https://www.calm.com',
        category: 'Health'
    },

    // News & Magazines
    'new-york-times': {
        name: 'The New York Times',
        icon: '📰',
        color: '#000000',
        defaultUrl: 'https://www.nytimes.com',
        category: 'News'
    },
    'medium': {
        name: 'Medium',
        icon: '📖',
        color: '#000000',
        defaultUrl: 'https://medium.com',
        category: 'News'
    },

    // Communication
    'zoom': {
        name: 'Zoom',
        icon: '💬',
        color: '#2D8CFF',
        defaultUrl: 'https://zoom.us',
        category: 'Communication'
    },
    'slack': {
        name: 'Slack',
        icon: '💼',
        color: '#4A154B',
        defaultUrl: 'https://slack.com',
        category: 'Communication'
    },
    'discord-nitro': {
        name: 'Discord Nitro',
        icon: '🎮',
        color: '#5865F2',
        defaultUrl: 'https://discord.com/nitro',
        category: 'Communication'
    },

    // Development
    'github': {
        name: 'GitHub',
        icon: '🐙',
        color: '#181717',
        defaultUrl: 'https://github.com',
        category: 'Development'
    },
    'jetbrains': {
        name: 'JetBrains',
        icon: '💻',
        color: '#000000',
        defaultUrl: 'https://www.jetbrains.com',
        category: 'Development'
    },
    'figma': {
        name: 'Figma',
        icon: '🎨',
        color: '#F24E1E',
        defaultUrl: 'https://www.figma.com',
        category: 'Design'
    },

    // Other
    'other': {
        name: 'Other',
        icon: '📋',
        color: '#6C757D',
        defaultUrl: '',
        category: 'Other'
    }
};

// Get all subscriptions grouped by category
function getSubscriptionsByCategory() {
    const categories = {};

    Object.entries(SUBSCRIPTION_DATABASE).forEach(([key, sub]) => {
        if (!categories[sub.category]) {
            categories[sub.category] = [];
        }
        categories[sub.category].push({
            id: key,
            ...sub
        });
    });

    return categories;
}

// Get subscription by ID
function getSubscription(id) {
    return SUBSCRIPTION_DATABASE[id] || SUBSCRIPTION_DATABASE['other'];
}

// Validate domain against subscription
function validateSubscriptionDomain(subscriptionId, url) {
    const subscription = getSubscription(subscriptionId);

    // For 'other', allow any valid URL
    if (subscriptionId === 'other') {
        return isValidUrl(url);
    }

    try {
        const inputDomain = new URL(url).hostname.toLowerCase().replace('www.', '');
        const expectedDomain = new URL(subscription.defaultUrl).hostname.toLowerCase().replace('www.', '');

        // Check if domains match
        return inputDomain.includes(expectedDomain) || expectedDomain.includes(inputDomain);
    } catch (e) {
        return false;
    }
}

// Check if URL is valid
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Search subscriptions by name
function searchSubscriptions(query) {
    const lowerQuery = query.toLowerCase();
    return Object.entries(SUBSCRIPTION_DATABASE)
        .filter(([key, sub]) =>
            sub.name.toLowerCase().includes(lowerQuery) ||
            key.includes(lowerQuery)
        )
        .map(([key, sub]) => ({
            id: key,
            ...sub
        }));
}
