export function filterArticles(
    articles,
    { category = null, q = '', sort = 'latest' } = {},
) {
    const query = q.trim().toLowerCase();

    let list = articles.filter((article) => {
        if (category && category !== 'all') {
            const slug = article.categorySlug || '';
            const name = article.category || '';
            if (slug !== category && name !== category) return false;
        }
        if (!query) return true;
        const haystack = [
            article.title,
            article.subtitle,
            article.excerpt,
            article.category,
            ...(article.body ?? []),
            article.bodyHtml
                ? String(article.bodyHtml).replace(/<[^>]+>/g, ' ')
                : '',
        ]
            .join(' ')
            .toLowerCase();
        return haystack.includes(query);
    });

    list = [...list];
    switch (sort) {
        case 'oldest':
            list.sort(
                (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt),
            );
            break;
        case 'most-viewed':
            list.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
        case 'trending':
            list.sort((a, b) => {
                const score = (item) =>
                    (item.isFeatured ? 95 : 0) +
                    Math.min(90, (item.views || 0) / 20);
                return score(b) - score(a);
            });
            break;
        case 'a-z':
            list.sort((a, b) =>
                String(a.title || '').localeCompare(String(b.title || '')),
            );
            break;
        case 'latest':
        default:
            list.sort(
                (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
            );
            break;
    }

    return list;
}
