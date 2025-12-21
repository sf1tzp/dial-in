/**
 * Formats a date in a colloquial style:
 * - Today => "Today"
 * - Within the last week => "Monday", "Tuesday", etc.
 * - Within the last 2 weeks => "Dec 1st", "Nov 28th", etc.
 * - Older => 11/31
 */
export function formatColloquialDate(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    }

    if (diffDays > 0 && diffDays <= 7) {
        // Within the last week - show day name
        return target.toLocaleDateString('en-US', { weekday: 'long' });
    }

    if (diffDays > 7 && diffDays <= 14) {
        // Within the last 2 weeks - show "Dec 1st" format
        const month = target.toLocaleDateString('en-US', { month: 'short' });
        const day = target.getDate();
        const suffix = getOrdinalSuffix(day);
        return `${month} ${day}${suffix}`;
    }

    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

function getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}
