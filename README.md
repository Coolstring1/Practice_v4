# Practice: AI Sports Coach

Practice is a mobile application designed to act as a personal sports coach. It leverages AI to provide actionable feedback on physical techniques across various sports and activities. Users can capture or upload short video clips of their practice sessions and receive expert-level coaching to help them improve.

## 🚀 Vision

To provide faster, cheaper, and more flexible feedback that is "directionally correct" and available on-demand, helping amateur athletes and sports enthusiasts bridge the gap between practicing and improving.

## ✨ Key Features

- **Video Capture & Upload**: In-app recording (limited to 1 minute) or gallery upload for analysis.
- **AI-Driven Analysis**: Automatic identification and analysis of specific actions within the video (e.g., serves in tennis, spikes in volleyball).
- **Structured Feedback**: Constructive analysis of form and technique, paired with actionable practice tips.
- **Multi-Sport Support**: Supports Tennis, Volleyball, Pickleball, Badminton, Golf, Weightlifting, Ballet, and Snowboarding.
- **Analysis History**: Keep track of your progress with a history of past practice sessions and feedback.
- **Secure Authentication**: User accounts managed via Convex Auth.

## 🛠 Tech Stack

- **Frontend**: [Expo](https://expo.dev/) (React Native)
- **UI Framework**: [Gluestack UI](https://gluestack.io/)
- **Backend-as-a-Service**: [Convex](https://www.convex.dev/) (Database, File Storage, Edge Functions, Auth)
- **AI Analysis**: [Google Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/)
- **Development Tooling**: AI-assisted coding with [Gemini CLI](https://github.com/google/gemini-cli)

## 📁 Project Structure

- `practice/`: The main mobile application and backend logic.
  - `app/`: Expo Router application screens and navigation.
  - `convex/`: Convex backend functions, schema, and AI service adapters.
  - `components/`: Reusable React Native components.
  - `config/`: Application configuration, including sports and environment settings.
- `FigmaMakePrototypes/`: A Vite-based project for hosting and viewing Figma prototypes.
- `PRD_Practice_New.md`: Detailed Product Requirements Document.
- `AI_Implementation_Guide.md`: Comprehensive guide for AI-assisted development and implementation steps.

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Convex account
- A Gemini API key

### Local Development

1. **Clone the repository**:
   ```bash
   git clone git@github.com:Coolstring1/Practice_v4.git
   cd Practice_v4
   ```

2. **Setup the mobile app**:
   ```bash
   cd practice
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy `.env.local.example` to `.env.local` in the `practice` directory and fill in your Convex URL.
   - Set your `GEMINI_API_KEY` in the Convex dashboard.

4. **Start Convex**:
   ```bash
   npx convex dev
   ```

5. **Start Expo**:
   ```bash
   npx expo start
   ```

## 📖 Documentation

For more detailed information, please refer to:
- [Product Requirements Document (PRD)](./PRD_Practice_New.md)
- [AI Implementation Guide](./AI_Implementation_Guide.md)
- [User Stories](./user_stories.json)

---
Built with ❤️ by the Practice Team.
