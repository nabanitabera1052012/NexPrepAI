const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseMessageJson(rawMessage) {
    if (typeof rawMessage !== "string") return null
    try {
        const parsed = JSON.parse(rawMessage)
        return parsed?.error || null
    } catch {
        return null
    }
}

function normalizeStatus(status) {
    if (status === undefined || status === null) return undefined
    if (typeof status === "number") return status
    if (typeof status === "string") {
        if (/^\d+$/.test(status)) return Number(status)
        if (status.toUpperCase() === "UNAVAILABLE") return 503
        if (status.toUpperCase() === "NOT_FOUND") return 404
    }
    return undefined
}

function isOverloadedGeminiError(err) {
    const info = getGeminiErrorInfo(err)
    return info.code === 503 || info.status === 503
}

function getGeminiErrorInfo(err) {
    const messageError = parseMessageJson(err?.message)
    const rawCode = err?.error?.code ?? messageError?.code
    const rawStatus = err?.error?.status ?? err?.status ?? messageError?.status

    const code = normalizeStatus(rawCode)
    const status = normalizeStatus(rawStatus)

    return {
        code,
        status,
        message: err?.error?.message || err?.message,
    }
}

async function generateJsonWithFallback({ prompt, schema, models }) {
    const errors = []

    for (const model of models) {
        // Retry a couple times per model on overload.
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: zodToJsonSchema(schema),
                    }
                })

                return JSON.parse(response.text)
            } catch (err) {
                const info = getGeminiErrorInfo(err)
                errors.push({ model, attempt, ...info })
                if (isOverloadedGeminiError(err) && attempt < 2) {
                    await sleep(1500 * (attempt + 1))
                    continue
                }
                break
            }
        }
    }

    const last = errors[errors.length - 1]
    const e = new Error(
        `Gemini request failed. Last model: ${last?.model || "unknown"}; ` +
        `last status: ${last?.status || "unknown"}; last code: ${last?.code || "unknown"}`
    )
    e.details = errors
    throw e
}


const interviewReportSchema = z.object({
    matchScore: z.number().min(1).max(100).describe("A score between 1 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).min(3).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).min(3).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).min(3).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).min(3).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Important constraints:
                        - Return valid JSON exactly matching schema.
                        - matchScore must be between 1 and 100.
                        - Provide at least 3 technicalQuestions, 3 behavioralQuestions, 3 skillGaps, and 3 preparationPlan days.
                        - Keep answers practical and specific, not generic.
`

    // Prefer currently supported/available models first; preview as last fallback.
    const models = [
        process.env.GEMINI_MODEL || "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-3-flash-preview",
    ]

    return await generateJsonWithFallback({ prompt, schema: interviewReportSchema, models })


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const models = [
        process.env.GEMINI_MODEL || "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-3-flash-preview",
    ]

    const jsonContent = await generateJsonWithFallback({ prompt, schema: resumePdfSchema, models })

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }