/**
 * ⚡🌟🎯 Interest Hyperspaces - ADHD Special Interest Communities 🎯🌟⚡
 *
 * Features:
 * - Deep-dive topic discussions for special interests
 * - ADHD-friendly content organization
 * - Hyperfocus-supporting community features
 * - Safe spaces for neurodivergent expression
 */

import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTheme } from '../contexts/ThemeContext';

interface InterestSpace {
    id: string;
    title: string;
    description: string;
    memberCount: number;
    posts: number;
    icon: string;
    color: string;
    tags: string[];
    isJoined: boolean;
    hyperfocusLevel: 'casual' | 'moderate' | 'intense';
}

interface Post {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    likes: number;
    comments: number;
    tags: string[];
    spaceId: string;
}

export const InterestHyperspace: React.FC = () => {
    const { colors, typography } = useTheme();
    const { announceForScreenReader } = useAccessibility();

    const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'discover' | 'joined' | 'create'>('discover');

    // Sample interest spaces - in real app, this would come from API
    const [interestSpaces] = useState<InterestSpace[]>([
        {
            id: '1',
            title: 'ADHD Productivity Hacks',
            description: 'Share and discover productivity techniques that actually work for ADHD brains',
            memberCount: 12500,
            posts: 3200,
            icon: 'brain',
            color: '#6C5CE7',
            tags: ['productivity', 'adhd', 'tips', 'organization'],
            isJoined: true,
            hyperfocusLevel: 'intense',
        },
        {
            id: '2',
            title: 'Creative Expression Zone',
            description: 'A safe space for sharing art, writing, music, and creative hyperfocus projects',
            memberCount: 8900,
            posts: 5600,
            icon: 'palette',
            color: '#FD79A8',
            tags: ['creativity', 'art', 'writing', 'music'],
            isJoined: true,
            hyperfocusLevel: 'moderate',
        },
        {
            id: '3',
            title: 'Science & Discovery',
            description: 'Deep dives into fascinating scientific topics and discoveries',
            memberCount: 15600,
            posts: 4100,
            icon: 'flask',
            color: '#00B894',
            tags: ['science', 'research', 'discovery', 'learning'],
            isJoined: false,
            hyperfocusLevel: 'intense',
        },
        {
            id: '4',
            title: 'Gaming & Strategy',
            description: 'Discuss games, strategies, and the psychology of gaming',
            memberCount: 22300,
            posts: 8900,
            icon: 'gamepad-variant',
            color: '#E17055',
            tags: ['gaming', 'strategy', 'community', 'fun'],
            isJoined: true,
            hyperfocusLevel: 'casual',
        },
        {
            id: '5',
            title: 'Tech & Innovation',
            description: 'Latest in technology, programming, and digital innovation',
            memberCount: 18700,
            posts: 6400,
            icon: 'code-tags',
            color: '#0984E3',
            tags: ['technology', 'programming', 'innovation', 'coding'],
            isJoined: false,
            hyperfocusLevel: 'intense',
        },
    ]);

    const [samplePosts] = useState<Post[]>([
        {
            id: '1',
            author: 'FocusedMind',
            content: 'Just discovered the "15-minute rule" - if a task takes less than 15 minutes, do it immediately. Game changer for my ADHD! 🧠✨',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            likes: 42,
            comments: 12,
            tags: ['productivity', 'tips'],
            spaceId: '1',
        },
        {
            id: '2',
            author: 'CreativeNeuron',
            content: 'Spent 6 hours hyperfocused on this digital art piece. ADHD hyperfocus can be a superpower when channeled right! 🎨',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            likes: 78,
            comments: 23,
            tags: ['art', 'hyperfocus'],
            spaceId: '2',
        },
    ]);

    const joinSpace = (spaceId: string) => {
        announceForScreenReader('Joined interest space successfully');
        Alert.alert(
            '🎉 Welcome!',
            'You\'ve joined this hyperspace! You\'ll now see posts in your feed and can participate in discussions.',
            [{ text: 'Got it!', style: 'default' }]
        );
    };

    const leaveSpace = (spaceId: string) => {
        Alert.alert(
            'Leave Hyperspace?',
            'Are you sure you want to leave this interest space?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => announceForScreenReader('Left interest space')
                }
            ]
        );
    };

    const renderSpaceCard = ({ item }: { item: InterestSpace }) => (
        <TouchableOpacity
            style={[
                styles.spaceCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: item.isJoined ? item.color : colors.border,
                    borderWidth: item.isJoined ? 2 : 1,
                }
            ]}
            onPress={() => setSelectedSpace(item.id)}
            accessibilityLabel={`${item.title} interest space`}
            accessibilityHint={`${item.memberCount} members, ${item.posts} posts. ${item.isJoined ? 'Already joined' : 'Tap to view details'}`}
        >
            <View style={styles.spaceHeader}>
                <View style={[styles.spaceIcon, { backgroundColor: item.color + '20' }]}>
                    <Icon name={item.icon} size={24} color={item.color} />
                </View>

                <View style={styles.hyperfocusIndicator}>
                    <View style={[
                        styles.hyperfocusBar,
                        {
                            backgroundColor: item.hyperfocusLevel === 'intense' ? '#E17055' :
                                item.hyperfocusLevel === 'moderate' ? '#FDCB6E' : '#00B894'
                        }
                    ]} />
                    <Text style={[styles.hyperfocusLabel, { color: colors.textSecondary }]}>
                        {item.hyperfocusLevel}
                    </Text>
                </View>
            </View>

            <Text style={[styles.spaceTitle, { color: colors.text, ...typography.subtitle }]}>
                {item.title}
            </Text>

            <Text style={[styles.spaceDescription, { color: colors.textSecondary, ...typography.caption }]}>
                {item.description}
            </Text>

            <View style={styles.spaceTags}>
                {item.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: item.color + '20' }]}>
                        <Text style={[styles.tagText, { color: item.color }]}>
                            #{tag}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.spaceStats}>
                <View style={styles.statItem}>
                    <Icon name="account-group" size={16} color={colors.textSecondary} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {item.memberCount.toLocaleString()}
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Icon name="message-text" size={16} color={colors.textSecondary} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {item.posts.toLocaleString()}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.joinButton,
                        {
                            backgroundColor: item.isJoined ? colors.surface : item.color,
                            borderColor: item.color,
                            borderWidth: item.isJoined ? 1 : 0,
                        }
                    ]}
                    onPress={() => item.isJoined ? leaveSpace(item.id) : joinSpace(item.id)}
                    accessibilityLabel={item.isJoined ? 'Leave space' : 'Join space'}
                >
                    <Text style={[
                        styles.joinButtonText,
                        { color: item.isJoined ? item.color : '#FFFFFF' }
                    ]}>
                        {item.isJoined ? 'Joined' : 'Join'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderPost = ({ item }: { item: Post }) => (
        <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.postHeader}>
                <Text style={[styles.postAuthor, { color: colors.text, ...typography.subtitle }]}>
                    @{item.author}
                </Text>
                <Text style={[styles.postTime, { color: colors.textSecondary }]}>
                    {formatTimestamp(item.timestamp)}
                </Text>
            </View>

            <Text style={[styles.postContent, { color: colors.text, ...typography.body }]}>
                {item.content}
            </Text>

            <View style={styles.postTags}>
                {item.tags.map((tag, index) => (
                    <View key={index} style={[styles.postTag, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.postTagText, { color: colors.primary }]}>
                            #{tag}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Icon name="heart-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                        {item.likes}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Icon name="comment-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                        {item.comments}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Icon name="share-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const formatTimestamp = (timestamp: Date): string => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        }
    };

    const filteredSpaces = interestSpaces.filter(space =>
        space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const joinedSpaces = interestSpaces.filter(space => space.isJoined);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text, ...typography.title }]}>
                    ⚡ Interest Hyperspaces
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary, ...typography.caption }]}>
                    Deep-dive communities for your special interests
                </Text>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                <Icon name="magnify" size={20} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search interests, topics, or tags..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    accessibilityLabel="Search interest spaces"
                />
            </View>

            <View style={styles.modeToggle}>
                {(['discover', 'joined', 'create'] as const).map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[
                            styles.modeButton,
                            {
                                backgroundColor: viewMode === mode ? colors.primary : colors.surface,
                                borderColor: colors.border,
                            }
                        ]}
                        onPress={() => setViewMode(mode)}
                        accessibilityLabel={`Switch to ${mode} mode`}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            { color: viewMode === mode ? colors.onPrimary : colors.text }
                        ]}>
                            {mode === 'discover' ? '🔍 Discover' :
                                mode === 'joined' ? '⚡ Joined' : '➕ Create'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {viewMode === 'discover' && (
                <FlatList
                    data={filteredSpaces}
                    renderItem={renderSpaceCard}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.spacesList}
                />
            )}

            {viewMode === 'joined' && (
                <View style={styles.joinedContainer}>
                    <FlatList
                        data={joinedSpaces}
                        renderItem={renderSpaceCard}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.spacesList}
                        ListHeaderComponent={
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Your Hyperspaces ({joinedSpaces.length})
                                </Text>
                            </View>
                        }
                    />

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Recent Posts
                        </Text>
                    </View>

                    <FlatList
                        data={samplePosts}
                        renderItem={renderPost}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {viewMode === 'create' && (
                <View style={styles.createContainer}>
                    <Text style={[styles.createTitle, { color: colors.text, ...typography.headline }]}>
                        🚀 Create Your Hyperspace
                    </Text>
                    <Text style={[styles.createDescription, { color: colors.textSecondary, ...typography.body }]}>
                        Start a community around your special interest or passion project
                    </Text>

                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: colors.primary }]}
                        onPress={() => Alert.alert('Coming Soon!', 'Custom hyperspace creation will be available in the next update.')}
                    >
                        <Icon name="plus" size={20} color={colors.onPrimary} />
                        <Text style={[styles.createButtonText, { color: colors.onPrimary }]}>
                            Create New Hyperspace
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 25,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    modeToggle: {
        flexDirection: 'row',
        marginBottom: 20,
        borderRadius: 25,
        overflow: 'hidden',
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    spacesList: {
        paddingBottom: 20,
    },
    spaceCard: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
    },
    spaceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    spaceIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hyperfocusIndicator: {
        alignItems: 'center',
    },
    hyperfocusBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: 4,
    },
    hyperfocusLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    spaceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    spaceDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    spaceTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    spaceStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        marginLeft: 4,
    },
    joinButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 15,
    },
    joinButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    joinedContainer: {
        flex: 1,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    postCard: {
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    postAuthor: {
        fontSize: 14,
        fontWeight: '600',
    },
    postTime: {
        fontSize: 12,
    },
    postContent: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 12,
    },
    postTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    postTag: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 3,
    },
    postTagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    actionText: {
        fontSize: 12,
        marginLeft: 4,
    },
    createContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    createTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    createDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 15,
        borderRadius: 25,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
