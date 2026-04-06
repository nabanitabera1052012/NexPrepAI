/**
 * Normalizes question items when the API returns stringified JSON in any field.
 */
export function normalizeQuestionItem(item) {
    const out = {
        intention: item?.intention != null ? String(item.intention) : '',
        question: item?.question != null ? String(item.question) : '',
        answer: item?.answer != null ? String(item.answer) : '',
    }

    function mergeFromEmbedded(str) {
        if (typeof str !== 'string') return
        const t = str.trim()
        if (!t.startsWith('{')) return
        try {
            const o = JSON.parse(t)
            if (!o || typeof o !== 'object' || Array.isArray(o)) return
            if ('intention' in o && o.intention != null)
                out.intention = String(o.intention)
            if ('question' in o && o.question != null)
                out.question = String(o.question)
            if ('answer' in o && o.answer != null) out.answer = String(o.answer)
        } catch {
            /* not JSON */
        }
    }

    mergeFromEmbedded(out.question)
    mergeFromEmbedded(out.intention)
    mergeFromEmbedded(out.answer)

    return out
}

/** Split on `backticks` for inline code styling. */
export function textWithInlineCode(text) {
    if (text == null || text === '') return []
    const str = String(text)
    const parts = str.split(/(`[^`]+`)/g)
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return { type: 'code', key: i, text: part.slice(1, -1) }
        }
        return { type: 'text', key: i, text: part }
    })
}
