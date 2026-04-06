const { Router } = require("express");
const multer = require("multer");

const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");

const interviewRouter = Router();

// Parse `multipart/form-data` sent from the React frontend.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET /api/interview/ -> list all reports for logged-in user
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController
);

// GET /api/interview/report/:interviewId -> single report
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController
);

// POST /api/interview/ -> create report
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterViewReportController
);

// POST /api/interview/resume/pdf/:interviewReportId -> download resume pdf
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  interviewController.generateResumePdfController
);

module.exports = interviewRouter;

