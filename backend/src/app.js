const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cookieParser())
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174,https://interview-ai-frontend-ten.vercel.app")
  .split(",")
  .map((s) => s.trim())

function isAllowedLocalhostOrigin(origin) {
  try {
    const parsed = new URL(origin)
    const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
    const isHttp = parsed.protocol === "http:"
    return isLocalhost && isHttp
  } catch {
    return false
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || isAllowedLocalhostOrigin(origin)) {
      return callback(null, true)
    }
    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
}))

/*require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


//using all the routes here
app.use("/api/auth",authRouter)


// Interview endpoints (used by the React frontend)
app.use("/api/interview", interviewRouter)

module.exports = app