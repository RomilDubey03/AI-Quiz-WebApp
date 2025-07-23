import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Quiz } from "../models/quiz.model.js";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const createQuiz = asyncHandler(async (req, res) => {
    const { title, description, questions, timePerQuestion } = req.body;
    const userId = req.user?._id;

    if (!title || !questions || questions.length === 0) {
        throw new ApiError(400, "Title and questions are required");
    }

    // Validate questions format
    questions.forEach((q, index) => {
        if (!q.text || !q.options || q.options.length < 2 || !q.correctIndex) {
            throw new ApiError(400, `Invalid question format at index ${index}`);
        }
    });

    const quiz = await Quiz.create({
        title,
        description,
        creator: userId,
        questions,
        timePerQuestion: timePerQuestion || 30,
        isAIGenerated: false
    });

    return res
        .status(201)
        .json(new ApiResponse(201, quiz, "Quiz created successfully"));
});

const generateAIQuiz = asyncHandler(async (req, res) => {
    const { topic, difficulty, numberOfQuestions } = req.body;
    const userId = req.user?._id;

    if (!topic || !difficulty || !numberOfQuestions) {
        throw new ApiError(400, "Topic, difficulty and number of questions are required");
    }

    const prompt = `Create a multiple choice quiz about ${topic} with ${numberOfQuestions} questions at ${difficulty} difficulty level. Format the response as a JSON array with each question having properties: text, options (array of 4 choices), and correctIndex (0-3).`;

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 2000,
            temperature: 0.7
        });

        const generatedQuestions = JSON.parse(response.data.choices[0].text);

        const quiz = await Quiz.create({
            title: `${topic} Quiz`,
            description: `AI generated quiz about ${topic} (${difficulty} level)`,
            creator: userId,
            questions: generatedQuestions,
            isAIGenerated: true
        });

        return res
            .status(201)
            .json(new ApiResponse(201, quiz, "AI Quiz generated successfully"));

    } catch (error) {
        throw new ApiError(500, "Error generating AI quiz");
    }
});

const getQuizByCode = asyncHandler(async (req, res) => {
    const { accessCode } = req.params;

    const quiz = await Quiz.findOne({ accessCode })
        .select('title description timePerQuestion status');

    if (!quiz) {
        throw new ApiError(404, "Quiz not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, quiz, "Quiz found successfully"));
});

const updateQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const updates = req.body;
    const userId = req.user?._id;

    const quiz = await Quiz.findOne({ _id: quizId, creator: userId });

    if (!quiz) {
        throw new ApiError(404, "Quiz not found or unauthorized");
    }

    if (quiz.status !== "draft") {
        throw new ApiError(400, "Can only update draft quizzes");
    }

    // Only allow updating certain fields
    const allowedUpdates = ['title', 'description', 'questions', 'timePerQuestion'];
    Object.keys(updates).forEach((key) => {
        if (!allowedUpdates.includes(key)) {
            delete updates[key];
        }
    });

    const updatedQuiz = await Quiz.findByIdAndUpdate(
        quizId,
        { $set: updates },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedQuiz, "Quiz updated successfully"));
});

const deleteQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user?._id;

    const quiz = await Quiz.findOne({ _id: quizId, creator: userId });

    if (!quiz) {
        throw new ApiError(404, "Quiz not found or unauthorized");
    }

    if (quiz.status !== "draft") {
        throw new ApiError(400, "Can only delete draft quizzes");
    }

    await Quiz.findByIdAndDelete(quizId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Quiz deleted successfully"));
});

export {
    createQuiz,
    generateAIQuiz,
    getQuizByCode,
    updateQuiz,
    deleteQuiz
}; 