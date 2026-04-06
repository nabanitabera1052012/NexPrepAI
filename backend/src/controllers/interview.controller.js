const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

function buildFallbackInterviewReport({ jobDescription = "", selfDescription = "" }) {
    const text = `${jobDescription} ${selfDescription}`.trim()
    const title = text ? text.split(/\s+/).slice(0, 5).join(" ") : "Interview Strategy"

    return {
        title,
        matchScore: 65,
        technicalQuestions: [
            {
                question: "Walk me through a recent project you built and the architecture choices you made.",
                intention: "Evaluate system design thinking and technical ownership.",
                answer: "Describe problem, constraints, architecture, trade-offs, and measurable impact."
            },
            {
                question: "How do you debug production issues quickly and safely?",
                intention: "Assess troubleshooting process and reliability practices.",
                answer: "Explain logs/metrics, reproduction strategy, root-cause analysis, fix rollout, and postmortem."
            },
            {
                question: "How do you optimize API and frontend performance together?",
                intention: "Check end-to-end performance understanding.",
                answer: "Cover payload optimization, caching, lazy loading, DB/query tuning, and monitoring."
            }
        ],
        behavioralQuestions: [
            {
                question: "Tell me about a time requirements changed late in the project.",
                intention: "Assess adaptability and stakeholder communication.",
                answer: "Use STAR format: context, action to realign scope, and final result."
            },
            {
                question: "Describe a conflict in your team and how you resolved it.",
                intention: "Evaluate collaboration and conflict management.",
                answer: "Focus on listening, shared goals, options, and final agreement."
            }
        ],
        skillGaps: [
            { skill: "Advanced system design communication", severity: "medium" },
            { skill: "Production observability and metrics", severity: "medium" },
            { skill: "Behavioral answer storytelling", severity: "low" }
        ],
        preparationPlan: [
            {
                day: 1,
                focus: "Understand role and align experience",
                tasks: [
                    "Map your projects to job responsibilities.",
                    "Prepare 2 technical stories with measurable impact.",
                    "Write concise intro and role fit statement."
                ]
            },
            {
                day: 2,
                focus: "Technical and behavioral practice",
                tasks: [
                    "Practice 5 technical and 5 behavioral answers.",
                    "Refine answers using STAR and clear metrics.",
                    "Do one timed mock interview round."
                ]
            },
            {
                day: 3,
                focus: "Final polishing and confidence",
                tasks: [
                    "Review weak areas from mock feedback.",
                    "Prepare thoughtful questions for interviewer.",
                    "Finalize notes and interview checklist."
                ]
            }
        ]
    }
}

function mergeWithFallback(aiReport, fallbackReport) {
    const score = Number(aiReport?.matchScore)
    const hasValidScore = Number.isFinite(score) && score > 0

    const normalizeQuestions = (items, fallbackItems) => {
        if (!Array.isArray(items) || items.length === 0) return fallbackItems
        const mapped = items
            .map((item) => {
                if (typeof item === "string") {
                    return {
                        question: item,
                        intention: "Assess your interview readiness for this topic.",
                        answer: "Structure your response with context, action, and measurable outcome."
                    }
                }
                if (item && typeof item === "object" && typeof item.question === "string") {
                    return {
                        question: item.question,
                        intention: item.intention || "Assess your interview readiness for this topic.",
                        answer: item.answer || "Structure your response with context, action, and measurable outcome."
                    }
                }
                return null
            })
            .filter(Boolean)
        return mapped.length > 0 ? mapped : fallbackItems
    }

    const normalizeSkillGaps = (items, fallbackItems) => {
        if (!Array.isArray(items) || items.length === 0) return fallbackItems
        const mapped = items
            .map((item) => {
                if (typeof item === "string") {
                    return { skill: item, severity: "medium" }
                }
                if (item && typeof item === "object" && typeof item.skill === "string") {
                    const severity = [ "low", "medium", "high" ].includes(item.severity) ? item.severity : "medium"
                    return { skill: item.skill, severity }
                }
                return null
            })
            .filter(Boolean)
        return mapped.length > 0 ? mapped : fallbackItems
    }

    const normalizePreparationPlan = (items, fallbackItems) => {
        if (!Array.isArray(items) || items.length === 0) return fallbackItems
        const mapped = items
            .map((item, index) => {
                if (typeof item === "string") {
                    return {
                        day: index + 1,
                        focus: item,
                        tasks: [ "Review this topic deeply.", "Practice with one concrete example." ]
                    }
                }
                if (item && typeof item === "object") {
                    const tasks = Array.isArray(item.tasks)
                        ? item.tasks.filter((t) => typeof t === "string" && t.trim())
                        : []
                    return {
                        day: Number(item.day) || index + 1,
                        focus: item.focus || `Preparation Day ${index + 1}`,
                        tasks: tasks.length > 0 ? tasks : [ "Review this topic deeply.", "Practice with one concrete example." ]
                    }
                }
                return null
            })
            .filter(Boolean)
        return mapped.length > 0 ? mapped : fallbackItems
    }

    const technicalQuestions = normalizeQuestions(aiReport?.technicalQuestions, fallbackReport.technicalQuestions)
    const behavioralQuestions = normalizeQuestions(aiReport?.behavioralQuestions, fallbackReport.behavioralQuestions)
    const preparationPlan = normalizePreparationPlan(aiReport?.preparationPlan, fallbackReport.preparationPlan)
    const skillGaps = normalizeSkillGaps(aiReport?.skillGaps, fallbackReport.skillGaps)

    const title = typeof aiReport?.title === "string" && aiReport.title.trim()
        ? aiReport.title.trim()
        : fallbackReport.title

    return {
        ...aiReport,
        title,
        matchScore: hasValidScore ? Math.min(100, Math.max(1, score)) : fallbackReport.matchScore,
        technicalQuestions,
        behavioralQuestions,
        skillGaps,
        preparationPlan,
    }
}




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */

async function generateInterViewReportController(req, res) {

    const { selfDescription = "", jobDescription = "" } = req.body || {}

    if (!jobDescription && !selfDescription && !req.file) {
        return res.status(400).json({
            message: "Please provide jobDescription and either resume file or selfDescription."
        })
    }

    let resumeText = ""
    if (req.file) {
        const mime = req.file.mimetype || ""
        if (mime !== "application/pdf") {
            return res.status(400).json({ message: "Only PDF resume is supported right now." })
        }
        const parsed = await pdfParse(req.file.buffer)
        resumeText = parsed.text || ""
    }

    try {
        const fallbackReport = buildFallbackInterviewReport({ jobDescription, selfDescription })
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const safeReport = mergeWithFallback(interViewReportByAi, fallbackReport)

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...safeReport
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Failed to generate interview report via Gemini:", err?.message || err)
        if (err?.details) {
            console.error("Gemini attempt details:", err.details)
        }
        if (String(process.env.REQUIRE_GEMINI).toLowerCase() === "true") {
            return res.status(503).json({
                message: "Gemini could not generate the report right now. Please try again.",
            })
        }
        // Graceful fallback so frontend still gets usable interview questions.
        const fallbackReport = buildFallbackInterviewReport({ jobDescription, selfDescription })
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...fallbackReport
        })

        return res.status(201).json({
            message: "Interview report generated using fallback strategy.",
            interviewReport
        })
    }

}

/**
 * @description Controller to get interview report by interviewId.
 */


async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */


async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */


async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }