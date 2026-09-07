const Quizzes = require("../../models/quizzes");
const studentSessions = require("../../models/studentSessions");
const Classrooms = require("../../models/classrooms");

const getQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const quiz = await Quizzes.findById(quiz_id).populate(
      "questions.dataset_id",
    );
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { quiz_id, session_id, answers } = req.body;

    const quiz = await Quizzes.findById(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const session = await studentSessions.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const alreadySubmitted = session.submitted_quizzes?.some(
      (sq) => String(sq.quiz_id) === String(quiz_id),
    );
    if (alreadySubmitted) {
      return res
        .status(400)
        .json({ error: "Quiz has already been submitted." });
    }

    let calculatedScore = 0;
    const evaluatedAnswers = answers.map((answer) => {
      const questionObj = quiz.questions.id(answer.question_id);
      let isCorrect = false;
      if (questionObj && questionObj.correct_answers) {
        if (Array.isArray(answer.answer)) {
          isCorrect = answer.answer.every((a) =>
            questionObj.correct_answers.includes(a),
          );
        } else {
          isCorrect = questionObj.correct_answers.includes(answer.answer);
        }
      }
      if (isCorrect) calculatedScore += 10;

      return {
        question_id: answer.question_id,
        answer: answer.answer,
        is_correct: isCorrect,
      };
    });

    session.submitted_quizzes.push({
      quiz_id,
      score: calculatedScore,
      answers: evaluatedAnswers,
    });
    session.score = (session.score || 0) + calculatedScore;
    session.answers.push(...evaluatedAnswers);
    await session.save();

    const room = await Classrooms.findById(session.classroom_id);
    if (room) {
      const io = req.app.get("io");
      if (io) {
        io.to(String(room.room_code)).emit("answer_submitted", {
          session_id: session._id,
          display_name: session.display_name,
          quiz_id,
          score: calculatedScore,
          answers: evaluatedAnswers,
        });
      }
    }

    res.status(200).json({
      message: "Quiz submitted successfully",
      score: calculatedScore,
      answers: evaluatedAnswers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSessionStatus = async (req, res) => {
  try {
    const { session_id } = req.params;
    const session = await studentSessions.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveProgress = async (req, res) => {
  try {
    const { session_id, progress } = req.body;
    const session = await studentSessions.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    // We expect progress to be an object: { "0": "ans1", "1": "ans2" }
    // We merge it into the existing saved_progress for the quiz or globally
    session.saved_progress = {
      ...(session.saved_progress || {}),
      ...progress
    };
    
    // Mark modified because it's a Mixed type
    session.markModified('saved_progress');
    await session.save();
    
    res.status(200).json({ message: "Progress saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getQuiz,
  submitAnswer,
  getSessionStatus,
  saveProgress,
};
